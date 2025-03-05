'use client';

import { Model } from "@/lib/types";
import { useState, useEffect } from "react";
import { GenerationSettings } from "./image-generator/generation-settings";
import { ImageDisplay } from "./image-generator/image-display";
import { GenerationsGallery } from "./image-generator/generations-gallery";
import { generateImage } from "@/lib/actions/generate-image";
import { useToast } from "@/hooks/use-toast";
import { Image, Generation } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';

const API_KEY_STORAGE_KEY = 'fal-ai-api-key';
const GENERATIONS_STORAGE_KEY = 'fal-ai-generations';

interface ImageGeneratorProps {
  model: Model;
}

export function ImageGenerator({ model }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<Image | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const { toast } = useToast();

  const [parameters, setParameters] = useState<Record<string, any>>(() => {
    // Initialize parameters with default values from the model schema
    return Object.fromEntries(
      model.inputSchema
        .filter(param => param.default !== undefined)
        .map(param => [param.key, param.default])
    );
  });

  // Load generations from localStorage on mount
  useEffect(() => {
    const savedGenerations = localStorage.getItem(GENERATIONS_STORAGE_KEY);
    if (savedGenerations) {
      try {
        setGenerations(JSON.parse(savedGenerations));
      } catch (error) {
        console.error('Failed to parse saved generations:', error);
      }
    }
  }, []);

  async function handleGenerate() {
    console.log("🎨 Starting client-side image generation process");

    const apiKey =
      localStorage.getItem(API_KEY_STORAGE_KEY) ??
      process.env.NEXT_PUBLIC_API_KEY;
    if (!apiKey) {
      console.log("❌ No API key found in localStorage");
      toast({
        title: "API Key Required",
        description: "Please set your FAL.AI API key first",
        variant: "destructive",
      });
      return;
    }

    console.log("🔄 Setting generation state...");
    setIsGenerating(true);

    try {
      const allParameters = {
        ...parameters,
        prompt,
      };

      console.log("📤 Sending generation request with parameters:", {
        modelId: model.id,
        parameters: {
          ...allParameters,
          prompt: allParameters.prompt?.substring(0, 50) + "...",
        },
      });

      const response = await generateImage(model, allParameters, apiKey);

      if (response.success) {
        console.log("✅ Generation successful:", {
          seed: response.seed,
          requestId: response.requestId,
        });
        setResult(response.image);

        // Create a new generation record
        const newGeneration: Generation = {
          id: uuidv4(),
          modelId: model.id,
          modelName: model.name,
          prompt,
          parameters: allParameters,
          output: {
            images: [response.image],
            timings: response.timings || {},
            seed: response.seed,
            has_nsfw_concepts: response.has_nsfw_concepts || [],
          },
          timestamp: Date.now(),
        };

        // Update generations in state and localStorage
        const updatedGenerations = [newGeneration, ...generations];
        setGenerations(updatedGenerations);
        localStorage.setItem(
          GENERATIONS_STORAGE_KEY,
          JSON.stringify(updatedGenerations)
        );

        toast({
          title: "Image generated successfully",
          description: `Seed: ${response.seed}`,
        });
      } else {
        console.error("❌ Generation failed:", response.error);
        toast({
          title: "Generation failed",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("💥 Unexpected error during generation:", error);
      toast({
        title: "Generation failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      console.log("🏁 Finishing generation process");
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col space-y-8 w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GenerationSettings 
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          model={model}
          parameters={parameters}
          setParameters={setParameters}
        />
        <ImageDisplay result={result} />
      </div>
      <GenerationsGallery generations={generations} />
    </div>
  );
} 