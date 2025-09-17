"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, RotateCcw, Home, Check, X, BarChart3 } from "lucide-react"
import Link from "next/link"

interface Flashcard {
  id: string
  front_text: string
  back_text: string
  position: number
}

interface FlashcardSet {
  id: string
  title: string
  description: string | null
}

interface FlashcardViewerProps {
  flashcardSet: FlashcardSet
  flashcards: Flashcard[]
  userId: string
}

export function FlashcardViewer({ flashcardSet, flashcards, userId }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [studyMode, setStudyMode] = useState<"front-to-back" | "back-to-front">("front-to-back")
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>(flashcards)
  const [studyStats, setStudyStats] = useState({
    cardsStudied: 0,
    cardsCorrect: 0,
  })
  const [sessionStartTime] = useState(new Date())
  const [isSavingSession, setIsSavingSession] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  const currentCards = isShuffled ? shuffledCards : flashcards
  const currentCard = currentCards[currentIndex]
  const progress = ((currentIndex + 1) / currentCards.length) * 100

  useEffect(() => {
    setIsFlipped(false)
  }, [currentIndex])

  const handleCardClick = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    if (currentIndex < currentCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setShowCompletionModal(true)
      saveStudySession()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleCorrect = () => {
    setStudyStats((prev) => ({
      cardsStudied: prev.cardsStudied + 1,
      cardsCorrect: prev.cardsCorrect + 1,
    }))
    handleNext()
  }

  const handleIncorrect = () => {
    setStudyStats((prev) => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
    }))
    handleNext()
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setStudyStats({
      cardsStudied: 0,
      cardsCorrect: 0,
    })
    setShowCompletionModal(false)
  }

  const handleResetDialogAction = async (action: "restart" | "complete" | "cancel") => {
    if (action === "restart") {
      handleRestart()
    } else if (action === "complete") {
      setShowCompletionModal(false)
      await completeSession()
    } else {
      setShowCompletionModal(false)
    }
  }

  const saveStudySession = async () => {
    if (studyStats.cardsStudied === 0) return

    console.log("[v0] Attempting to save study session:", {
      set_id: flashcardSet.id,
      cards_studied: studyStats.cardsStudied,
      cards_correct: studyStats.cardsCorrect,
    })

    setIsSavingSession(true)
    try {
      const response = await fetch("/api/study-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          set_id: flashcardSet.id,
          cards_studied: studyStats.cardsStudied,
          cards_correct: studyStats.cardsCorrect,
        }),
      })

      console.log("[v0] Study session API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("[v0] Study session API error:", errorData)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Study session saved successfully:", result)
    } catch (error) {
      console.error("[v0] Failed to save study session:", error)
    } finally {
      setIsSavingSession(false)
    }
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      event.preventDefault()
      handleCardClick()
    } else if (event.code === "ArrowLeft") {
      event.preventDefault()
      handlePrevious()
    } else if (event.code === "ArrowRight") {
      event.preventDefault()
      handleNext()
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentIndex, isFlipped])

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
    setIsShuffled(true)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const unshuffleCards = () => {
    setIsShuffled(false)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const toggleStudyMode = () => {
    setStudyMode((prev) => (prev === "front-to-back" ? "back-to-front" : "front-to-back"))
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const completeSession = async () => {
    if (studyStats.cardsStudied > 0) {
      await saveStudySession()
    }
    setShowCompletionModal(true)
  }

  const accuracy =
    studyStats.cardsStudied > 0 ? Math.round((studyStats.cardsCorrect / studyStats.cardsStudied) * 100) : 0
  const sessionDuration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60) // minutes

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              Study Session Complete!
            </DialogTitle>
            <DialogDescription className="text-center">Great job studying {flashcardSet.title}</DialogDescription>
          </DialogHeader>

          <div className="bg-card border-border rounded-lg p-4 my-4 shadow-lg">
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div>
                <div className="text-2xl font-bold text-primary">{studyStats.cardsStudied}</div>
                <div className="text-sm text-muted-foreground">Cards Studied</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-accent">{studyStats.cardsCorrect}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">{sessionDuration}m</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>
          </div>

          {isSavingSession && <p className="text-sm text-muted-foreground text-center">Saving your progress...</p>}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={handleRestart} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <RotateCcw className="h-4 w-4 mr-2" />
              Study Again
            </Button>
            <Link href={`/analytics/${flashcardSet.id}`}>
              <Button
                variant="outline"
                className="border-2 border-secondary/50 hover:border-secondary text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent w-full"
                onClick={() => setShowCompletionModal(false)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Stats
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-2 border-primary/50 hover:border-primary text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent w-full"
                onClick={() => setShowCompletionModal(false)}
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => {
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
            ]
            return (
              <div
                key={i}
                className="absolute text-primary/20 animate-bounce"
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

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-6">
            {/* Top row: Title on left, Dashboard on right */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-balance bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {flashcardSet.title}
                </h1>
                <p className="text-muted-foreground">
                  Card {currentIndex + 1} of {currentCards.length}
                </p>
              </div>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-secondary/50 hover:border-secondary text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>

            {/* Bottom row: Other control buttons */}
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button
                onClick={toggleStudyMode}
                variant="outline"
                size="sm"
                className="border-2 border-primary/50 hover:border-primary text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
              >
                {studyMode === "front-to-back" ? "Vocab → Def" : "Def → Vocab"}
              </Button>
              <Button
                onClick={isShuffled ? unshuffleCards : shuffleCards}
                variant="outline"
                size="sm"
                className="border-2 border-accent/50 hover:border-accent text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
              >
                {isShuffled ? "Unshuffle" : "Shuffle"}
              </Button>
              <Button
                onClick={completeSession}
                variant="outline"
                size="sm"
                className="border-2 border-secondary/50 hover:border-secondary text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <Progress value={progress} className="h-2 bg-muted" />
            {studyStats.cardsStudied > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>
                  Studied: <span className="text-primary font-medium">{studyStats.cardsStudied}</span> | Correct:{" "}
                  <span className="text-secondary font-medium">{studyStats.cardsCorrect}</span>
                </span>
                <span>
                  Accuracy:{" "}
                  <span className="text-accent font-medium">
                    {studyStats.cardsStudied > 0
                      ? Math.round((studyStats.cardsCorrect / studyStats.cardsStudied) * 100)
                      : 0}
                    %
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-center mb-8">
            <Card
              className="w-full max-w-sm md:max-w-2xl h-64 md:h-80 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 bg-card border-2 border-primary/50 hover:border-primary/80 mx-2"
              onClick={handleCardClick}
            >
              <CardContent className="flex items-center justify-center h-full p-4 md:p-8">
                <div className="text-center">
                  <div className="text-xl md:text-4xl font-medium text-balance leading-relaxed">
                    {isFlipped ? (
                      studyMode === "front-to-back" ? (
                        <span className="text-foreground text-base md:text-xl">{currentCard.back_text}</span>
                      ) : (
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bold">
                          {currentCard.front_text}
                        </span>
                      )
                    ) : studyMode === "front-to-back" ? (
                      <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bold">
                        {currentCard.front_text}
                      </span>
                    ) : (
                      <span className="text-foreground text-base md:text-xl">{currentCard.back_text}</span>
                    )}
                  </div>
                  {!isFlipped && (
                    <div className="mt-4 md:mt-6 text-xs md:text-sm text-muted-foreground">Click to reveal answer</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col items-center gap-4 md:gap-6 px-2">
            <div className="flex items-center gap-2 md:gap-4 w-full max-w-md justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                variant="outline"
                size="lg"
                className="border-2 border-primary/50 hover:border-primary text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent disabled:opacity-50 flex-shrink-0"
              >
                <ChevronLeft className="h-5 w-5 md:mr-2" />
                <span className="hidden lg:inline">Previous</span>
              </Button>

              <Button
                onClick={handleCardClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 md:px-8 flex-shrink-0"
                size="lg"
              >
                <span className="text-sm md:text-base">{isFlipped ? "Hide Answer" : "Show Answer"}</span>
              </Button>

              <Button
                onClick={handleNext}
                variant="outline"
                size="lg"
                className="border-2 border-primary/50 hover:border-primary text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent flex-shrink-0"
              >
                <span className="hidden lg:inline">Next</span>
                <ChevronRight className="h-5 w-5 lg:ml-2" />
              </Button>
            </div>

            {isFlipped && (
              <div className="flex items-center gap-2 md:gap-4">
                <Button
                  onClick={handleIncorrect}
                  variant="outline"
                  size="lg"
                  className="border-2 border-red-500/50 hover:border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
                >
                  <X className="h-5 w-5 mr-1 md:mr-2" />
                  <span className="text-sm md:text-base">Incorrect</span>
                </Button>
                <Button
                  onClick={handleCorrect}
                  variant="outline"
                  size="lg"
                  className="border-2 border-green-500/50 hover:border-green-500 text-green-500 hover:bg-green-500/10 bg-transparent"
                >
                  <Check className="h-5 w-5 mr-1 md:mr-2" />
                  <span className="text-sm md:text-base">Correct</span>
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <p>Use Space to flip, ← → arrows to navigate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
