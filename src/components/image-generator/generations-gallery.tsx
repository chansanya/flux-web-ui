'use client';

import { useState } from "react";
import { Generation } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbox } from "@/components/ui/lightbox";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";

interface GenerationsGalleryProps {
  generations: Generation[];
}

const ITEMS_PER_PAGE = 16;

function truncateText(text: string, maxWords: number = 150) {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Failed to download image:', error);
  }
}

export function GenerationsGallery({ generations }: GenerationsGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedGenerations = [...generations].sort((a, b) => b.timestamp - a.timestamp);
  const totalPages = Math.ceil(sortedGenerations.length / ITEMS_PER_PAGE);
  const paginatedGenerations = sortedGenerations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Previous Generations</h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {paginatedGenerations.map((generation) => (
          <Card key={generation.id} className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary transition-all">
            <CardContent className="p-0">
              <div className="flex flex-col">
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
                    className="absolute inset-0 object-cover w-full h-full"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 bg-black/20 hover:bg-black/40 backdrop-blur-[2px] text-white z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(
                        generation.output.images[0].url,
                        `generation-${generation.id}.png`
                      );
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download image</span>
                  </Button>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{generation.modelName}</span>
                    {generation.output.has_nsfw_concepts?.[0] && (
                      <Badge variant="destructive" className="text-[10px]">NSFW</Badge>
                    )}
                  </div>
                  <p className="text-xs line-clamp-3">{truncateText(generation.prompt)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(generation.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
          onDownload={() => 
            downloadImage(
              selectedGeneration.output.images[selectedImageIndex].url,
              `generation-${selectedGeneration.id}-${selectedImageIndex + 1}.png`
            )
          }
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Generation Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Model</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedGeneration.modelName}</span>
                    {selectedGeneration.output.has_nsfw_concepts?.[selectedImageIndex] && (
                      <Badge variant="destructive">NSFW</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Generated</p>
                  <p className="font-medium">
                    {formatDistanceToNow(selectedGeneration.timestamp, { addSuffix: true })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Seed</p>
                  <p className="font-medium font-mono">{selectedGeneration.output.seed}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-1">Prompt</p>
              <p className="text-sm">{selectedGeneration.prompt}</p>
            </div>
          </div>
        </Lightbox>
      )}
    </div>
  );
} 