"use client"

import Image from "next/image"

interface EinsteinLoadingProps {
  message?: string
}

export function EinsteinLoading({ message = "Einstein is thinking..." }: EinsteinLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-32 h-32 mb-4">
        <Image
          src="/images/einstein-brain.png"
          alt="Einstein thinking"
          fill
          className="object-cover rounded-full animate-pulse-glow"
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-primary/50 animate-spin"
          style={{ animationDuration: "3s" }}
        />
      </div>
      <p className="text-lg font-medium text-primary animate-pulse">{message}</p>
      <div className="flex gap-1 mt-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
