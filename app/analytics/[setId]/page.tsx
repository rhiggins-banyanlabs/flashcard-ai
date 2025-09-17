import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudyAnalytics } from "@/components/study-analytics"

interface AnalyticsPageProps {
  params: Promise<{ setId: string }>
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { setId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get flashcard set
  const { data: flashcardSet, error: setError } = await supabase
    .from("flashcard_sets")
    .select("id, title, description")
    .eq("id", setId)
    .eq("user_id", user.id)
    .single()

  if (setError || !flashcardSet) {
    redirect("/dashboard")
  }

  // Get study sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("set_id", setId)
    .eq("user_id", user.id)
    .order("session_date", { ascending: false })

  if (sessionsError) {
    console.error("Error fetching study sessions:", sessionsError)
  }

  return (
    <div className="min-h-screen bg-background">
      <StudyAnalytics flashcardSet={flashcardSet} sessions={sessions || []} />
    </div>
  )
}
