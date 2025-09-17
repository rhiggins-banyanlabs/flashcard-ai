"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { createBrowserClient } from "@supabase/ssr"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, avatar_path")
          .eq("id", user.id)
          .single()

        setProfile(profileData)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)

      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, avatar_path")
          .eq("id", session.user.id)
          .single()

        setProfile(profileData)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ]

  const NavigationContent = () => (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2 transition-colors ${
              isActive
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary"
            }`}
          >
            <span className="w-4 h-4 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}

      <Link
        href="/upload"
        onClick={() => setIsOpen(false)}
        className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary transition-colors"
      >
        <span>📤</span>
        <span>Upload Document</span>
      </Link>

      <div className="flex items-center space-x-3 px-3 py-2 border-t border-border mt-4 pt-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {profile?.avatar_path ? (
            <img
              src={`/api/avatar/${profile.avatar_path}`}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling.style.display = "flex"
              }}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center text-primary text-sm font-medium ${profile?.avatar_path ? "hidden" : "flex"}`}
          >
            {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
          </div>
        </div>
        <span className="text-foreground font-medium">{profile?.display_name || user?.email}</span>
      </div>

      <button
        onClick={handleSignOut}
        className="flex items-center space-x-2 px-3 py-2 w-full text-left text-muted-foreground hover:text-red-500 hover:border-b-2 hover:border-red-500 transition-colors cursor-pointer"
      >
        <span className="w-4 h-4 text-center text-red-500">🚪</span>
        <span>Sign out</span>
      </button>
    </>
  )

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    await supabase.auth.signOut()
    router.push("/")
    setIsOpen(false)
  }

  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="text-primary font-bold text-xl">
            FlashCards AI
          </Link>

          {!isMobile && (
            <div className="flex items-center space-x-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 transition-colors ${
                      isActive
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary"
                    }`}
                  >
                    <span className="w-4 h-4 text-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              <Link
                href="/upload"
                className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary transition-colors"
              >
                <span>📤</span>
                <span>Upload Document</span>
              </Link>

              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_path ? (
                    <img
                      src={`/api/avatar/${profile.avatar_path}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                        e.currentTarget.nextElementSibling.style.display = "flex"
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center text-primary text-xs font-medium ${profile?.avatar_path ? "hidden" : "flex"}`}
                  >
                    {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                </div>
                <span className="text-muted-foreground text-sm">{profile?.display_name || user?.email}</span>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-red-500 hover:border-b-2 hover:border-red-500 transition-colors cursor-pointer"
              >
                <span className="w-4 h-4 text-center text-red-500">🚪</span>
                <span>Sign out</span>
              </button>
            </div>
          )}

          {isMobile && (
            <div className="flex items-center space-x-3">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <span className="w-5 h-5 text-center">☰</span>
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-48">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 mt-6">
                    <NavigationContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
