import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FlashcardSetManager } from "@/components/flashcard-set-manager"

interface ManageSetPageProps {
  params: Promise<{ setId: string }>
}

export default async function ManageSetPage({ params }: ManageSetPageProps) {
  const { setId } = await params
  const supabase = await createClient()

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
      created_at,
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
    redirect("/dashboard")
  }

  // Sort flashcards by position
  const sortedFlashcards = flashcardSet.flashcards?.sort((a, b) => a.position - b.position) || []

  return (
    <div className="min-h-screen bg-background">
      <FlashcardSetManager
        flashcardSet={{
          id: flashcardSet.id,
          title: flashcardSet.title,
          description: flashcardSet.description,
          created_at: flashcardSet.created_at,
        }}
        flashcards={sortedFlashcards}
      />
    </div>
  )
}
