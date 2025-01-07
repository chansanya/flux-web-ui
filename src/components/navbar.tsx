import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Navbar() {
  const navItems = [
    {
      href: "/flux/flux-pro/v1.1-ultra",
      label: "Flux Pro Ultra",
      icon: "✨"
    },
    {
      href: "/flux/flux-pro/v1.1-ultra/redux",
      label: "Flux Pro Ultra Redux",
      icon: "🚀"
    },
    {
      href: "/flux-lora",
      label: "Flux Lora",
      icon: "🎨"
    }
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <Sparkles className="h-5 w-5 text-blue-600" />
              FLUX WEB UI
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="text-sm font-medium transition-colors hover:bg-muted relative group px-4 cursor-pointer"
                  asChild
                >
                  <Link href={item.href}>
                    <span className="flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      {item.label}
                    </span>
                    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all group-hover:w-full" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <div className="md:hidden flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className="text-lg cursor-pointer"
                asChild
              >
                <Link href={item.href}>
                  <span>{item.icon}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
} 