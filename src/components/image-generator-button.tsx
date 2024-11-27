"use client";

import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface ImageGeneratorButtonProps {
  isLoading: boolean;
  onGenerate: () => Promise<void>;
}

export function ImageGeneratorButton({ isLoading, onGenerate }: ImageGeneratorButtonProps) {
  return (
    <Button 
      onClick={onGenerate} 
      className="w-full" 
      disabled={isLoading}
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating...</span>
        </div>
      ) : (
        <span>Generate Image</span>
      )}
    </Button>
  );
} 