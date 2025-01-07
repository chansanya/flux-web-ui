"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Lightbox } from "./ui/lightbox";
import { Button } from "./ui/button";
import { ImageIcon, InfoIcon, Loader2, ChevronLeft, ChevronRight, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea as ScrollAreaPrimitive } from "./ui/scroll-area";
import { useHistory } from "@/context/history-context"

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
    options?: {
      seed?: number;
      numInferenceSteps?: number;
      guidanceScale?: number;
      safety_tolerance?: string;
      enable_safety_checker?: boolean;
      outputFormat?: string;
      raw?: boolean;
      image_prompt_strength?: number;
    };
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
  const { refreshKey, refreshHistory, remixImage } = useHistory();

  useEffect(() => {
    const loadHistory = () => {
      setLoading(true);
      try {
        const storedHistory = localStorage.getItem("imageHistory");
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error("Failed to load image history:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [refreshKey]);

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

  const handleDelete = (id: string) => {
    try {
      const storedHistory = localStorage.getItem("imageHistory");
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        const updatedHistory = parsedHistory.filter((item: HistoryItem) => item.id !== id);
        localStorage.setItem("imageHistory", JSON.stringify(updatedHistory));
        refreshHistory();
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your creations...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-6 text-center">
        <div className="bg-primary/10 p-6 rounded-full">
          <ImageIcon className="h-10 w-10 text-primary" />
        </div>
        <div className="max-w-[300px] space-y-2">
          <h3 className="text-xl font-semibold">No Images Yet</h3>
          <p className="text-sm text-muted-foreground">
            Your AI-generated masterpieces will appear here. Start creating by selecting a model above!
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
            onDelete={handleDelete}
            onRemix={(item) => remixImage(item)}
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
  onDetailsClick,
  onDelete,
  onRemix
}: { 
  item: HistoryItem; 
  onImageClick: () => void;
  onDetailsClick: () => void;
  onDelete: (id: string) => void;
  onRemix: (item: HistoryItem) => void;
}) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-b from-background to-muted/20 dark:from-background dark:to-muted/10 border-0 ring-1 ring-black/5">
      <div className="space-y-3 p-2">
        <div 
          className="relative aspect-square rounded-lg overflow-hidden cursor-zoom-in ring-1 ring-black/10 group-hover:ring-primary/20 transition-all duration-300"
          onClick={onImageClick}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-30 transition-opacity duration-300 group-hover:opacity-40"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          />
          
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <Loader2 className="h-6 w-6 animate-spin text-primary relative z-10" />
              </div>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={item.imageUrl}
              alt={item.prompt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw"
              className={cn(
                "object-contain transition-all duration-500",
                imageLoading ? "opacity-0" : "opacity-100"
              )}
              onLoadingComplete={() => setImageLoading(false)}
              priority={false}
            />
          </div>
        </div>

        <div className="space-y-3 px-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium leading-snug">
              <span className="line-clamp-2">
                {item.prompt}
              </span>
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {item.model}
              </span>
              <span className="text-green-600 dark:text-green-400 text-xs font-medium px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                ${item.cost.toFixed(4)}
              </span>
              {item.requestDetails?.options?.seed && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium text-muted-foreground">
                  Seed: {item.requestDetails.options.seed}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemix(item)}
                className="h-8 px-2 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-3.5 w-3.5 mr-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="text-xs">Remix</span>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onDetailsClick}
                    className="h-8 px-2 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <InfoIcon className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Details</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                      <span>Generation Details</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
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
                        <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm">
                          {JSON.stringify(item.requestDetails || {}, null, 2)}
                        </pre>
                      </section>
                      
                      <section>
                        <h3 className="text-sm font-semibold mb-2">Response Details</h3>
                        <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm">
                          {JSON.stringify(item.responseDetails || {}, null, 2)}
                        </pre>
                      </section>

                      {item.logs && (
                        <section>
                          <h3 className="text-sm font-semibold mb-2">Logs</h3>
                          <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap text-sm font-mono">
                            {item.logs}
                          </pre>
                        </section>
                      )}
                    </div>
                  </ScrollAreaPrimitive>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive transition-colors group/delete"
              >
                <Trash2Icon className="h-3.5 w-3.5 transition-transform group-hover/delete:scale-110" />
                <span className="sr-only">Delete image</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 