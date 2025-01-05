import { z } from "zod";

// Common parameter schemas
const BaseModelParams = z.object({
  prompt: z.string(),
  image_size: z.string(),
  num_images: z.number(),
  seed: z.number().optional(),
  output_format: z.enum(["jpeg", "png"]).optional(),
  sync_mode: z.boolean().optional(),
});

const SafetyParams = z.object({
  enable_safety_checker: z.boolean().optional(),
  safety_tolerance: z.enum(["1", "2", "3", "4", "5", "6"]).optional(),
});

const ImageToImageParams = z.object({
  image_url: z.string().optional(),
  image_prompt_strength: z.number().optional(),
  strength: z.number().optional(),
});

const InferenceParams = z.object({
  num_inference_steps: z.number().optional(),
  guidance_scale: z.number().optional(),
});

// Add Redux-specific parameter schema
export const FluxProReduxParams = BaseModelParams.extend({
  aspect_ratio: z.enum([
    "21:9",
    "16:9",
    "4:3",
    "1:1",
    "3:4",
    "9:16",
    "9:21",
  ]).optional(),
  raw: z.boolean().optional(),
  enable_safety_checker: z.boolean().optional(),
  safety_tolerance: z.enum(["1", "2", "3", "4", "5", "6"]).optional(),
  image_url: z.string().optional(),
  image_prompt_strength: z.number().optional(),
});

// Model-specific parameter schemas
export const FluxProParams = BaseModelParams.merge(InferenceParams);
export const FluxProUltraParams = BaseModelParams.extend({
  aspect_ratio: z.enum([
    "21:9",
    "16:9",
    "4:3",
    "1:1",
    "3:4",
    "9:16",
    "9:21",
  ]).optional(),
});
export const FluxDevParams = BaseModelParams
  .merge(SafetyParams)
  .merge(InferenceParams)
  .merge(ImageToImageParams);

