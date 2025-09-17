"use client"

import { useTheme, type Theme } from "@/contexts/theme-context"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Palette } from "lucide-react"

const themes = [
  {
    name: "pink" as Theme,
    label: "Rose & Black",
    description: "Bold and vibrant",
    colors: ["bg-rose-500", "bg-black"],
  },
  {
    name: "blue" as Theme,
    label: "Blue & Black",
    description: "Cool and professional",
    colors: ["bg-blue-500", "bg-black"],
  },
  {
    name: "purple" as Theme,
    label: "Purple & Black",
    description: "Creative and modern",
    colors: ["bg-purple-500", "bg-black"],
  },
  {
    name: "green" as Theme,
    label: "Green & Black",
    description: "Fresh and natural",
    colors: ["bg-green-500", "bg-black"],
  },
]

interface ThemeSelectorProps {
  showTitle?: boolean
  compact?: boolean
  dropdown?: boolean
}

export function ThemeSelector({ showTitle = true, compact = false, dropdown = false }: ThemeSelectorProps) {
  const { theme, setTheme, isLoading } = useTheme()

  console.log("[v0] ThemeSelector rendered - current theme:", theme, "isLoading:", isLoading)

  if (isLoading) {
    return <div className="animate-pulse h-20 bg-muted rounded-lg" />
  }

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.name === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    const nextTheme = themes[nextIndex]
    setTheme(nextTheme.name)
  }

  if (dropdown) {
    const currentTheme = themes.find((t) => t.name === theme)

    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-transparent border-primary hover:border-primary/80"
        onClick={cycleTheme}
      >
        <Palette className="w-4 h-4" />
        {currentTheme ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {currentTheme.colors.map((color, index) => (
                <div key={index} className={`w-3 h-3 rounded-full ${color}`} />
              ))}
            </div>
            <span className="hidden sm:inline">{currentTheme.label}</span>
          </div>
        ) : (
          "Theme"
        )}
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h3 className="text-lg font-semibold">Choose Your Theme</h3>
          <p className="text-sm text-muted-foreground">Select a color scheme that matches your style</p>
        </div>
      )}

      <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
        {themes.map((themeOption) => (
          <Card
            key={themeOption.name}
            className={`cursor-pointer transition-all hover:shadow-md ${
              theme === themeOption.name ? "ring-2 ring-primary border-primary" : "hover:border-muted-foreground/50"
            }`}
            onClick={() => setTheme(themeOption.name)}
          >
            <CardHeader className={compact ? "p-3" : "p-4"}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {themeOption.colors.map((color, index) => (
                      <div key={index} className={`w-4 h-4 rounded-full ${color}`} />
                    ))}
                  </div>
                  <div>
                    <CardTitle className={compact ? "text-sm" : "text-base"}>{themeOption.label}</CardTitle>
                    {!compact && <CardDescription className="text-xs">{themeOption.description}</CardDescription>}
                  </div>
                </div>
                {theme === themeOption.name && <Check className="w-4 h-4 text-primary" />}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
