'use client';

import { Model } from "@/lib/types";
import { useState } from "react";
import { GenerationSettings } from "./image-generator/generation-settings";
import { ImageDisplay } from "./image-generator/image-display";

interface ImageGeneratorProps {
  model: Model;
}

export function ImageGenerator({ model }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>(() => {
    // Initialize parameters with default values from the model schema
    return Object.fromEntries(
      model.inputSchema
        .filter(param => param.default !== undefined)
        .map(param => [param.key, param.default])
    );
  });

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      // TODO: Implement image generation logic using model.id and parameters
      const allParameters = {
        ...parameters,
        prompt,
      };
      console.log('Generating with parameters:', allParameters);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl mx-auto">
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
  );
} 