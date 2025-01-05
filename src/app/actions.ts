"use server";

import { fal } from "@fal-ai/client";
import { MODELS, type ModelId, type ModelParams, validateModelParams } from "@/config/models";
import { handleError, type AppError } from "@/types/errors";

type GenerationOutput = {
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  meta: {
    api_cost: number;
    timings?: Record<string, number>;
    has_nsfw_concepts?: boolean[];
  };
};

export async function generateImage(
  apiKey: string,
  prompt: string,
  imageSize: string,
  model: ModelId,
  numImages: number,
  options: {
    seed?: number;
    output_format?: "jpeg" | "png";
    raw?: boolean;
    sync_mode?: boolean;
    enable_safety_checker?: boolean;
    safety_tolerance?: string;
    image_url?: string;
    image_prompt_strength?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
    strength?: number;
  }
): Promise<{
  status: string;
  imageUrls: string[];
  cost?: number;
  metadata?: any;
}> {
  try {
    const modelConfig = MODELS[model];
    const baseUrl = process.env.NEXT_PUBLIC_FAL_API_URL || 'https://fal.run';

    // Prepare input parameters based on model configuration
    const input = {
      prompt,
      image_size: imageSize,
      num_images: numImages,
      ...modelConfig.defaults,
      ...options,
    };

    // Validate input parameters against model schema
    const validatedInput = validateModelParams(model, input);

    const startTime = Date.now();
    let retries = 0;
    const MAX_RETRIES = 3;

    while (retries < MAX_RETRIES) {
      try {
        console.log(`🔵 Generation attempt ${retries + 1}/${MAX_RETRIES}:`, {
          model: modelConfig.id,
          imageSize,
          numImages,
          options: validatedInput,
        });

        const result = await fal.subscribe(modelConfig.id, {
          input: validatedInput,
          logs: true,
          onQueueUpdate: (update) => {
            console.log("Queue update:", update);
          },
        });

        const output = result.data as unknown as GenerationOutput;
        const processingTime = Date.now() - startTime;
        
        console.log("✅ Generation successful:", {
          model: modelConfig.id,
          prompt,
          imageSize,
          processingTime,
          totalTokens: output.images.length,
          cost: output.meta?.api_cost,
        });

        return {
          status: "COMPLETED",
          imageUrls: output.images.map((img) => img.url),
          cost: output.meta?.api_cost,
          metadata: {
            timings: output.meta?.timings,
            has_nsfw_concepts: output.meta?.has_nsfw_concepts,
          },
        };
      } catch (error) {
        console.error(`❌ Generation attempt ${retries + 1} failed:`, error);
        retries++;
        if (retries === MAX_RETRIES) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }

    throw new Error("Maximum retries exceeded");
  } catch (error) {
    throw handleError(error);
  }
}

interface Flux11ProOptions {
  image_size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | {
    width: number;
    height: number;
  };
  seed?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
  output_format?: "jpeg" | "png";
}

interface Flux11ProOutput {
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  meta: {
    api_cost: number;
    timings?: Record<string, number>;
    has_nsfw_concepts?: boolean[];
  };
}

export async function generateFlux11Pro(
  prompt: string,
  apiKey: string,
  options?: Flux11ProOptions
) {
  try {
    fal.config({
      credentials: apiKey,
    });

    const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
      input: {
        prompt,
        image_size: options?.image_size || "landscape_4_3",
        num_images: options?.num_images || 1,
        enable_safety_checker: false,
        safety_tolerance: "6",
        output_format: options?.output_format || "jpeg",
        ...(options?.seed && { seed: options.seed }),
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    const output = result.data as unknown as Flux11ProOutput;
    console.log("API Response Data:", output);
    console.log("Request ID:", result.requestId);

    return {
      status: "COMPLETED",
      imageUrls: output.images.map((img) => img.url),
      cost: output.meta?.api_cost,
      metadata: {
        timings: output.meta?.timings,
        has_nsfw_concepts: output.meta?.has_nsfw_concepts,
      },
      requestId: result.requestId
    };
  } catch (error) {
    console.error("Flux 1.1 Pro Generation Error:", error);
    throw handleError(error);
  }
}

