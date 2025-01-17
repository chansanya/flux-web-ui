"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";
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
  onDownload?: () => void;
  children?: React.ReactNode;
  isNSFW?: boolean;
  onNSFWToggle?: (isNSFW: boolean) => void;
}

export function Lightbox({ 
  isOpen, 
  onClose, 
  imageUrl,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  onDownload,
  children,
  isNSFW,
  onNSFWToggle
}: LightboxProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] h-[90vh] p-0 bg-background/80 backdrop-blur-xl">
        <VisuallyHidden asChild>
          <DialogTitle>Image Preview</DialogTitle>
        </VisuallyHidden>

        {/* Background blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />

        <div className="absolute right-4 top-4 flex items-center gap-2 z-50">
          {onNSFWToggle && (
            <Button
              variant={isNSFW ? "destructive" : "outline"}
              size="sm"
              className="bg-background/80 hover:bg-background/90 backdrop-blur-sm"
              onClick={() => onNSFWToggle(!isNSFW)}
            >
              {isNSFW ? "Mark Safe" : "Mark NSFW"}
            </Button>
          )}
          {onDownload && (
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 hover:bg-background/90 backdrop-blur-sm"
              onClick={onDownload}
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download image</span>
            </Button>
          )}
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="relative w-full h-full flex md:flex-row flex-col z-10">
          {/* Details Panel */}
          {children && (
            <div className="md:w-80 w-full shrink-0 p-6 bg-background/95 backdrop-blur-sm md:h-full overflow-y-auto">
              {children}
            </div>
          )}

          {/* Image Container */}
          <div className="flex-1 relative flex items-center justify-center min-h-0 p-4">
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt="Enlarged view"
                fill
                className="object-contain"
                quality={100}
                priority
                sizes="(min-width: 768px) 60vw, 90vw"
                onError={(e) => {
                  console.error('Failed to load image:', imageUrl);
                  onClose();
                }}
              />

              {/* Navigation Buttons */}
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 