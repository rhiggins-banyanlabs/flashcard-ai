import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user's profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => {
            const equations = [
              "E=mc²",
              "a²+b²=c²",
              "∫f(x)dx",
              "∑n=1",
              "π≈3.14",
              "∞",
              "√x",
              "∆y/∆x",
              "sin²+cos²=1",
              "lim→∞",
              "∂f/∂x",
              "∇²φ",
              "F=ma",
              "PV=nRT",
              "λ=h/p",
            ]
            return (
              <div
                key={i}
                className="absolute text-yellow-400/70 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <span className="text-lg font-mono">{equations[i % equations.length]}</span>
              </div>
            )
          })}
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 text-foreground bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text [background-clip:text] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] [&:not(:has(*))]:text-foreground">
              Your Profile
            </h1>
            <p className="text-muted-foreground text-lg">Manage your account information and preferences</p>
          </div>

          <ProfileForm user={user} profile={profile} />
        </div>
      </div>
    </div>
  )
}
