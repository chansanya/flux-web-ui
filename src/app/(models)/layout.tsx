import { ApiKeyForm } from "@/components/api-key-form"
import { ImageHistory } from "@/components/image-history"


const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
    {children}

    <section>
          <div className="min-h-[600px] max-w-7xl mx-auto">
            <ImageHistory />
          </div>
        </section>

        <section className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Settings</h2>
          <ApiKeyForm />
        </section>

      
    </div>
  )
}

export default layout
