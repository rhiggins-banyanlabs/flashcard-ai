import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FlashcardViewer } from "@/components/flashcard-viewer"

interface StudyPageProps {
  params: Promise<{ setId: string }>
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { setId } = await params
  const supabase = await createClient()

  if (!supabase) {
    console.error("[v0] Supabase client is undefined")
    redirect("/auth/login")
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    // Get flashcard set with cards
    const { data: flashcardSet, error } = await supabase
      .from("flashcard_sets")
      .select(`
        id,
        title,
        description,
        flashcards (
          id,
          front_text,
          back_text,
          position
        )
      `)
      .eq("id", setId)
      .eq("user_id", user.id)
      .single()

    if (error || !flashcardSet) {
      console.error("[v0] Error fetching flashcard set:", error)
      redirect("/dashboard")
    }

    // Sort flashcards by position
    const sortedFlashcards = flashcardSet.flashcards?.sort((a, b) => a.position - b.position) || []

    if (sortedFlashcards.length === 0) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No flashcards found</h1>
            <p className="text-muted-foreground">This flashcard set appears to be empty.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background">
        <FlashcardViewer
          flashcardSet={{
            id: flashcardSet.id,
            title: flashcardSet.title,
            description: flashcardSet.description,
          }}
          flashcards={sortedFlashcards}
          userId={user.id}
        />
      </div>
    )
  } catch (error) {
    console.error("[v0] Error in StudyPage:", error)
    redirect("/auth/login")
  }
}
