import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const supabase = await createClient()

    const filePath = params.path.join("/")

    const { data, error } = await supabase.storage.from("avatars").download(filePath)

    if (error) {
      console.error("Avatar download error:", error)
      return new NextResponse("Avatar not found", { status: 404 })
    }

    const headers = new Headers()
    headers.set("Content-Type", data.type || "image/jpeg")
    headers.set("Cache-Control", "public, max-age=3600")

    return new NextResponse(data, { headers })
  } catch (error) {
    console.error("Error serving avatar:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
