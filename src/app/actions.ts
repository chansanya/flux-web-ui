"use server";

import { fal } from "@fal-ai/client";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY,
});

const AVAILABLE_MODELS = {
  "flux-pro": "fal-ai/flux-pro/v1.1-ultra",
  "flux-lora": "fal-ai/flux-lora",
  "flux-dev": "fal-ai/flux/dev",
  "flux-schnell": "fal-ai/flux/schnell",
} as const;

type AspectRatio = "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21";

interface FluxProUltraInput {
  prompt: string;
  seed?: number;
  sync_mode?: boolean;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: "1" | "2" | "3" | "4" | "5" | "6";
  output_format?: "jpeg" | "png";
  aspect_ratio?: AspectRatio;
  raw?: boolean;
  image_url?: string;
  image_prompt_strength?: number;
}

interface FalApiResponse {
  status: string;
  data?: {
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      content_type?: string;
    }>;
  };
  logs?: Array<{
    message: string;
  }>;
}

export async function generateImage(
  apiKey: string,
  prompt: string,
  aspectRatio: AspectRatio,
  model: keyof typeof AVAILABLE_MODELS,
  numImages: number = 1
): Promise<{
  status: string;
  logs?: string;
  imageUrl?: string;
}> {
  console.log("Server action started:", {
    model: AVAILABLE_MODELS[model],
    aspectRatio,
    numImages,
    // Excluding API key and prompt for security
  });

  fal.config({
    credentials: apiKey,
  });

  try {
    const result = await fal.subscribe<FalApiResponse>(AVAILABLE_MODELS[model], {
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        num_images: numImages,
        output_format: "jpeg",
        enable_safety_checker: true,
      },
      logs: true,
    });

    console.log("FAL API response:", {
      status: result.status,
      logs: result.logs?.map(log => log.message),
      hasImages: !!result?.data?.images?.length,
    });

    if (!result?.data?.images?.[0]?.url) {
      throw new Error("No image URL in response");
    }

    return {
      status: "COMPLETED",
      logs: result.logs?.map(log => log.message).join("\n"),
      imageUrl: result.data.images[0].url
    };
  } catch (error) {
    console.error("Image generation failed:", error);
    throw new Error("Failed to generate image");
  }
}

export async function generateFluxProUltraImage({
  apiKey,
  prompt,
  seed,
  sync_mode = false,
  num_images = 1,
  enable_safety_checker = true,
  safety_tolerance = "6",
  output_format = "jpeg",
  aspect_ratio = "16:9",
  raw = false,
  image_url,
  image_prompt_strength,
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
        enable_safety_checker,
        safety_tolerance,
        output_format,
        aspect_ratio,
        raw,
        ...(image_url && { image_url }),
        ...(image_prompt_strength && { image_prompt_strength }),
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Generation progress:", update.logs);
        }
      },
    });

    if (!result?.data?.images?.[0]?.url) {
      throw new Error("No image URL in response");
    }

    return result.data.images[0].url;
  } catch (error) {
    console.error("Image generation failed:", error);
    throw new Error("Failed to generate image");
  }
}

export async function generateImageRealtime(
  apiKey: string,
  prompt: string,
  aspectRatio: AspectRatio,
  model: keyof typeof AVAILABLE_MODELS
) {
  fal.config({
    credentials: apiKey,
    proxyUrl: "/api/fal/proxy" // Make sure you have the proxy setup
  });

  const connection = fal.realtime.connect(AVAILABLE_MODELS[model], {
    connectionKey: "image-generation",
    onResult: (result) => {
      return {
        status: "COMPLETED",
        imageUrl: result.data.images[0].url
      };
    },
  });

  connection.send({
    prompt,
    aspect_ratio: aspectRatio,
    output_format: "jpeg",
    enable_safety_checker: true,
  });
}

