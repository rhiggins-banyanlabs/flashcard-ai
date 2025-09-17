"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "pink" | "blue" | "purple" | "green"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("pink")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { createBrowserClient } = await import("@supabase/ssr")
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        // First check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Load theme from user profile
          const { data: profile } = await supabase.from("profiles").select("theme").eq("id", user.id).single()

          if (profile?.theme) {
            setThemeState(profile.theme as Theme)
            localStorage.setItem("theme", profile.theme)
          }
        } else {
          // Load theme from localStorage for non-authenticated users
          const savedTheme = localStorage.getItem("theme") as Theme
          if (savedTheme && ["pink", "blue", "purple", "green"].includes(savedTheme)) {
            setThemeState(savedTheme)
          }
        }
      } catch (error) {
        console.error("Error loading theme:", error)
        // Fallback to localStorage
        const savedTheme = localStorage.getItem("theme") as Theme
        if (savedTheme && ["pink", "blue", "purple", "green"].includes(savedTheme)) {
          setThemeState(savedTheme)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  const setTheme = async (newTheme: Theme) => {
    console.log("[v0] Setting theme to:", newTheme)
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)

    try {
      const { createBrowserClient } = await import("@supabase/ssr")
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        console.log("[v0] Updating theme in database for user:", user.id)
        await supabase.from("profiles").update({ theme: newTheme }).eq("id", user.id)
        console.log("[v0] Theme updated in database successfully")
      } else {
        console.log("[v0] No user authenticated, theme saved to localStorage only")
      }
    } catch (error) {
      console.error("[v0] Error saving theme:", error)
    }
  }

  useEffect(() => {
    console.log("[v0] Applying theme class:", `theme-${theme}`)
    const html = document.documentElement
    // Remove any existing theme classes
    html.classList.remove("theme-pink", "theme-blue", "theme-purple", "theme-green")
    // Add the new theme class
    html.classList.add(`theme-${theme}`)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>{children}</ThemeContext.Provider>
}
