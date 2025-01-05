"use client"

import React, { useEffect, useState } from 'react'
import { fal } from "@fal-ai/client";
import { v4 as uuidv4 } from 'uuid';

interface ImageResult {
  url: string;
  content_type?: string | null;
}

interface HistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  cost: number;
  createdAt: string;
  requestDetails: {
    prompt: string;
    aspectRatio: string;
    model: string;
    numImages: number;
    options?: Record<string, unknown>;
  };
  responseDetails: Record<string, unknown>;
  logs?: string;
}

const Page = () => {
  const [generatedImage, setGeneratedImage] = useState<ImageResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const apiKey = localStorage.getItem("fal_api_key");
    if (apiKey) {
      fal.config({
        credentials: apiKey
      });
    }
  }, []);

  const generateImage = async () => {
    try {
      setIsGenerating(true);
      setLogs([]);
      
      const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
        input: {
          prompt: inputState.prompt,
          seed: inputState.seed ? parseInt(inputState.seed) : undefined,
          safety_tolerance: inputState.safety_tolerance as "1"|"2"|"3"|"4"|"5"|"6"|undefined,
          enable_safety_checker: inputState.enable_safety_checker,
          aspect_ratio: inputState.aspect_ratio as "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21" | undefined,
          raw: inputState.raw,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            const messages = update.logs.map((log) => log.message);
            setLogs(prev => [...prev, ...messages]);
            messages.forEach(console.log);
          }
        },
      });
      
      if (result.data.images?.[0]) {
        const generatedImg = result.data.images[0];
        setGeneratedImage(generatedImg);
        
        const historyItem: HistoryItem = {
          id: uuidv4(),
          imageUrl: generatedImg.url,
          prompt: inputState.prompt,
          model: "Flux Pro v1.1 Ultra",
          cost: 0.01,
          createdAt: new Date().toISOString(),
          requestDetails: {
            prompt: inputState.prompt,
            aspectRatio: inputState.aspect_ratio,
            model: "fal-ai/flux-pro/v1.1-ultra",
            numImages: 1,
            options: {
              seed: inputState.seed,
              safety_tolerance: inputState.safety_tolerance,
              enable_safety_checker: inputState.enable_safety_checker,
              raw: inputState.raw,
            }
          },
          responseDetails: result.data,
          logs: logs.join('\n')
        };

        const existingHistory = JSON.parse(localStorage.getItem("imageHistory") || "[]");
        const updatedHistory = [historyItem, ...existingHistory];
        localStorage.setItem("imageHistory", JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const [inputState, setInputState] = useState({
    prompt: "",
    seed: "",
    safety_tolerance: "6",
    enable_safety_checker: false,
    aspect_ratio: "1:1",
    raw: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setInputState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="p-4 container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Prompt:</label>
            <input
              type="text"
              name="prompt"
              value={inputState.prompt}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Seed (optional):</label>
            <input
              type="number"
              name="seed"
              value={inputState.seed}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Safety Tolerance (1-10):</label>
            <input
              type="number"
              name="safety_tolerance"
              min="1"
              max="10"
              value={inputState.safety_tolerance}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Aspect Ratio:</label>
            <select
              name="aspect_ratio"
              value={inputState.aspect_ratio}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="21:9">21:9</option>
              <option value="16:9">16:9</option>
              <option value="4:3">4:3</option>
              <option value="1:1">1:1</option>
              <option value="3:4">3:4</option>
              <option value="9:16">9:16</option>
              <option value="9:21">9:21</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="enable_safety_checker"
                checked={inputState.enable_safety_checker}
                onChange={handleInputChange}
              />
              Enable Safety Checker
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="raw"
                checked={inputState.raw}
                onChange={handleInputChange}
              />
              Raw Output
            </label>
          </div>

          <button
            onClick={generateImage}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Generate Image
          </button>
        </div>

        <div className="border rounded-lg p-4 min-h-[400px] flex items-center justify-center bg-gray-50">
          {isGenerating ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Generating image...</p>
            </div>
          ) : generatedImage ? (
            <img 
              src={generatedImage.url} 
              alt="Generated image"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="text-center text-gray-400">
              <p>Generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page
