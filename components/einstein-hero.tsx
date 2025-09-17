"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const einsteinImages = [
  { src: "/images/einstein-graffiti.png", alt: "Einstein Graffiti Art" },
  { src: "/images/einstein-colorful.png", alt: "Colorful Einstein" },
  { src: "/images/einstein-brain.png", alt: "Einstein with Brain" },
  { src: "/images/einstein-cosmic.png", alt: "Cosmic Einstein" },
  { src: "/images/einstein-geometric.png", alt: "Geometric Einstein" },
  { src: "/images/einstein-sketch.png", alt: "Einstein Sketch" },
  { src: "/images/einstein-formula.png", alt: "Einstein with Formula" },
  { src: "/images/einstein-mural.png", alt: "Einstein Mural" },
  { src: "/images/einstein-pipe.png", alt: "Einstein with Pipe" },
]

export function EinsteinHero() {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % einsteinImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden border-4 border-primary/30 shadow-2xl mx-auto">
        {einsteinImages.map((image, index) => (
          <Image
            key={image.src}
            src={image.src || "/placeholder.svg"}
            alt={image.alt}
            fill
            className={`object-cover transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
