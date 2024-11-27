import "./globals.css";
import { fal } from "@fal-ai/client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAL.AI Studio",
  description: "Generate amazing images with AI using FAL.AI's powerful image generation API",
  keywords: ["AI", "image generation", "FAL.AI", "artificial intelligence", "stable diffusion"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "FAL.AI Studio",
    description: "Generate amazing images with AI using FAL.AI's powerful image generation API",
    type: "website",
    locale: "en_US",
    siteName: "FAL.AI Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAL.AI Studio",
    description: "Generate amazing images with AI using FAL.AI's powerful image generation API",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

fal.config({
  proxyUrl: "/api/fal/proxy",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
