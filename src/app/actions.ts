"use server";

import { fal } from "@fal-ai/client";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY,
});

const AVAILABLE_MODELS = {
  "flux-1-pro": "fal-ai/flux-pro/new",
  "flux-1.1-pro": "fal-ai/flux-pro/v1.1-ultra",
  "flux-lora": "fal-ai/flux-lora",
  "flux-dev": "fal-ai/flux/dev",
  "flux-schnell": "fal-ai/flux/schnell",
  "flux-img2img": "fal-ai/flux/dev/image-to-image",
} as const;

type AspectRatio = "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21";

interface FluxImage {
  url: string;
  width: number;
  height: number;
  content_type: string;
}

interface FluxProUltraInput {
  prompt: string;
  aspect_ratio?: "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21";
  seed?: number;
  sync_mode?: boolean;
  output_format?: "jpeg" | "png";
  raw?: boolean;
}

interface FluxProInput {
  prompt: string;
  image_size?: {
    width: number;
    height: number;
  } | "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  num_inference_steps?: number;
  seed?: number;
  guidance_scale?: number;
  sync_mode?: boolean;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
  output_format?: "jpeg" | "png";
  raw?: boolean;
  image_url?: string;
  image_prompt_strength?: number;
}

interface FluxImgToImgInput {
  prompt: string;
  image_url: string;
  strength?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  sync_mode?: boolean;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
  output_format?: "jpeg" | "png";
  raw?: boolean;
}

interface FluxProUltraOutput {
  images: FluxImage[];
  timings: Record<string, number>;
  seed: number;
  has_nsfw_concepts: boolean[];
  prompt: string;
}

const COST_PER_MEGAPIXEL = {
  "flux-1-pro": 0.05,
  "flux-1.1-pro": 0.05,
  "flux-dev": 0.025,
  "flux-schnell": 0.003,
  "flux-lora": 0.025,
} as const;

function calculateImageCost(width: number, height: number, model: keyof typeof AVAILABLE_MODELS): number {
  const megapixels = (width * height) / 1000000;
  const costPerMp = COST_PER_MEGAPIXEL[model as keyof typeof COST_PER_MEGAPIXEL] || 0;
  return Number((megapixels * costPerMp).toFixed(3));
}

// Add new types for better type safety
export type GenerationProgress = {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
};

export type GenerationResult = {
  status: string;
  logs?: string;
  imageUrls: string[];
  cost?: number;
  metadata?: {
    model: string;
    prompt: string;
    aspectRatio: string;
    processingTime?: number;
    totalTokens?: number;
    seed?: number;
    timings?: Record<string, number>;
    has_nsfw_concepts?: boolean[];
  };
};

export type GenerationError = {
  code: string;
  message: string;
  details?: unknown;
  status?: number;
};

// Add rate limiting and retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Enhanced error handling utility
function handleGenerationError(error: unknown): never {
  const baseError = error instanceof Error ? error : new Error('Unknown error');
  const apiError = error as { status?: number; body?: { detail?: string } };
  
  const generationError: GenerationError = {
    code: 'GENERATION_FAILED',
    message: baseError.message,
    status: apiError.status,
    details: apiError.body
  };

  if (apiError.status === 429) {
    generationError.code = 'RATE_LIMIT_EXCEEDED';
  } else if (apiError.status === 402) {
    generationError.code = 'INSUFFICIENT_CREDITS';
  } else if (apiError.status === 401) {
    generationError.code = 'INVALID_API_KEY';
  }

  throw generationError;
}

