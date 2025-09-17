"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const einsteinQuotes = [
  {
    quote: "Try not to become a person of success, but rather try to become a person of value.",
    image: "/images/einstein-sketch.png",
  },
  {
    quote: "Education is what remains after one has forgotten what one has learned in school.",
    image: "/images/einstein-formula.png",
  },
  {
    quote: "The only source of knowledge is experience.",
    image: "/images/einstein-cosmic.png",
  },
  {
    quote: "Logic will get you from A to B. Imagination will take you everywhere.",
    image: "/images/einstein-colorful.png",
  },
]

export function EinsteinQuotes() {
  const [currentQuote, setCurrentQuote] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % einsteinQuotes.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const quote = einsteinQuotes[currentQuote]

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
          <Image
            src={quote.image || "/placeholder.svg"}
            alt="Einstein"
            fill
            className="object-cover rounded-full border-2 border-primary/30"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <blockquote className="text-base sm:text-lg font-medium text-foreground mb-2 leading-relaxed">
            "{quote.quote}"
          </blockquote>
          <cite className="text-sm text-primary font-semibold">— Albert Einstein</cite>
        </div>
      </div>
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
  )
}
