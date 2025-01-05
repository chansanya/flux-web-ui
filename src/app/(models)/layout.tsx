import { ApiKeyForm } from "@/components/api-key-form"
import { ImageHistory } from "@/components/image-history"
import { Button } from "@/components/ui/button"
import { HistoryProvider } from "@/context/history-context"
import Link from "next/link"

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <HistoryProvider>
      <div className="container mx-auto mt-24">
        <div className="flex ">
        <Button asChild>
            <Link href="/flux/flux-pro/v1.1-ultra">
              flux 1.1 pro ultra
            </Link>
          </Button>
          <Button asChild className=" mr-4 ml-4" >
            <Link href="/flux/flux-pro/v1.1-ultra/redux">
              flux 1.1 pro ultra(redux)
            </Link>
          </Button>

        </div>
        <div className="flex flex-row">
          {children}
        </div>

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
    </HistoryProvider>
  )
}

export default layout
