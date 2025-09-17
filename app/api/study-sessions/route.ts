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

    const { set_id, cards_studied, cards_correct } = await request.json()

    if (!set_id || cards_studied === undefined || cards_correct === undefined) {
      return NextResponse.json({ error: "Set ID, cards studied, and cards correct are required" }, { status: 400 })
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

    // Create the study session
    const { data, error } = await supabase
      .from("study_sessions")
      .insert({
        set_id,
        user_id: user.id,
        cards_studied,
        cards_correct,
        session_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating study session:", error)
      return NextResponse.json({ error: "Failed to create study session" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error in POST study-sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
