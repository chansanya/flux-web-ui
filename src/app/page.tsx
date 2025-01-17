import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { allModels } from "@/lib/models/registry";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-bold text-center">FAL.AI Web Interface</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Generate amazing images using FAL.AI&apos;s powerful AI models
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
          {allModels.map((model) => (
            <Link 
              key={model.id} 
              href={`/flux/${model.id.replace(/\//g, "-")}`}
              className="block"
            >
              <Card className="aspect-square flex items-center justify-center p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center">{model.name}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}