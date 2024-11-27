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

interface GenerationOptions {
  prompt: string;
  model_name: string;
  image_size: string;
}

export function ImageGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<GenerationOptions>({
    prompt: "",
    model_name: "stabilityai/stable-diffusion-xl-base-1.0",
    image_size: "square_hd",
  });
  const { toast } = useToast();

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
    try {
      // Implementation of image generation will go here
      // This will use the fal.subscribe method as shown in the docs
      setImageUrl(""); // Set the generated image URL
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
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
            value={options.model_name}
            onValueChange={(value) => setOptions({ ...options, model_name: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stabilityai/stable-diffusion-xl-base-1.0">
                Stable Diffusion XL
              </SelectItem>
              <SelectItem value="sd-community/sdxl-flash">SDXL Flash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Image Size</label>
          <Select
            value={options.image_size}
            onValueChange={(value) => setOptions({ ...options, image_size: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="square_hd">Square HD</SelectItem>
              <SelectItem value="portrait_hd">Portrait HD</SelectItem>
              <SelectItem value="landscape_hd">Landscape HD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleGenerate} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Image"
          )}
        </Button>

        {imageUrl && (
          <div className="mt-6">
            <Image
              src={imageUrl}
              alt="Generated image"
              width={512}
              height={512}
              className="rounded-lg shadow-lg"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}