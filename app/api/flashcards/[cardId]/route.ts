import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ cardId: string }> }) {
  try {
    const { cardId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { front_text, back_text } = await request.json()

    if (!front_text?.trim() || !back_text?.trim()) {
      return NextResponse.json({ error: "Front text and back text are required" }, { status: 400 })
    }

    // Update the flashcard (RLS will ensure user owns the set)
    const { data, error } = await supabase
      .from("flashcards")
      .update({
        front_text: front_text.trim(),
        back_text: back_text.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardId)
      .select()
      .single()

    if (error) {
      console.error("Error updating flashcard:", error)
      return NextResponse.json({ error: "Failed to update flashcard" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error in PATCH flashcards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ cardId: string }> }) {
  try {
    const { cardId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the flashcard (RLS will ensure user owns the set)
    const { error } = await supabase.from("flashcards").delete().eq("id", cardId)

    if (error) {
      console.error("Error deleting flashcard:", error)
      return NextResponse.json({ error: "Failed to delete flashcard" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error in DELETE flashcards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
