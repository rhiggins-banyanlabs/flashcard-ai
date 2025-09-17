"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Clock, BookOpen, Sparkles } from "lucide-react"
import { ThemeSelector } from "@/components/theme-selector"
import { EinsteinHero } from "@/components/einstein-hero"

const einsteinQuotes = [
  "Imagination is more important than knowledge",
  "Try not to become a person of success, but rather try to become a person of value",
  "Education is what remains after one has forgotten what one has learned in school",
  "The only source of knowledge is experience",
  "Logic will get you from A to B. Imagination will take you everywhere",
]

export default function HomePage() {
  const [currentQuote, setCurrentQuote] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % einsteinQuotes.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeSelector dropdown />
      </div>

      <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          <Sparkles className="w-8 h-8 text-primary" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
        </div>
      </div>

      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-8 mt-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-4 items-center mb-4 min-h-[400px]">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 text-balance leading-tight">
              Master Your Studies with AI-Powered Flashcards
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl leading-relaxed">
              Upload documents, let AI create flashcards, and study smarter with our interactive learning platform.
            </p>
            <div className="flex gap-4 items-center justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium"
                asChild
              >
                <Link href="/auth/sign-up">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started
                </Link>
              </Button>
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                Sign In
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <EinsteinHero />
          </div>
        </div>

        <div className="text-center mb-2">
          <p className="text-3xl md:text-4xl font-bold leading-relaxed min-h-[100px] flex items-center justify-center">
            <span
              className="animate-pulse"
              style={{
                background: "linear-gradient(90deg, #f43f5e, #a855f7, #3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "#a855f7", // fallback color
              }}
            >
              "{einsteinQuotes[currentQuote]}"
            </span>
          </p>
          <p className="text-lg text-muted-foreground mt-2 font-medium">- Albert Einstein</p>

          <div className="flex justify-center mt-4 gap-2">
            {einsteinQuotes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuote(index)}
                className={`w-2 h-2 rounded-full transition-colors ${index === currentQuote ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8">
          <Card className="bg-card border-border hover:border-border/80 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-card-foreground text-xl font-semibold mb-2">Upload Documents</CardTitle>
              <CardDescription className="text-muted-foreground leading-relaxed">
                Upload PDFs or text documents with vocabulary and study material
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-border/80 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-card-foreground text-xl font-semibold mb-2">AI Processing</CardTitle>
              <CardDescription className="text-muted-foreground leading-relaxed">
                Our AI extracts key terms and creates perfect flashcards automatically
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-border/80 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-card-foreground text-xl font-semibold mb-2">Interactive Study</CardTitle>
              <CardDescription className="text-muted-foreground leading-relaxed">
                Study with click-to-flip cards and track your progress
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
