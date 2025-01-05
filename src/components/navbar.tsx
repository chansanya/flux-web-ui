import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Navbar() {
  const navItems = [
    {
      href: "/flux/flux-pro/v1.1-ultra",
      label: "Flux Pro Ultra"
    },
    {
      href: "/flux/flux-pro/v1.1-ultra/redux",
      label: "Flux Pro Ultra Redux"
    },
    {
      href: "/flux/flux-lora",
      label: "Flux Lora"
    }
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              FLUX WEB UI
            </Link>
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="text-sm font-medium transition-colors hover:bg-muted"
                  asChild
                >
                  <Link href={item.href}>
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 