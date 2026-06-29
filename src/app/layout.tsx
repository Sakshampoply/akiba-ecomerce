import type { Metadata } from "next"
import { Inter, Syne } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Akiba Shop — Premium Anime Merchandise",
    template: "%s | Akiba Shop",
  },
  description:
    "The definitive destination for premium anime figures, apparel, and collectibles.",
  keywords: ["anime", "figures", "merchandise", "collectibles", "manga"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#f0f0ff] antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
