import { Model } from "@/lib/types";

export const flux_1_1_pro: Model = {
  name: "Flux 1.1 Pro",
  id: "fal-ai/flux-pro/v1.1",
  inputSchema: [
    {
      key: "prompt",
      type: "string",
      required: true
    },
    {
      key: "image_size",
      type: "enum",
      default: "portrait_4_3",
      options: ["square_hd", "square", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"]
    },
    {
      key: "seed",
      type: "number"
    },
    {
      key: "sync_mode",
      type: "boolean",
      default: false
    },
    {
      key: "num_images",
      type: "number",
      default: 1
    },
    {
      key: "enable_safety_checker",
      type: "boolean",
      default: true
    },
    {
      key: "safety_tolerance",
      type: "enum",
      default: "6",
      options: ["1", "2", "3", "4", "5", "6"]
    },
    {
      key: "output_format",
      type: "enum",
      default: "jpeg",
      options: ["jpeg", "png"]
    }
  ],
  outputSchema: [
    {
      key: "images",
      type: "array",
      required: true
    },
    {
      key: "seed",
      type: "number",
      required: true
    },
    {
      key: "has_nsfw_concepts",
      type: "array",
      required: true
    },
    {
      key: "prompt",
      type: "string",
      required: true
    }
  ]
};

export const flux_1_1_pro_ultra: Model = {
  name: "Flux 1.1 Pro Ultra",
  id: "fal-ai/flux-pro/v1.1-ultra",
  inputSchema: [
    {
      key: "prompt",
      type: "string",
      required: true
    },
    {
      key: "seed",
      type: "number"
    },
    {
      key: "sync_mode",
      type: "boolean",
      default: false
    },
    {
      key: "num_images",
      type: "number",
      default: 1
    },
    {
      key: "enable_safety_checker",
      type: "boolean",
      default: true
    },
    {
      key: "safety_tolerance",
      type: "enum",
      default: "2",
      options: ["1", "2", "3", "4", "5", "6"]
    },
    {
      key: "output_format",
      type: "enum",
      default: "jpeg",
      options: ["jpeg", "png"]
    },
    {
      key: "aspect_ratio",
      type: "enum",
      default: "16:9",
      options: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16", "9:21"]
    },
    {
      key: "raw",
      type: "boolean"
    }
  ],
  outputSchema: [
    {
      key: "images",
      type: "array",
      required: true
    },
    {
      key: "timings",
      type: "object",
      required: true
    },
    {
      key: "seed",
      type: "number",
      required: true
    },
    {
      key: "has_nsfw_concepts",
      type: "array",
      required: true
    },
    {
      key: "prompt",
      type: "string",
      required: true
    }
  ]
};
