import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-bold text-center">FAL.AI Web Interface</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Generate amazing images using FAL.AI&apos;s powerful AI models
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/flux/fal-ai-flux-pro-v1.1">Flux Pro</Link>
          </Button>
          <Button asChild>
            <Link href="/flux/fal-ai-flux-pro-v1.1-ultra">Flux Pro Ultra</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}