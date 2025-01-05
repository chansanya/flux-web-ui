"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { fal } from "@fal-ai/client";
import { v4 as uuidv4 } from 'uuid';
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHistory } from "@/context/history-context"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"

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
  const { refreshHistory } = useHistory();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

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
      
      const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra/redux", {
        input: {
          prompt: inputState.prompt,
          seed: inputState.seed ? parseInt(inputState.seed) : undefined,
          safety_tolerance: inputState.safety_tolerance as "1"|"2"|"3"|"4"|"5"|"6"|undefined,
          enable_safety_checker: inputState.enable_safety_checker,
          aspect_ratio: inputState.aspect_ratio as "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21" | undefined,
          raw: inputState.raw,
          image_url: uploadedImageUrl || undefined,
          image_prompt_strength: inputState.image_prompt_strength,
          num_inference_steps: inputState.num_inference_steps,
          guidance_scale: inputState.guidance_scale,
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
          model: "Flux Pro v1.1 Ultra (redux)",
          cost: 0.01,
          createdAt: new Date().toISOString(),
          requestDetails: {
            prompt: inputState.prompt,
            aspectRatio: inputState.aspect_ratio,
            model: "fal-ai/flux-pro/v1.1-ultra/redux",
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
        
        refreshHistory();
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
    image_prompt_strength: 0.1,
    num_inference_steps: 28,
    guidance_scale: 3.5,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setInputState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      const uploadedUrl = await fal.storage.upload(file);
      setUploadedImageUrl(uploadedUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }, []);

  return (
    <div className="p-4 container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">
            FLUX1.1 <span className="text-blue-600">[pro]</span> (Ultra) (Redux)
          </h1>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              name="prompt"
              value={inputState.prompt}
              onChange={handleInputChange}
              placeholder="Enter your prompt here..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="w-1/3">
            <Label htmlFor="seed">Seed (optional)</Label>
            <Input
              id="seed"
              type="number"
              name="seed"
              value={inputState.seed}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image (optional)</Label>
            <Card className="border-2 border-dashed border-gray-200 rounded-lg p-3">
              <div className="flex flex-col items-center justify-center gap-2">
                {!uploadedImage ? (
                  <>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full text-sm cursor-pointer"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 w-full">
                    <div className="flex items-start gap-4">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded preview" 
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="image_prompt_strength">Strength</Label>
                          <span className="text-sm text-gray-500">
                            {inputState.image_prompt_strength}
                          </span>
                        </div>
                        <Slider
                          id="image_prompt_strength"
                          min={0}
                          max={1}
                          step={0.1}
                          value={[inputState.image_prompt_strength]}
                          onValueChange={(value) => {
                            handleInputChange({
                              target: { name: 'image_prompt_strength', value: value[0] }
                            } as any);
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setUploadedImageUrl(null);
                        }}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="safety_tolerance">Safety Tolerance</Label>
              <Input
                id="safety_tolerance"
                type="number"
                name="safety_tolerance"
                min="1"
                max="10"
                value={inputState.safety_tolerance}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspect_ratio">Aspect Ratio</Label>
              <Select 
                name="aspect_ratio" 
                value={inputState.aspect_ratio}
                onValueChange={(value) => 
                  handleInputChange({ 
                    target: { name: 'aspect_ratio', value } 
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="21:9">21:9</SelectItem>
                  <SelectItem value="16:9">16:9</SelectItem>
                  <SelectItem value="4:3">4:3</SelectItem>
                  <SelectItem value="1:1">1:1</SelectItem>
                  <SelectItem value="3:4">3:4</SelectItem>
                  <SelectItem value="9:16">9:16</SelectItem>
                  <SelectItem value="9:21">9:21</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="num_inference_steps">Inference Steps</Label>
                <span className="text-sm text-gray-500">
                  {inputState.num_inference_steps}
                </span>
              </div>
              <Slider
                id="num_inference_steps"
                min={1}
                max={40}
                step={1}
                value={[inputState.num_inference_steps]}
                onValueChange={(value) => {
                  handleInputChange({
                    target: { name: 'num_inference_steps', value: value[0] }
                  } as any);
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="guidance_scale">Guidance Scale</Label>
                <span className="text-sm text-gray-500">
                  {inputState.guidance_scale}
                </span>
              </div>
              <Slider
                id="guidance_scale"
                min={0}
                max={10}
                step={0.1}
                value={[inputState.guidance_scale]}
                onValueChange={(value) => {
                  handleInputChange({
                    target: { name: 'guidance_scale', value: value[0] }
                  } as any);
                }}
              />
            </div>
          </div>

          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable_safety_checker"
                name="enable_safety_checker"
                checked={inputState.enable_safety_checker}
                onCheckedChange={(checked) =>
                  handleInputChange({
                    target: { name: 'enable_safety_checker', type: 'checkbox', checked }
                  } as any)
                }
              />
              <Label htmlFor="enable_safety_checker">Enable Safety Checker</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="raw"
                name="raw"
                checked={inputState.raw}
                onCheckedChange={(checked) =>
                  handleInputChange({
                    target: { name: 'raw', type: 'checkbox', checked }
                  } as any)
                }
              />
              <Label htmlFor="raw">Raw Output</Label>
            </div>
          </div>

          <button
            onClick={generateImage}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
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
