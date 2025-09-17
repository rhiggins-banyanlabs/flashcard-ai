"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { EinsteinHero } from "@/components/einstein-hero"

interface DashboardClientProps {
  profile: any
  flashcardSets: any[]
}

export function DashboardClient({ profile, flashcardSets }: DashboardClientProps) {
  const [currentQuote, setCurrentQuote] = useState(0)

  const quotes = [
    "Imagination is more important than knowledge.",
    "Try not to become a person of success, but rather try to become a person of value.",
    "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    "The important thing is not to stop questioning.",
    "Education is what remains after one has forgotten what one has learned in school.",
    "Logic will get you from A to B. Imagination will take you everywhere.",
    "The only source of knowledge is experience.",
    "A person who never made a mistake never tried anything new.",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [quotes.length])

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => {
          const equations = [
            "E=mc²",
            "a²+b²=c²",
            "∫f(x)dx",
            "∑n=1",
            "π≈3.14",
            "∞",
            "√x",
            "∆y/∆x",
            "sin²+cos²=1",
            "lim→∞",
            "∂f/∂x",
            "∇²φ",
            "F=ma",
            "PV=nRT",
            "λ=h/p",
          ]
          return (
            <div
              key={i}
              className="absolute text-yellow-400/70 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <span className="text-lg font-mono">{equations[i % equations.length]}</span>
            </div>
          )
        })}
      </div>

      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-4 mt-8 relative z-10">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold mb-2 text-foreground bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text [background-clip:text] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] [&:not(:has(*))]:text-foreground">
            {profile?.display_name ? `Welcome back, ${profile.display_name}!` : "Your Flashcard Sets"}
          </h1>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">Flashcard Collections</h2>
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-2">
            {flashcardSets && flashcardSets.length > 0 ? (
              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 gap-4">
                  {flashcardSets.map((set: any) => (
                    <Card
                      key={set.id}
                      className="bg-card border-2 border-primary/30 hover:border-primary/50 border-l-4 border-l-primary hover:bg-accent/5 hover:shadow-lg hover:shadow-primary/10 hover:border-l-secondary transition-all duration-300 group"
                    >
                      <CardHeader>
                        <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                          {set.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">{set.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-muted-foreground">{set.flashcards?.[0]?.count || 0} cards</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(set.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <Link href={`/study/${set.id}`}>
                            <Button
                              size="sm"
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary/50 hover:border-primary cursor-pointer"
                            >
                              <span className="mr-1">📚</span>
                              Study
                            </Button>
                          </Link>
                          <Link href={`/manage/${set.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-2 border-secondary/50 hover:border-secondary text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer bg-transparent"
                            >
                              <span className="mr-1">✏️</span>
                              Manage
                            </Button>
                          </Link>
                          <Link href={`/analytics/${set.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-2 border-accent/50 hover:border-accent text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer bg-transparent"
                            >
                              <span className="mr-1">📊</span>
                              Stats
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 w-full text-center py-16">
                <div className="relative inline-block mb-6">
                  <span className="text-8xl animate-pulse">📤</span>
                  <div className="absolute -top-2 -right-2">
                    <span className="text-2xl animate-bounce font-mono">∑</span>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-3 text-foreground">No flashcard sets yet</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Upload a document to create your first flashcard set
                </p>
                <Link href="/upload">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/25 transition-all duration-300 cursor-pointer text-lg px-8 py-3">
                    <span className="mr-2">➕</span>
                    Create Your First Set
                  </Button>
                </Link>
              </div>
            )}
            <div className="flex-1 w-full lg:max-w-md flex justify-center lg:justify-end">
              <EinsteinHero />
            </div>
          </div>

          <div className="text-center mb-2 mt-8">
            <div className="relative max-w-4xl mx-auto px-4">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-center min-h-[140px] sm:min-h-[120px] md:min-h-[100px] flex items-center justify-center">
                <div className="relative w-full">
                  {quotes.map((quote, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center text-balance leading-relaxed px-2 py-4 ${
                        index === currentQuote ? "opacity-100" : "opacity-0"
                      }`}
                      style={{
                        background: "linear-gradient(45deg, #f43f5e, #a855f7, #3b82f6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        color: "#a855f7",
                      }}
                    >
                      "{quote}"
                    </div>
                  ))}
                  {/* Invisible placeholder to maintain height for longest quote */}
                  <div className="invisible text-xl sm:text-2xl md:text-3xl font-bold text-balance leading-relaxed px-2 py-4">
                    "Try not to become a person of success, but rather try to become a person of value."
                  </div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground mt-4 font-medium">- Albert Einstein</p>

              <div className="flex justify-center mt-6 gap-2">
                {quotes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuote(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentQuote ? "bg-primary scale-110" : "bg-muted hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to quote ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
