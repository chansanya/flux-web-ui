"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Lightbox } from "./ui/lightbox";
import { Button } from "./ui/button";
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

export function ImageHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<HistoryItem | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("imageHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load image history:", error);
      setHistory([]);
    }
  }, []);

  if (history.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No images generated yet. Try generating some images first!
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <ImageCard
              key={item.id}
              item={item}
              onImageClick={() => setSelectedImageUrl(item.imageUrl)}
              onDetailsClick={() => setSelectedImage(item)}
            />
          ))}
        </div>
      </ScrollArea>

      <Lightbox
        isOpen={Boolean(selectedImageUrl)}
        onClose={() => setSelectedImageUrl(null)}
        imageUrl={selectedImageUrl || ''}
      />
    </>
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
  return (
    <Card className="p-4">
      <div 
        className="aspect-square relative rounded-md overflow-hidden cursor-pointer"
        onClick={onImageClick}
      >
        <Image
          src={item.imageUrl}
          alt={item.prompt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform hover:scale-105"
          priority={false}
        />
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium line-clamp-2">{item.prompt}</p>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{item.model}</span>
          <span>${item.cost.toFixed(4)}</span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onDetailsClick}
              >
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Generation Details</DialogTitle>
              </DialogHeader>
              <ScrollAreaPrimitive className="h-[500px] mt-4">
                <div className="space-y-4 p-4">
                  <section>
                    <h3 className="font-semibold mb-2">Request Details</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                      {JSON.stringify(item.requestDetails, null, 2)}
                    </pre>
                  </section>
                  
                  <section>
                    <h3 className="font-semibold mb-2">Response Details</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                      {JSON.stringify(item.responseDetails, null, 2)}
                    </pre>
                  </section>

                  {item.logs && (
                    <section>
                      <h3 className="font-semibold mb-2">Logs</h3>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
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
    </Card>
  );
} 