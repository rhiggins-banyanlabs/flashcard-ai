import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createClient()

    // Create the test user using Supabase Auth Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "test@example.com",
      password: "password123",
      email_confirm: true, // Skip email confirmation
    })

    if (authError) {
      // If user already exists, that's okay
      if (authError.message.includes("already registered")) {
        return NextResponse.json({ message: "Test user already exists" })
      }
      throw authError
    }

    const userId = authData.user.id

    // Create sample flashcard sets for the test user
    const { error: setError } = await supabase.from("flashcard_sets").insert([
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        user_id: userId,
        title: "Spanish Vocabulary",
        description: "Basic Spanish words and phrases",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        user_id: userId,
        title: "Programming Terms",
        description: "Essential programming concepts",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    if (setError) throw setError

    // Create sample flashcards
    const { error: cardError } = await supabase.from("flashcards").insert([
      // Spanish Vocabulary cards
      {
        flashcard_set_id: "550e8400-e29b-41d4-a716-446655440001",
        front: "Hola",
        back: "Hello",
        position: 0,
      },
      {
        flashcard_set_id: "550e8400-e29b-41d4-a716-446655440001",
        front: "Gracias",
        back: "Thank you",
        position: 1,
      },
      {
        flashcard_set_id: "550e8400-e29b-41d4-a716-446655440001",
        front: "Por favor",
        back: "Please",
        position: 2,
      },
      // Programming Terms cards
      {
        flashcard_set_id: "550e8400-e29b-41d4-a716-446655440002",
        front: "Variable",
        back: "A storage location with an associated name that contains data",
        position: 0,
      },
      {
        flashcard_set_id: "550e8400-e29b-41d4-a716-446655440002",
        front: "Function",
        back: "A reusable block of code that performs a specific task",
        position: 1,
      },
      {
        flashcard_set_id: "550e8400-e29b-41d4-a716-446655440002",
        front: "Array",
        back: "A data structure that stores multiple values in a single variable",
        position: 2,
      },
    ])

    if (cardError) throw cardError

    return NextResponse.json({
      message: "Test user and sample data created successfully",
      userId: userId,
    })
  } catch (error) {
    console.error("Error creating test user:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create test user" },
      { status: 500 },
    )
  }
}