export async function generateImage(
  apiKey: string,
  prompt: string,
  size_or_ratio: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21",
  model: keyof typeof AVAILABLE_MODELS,
  numImages: number = 1,
  options?: {
    seed?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
    enable_safety_checker?: boolean;
    safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
    output_format?: "jpeg" | "png";
    raw?: boolean;
    sync_mode?: boolean;
    image_url?: string;
    image_prompt_strength?: number;
    strength?: number;
  }
): Promise<GenerationResult> {
  const startTime = Date.now();
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      console.log(`🔵 Generation attempt ${retries + 1}/${MAX_RETRIES}:`, {
        model: AVAILABLE_MODELS[model],
        size_or_ratio,
        numImages,
        options,
      });

      fal.config({
        credentials: apiKey,
      });

      const baseInput = {
        prompt,
        num_images: Math.min(Math.max(1, numImages), 4),
        output_format: options?.output_format ?? "jpeg",
        sync_mode: options?.sync_mode ?? false,
        ...(options?.seed !== undefined && { seed: options.seed }),
        ...(options?.raw !== undefined && { raw: options.raw }),
      };

      // Add model-specific parameters
      const modelInput = model === "flux-1.1-pro" 
        ? {
            prompt: baseInput.prompt,
            aspect_ratio: size_or_ratio,
            raw: options?.raw,
            output_format: baseInput.output_format,
            sync_mode: baseInput.sync_mode,
            ...(options?.seed !== undefined && { seed: options.seed }),
          } as FluxProUltraInput
        : model === "flux-img2img"
        ? {
            ...baseInput,
            enable_safety_checker: Boolean(options?.enable_safety_checker),
            safety_tolerance: options?.safety_tolerance ?? "6",
            image_url: options?.image_url,
            strength: options?.strength ?? 0.95,
            ...(options?.num_inference_steps !== undefined && { num_inference_steps: options.num_inference_steps }),
            ...(options?.guidance_scale !== undefined && { guidance_scale: options.guidance_scale }),
          } as FluxImgToImgInput
        : {
            ...baseInput,
            enable_safety_checker: Boolean(options?.enable_safety_checker),
            safety_tolerance: options?.safety_tolerance ?? "6",
            image_size: size_or_ratio,
            ...(options?.num_inference_steps !== undefined && { num_inference_steps: options.num_inference_steps }),
            ...(options?.guidance_scale !== undefined && { guidance_scale: options.guidance_scale }),
            ...(options?.image_url && { image_url: options.image_url }),
            ...(options?.image_prompt_strength && { 
              image_prompt_strength: Math.max(0, Math.min(1, options.image_prompt_strength)) 
            }),
          } as FluxProInput;

      const result = await fal.subscribe(AVAILABLE_MODELS[model], {
        input: modelInput,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs);
          }
        },
      });

      if (!result?.data?.images?.length) {
        throw new Error("No images in response");
      }

      // Type assertion for the result data
      const typedResult = result.data as unknown as FluxProUltraOutput;
      
      const totalCost = typedResult.images.reduce((acc: number, image: FluxImage) => {
        return acc + calculateImageCost(
          image.width,
          image.height,
          model
        );
      }, 0);

      const processingTime = Date.now() - startTime;

      console.log("🟢 Generation successful:", {
        status: "success",
        processingTime,
        images: typedResult.images.map((img: FluxImage) => ({
          url: img.url,
          width: img.width,
          height: img.height,
          content_type: img.content_type
        })),
        seed: typedResult.seed,
        has_nsfw_concepts: typedResult.has_nsfw_concepts,
      });

      return {
        status: "COMPLETED",
        imageUrls: typedResult.images.map((img: FluxImage) => img.url),
        cost: totalCost,
        metadata: {
          model: AVAILABLE_MODELS[model],
          prompt,
          aspectRatio: size_or_ratio,
          processingTime,
          totalTokens: typedResult.images.length,
          seed: typedResult.seed,
          timings: typedResult.timings,
          has_nsfw_concepts: typedResult.has_nsfw_concepts,
        }
      };
    } catch (error) {
      console.error(`❌ Generation attempt ${retries + 1} failed:`, error);
      
      if (retries < MAX_RETRIES - 1 && isRetryableError(error)) {
        retries++;
        await wait(RETRY_DELAY * retries);
        continue;
      }
      
      handleGenerationError(error);
    }
  }

  throw new Error("Maximum retries exceeded");
}

// Helper function to determine if an error is retryable
function isRetryableError(error: unknown): boolean {
  const apiError = error as { status?: number };
  // Retry on rate limits and temporary server errors
  return Boolean(apiError.status === 429 || (apiError.status && apiError.status >= 500));
}

