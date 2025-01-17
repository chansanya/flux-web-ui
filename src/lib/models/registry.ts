import { Model } from "@/lib/types";
import * as textToText from "./flux/text-to-text";

// Get all exported models from text-to-text
const textToTextModels = Object.values(textToText).filter(
  (value): value is Model => {
    return (
      typeof value === "object" &&
      value !== null &&
      "name" in value &&
      "id" in value &&
      "inputSchema" in value &&
      "outputSchema" in value
    );
  }
);

// Export all models in a single array
export const allModels = [...textToTextModels]; 