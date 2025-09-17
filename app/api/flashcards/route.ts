import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { set_id, front_text, back_text, position } = await request.json()

    if (!set_id || !front_text?.trim() || !back_text?.trim()) {
      return NextResponse.json({ error: "Set ID, front text, and back text are required" }, { status: 400 })
    }

    // Verify the set belongs to the user
    const { data: setData, error: setError } = await supabase
      .from("flashcard_sets")
      .select("id")
      .eq("id", set_id)
      .eq("user_id", user.id)
      .single()

    if (setError || !setData) {
      return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 })
    }

    // Create the flashcard
    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        set_id,
        front_text: front_text.trim(),
        back_text: back_text.trim(),
        position: position || 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating flashcard:", error)
      return NextResponse.json({ error: "Failed to create flashcard" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error in POST flashcards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
