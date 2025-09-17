"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ThemeSelector } from "@/components/theme-selector"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  display_name: string | null
  bio: string | null
  avatar_path: string | null
  classes: string[] | null
  theme: string | null
  created_at: string
  updated_at: string
}

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatar_path ? `/api/avatar/${profile.avatar_path}` : null,
  )
  const [classes, setClasses] = useState<string[]>(profile?.classes || [])
  const [newClass, setNewClass] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddClass = () => {
    if (newClass.trim() && !classes.includes(newClass.trim())) {
      setClasses([...classes, newClass.trim()])
      setNewClass("")
    }
  }

  const handleRemoveClass = (classToRemove: string) => {
    setClasses(classes.filter((c) => c !== classToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !authUser) {
        throw new Error("You must be logged in to update your profile")
      }

      let avatarPath = profile?.avatar_path

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop()
        const fileName = `${authUser.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        })

        if (uploadError) {
          console.error("Upload error:", uploadError)
          throw new Error(`Failed to upload image: ${uploadError.message}`)
        }
        avatarPath = fileName
      }

      const { error } = await supabase.from("profiles").upsert(
        {
          id: authUser.id,
          display_name: displayName,
          bio: bio,
          avatar_path: avatarPath,
          classes: classes,
          theme: profile?.theme, // Assuming theme is part of the profile
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again."
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-foreground">Theme Settings</CardTitle>
          <CardDescription className="text-muted-foreground">
            Choose your preferred color theme for the entire website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      <Card className="bg-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-foreground">Profile Information</CardTitle>
          <CardDescription className="text-muted-foreground">
            Update your profile details and manage your classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-foreground">
                Profile Picture
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-background border-border text-foreground"
              />
              {avatarPreview && (
                <div className="mt-2">
                  <img
                    src={avatarPreview || "/placeholder.svg"}
                    alt="Profile preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-foreground">
                Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-foreground">
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-background border-border text-foreground min-h-[100px]"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-foreground">Classes</Label>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add a class (e.g., Math 101, Biology)"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddClass())}
                  className="bg-background border-border text-foreground"
                />
                <Button
                  type="button"
                  onClick={handleAddClass}
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
                >
                  Add
                </Button>
              </div>

              {classes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {classes.map((className) => (
                    <Badge
                      key={className}
                      variant="secondary"
                      className="bg-secondary/20 text-secondary hover:bg-secondary/30 cursor-pointer"
                      onClick={() => handleRemoveClass(className)}
                    >
                      {className} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {message && (
              <div
                className={`p-3 rounded-md ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
              >
                Back to Dashboard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 mt-6">
        <CardHeader>
          <CardTitle className="text-foreground">Account Information</CardTitle>
          <CardDescription className="text-muted-foreground">Your account details from authentication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-foreground">{user.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
              <p className="text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Last Sign In</Label>
              <p className="text-foreground">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
