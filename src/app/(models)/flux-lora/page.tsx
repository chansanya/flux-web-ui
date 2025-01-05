"use client"

import React, { useEffect, useState } from 'react'
import { fal } from "@fal-ai/client";
import { v4 as uuidv4 } from 'uuid';
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHistory } from "@/context/history-context"

interface ImageResult {
  url: string;
  content_type?: string | null;
  width?: number;
  height?: number;
}

interface LoraWeight {
  path: string;
  scale: number;
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
    imageSize: string | { width: number; height: number };
    model: string;
    numImages: number;
    options?: {
      numInferenceSteps?: number;
      seed?: number;
      guidanceScale?: number;
      enableSafetyChecker?: boolean;
      outputFormat?: string;
      loras?: LoraWeight[];
    };
  };
  responseDetails: Record<string, unknown>;
  logs?: string;
}

const Page = () => {
  const [generatedImage, setGeneratedImage] = useState<ImageResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { refreshHistory } = useHistory();

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
      
      const result = await fal.subscribe("fal-ai/flux-lora", {
        input: {
          prompt: inputState.prompt,
          image_size: inputState.image_size,
          num_inference_steps: parseInt(inputState.num_inference_steps.toString()),
          seed: inputState.seed ? parseInt(inputState.seed) : undefined,
          guidance_scale: parseFloat(inputState.guidance_scale.toString()),
          enable_safety_checker: inputState.enable_safety_checker,
          output_format: inputState.output_format,
          loras: inputState.loras.length > 0 ? inputState.loras : undefined,
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
          model: "Flux LoRA",
          cost: 0.01,
          createdAt: new Date().toISOString(),
          requestDetails: {
            prompt: inputState.prompt,
            imageSize: inputState.image_size,
            model: "fal-ai/flux-lora",
            numImages: 1,
            options: {
              numInferenceSteps: parseInt(inputState.num_inference_steps.toString()),
              seed: inputState.seed ? parseInt(inputState.seed) : undefined,
              guidanceScale: parseFloat(inputState.guidance_scale.toString()),
              enableSafetyChecker: inputState.enable_safety_checker,
              outputFormat: inputState.output_format,
              loras: inputState.loras.length > 0 ? inputState.loras : undefined,
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
    image_size: "landscape_4_3",
    num_inference_steps: 28,
    seed: "",
    guidance_scale: 3.5,
    enable_safety_checker: true,
    output_format: "jpeg",
    loras: [] as LoraWeight[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setInputState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleLoraChange = (index: number, field: 'path' | 'scale', value: string) => {
    setInputState(prev => {
      const newLoras = [...prev.loras];
      if (index >= newLoras.length) {
        newLoras.push({ path: '', scale: 1 });
      }
      if (field === 'scale') {
        newLoras[index] = { ...newLoras[index], scale: parseFloat(value) || 1 };
      } else {
        newLoras[index] = { ...newLoras[index], path: value };
      }
      return { ...prev, loras: newLoras };
    });
  };

  const removeLora = (index: number) => {
    setInputState(prev => ({
      ...prev,
      loras: prev.loras.filter((_, i) => i !== index)
    }));
  };

  const addLora = () => {
    if (inputState.loras.length < 5) {
      setInputState(prev => ({
        ...prev,
        loras: [...prev.loras, { path: '', scale: 1 }]
      }));
    }
  };

  return (
    <div className="p-4 container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">
            FLUX <span className="text-blue-600">[LoRA]</span>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image_size">Image Size</Label>
              <Select 
                name="image_size" 
                value={inputState.image_size}
                onValueChange={(value) => 
                  handleInputChange({ 
                    target: { name: 'image_size', value } 
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select image size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square_hd">Square HD</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="portrait_4_3">Portrait 4:3</SelectItem>
                  <SelectItem value="portrait_16_9">Portrait 16:9</SelectItem>
                  <SelectItem value="landscape_4_3">Landscape 4:3</SelectItem>
                  <SelectItem value="landscape_16_9">Landscape 16:9</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="num_inference_steps">Inference Steps</Label>
              <Input
                id="num_inference_steps"
                type="number"
                name="num_inference_steps"
                value={inputState.num_inference_steps}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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
              <Label htmlFor="guidance_scale">Guidance Scale</Label>
              <Input
                id="guidance_scale"
                type="number"
                name="guidance_scale"
                value={inputState.guidance_scale}
                onChange={handleInputChange}
                step="0.1"
                min="1"
                max="20"
                className="w-full"
              />
            </div>
          </div>

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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>LoRA Weights</Label>
              {inputState.loras.length < 5 && (
                <button
                  onClick={addLora}
                  type="button"
                  className="text-sm px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add LoRA
                </button>
              )}
            </div>
            
            {inputState.loras.map((lora, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg relative">
                <button
                  onClick={() => removeLora(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
                
                <div className="space-y-2">
                  <Label htmlFor={`lora-path-${index}`}>LoRA Path/URL</Label>
                  <Input
                    id={`lora-path-${index}`}
                    value={lora.path}
                    onChange={(e) => handleLoraChange(index, 'path', e.target.value)}
                    placeholder="Enter LoRA path or URL"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`lora-scale-${index}`}>Scale</Label>
                  <Input
                    id={`lora-scale-${index}`}
                    type="number"
                    value={lora.scale}
                    onChange={(e) => handleLoraChange(index, 'scale', e.target.value)}
                    step="0.1"
                    min="0"
                    max="2"
                    className="w-full"
                  />
                </div>
              </div>
            ))}
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
