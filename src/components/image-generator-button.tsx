"use client";

import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface ImageGeneratorButtonProps {
  isLoading: boolean;
  onGenerate: () => void;
  shortcutText?: string;
}

export function ImageGeneratorButton({ 
  isLoading, 
  onGenerate,
  shortcutText 
}: ImageGeneratorButtonProps) {
  return (
    <Button
      onClick={onGenerate}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <div className="flex items-center justify-center w-full">
          <span>Generate</span>
          {shortcutText && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({shortcutText})
            </span>
          )}
        </div>
      )}
    </Button>
  );
} 