// Model configurations
export const MODELS = {
  "flux-1.1-pro-redux": {
    id: "fal-ai/flux-pro/v1.1-ultra/redux",
    name: "FLUX1.1 Ultra Redux [pro]",
    description: "Next generation text-to-image model with enhanced capabilities",
    schema: FluxProReduxParams,
    defaults: {
      num_images: 1,
      enable_safety_checker: true,
      safety_tolerance: "2" as const,
      output_format: "jpeg" as const,
      aspect_ratio: "16:9" as const,
      image_prompt_strength: 0.1,
      sync_mode: false,
    },
    aspectRatios: [
      { value: "21:9", label: "Ultra Wide 21:9" },
      { value: "16:9", label: "Wide 16:9" },
      { value: "4:3", label: "Standard 4:3" },
      { value: "1:1", label: "Square 1:1" },
      { value: "3:4", label: "Portrait 3:4" },
      { value: "9:16", label: "Tall 9:16" },
      { value: "9:21", label: "Ultra Tall 9:21" },
    ],
    maxImages: 1,
    supportsImageToImage: true,
  },
  "flux-1-pro": {
    id: "fal-ai/flux-pro/new",
    name: "Flux.1 Pro",
    description: "High-quality image generation with standard aspect ratios",
    schema: FluxProParams,
    defaults: {
      num_inference_steps: 28,
      guidance_scale: 3.5,
      output_format: "jpeg" as const,
      sync_mode: false,
    },
    sizes: [
      { value: "square_hd", label: "Square HD" },
      { value: "square", label: "Square" },
      { value: "portrait_4_3", label: "Portrait 4:3" },
      { value: "portrait_16_9", label: "Portrait 16:9" },
      { value: "landscape_4_3", label: "Landscape 4:3" },
      { value: "landscape_16_9", label: "Landscape 16:9" },
    ],
    maxImages: 2,
  },
  "flux-1.1-pro": {
    id: "fal-ai/flux-pro/v1.1-ultra",
    name: "FLUX1.1 [pro] Ultra - High Res",
    description: "Ultra high-resolution image generation with flexible aspect ratios",
    schema: FluxProUltraParams,
    defaults: {
      output_format: "jpeg" as const,
      sync_mode: false,
    },
    aspectRatios: [
      { value: "21:9", label: "Ultra Wide 21:9" },
      { value: "16:9", label: "Wide 16:9" },
      { value: "4:3", label: "Standard 4:3" },
      { value: "1:1", label: "Square 1:1" },
      { value: "3:4", label: "Portrait 3:4" },
      { value: "9:16", label: "Tall 9:16" },
      { value: "9:21", label: "Ultra Tall 9:21" },
    ],
    maxImages: 1,
  },
  "flux-lora": {
    id: "fal-ai/flux-lora",
    name: "Flux LoRA",
    description: "Specialized model with LoRA adaptations",
    schema: FluxDevParams,
    defaults: {
      num_inference_steps: 28,
      guidance_scale: 3.5,
      output_format: "jpeg" as const,
      sync_mode: false,
      enable_safety_checker: false,
      safety_tolerance: "3" as const,
    },
    sizes: [
      { value: "square_hd", label: "Square HD" },
      { value: "square", label: "Square" },
      { value: "portrait_4_3", label: "Portrait 4:3" },
      { value: "portrait_16_9", label: "Portrait 16:9" },
      { value: "landscape_4_3", label: "Landscape 4:3" },
      { value: "landscape_16_9", label: "Landscape 16:9" },
    ],
    maxImages: 4,
  },
  "flux-dev": {
    id: "fal-ai/flux/dev",
    name: "Flux Dev",
    description: "Development version with experimental features",
    schema: FluxDevParams,
    defaults: {
      num_inference_steps: 28,
      guidance_scale: 3.5,
      output_format: "jpeg" as const,
      sync_mode: false,
      enable_safety_checker: false,
      safety_tolerance: "3" as const,
    },
    sizes: [
      { value: "square_hd", label: "Square HD" },
      { value: "square", label: "Square" },
      { value: "portrait_4_3", label: "Portrait 4:3" },
      { value: "portrait_16_9", label: "Portrait 16:9" },
      { value: "landscape_4_3", label: "Landscape 4:3" },
      { value: "landscape_16_9", label: "Landscape 16:9" },
    ],
    maxImages: 4,
  },
  "flux-schnell": {
    id: "fal-ai/flux/schnell",
    name: "Flux Schnell",
    description: "Fast inference optimized model",
    schema: FluxDevParams,
    defaults: {
      num_inference_steps: 28,
      guidance_scale: 3.5,
      output_format: "jpeg" as const,
      sync_mode: false,
      enable_safety_checker: false,
      safety_tolerance: "3" as const,
    },
    sizes: [
      { value: "square_hd", label: "Square HD" },
      { value: "square", label: "Square" },
      { value: "portrait_4_3", label: "Portrait 4:3" },
      { value: "portrait_16_9", label: "Portrait 16:9" },
      { value: "landscape_4_3", label: "Landscape 4:3" },
      { value: "landscape_16_9", label: "Landscape 16:9" },
    ],
    maxImages: 4,
  },
  "flux-img2img": {
    id: "fal-ai/flux/dev/image-to-image",
    name: "Flux Image-to-Image",
    description: "Image-to-image generation with controllable strength",
    schema: FluxDevParams,
    defaults: {
      num_inference_steps: 28,
      guidance_scale: 3.5,
      output_format: "jpeg" as const,
      sync_mode: false,
      enable_safety_checker: false,
      safety_tolerance: "3" as const,
      image_prompt_strength: 0.35,
    },
    sizes: [
      { value: "square_hd", label: "Square HD" },
      { value: "square", label: "Square" },
      { value: "portrait_4_3", label: "Portrait 4:3" },
      { value: "portrait_16_9", label: "Portrait 16:9" },
      { value: "landscape_4_3", label: "Landscape 4:3" },
      { value: "landscape_16_9", label: "Landscape 16:9" },
    ],
    maxImages: 4,
    requiresImage: true,
  },
} as const;

export type ModelId = keyof typeof MODELS;
export type ModelConfig = typeof MODELS[ModelId];
export type ModelParams<T extends ModelId> = z.infer<typeof MODELS[T]["schema"]>;

// Type guard to check if a model requires an image
export function modelRequiresImage(modelId: ModelId): boolean {
  return "requiresImage" in MODELS[modelId] && MODELS[modelId].requiresImage === true;
}

// Helper to get model configuration
export function getModelConfig(modelId: ModelId): ModelConfig {
  return MODELS[modelId];
}

// Helper to validate model parameters
export function validateModelParams<T extends ModelId>(
  modelId: T,
  params: unknown
): ModelParams<T> {
  const config = MODELS[modelId];
  return config.schema.parse(params) as ModelParams<T>;
}

// Helper to get default parameters for a model
export function getModelDefaults<T extends ModelId>(modelId: T): Partial<ModelParams<T>> {
  return MODELS[modelId].defaults as Partial<ModelParams<T>>;
} 