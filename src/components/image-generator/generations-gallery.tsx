'use client';

import { useState } from "react";
import { Generation } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbox } from "@/components/ui/lightbox";
import { formatDistanceToNow } from "date-fns";

interface GenerationsGalleryProps {
  generations: Generation[];
}

export function GenerationsGallery({ generations }: GenerationsGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);

  const sortedGenerations = [...generations].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold">Previous Generations</h2>
      <ScrollArea className="h-[500px] w-full rounded-md border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {sortedGenerations.map((generation) => (
            <Card key={generation.id} className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              <CardContent className="p-0">
                <div 
                  onClick={() => {
                    setSelectedGeneration(generation);
                    setSelectedImageIndex(0);
                  }}
                  className="relative aspect-square"
                >
                  <img
                    src={generation.output.images[0].url}
                    alt={generation.prompt}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                    <div className="text-white space-y-2">
                      <p className="text-sm line-clamp-3">{generation.prompt}</p>
                      <p className="text-xs text-gray-300">
                        {formatDistanceToNow(generation.timestamp, { addSuffix: true })}
                      </p>
                      <p className="text-xs text-gray-300">
                        Seed: {generation.output.seed}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {selectedGeneration && selectedImageIndex !== null && (
        <Lightbox
          isOpen={true}
          onClose={() => {
            setSelectedGeneration(null);
            setSelectedImageIndex(null);
          }}
          imageUrl={selectedGeneration.output.images[selectedImageIndex].url}
          onNext={
            selectedImageIndex < selectedGeneration.output.images.length - 1
              ? () => setSelectedImageIndex(selectedImageIndex + 1)
              : undefined
          }
          onPrevious={
            selectedImageIndex > 0
              ? () => setSelectedImageIndex(selectedImageIndex - 1)
              : undefined
          }
          hasNext={selectedImageIndex < selectedGeneration.output.images.length - 1}
          hasPrevious={selectedImageIndex > 0}
        />
      )}
    </div>
  );
} 