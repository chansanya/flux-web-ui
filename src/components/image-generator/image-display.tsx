import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Image } from "@/lib/types";

interface ImageDisplayProps {
  result: Image | null;
}

export function ImageDisplay({ result }: ImageDisplayProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Generated Image</CardTitle>
          <CardDescription>Your AI-generated artwork will appear here</CardDescription>
        </div>
        {result && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.open(result.url, '_blank')}
            title="Download Image"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {result ? (
          <img 
            src={result.url} 
            alt="Generated image"
            width={result.width}
            height={result.height}
            className="rounded-lg w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-[300px] bg-muted rounded-lg">
            <p className="text-muted-foreground">No image generated yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 