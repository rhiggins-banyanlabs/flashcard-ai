"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  created_at: string
}

interface FlashcardSetManagerProps {
  flashcardSet: FlashcardSet
  flashcards: Flashcard[]
}

export function FlashcardSetManager({ flashcardSet, flashcards }: FlashcardSetManagerProps) {
  const [cards, setCards] = useState<Flashcard[]>(flashcards)
  const [setTitle, setSetTitle] = useState(flashcardSet.title)
  const [setDescription, setSetDescription] = useState(flashcardSet.description || "")
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [editingSet, setEditingSet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleUpdateSet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/flashcard-sets/${flashcardSet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: setTitle.trim(),
          description: setDescription.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update set")
      }

      setEditingSet(false)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSet = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/flashcard-sets/${flashcardSet.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete set")
      }

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleUpdateCard = async (cardId: string, frontText: string, backText: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/flashcards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          front_text: frontText.trim(),
          back_text: backText.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update card")
      }

      setCards(
        cards.map((card) =>
          card.id === cardId ? { ...card, front_text: frontText.trim(), back_text: backText.trim() } : card,
        ),
      )
      setEditingCard(null)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/flashcards/${cardId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete card")
      }

      setCards(cards.filter((card) => card.id !== cardId))
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCard = async (frontText: string, backText: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          set_id: flashcardSet.id,
          front_text: frontText.trim(),
          back_text: backText.trim(),
          position: cards.length,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add card")
      }

      const newCard = await response.json()
      setCards([...cards, newCard])
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex-1">
            {editingSet ? (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label htmlFor="set-title" className="text-foreground">
                    Title
                  </Label>
                  <Input
                    id="set-title"
                    value={setTitle}
                    onChange={(e) => setSetTitle(e.target.value)}
                    className="bg-card border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="set-description" className="text-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="set-description"
                    value={setDescription}
                    onChange={(e) => setSetDescription(e.target.value)}
                    className="bg-card border-border text-foreground"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateSet}
                    disabled={isLoading}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary"
                  >
                    💾 Save
                  </Button>
                  <Button
                    onClick={() => setEditingSet(false)}
                    variant="outline"
                    size="sm"
                    className="border-2 border-border text-foreground hover:bg-accent bg-transparent"
                  >
                    ✕ Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold mb-2 text-balance text-foreground">{setTitle}</h1>
                {setDescription && <p className="text-muted-foreground text-pretty">{setDescription}</p>}
                <p className="text-sm text-muted-foreground mt-2">{cards.length} cards</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Link href={`/study/${flashcardSet.id}`} className="flex-1 md:flex-none">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary w-full">
                📚 Study
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="border-2 border-border text-foreground hover:bg-accent bg-transparent w-full"
              >
                🏠 Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Set Management Actions */}
        {!editingSet && (
          <div className="flex gap-2 mb-8">
            <Button
              onClick={() => setEditingSet(true)}
              variant="outline"
              className="border-2 border-border text-foreground hover:bg-accent bg-transparent"
            >
              ✏️ Edit Set
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-2 border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  🗑️ Delete Set
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Delete Flashcard Set</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Are you sure you want to delete "{setTitle}"? This action cannot be undone and will delete all
                    flashcards in this set.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-2 border-border text-foreground hover:bg-accent bg-transparent">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSet}
                    disabled={isLoading}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-2 border-destructive"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Add New Card */}
        <div className="mb-8">
          <AddCardDialog onAddCard={handleAddCard} isLoading={isLoading} />
        </div>

        {/* Flashcards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <FlashcardEditor
              key={card.id}
              card={card}
              isEditing={editingCard === card.id}
              onStartEdit={() => setEditingCard(card.id)}
              onCancelEdit={() => setEditingCard(null)}
              onSave={(frontText, backText) => handleUpdateCard(card.id, frontText, backText)}
              onDelete={() => handleDeleteCard(card.id)}
              isLoading={isLoading}
            />
          ))}
        </div>

        {cards.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No flashcards in this set yet.</p>
            <AddCardDialog onAddCard={handleAddCard} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  )
}

interface FlashcardEditorProps {
  card: Flashcard
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSave: (frontText: string, backText: string) => void
  onDelete: () => void
  isLoading: boolean
}

function FlashcardEditor({
  card,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  isLoading,
}: FlashcardEditorProps) {
  const [frontText, setFrontText] = useState(card.front_text)
  const [backText, setBackText] = useState(card.back_text)

  const handleSave = () => {
    if (frontText.trim() && backText.trim()) {
      onSave(frontText, backText)
    }
  }

  const handleCancel = () => {
    setFrontText(card.front_text)
    setBackText(card.back_text)
    onCancelEdit()
  }

  if (isEditing) {
    return (
      <Card className="bg-card border-2 border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-sm">Editing Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`front-${card.id}`} className="text-foreground text-sm">
              Front
            </Label>
            <Textarea
              id={`front-${card.id}`}
              value={frontText}
              onChange={(e) => setFrontText(e.target.value)}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor={`back-${card.id}`} className="text-foreground text-sm">
              Back
            </Label>
            <Textarea
              id={`back-${card.id}`}
              value={backText}
              onChange={(e) => setBackText(e.target.value)}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading || !frontText.trim() || !backText.trim()}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary"
            >
              💾 Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="border-2 border-border text-foreground hover:bg-accent bg-transparent"
            >
              ✕ Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-2 border-border shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Front</div>
            <div className="text-foreground text-balance">{card.front_text}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Back</div>
            <div className="text-foreground text-balance">{card.back_text}</div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onStartEdit}
              variant="outline"
              size="sm"
              className="border-2 border-border text-foreground hover:bg-accent bg-transparent"
            >
              ✏️ Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  🗑️ Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Delete Flashcard</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Are you sure you want to delete this flashcard? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-2 border-border text-foreground hover:bg-accent bg-transparent">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    disabled={isLoading}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-2 border-destructive"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AddCardDialogProps {
  onAddCard: (frontText: string, backText: string) => void
  isLoading: boolean
}

function AddCardDialog({ onAddCard, isLoading }: AddCardDialogProps) {
  const [frontText, setFrontText] = useState("")
  const [backText, setBackText] = useState("")
  const [open, setOpen] = useState(false)

  const handleAdd = () => {
    if (frontText.trim() && backText.trim()) {
      onAddCard(frontText, backText)
      setFrontText("")
      setBackText("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary">
          ➕ Add New Card
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Flashcard</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new flashcard by entering the front and back content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="new-front" className="text-foreground">
              Front
            </Label>
            <Textarea
              id="new-front"
              value={frontText}
              onChange={(e) => setFrontText(e.target.value)}
              placeholder="Enter the question or term"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="new-back" className="text-foreground">
              Back
            </Label>
            <Textarea
              id="new-back"
              value={backText}
              onChange={(e) => setBackText(e.target.value)}
              placeholder="Enter the answer or definition"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="border-2 border-border text-foreground hover:bg-accent bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isLoading || !frontText.trim() || !backText.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary"
            >
              Add Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
