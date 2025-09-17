"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function SetupTestUserPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createTestUser = async () => {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/setup-test-user", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create test user")
      }

      setMessage("Test user created successfully! You can now login with: test@example.com / password123")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Setup Test User</CardTitle>
            <CardDescription className="text-slate-300">
              Create a test user account for development purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="text-sm text-slate-300">
                <p>
                  <strong>Test Credentials:</strong>
                </p>
                <p>Email: test@example.com</p>
                <p>Password: password123</p>
              </div>

              {message && (
                <div className="p-3 bg-green-900/50 border border-green-700 rounded text-green-300 text-sm">
                  {message}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">{error}</div>
              )}

              <Button onClick={createTestUser} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Creating Test User..." : "Create Test User"}
              </Button>

              <div className="text-center text-sm">
                <a href="/auth/login" className="text-blue-400 underline underline-offset-4 hover:text-blue-300">
                  Go to Login Page
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
