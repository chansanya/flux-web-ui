import { ApiKeyForm } from "@/components/api-key-form"
import { ImageHistory } from "@/components/image-history"
import { Button } from "@/components/ui/button"
import { HistoryProvider } from "@/context/history-context"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <HistoryProvider>
      <div className="container mx-auto mt-24">
        <Navbar />
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
