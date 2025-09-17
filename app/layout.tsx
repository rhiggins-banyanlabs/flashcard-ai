import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Crimson_Text } from "next/font/google"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeProvider as CustomThemeProvider } from "@/contexts/theme-context"
import "./globals.css"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
})

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  variable: "--font-crimson",
  weight: ["400", "600", "700"],
})

export const metadata: Metadata = {
  title: "FlashCard Master",
  description: "Master your studies with AI-powered flashcards",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${playfairDisplay.variable} ${crimsonText.variable} antialiased`}>
        <CustomThemeProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95" />

              {/* Floating sparkles */}
              {[...Array(15)].map((_, i) => (
                <div
                  key={`sparkle-${i}`}
                  className="absolute w-1 h-1 bg-primary/30 rounded-full animate-sparkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}

              {/* Floating geometric shapes */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={`shape-${i}`}
                  className="absolute w-2 h-2 bg-primary/10 rotate-45 animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${4 + Math.random() * 3}s`,
                  }}
                />
              ))}

              {/* Bouncing dots */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`dot-${i}`}
                  className="absolute w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce-slow"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
            <div className="relative z-10">
              <Suspense fallback={null}>{children}</Suspense>
            </div>
          </ThemeProvider>
        </CustomThemeProvider>
      </body>
    </html>
  )
}
