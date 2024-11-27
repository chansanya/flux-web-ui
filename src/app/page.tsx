import { ApiKeyForm } from "@/components/api-key-form";
import { ImageGenerator } from "@/components/image-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 pb-20 gap-8 sm:p-20">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">FAL.AI Studio</h1>
        <p className="text-muted-foreground mt-2">Generate amazing images with AI</p>
      </header>

      <main className="w-full max-w-4xl mx-auto">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="mt-6">
            <ImageGenerator />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <ApiKeyForm />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-4 flex-wrap">
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