"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Lightbox } from "./ui/lightbox";
import { Button } from "./ui/button";
import { ImageIcon, InfoIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea as ScrollAreaPrimitive } from "./ui/scroll-area";

interface HistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  cost: number;
  createdAt: string;
  requestDetails: {
    prompt: string;
    aspectRatio: string;
    model: string;
    numImages: number;
    options?: Record<string, unknown>;
  };
  responseDetails: Record<string, unknown>;
  logs?: string;
}

const ITEMS_PER_PAGE = 12;

function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ImageHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("imageHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load image history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = history.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleImageClick = (imageUrl: string, index: number) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageIndex(index);
  };

  const handlePreviousImage = () => {
    if (selectedImageIndex === null || selectedImageIndex <= 0) return;
    const newIndex = selectedImageIndex - 1;
    setSelectedImageIndex(newIndex);
    setSelectedImageUrl(currentItems[newIndex].imageUrl);
  };

  const handleNextImage = () => {
    if (selectedImageIndex === null || selectedImageIndex >= currentItems.length - 1) return;
    const newIndex = selectedImageIndex + 1;
    setSelectedImageIndex(newIndex);
    setSelectedImageUrl(currentItems[newIndex].imageUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
        <div className="bg-muted/30 p-4 rounded-full">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">No Images Yet</h3>
          <p className="text-muted-foreground">
            Your generated images will appear here. Try creating some!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="grid grid-cols-4 gap-6">
        {currentItems.map((item, index) => (
          <ImageCard
            key={item.id}
            item={item}
            onImageClick={() => handleImageClick(item.imageUrl, index)}
            onDetailsClick={() => setSelectedImage(item)}
          />
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Lightbox
        isOpen={Boolean(selectedImageUrl)}
        onClose={() => {
          setSelectedImageUrl(null);
          setSelectedImageIndex(null);
        }}
        imageUrl={selectedImageUrl || ''}
        onPrevious={handlePreviousImage}
        onNext={handleNextImage}
        hasPrevious={selectedImageIndex !== null && selectedImageIndex > 0}
        hasNext={selectedImageIndex !== null && selectedImageIndex < currentItems.length - 1}
      />
    </div>
  );
}

function ImageCard({ 
  item, 
  onImageClick, 
  onDetailsClick 
}: { 
  item: HistoryItem; 
  onImageClick: () => void;
  onDetailsClick: () => void;
}) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-3 space-y-3">
        <div 
          className="aspect-square relative rounded-md overflow-hidden cursor-zoom-in"
          onClick={onImageClick}
        >
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <Image
            src={item.imageUrl}
            alt={item.prompt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw"
            className={cn(
              "object-cover transition-all duration-300 group-hover:scale-105",
              imageLoading ? "opacity-0" : "opacity-100"
            )}
            onLoadingComplete={() => setImageLoading(false)}
            priority={false}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium line-clamp-2 leading-snug">
            {item.prompt}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="px-2 py-1 bg-muted rounded-md font-medium">
              {item.model}
            </span>
            <span className="text-green-600 font-medium">
              ${item.cost.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onDetailsClick}
                  className="hover:bg-muted"
                >
                  <InfoIcon className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <span>Generation Details</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <ScrollAreaPrimitive className="h-[500px] mt-4">
                  <div className="space-y-6 p-4">
                    <section>
                      <h3 className="text-sm font-semibold mb-2 flex items-center">
                        Request Details
                      </h3>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        {JSON.stringify(item.requestDetails, null, 2)}
                      </pre>
                    </section>
                    
                    <section>
                      <h3 className="text-sm font-semibold mb-2">Response Details</h3>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        {JSON.stringify(item.responseDetails, null, 2)}
                      </pre>
                    </section>

                    {item.logs && (
                      <section>
                        <h3 className="text-sm font-semibold mb-2">Logs</h3>
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap text-sm font-mono">
                          {item.logs}
                        </pre>
                      </section>
                    )}
                  </div>
                </ScrollAreaPrimitive>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  );
} 