export async function generateFluxProUltraImage({
  apiKey,
  prompt,
  seed,
  sync_mode = false,
  num_images = 1,
  output_format = "jpeg",
  aspect_ratio = "16:9",
  raw = false,
}: FluxProUltraInput & { apiKey: string }): Promise<string> {
  fal.config({
    credentials: apiKey,
  });

  try {
    const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
      input: {
        prompt,
        seed,
        sync_mode,
        num_images,
        output_format,
        aspect_ratio,
        raw,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Queue update:", update);
        if (update.status === "IN_PROGRESS") {
          console.log("Generation progress:", update.logs);
        }
      },
    });

    // Type assertion for the result data
    const typedResult = result.data as unknown as FluxProUltraOutput;

    console.log("FluxPro generation response:", {
      images: typedResult.images,
      logs: result
    });

    if (!typedResult?.images?.[0]?.url) {
      throw new Error("No image URL in response");
    }

    return typedResult.images[0].url;
  } catch (error) {
    console.error("Image generation failed:", {
      error,
      status: (error as any)?.status,
      body: (error as any)?.body,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    
    const errorMessage = error instanceof Error 
      ? `${error.message}${(error as any)?.status ? ` (Status: ${(error as any).status})` : ''}`
      : 'Unknown error';
      
    throw new Error(`Failed to generate image: ${errorMessage}`);
  }
}

export async function generateImageRealtime(
  apiKey: string,
  prompt: string,
  aspectRatio: AspectRatio,
  model: keyof typeof AVAILABLE_MODELS,
  options?: {
    seed?: number;
    enable_safety_checker?: boolean;
    safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
    output_format?: "jpeg" | "png";
    raw?: boolean;
    sync_mode?: boolean;
    image_url?: string;
    image_prompt_strength?: number;
  }
): Promise<{
  status: string;
  imageUrl: string;
  metadata?: {
    model: string;
    prompt: string;
    aspectRatio: string;
    seed?: number;
    has_nsfw_concepts?: boolean[];
    timings?: Record<string, number>;
  };
}> {
  fal.config({
    credentials: apiKey,
    proxyUrl: "/api/fal/proxy"
  });

  return new Promise((resolve, reject) => {
    try {
      const connection = fal.realtime.connect(AVAILABLE_MODELS[model], {
        connectionKey: "image-generation",
        onResult: (result) => {
          // Type assertion for the result data
          const typedResult = result.data as unknown as FluxProUltraOutput;
          
          console.log("🟢 Realtime generation successful:", {
            images: typedResult.images,
            logs: result.logs,
            seed: typedResult.seed,
            has_nsfw_concepts: typedResult.has_nsfw_concepts,
          });

          if (!typedResult?.images?.[0]?.url) {
            reject(new Error("No image URL in response"));
            return;
          }

          resolve({
            status: "COMPLETED",
            imageUrl: typedResult.images[0].url,
            metadata: {
              model: AVAILABLE_MODELS[model],
              prompt,
              aspectRatio,
              seed: typedResult.seed,
              has_nsfw_concepts: typedResult.has_nsfw_concepts,
              timings: typedResult.timings,
            }
          });
        },
        onError: (error) => {
          console.error("❌ Realtime generation failed:", error);
          reject(error);
        }
      });

      connection.send({
        prompt,
        aspect_ratio: aspectRatio,
        output_format: options?.output_format ?? "jpeg",
        enable_safety_checker: Boolean(options?.enable_safety_checker),
        safety_tolerance: options?.safety_tolerance ?? "6",
        sync_mode: options?.sync_mode ?? false,
        ...(options?.seed !== undefined && { seed: options.seed }),
        ...(options?.raw !== undefined && { raw: options.raw }),
        ...(options?.image_url && { image_url: options.image_url }),
        ...(options?.image_prompt_strength && { 
          image_prompt_strength: Math.max(0, Math.min(1, options.image_prompt_strength)) 
        }),
      });
    } catch (error) {
      handleGenerationError(error);
    }
  });
}

