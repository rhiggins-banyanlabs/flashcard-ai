import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pink-500 mb-4">Welcome to Your Dashboard!</h1>
          <p className="text-gray-400 mb-8">You're successfully logged in as {user.email}</p>
          <form action="/auth/signout" method="post">
            <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
