import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ setId: string }> }) {
  try {
    const { setId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Update the flashcard set
    const { data, error } = await supabase
      .from("flashcard_sets")
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", setId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating flashcard set:", error)
      return NextResponse.json({ error: "Failed to update flashcard set" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error in PATCH flashcard-sets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ setId: string }> }) {
  try {
    const { setId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the flashcard set (cascades to delete flashcards)
    const { error } = await supabase.from("flashcard_sets").delete().eq("id", setId).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting flashcard set:", error)
      return NextResponse.json({ error: "Failed to delete flashcard set" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error in DELETE flashcard-sets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
