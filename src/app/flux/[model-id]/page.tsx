import { ImageGenerator } from "@/components/image-generator";
import { flux_1_1_pro, flux_1_1_pro_ultra } from "@/lib/models/flux/text-to-text";
import { notFound } from "next/navigation";

interface Props {
  params: {
    "model-id": string;
  }
}

export default async function FluxModelPage({ params }: Props) {
  const { "model-id": modelId } = await params;
  
  // Map URL-friendly IDs to actual models
  const model = {
    "fal-ai-flux-pro-v1.1": flux_1_1_pro,
    "fal-ai-flux-pro-v1.1-ultra": flux_1_1_pro_ultra,
  }[modelId];

  if (!model) {
    notFound();
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-bold text-center">{model.name}</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Generate images using {model.name}
        </p>
        <ImageGenerator model={model} />
      </div>
    </main>
  );
}
