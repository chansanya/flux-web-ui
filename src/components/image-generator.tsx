"use client";

import { useState, useEffect } from "react";
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
import { Lightbox } from "@/components/ui/lightbox";

const AVAILABLE_MODELS = {
  "flux-pro": "fal-ai/flux-pro/v1.1-ultra",
  "flux-lora": "fal-ai/flux-lora",
  "flux-dev": "fal-ai/flux/dev",
  "flux-schnell": "fal-ai/flux/schnell",
} as const;

type AspectRatio = "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21";

interface Options {
  prompt: string;
  num_images: string;
  aspect_ratio: AspectRatio;
  model: keyof typeof AVAILABLE_MODELS;
  seed?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: 1 | 2 | 3 | 4 | 5 | 6;
  output_format?: "jpeg" | "png";
  raw?: boolean;
}

interface RequestDetails {
  prompt: string;
  model: string;
  aspectRatio: string;
  numImages: number;
  timestamp: string;
  additionalOptions?: Record<string, any>;
}

export function ImageGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [options, setOptions] = useState<Options>({
    prompt: "",
    num_images: "1",
    aspect_ratio: "16:9",
    model: "flux-pro",
    seed: undefined,
    enable_safety_checker: false,
    safety_tolerance: 6,
    output_format: "jpeg",
    raw: false,
  });
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [cost, setCost] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null);

  const isFluxProUltra = options.model === "flux-pro";

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isLoading) {
        e.preventDefault();
        handleGenerate();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading]);

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
    setCost(null);
    
    try {
      console.log("Generation started with options:", {
        aspect_ratio: options.aspect_ratio,
        model: options.model,
        // Excluding API key for security
      });

      setRequestDetails({
        prompt: options.prompt,
        model: AVAILABLE_MODELS[options.model],
        aspectRatio: options.aspect_ratio,
        numImages: parseInt(options.num_images),
        timestamp: new Date().toLocaleString(),
        additionalOptions: isFluxProUltra ? {
          seed: options.seed,
          safety_tolerance: options.safety_tolerance,
          output_format: options.output_format,
          raw: options.raw,
          enable_safety_checker: options.enable_safety_checker,
        } : undefined,
      });

      const result = await generateImage(
        apiKey,
        options.prompt, 
        options.aspect_ratio, 
        options.model,
        parseInt(options.num_images),
        {
          seed: options.seed,
          enable_safety_checker: options.enable_safety_checker,
          safety_tolerance: options.safety_tolerance?.toString() as "1" | "2" | "3" | "4" | "5" | "6" | undefined,
          output_format: options.output_format,
          raw: options.raw,
        }
      );

      console.log("Generation result:", result);

      if (result.status === "COMPLETED" && result.imageUrls) {
        setImageUrls(result.imageUrls);
        if (result.cost) setCost(result.cost);
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
    <>
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

            <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="raw"
                      checked={options.raw}
                      onCheckedChange={(checked) => setOptions({ ...options, raw: !!checked })}
                    />
                    <label htmlFor="raw" className="text-sm font-medium">
                      Raw Output
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
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Number of Images</label>
                    <span className="text-sm text-muted-foreground">{options.num_images}</span>
                  </div>
                  <Slider
                    min={1}
                    max={4}
                    step={1}
                    value={[parseInt(options.num_images)]}
                    onValueChange={(value) => setOptions({ ...options, num_images: String(value[0]) })}
                    className="w-full"
                  />
                </div>
              </>
            )}

            <ImageGeneratorButton 
              isLoading={isLoading} 
              onGenerate={handleGenerate} 
              shortcutText="⌘ + Enter"
            />
          </CardContent>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center bg-muted/10">
          {imageUrls.length > 0 ? (
            <div className="space-y-4 w-full">
              <div className={`grid ${imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => setSelectedImage(url)}
                  >
                    <Image
                      src={url}
                      alt={`Generated image ${index + 1}`}
                      width={1024}
                      height={1024}
                      className="rounded-lg shadow-lg w-full h-auto"
                    />
                  </div>
                ))}
              </div>
              
              {requestDetails && (
                <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm space-y-2">
                  <h3 className="font-medium">Request Details:</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <span className="text-muted-foreground">Timestamp:</span> {requestDetails.timestamp}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Model:</span> {requestDetails.model}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Aspect Ratio:</span> {requestDetails.aspectRatio}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Number of Images:</span> {requestDetails.numImages}
                    </div>
                    {requestDetails.additionalOptions && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Additional Options:</span>
                        <pre className="mt-1 text-xs overflow-x-auto">
                          {JSON.stringify(requestDetails.additionalOptions, null, 2)}
                        </pre>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Prompt:</span>
                      <p className="mt-1">{requestDetails.prompt}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {cost !== null && (
                <div className="text-sm text-muted-foreground text-center">
                  Generation Cost: ${cost.toFixed(3)}
                </div>
              )}
            </div>
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

      {selectedImage && (
        <Lightbox
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage}
        />
      )}
    </>
  );
}