import { ApiKeyForm } from "@/components/api-key-form";
import { ImageGenerator } from "@/components/image-generator";
import { ImageHistory } from "@/components/image-history";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="relative text-center py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-small-black/[0.2] -z-10" />
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
            FAL.AI Flux 1.1 Pro Studio
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Generate amazing images with Flux 1.1 Pro - Next generation text-to-image model
          </p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 pb-16 space-y-16">
        <section className="space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-3xl font-semibold">Choose Your Model</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                asChild
              >
                <Link href="/flux/flux-pro/v1.1-ultra">
                  Flux 1.1 Pro Ultra
                </Link>
              </Button>
              <Button
                size="lg"
                className="min-w-[200px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                asChild
              >
                <Link href="/flux/flux-pro/v1.1-ultra/redux">
                  Flux 1.1 Pro Ultra Redux
                </Link>
              </Button>
              <Button
                size="lg"
                className="min-w-[200px] bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg"
                asChild
              >
                <Link href="/flux-lora">
                  Flux LoRA
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold">Generated Images</h2>
          </div>
          <div className="min-h-[600px] bg-white/50 dark:bg-gray-900/50 rounded-xl shadow-sm p-6">
            <ImageHistory />
          </div>
        </section>

        <section className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-semibold text-center">Settings</h2>
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl shadow-sm p-6">
            <ApiKeyForm />
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-8 bg-background/95">
        <div className="flex items-center justify-center gap-4 flex-wrap px-4">
          <p>Powered by FAL.AI and Next.js</p>
          <span>•</span>
          <p>A simple AI frontend for Flux API</p>
          <span>•</span>
          <p>Made with ❤️ in Vancouver, BC</p>
          <span>•</span>
          <a 
            href="https://github.com/olyaiy/simple-flux-web-api-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-primary transition-colors"
          >
            GitHub Repository
          </a>
        </div>
      </footer>
    </div>
  );
}