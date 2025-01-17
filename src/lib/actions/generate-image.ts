'use server';

import { fal } from "@fal-ai/client";
import { Model } from "@/lib/types";

export async function generateImage(
  model: Model, 
  input: Record<string, any>,
  apiKey: string
) {
  try {
    if (!apiKey) {
      throw new Error("Please set your FAL.AI API key first");
    }

    fal.config({
      credentials: apiKey,
    });

    const result = await fal.subscribe(model.id, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    // Extract the first image URL from the result
    const imageUrl = result.data?.images?.[0];
    if (!imageUrl) {
      throw new Error("No image was generated");
    }

    return {
      success: true as const,
      imageUrl,
      seed: result.data?.seed,
      requestId: result.requestId,
    };
  } catch (error) {
    console.error("Image generation failed:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to generate image",
    };
  }
} 