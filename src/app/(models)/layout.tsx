import { ApiKeyForm } from "@/components/api-key-form"
import { ImageHistory } from "@/components/image-history"

export default function ModelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto mt-12">
      <div className="flex flex-row">
        {children}
      </div>

      <section className="mt-16">
        <div className="min-h-[600px] max-w-7xl mx-auto">
          <ImageHistory />
        </div>
      </section>

      <section className="max-w-2xl mx-auto mt-16 mb-24">
        <h2 className="text-2xl font-semibold mb-6">Settings</h2>
        <ApiKeyForm />
      </section>
    </div>
  );
}
