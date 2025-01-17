'use server';

import { fal } from "@fal-ai/client";
import { Model } from "@/lib/types";

export async function generateImage(
  model: Model, 
  input: Record<string, any>,
  apiKey: string
) {
  console.log('🚀 Starting image generation process:', {
    modelId: model.id,
    inputParams: { ...input, prompt: input.prompt?.substring(0, 50) + '...' } // Truncate prompt for logging
  });

  try {
    if (!apiKey) {
      console.error('❌ No API key provided');
      throw new Error("Please set your FAL.AI API key first");
    }

    console.log('📝 Configuring FAL client with API key');
    fal.config({
      credentials: apiKey,
    });

    console.log('⏳ Subscribing to FAL model...');
    const result = await fal.subscribe(model.id, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log(`🔄 Queue Status: ${update.status}`);
        if (update.status === "IN_PROGRESS") {
          console.log('📊 Generation Logs:');
          update.logs.map((log) => log.message).forEach((msg) => console.log(`   ${msg}`));
        }
      },
    });

    console.log('📦 Complete API Response:', JSON.stringify(result, null, 2));
    console.log('✅ Generation completed:', { 
      requestId: result.requestId,
      hasImages: !!result.data?.images?.length
    });

    // Extract the first image URL from the result
    const imageUrl = result.data?.images?.[0];
    if (!imageUrl) {
      console.error('❌ No image URL in response');
      throw new Error("No image was generated");
    }

    console.log('🎉 Successfully generated image:', {
      seed: result.data?.seed,
      requestId: result.requestId,
      imageUrl: result.data?.images?.[0],
      // Log any additional response data that might be useful
      timing: result.data?.timing,
      modelVersion: result.data?.model_version,
      allImages: result.data?.images
    });

    return {
      success: true as const,
      imageUrl,
      seed: result.data?.seed,
      requestId: result.requestId,
    };
  } catch (error) {
    console.error("❌ Image generation failed:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to generate image",
    };
  }
} 