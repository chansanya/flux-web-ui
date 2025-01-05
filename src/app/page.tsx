import { ApiKeyForm } from "@/components/api-key-form";
import { ImageGenerator } from "@/components/image-generator";
import { ImageHistory } from "@/components/image-history";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="text-center py-8 px-4">
        <h1 className="text-4xl font-bold tracking-tight">FAL.AI Flux 1.1 Pro Studio</h1>
        <p className="text-muted-foreground mt-2">Generate amazing images with Flux 1.1 Pro - Next generation text-to-image model</p>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 pb-8 space-y-16">
        <section>
          <h2 className="text-2xl font-semibold mb-6">Image Generation</h2>
          <ImageGenerator />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Generated Images</h2>
          <div className="min-h-[600px]">
            <ImageHistory />
          </div>
        </section>

        <section className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Settings</h2>
          <ApiKeyForm />
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-8">
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
            className="hover:underline"
          >
            GitHub Repository
          </a>
        </div>
      </footer>
    </div>
  );
}