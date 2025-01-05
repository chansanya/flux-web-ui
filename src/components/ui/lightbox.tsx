"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "./button";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function Lightbox({ 
  isOpen, 
  onClose, 
  imageUrl,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: LightboxProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] h-[90vh] p-0">
        <VisuallyHidden asChild>
          <DialogTitle>Image Preview</DialogTitle>
        </VisuallyHidden>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {hasPrevious && onPrevious && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm z-50"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous image</span>
          </Button>
        )}

        {hasNext && onNext && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm z-50"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next image</span>
          </Button>
        )}

        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={imageUrl}
            alt="Enlarged view"
            fill
            className="object-contain"
            quality={100}
            priority
            sizes="90vw"
            onError={(e) => {
              console.error('Failed to load image:', imageUrl);
              onClose();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 