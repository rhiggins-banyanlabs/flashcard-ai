"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"

export default function UploadPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      setProgressMessage("")
      return
    }

    const progressSteps = [
      { progress: 10, message: "Uploading document...", delay: 500 },
      { progress: 30, message: "Extracting text from document...", delay: 2000 },
      { progress: 60, message: "AI is analyzing content...", delay: 3000 },
      { progress: 85, message: "Generating flashcards...", delay: 4000 },
      { progress: 95, message: "Saving to database...", delay: 1000 },
    ]

    let currentStep = 0
    let timeoutId: NodeJS.Timeout

    const runNextStep = () => {
      if (currentStep < progressSteps.length) {
        const step = progressSteps[currentStep]
        setProgress(step.progress)
        setProgressMessage(step.message)
        currentStep++

        if (currentStep < progressSteps.length) {
          timeoutId = setTimeout(runNextStep, step.delay)
        }
      }
    }

    // Start the first step immediately
    runNextStep()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isLoading])

  const extractTitleFromFilename = (filename: string): string => {
    const nameWithoutExtension = filename.replace(/\.[^/.]+$/, "")
    const cleanedName = nameWithoutExtension.replace(/[_-]/g, " ")
    return cleanedName.replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, TXT, DOC, or DOCX file")
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)
    const extractedTitle = extractTitleFromFilename(selectedFile.name)
    setTitle(extractedTitle)
    setError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) {
      setError("Please provide a title and select a file")
      return
    }

    setIsLoading(true)
    setError(null)
    setProgress(0)
    setProgressMessage("Starting upload...")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title.trim())
      formData.append("description", description.trim())

      const response = await fetch("/api/process-document", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process document")
      }

      const { setId } = await response.json()

      setProgress(100)
      setProgressMessage("Complete! Redirecting...")

      setTimeout(() => {
        router.push(`/study/${setId}`)
      }, 500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-primary">Upload Document</h1>
            <p className="text-muted-foreground">Upload a document and let AI create flashcards for you</p>
          </div>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-card-foreground">Document Upload</CardTitle>
              <CardDescription>Select your document file first, then customize the details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-2">
                  <Label className="text-foreground">Document File *</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDragOver
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input")?.click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl">📄</div>
                      <div className="text-lg font-medium">
                        {isDragOver ? "Drop your file here" : "Drag & drop your file here"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        or <span className="text-primary font-medium">click to browse</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Supported formats: PDF, TXT, DOC, DOCX (max 10MB)</p>
                </div>

                {file && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <span className="text-blue-600 font-mono">📄</span>
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}

                {file && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="title" className="text-foreground">
                        Flashcard Set Title *
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="e.g., Biology Chapter 5 Vocabulary"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description" className="text-foreground">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of what this flashcard set covers"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="bg-background text-foreground border-border"
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {isLoading && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{progressMessage}</span>
                      <span className="text-lg font-bold text-primary">{progress}%</span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || !file || !title.trim()}>
                  {isLoading ? (
                    <>
                      <span className="mr-2">⏳</span>
                      Processing Document...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">⬆️</span>
                      Create Flashcards
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
