"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Sparkles } from "lucide-react"

interface EinsteinSuccessProps {
  show: boolean
  onComplete?: () => void
}

export function EinsteinSuccess({ show, onComplete }: EinsteinSuccessProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative animate-bounce">
        <div className="w-48 h-48 relative">
          <Image
            src="/images/einstein-graffiti.png"
            alt="Einstein celebrating"
            fill
            className="object-cover rounded-full border-4 border-primary shadow-2xl"
          />
        </div>
        <div className="absolute -top-4 -right-4">
          <Sparkles className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div className="absolute -bottom-4 -left-4">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <div className="absolute top-1/2 -right-8">
          <Sparkles className="w-4 h-4 text-primary animate-bounce" />
        </div>
      </div>
      <div className="absolute bottom-1/3 text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Brilliant!</h2>
        <p className="text-muted-foreground">
          "Great spirits have always encountered violent opposition from mediocre minds"
        </p>
      </div>
    </div>
  )
}
