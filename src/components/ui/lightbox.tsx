"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function Lightbox({ isOpen, onClose, imageUrl }: LightboxProps) {
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
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={imageUrl}
            alt="Enlarged view"
            fill
            className="object-contain"
            quality={100}
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 