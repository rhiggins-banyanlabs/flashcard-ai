import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ setId: string }> }) {
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

    // Get study sessions for this set
    const { data: sessions, error } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("set_id", setId)
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })

    if (error) {
      console.error("Error fetching study sessions:", error)
      return NextResponse.json({ error: "Failed to fetch study sessions" }, { status: 500 })
    }

    // Calculate statistics
    const totalSessions = sessions.length
    const totalCardsStudied = sessions.reduce((sum, session) => sum + session.cards_studied, 0)
    const totalCardsCorrect = sessions.reduce((sum, session) => sum + session.cards_correct, 0)
    const averageAccuracy = totalCardsStudied > 0 ? Math.round((totalCardsCorrect / totalCardsStudied) * 100) : 0

    const recentSessions = sessions.slice(0, 10) // Last 10 sessions

    return NextResponse.json({
      sessions: recentSessions,
      stats: {
        totalSessions,
        totalCardsStudied,
        totalCardsCorrect,
        averageAccuracy,
      },
    })
  } catch (error) {
    console.error("Unexpected error in GET study-sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
