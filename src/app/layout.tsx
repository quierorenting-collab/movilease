import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { getCurrentBrand } from "@/lib/brand";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${brand.name} | Renting de Coches para Particulares`,
      template: `%s | ${brand.name}`,
    },
    description: brand.description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
