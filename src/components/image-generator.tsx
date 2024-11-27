"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { generateImage } from "@/app/actions";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { ImageGeneratorButton } from "./image-generator-button";

const AVAILABLE_MODELS = {
  "flux-pro": "fal-ai/flux-pro/v1.1-ultra",
  "flux-lora": "fal-ai/flux-lora",
  "flux-dev": "fal-ai/flux/dev",
  "flux-schnell": "fal-ai/flux/schnell",
} as const;

type AspectRatio = "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21";

interface GenerationOptions {
  prompt: string;
  aspect_ratio: AspectRatio;
  model: keyof typeof AVAILABLE_MODELS;
  seed?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: 1 | 2 | 3 | 4 | 5 | 6;
  output_format?: "jpeg" | "png";
  raw?: boolean;
}

export function ImageGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<GenerationOptions>({
    prompt: "",
    aspect_ratio: "16:9",
    model: "flux-pro",
    seed: undefined,
    num_images: 1,
    enable_safety_checker: true,
    safety_tolerance: 6,
    output_format: "jpeg",
    raw: false,
  });
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const isFluxProUltra = options.model === "flux-pro";

  const handleGenerate = async () => {
    const apiKey = localStorage.getItem("fal_api_key");
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please set your API key in the settings tab",
        variant: "destructive",
      });
      return;
    }

    if (!options.prompt) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setProgressText("Initializing...");
    
    try {
      console.log("Generation started with options:", {
        prompt: options.prompt,
        aspect_ratio: options.aspect_ratio,
        model: options.model,
        // Excluding API key for security
      });

      const result = await generateImage(
        apiKey,
        options.prompt, 
        options.aspect_ratio, 
        options.model
      );

      console.log("Generation result:", result);

      if (result.status === "COMPLETED" && result.imageUrl) {
        setImageUrl(result.imageUrl);
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProgressText("");
    }
  };

  return (
    <Card className="flex flex-col md:flex-row min-h-[600px]">
      <div className="flex-1 border-r overflow-y-auto">
        <CardHeader>
          <CardTitle>Generate Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <Textarea
              placeholder="Enter your prompt here..."
              value={options.prompt}
              onChange={(e) => setOptions({ ...options, prompt: e.target.value })}
              className="h-32"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Select
              value={options.model}
              onValueChange={(value: keyof typeof AVAILABLE_MODELS) => 
                setOptions({ ...options, model: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flux-pro">Flux Pro (Ultra)</SelectItem>
                <SelectItem value="flux-lora">Flux LoRA</SelectItem>
                <SelectItem value="flux-dev">Flux Dev</SelectItem>
                <SelectItem value="flux-schnell">Flux Schnell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Aspect Ratio</label>
            <Select
              value={options.aspect_ratio}
              onValueChange={(value: AspectRatio) => 
                setOptions({ ...options, aspect_ratio: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="21:9">Ultra Wide (21:9)</SelectItem>
                <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                <SelectItem value="4:3">Standard (4:3)</SelectItem>
                <SelectItem value="1:1">Square (1:1)</SelectItem>
                <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                <SelectItem value="9:16">Mobile (9:16)</SelectItem>
                <SelectItem value="9:21">Tall (9:21)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isFluxProUltra && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seed</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={options.seed || ''}
                    onChange={(e) => setOptions({ ...options, seed: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Leave blank for random"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setOptions({ ...options, seed: Math.floor(Math.random() * 1000000) })}
                  >
                    Random
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Safety Tolerance</label>
                <Select
                  value={options.safety_tolerance?.toString()}
                  onValueChange={(value) => setOptions({ ...options, safety_tolerance: Number(value) as 1 | 2 | 3 | 4 | 5 | 6 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Strict</SelectItem>
                    <SelectItem value="2">2 - Strict</SelectItem>
                    <SelectItem value="3">3 - Moderate</SelectItem>
                    <SelectItem value="4">4 - Permissive</SelectItem>
                    <SelectItem value="5">5 - Very Permissive</SelectItem>
                    <SelectItem value="6">6 - Unrestricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Output Format</label>
                <Select
                  value={options.output_format}
                  onValueChange={(value: "jpeg" | "png") => setOptions({ ...options, output_format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="raw"
                  checked={options.raw}
                  onCheckedChange={(checked) => setOptions({ ...options, raw: !!checked })}
                />
                <label htmlFor="raw" className="text-sm font-medium">
                  Raw Output (less processed, more natural-looking)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="safety"
                  checked={options.enable_safety_checker}
                  onCheckedChange={(checked) => setOptions({ ...options, enable_safety_checker: !!checked })}
                />
                <label htmlFor="safety" className="text-sm font-medium">
                  Enable Safety Checker
                </label>
              </div>
            </>
          )}

          <ImageGeneratorButton 
            isLoading={isLoading} 
            onGenerate={handleGenerate} 
          />
        </CardContent>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center bg-muted/10">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Generated image"
            width={512}
            height={512}
            className="rounded-lg shadow-lg"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground w-full max-w-[512px]">
            {isLoading ? (
              <div className="w-full space-y-4">
                <div className="border-2 border-dashed rounded-lg w-full aspect-video flex flex-col items-center justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-center font-medium">{progressText}</p>
                  <Progress value={progress} className="w-full mt-4" />
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg w-full aspect-video flex items-center justify-center">
                <p>Generated image will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}