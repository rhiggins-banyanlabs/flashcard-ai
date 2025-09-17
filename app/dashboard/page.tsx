import { Navigation } from "@/components/navigation"
import { DashboardClient } from "@/components/dashboard-client"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()

  const { data: flashcardSets } = await supabase
    .from("flashcard_sets")
    .select(`
      id,
      title,
      description,
      created_at,
      flashcards:flashcards(count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  console.log("[v0] User ID:", user.id)
  console.log("[v0] Profile data:", profile)
  console.log("[v0] Flashcard sets:", flashcardSets)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <DashboardClient
        profile={profile || { display_name: user.email?.split("@")[0] || "User" }}
        flashcardSets={flashcardSets || []}
      />
    </div>
  )
}
