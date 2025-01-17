'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Model } from "@/lib/types";
import { useState } from "react";

interface GenerationSettingsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  model: Model;
}

function GenerationSettings({ prompt, setPrompt, onGenerate, isGenerating, model }: GenerationSettingsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Configure your image generation for {model.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Enter your image generation prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onGenerate}
          disabled={isGenerating || !prompt}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Image"}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ImageDisplayProps {
  result: string | null;
}

function ImageDisplay({ result }: ImageDisplayProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Generated Image</CardTitle>
        <CardDescription>Your AI-generated artwork will appear here</CardDescription>
      </CardHeader>
      <CardContent>
        {result ? (
          <img 
            src={result} 
            alt="Generated image"
            className="rounded-lg w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-[300px] bg-muted rounded-lg">
            <p className="text-muted-foreground">No image generated yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ImageGeneratorProps {
  model: Model;
}

export function ImageGenerator({ model }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    // TODO: Implement image generation logic using model.id and parameters
    setIsGenerating(false);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl mx-auto">
      <GenerationSettings 
        prompt={prompt}
        setPrompt={setPrompt}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        model={model}
      />
      <ImageDisplay result={result} />
    </div>
  );
} 