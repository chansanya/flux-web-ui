'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ApiKeyInput } from "./api-key-input";

const routes = [
  {
    href: "/flux/fal-ai-flux-pro-v1.1",
    label: "Flux Pro"
  },
  {
    href: "/flux/fal-ai-flux-pro-v1.1-ultra",
    label: "Flux Pro Ultra"
  }
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-xl mr-8">
            FAL.AI UI
          </Link>
          <nav className="flex items-center space-x-4">
            {routes.map((route) => (
              <Button
                key={route.href}
                asChild
                variant={pathname === route.href ? "default" : "ghost"}
                className={cn(
                  "transition-colors",
                  pathname === route.href && "bg-primary text-primary-foreground"
                )}
              >
                <Link href={route.href}>
                  {route.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        <ApiKeyInput />
      </div>
    </header>
  );
} 