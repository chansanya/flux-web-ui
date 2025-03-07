import "./globals.css";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "FAL.AI Web Interface",
  description: "A modern web interface for FAL.AI image generation models",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
