import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Helper function to extract text from different file types
async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type
  const fileName = file.name.toLowerCase()

  console.log("[v0] Processing file:", fileName, "Type:", fileType)

  if (fileType === "text/plain") {
    return await file.text()
  }

  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    try {
      const { extractText } = await import("unpdf")
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      const { text } = await extractText(uint8Array, {
        mergePages: true,
      })

      console.log("[v0] Extracted PDF text length:", text.length)

      if (text.length < 50) {
        throw new Error("Insufficient text extracted from PDF")
      }

      return text
    } catch (error) {
      console.error("[v0] PDF parsing failed:", error)
      throw new Error("Could not extract text from PDF. Please try converting to a text file or DOCX format.")
    }
  }

  if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    try {
      const mammoth = await import("mammoth")
      const arrayBuffer = await file.arrayBuffer()

      // Use arrayBuffer directly instead of converting to Buffer
      const result = await mammoth.extractRawText({ arrayBuffer })
      console.log("[v0] Extracted DOCX text length:", result.value.length)

      if (result.value.length < 50) {
        throw new Error("Insufficient text extracted from DOCX")
      }

      return result.value
    } catch (error) {
      console.error("[v0] DOCX parsing failed:", error)
      throw new Error("Could not extract text from DOCX. Please try converting to a text file.")
    }
  }

  // For other file types, treat as plain text
  return await file.text()
}

// Helper function to clean and validate extracted text
function cleanText(text: string): string {
  // Remove excessive whitespace and normalize
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\-.,;:!?()[\]"']/g, "")
    .trim()
    .substring(0, 15000) // Increased limit for better content extraction

  console.log("[v0] Cleaned text length:", cleaned.length)
  return cleaned
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!file || !title) {
      return NextResponse.json({ error: "File and title are required" }, { status: 400 })
    }

    console.log("[v0] Processing document:", file.name, "Size:", file.size)

    // Extract text from the uploaded file
    let documentText: string
    try {
      documentText = await extractTextFromFile(file)
      documentText = cleanText(documentText)
    } catch (error) {
      console.error("Error extracting text from file:", error)
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Failed to extract text from document",
        },
        { status: 400 },
      )
    }

    if (!documentText || documentText.length < 50) {
      console.log("[v0] Document text too short:", documentText.length)
      return NextResponse.json({ error: "Document appears to be empty or too short" }, { status: 400 })
    }

    const prompt = `You are creating flashcards from the following study document. Extract ONLY the actual vocabulary terms, concepts, definitions, and facts that appear in this specific document.

Document content:
${documentText}

CRITICAL INSTRUCTIONS:
1. Extract ONLY terms, concepts, and facts that actually appear in the provided document
2. Do NOT create generic flashcards or add information not in the document
3. Look for key vocabulary words, important concepts, definitions, dates, names, and facts
4. Create as many flashcards as needed to cover all the important content from this document
5. Front of card: The term, concept, question, or prompt as it appears in the document
6. Back of card: The definition, explanation, or answer as provided in the document
7. Stay faithful to the document's content and terminology
8. If the document doesn't contain clear vocabulary terms, focus on key facts and concepts

Return ONLY a valid JSON array with no additional text or formatting:
[
  {
    "front": "Exact term or concept from document",
    "back": "Definition or explanation from document"
  }
]`

    let flashcardsData: Array<{ front: string; back: string }>

    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
        temperature: 0.1, // Very low temperature for consistent output
      })

      let cleanedText = text.trim()

      // Remove markdown code block markers if present
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      // Additional cleanup for any remaining markdown or extra text
      cleanedText = cleanedText.trim()

      // Find the JSON array in the response (in case there's extra text)
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        cleanedText = jsonMatch[0]
      }

      console.log("[v0] Cleaned AI response length:", cleanedText.length)
      console.log("[v0] AI response preview:", cleanedText.substring(0, 200))

      flashcardsData = JSON.parse(cleanedText)

      // Validate the response format
      if (!Array.isArray(flashcardsData) || flashcardsData.length === 0) {
        throw new Error("Invalid flashcards format from AI")
      }

      // Validate each flashcard
      flashcardsData = flashcardsData.filter(
        (card) =>
          card.front &&
          card.back &&
          typeof card.front === "string" &&
          typeof card.back === "string" &&
          card.front.trim().length > 0 &&
          card.back.trim().length > 0,
      )

      if (flashcardsData.length === 0) {
        throw new Error("No valid flashcards generated")
      }

      console.log("[v0] Successfully generated", flashcardsData.length, "flashcards")
    } catch (error) {
      console.error("Error generating flashcards with AI:", error)
      return NextResponse.json(
        {
          error:
            "Failed to generate flashcards. Please try with a different document or check if it contains clear vocabulary terms.",
        },
        { status: 500 },
      )
    }

    // Create flashcard set in database
    const { data: flashcardSet, error: setError } = await supabase
      .from("flashcard_sets")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        user_id: user.id,
      })
      .select()
      .single()

    if (setError) {
      console.error("Error creating flashcard set:", setError)
      return NextResponse.json({ error: "Failed to create flashcard set" }, { status: 500 })
    }

    // Insert flashcards
    const flashcardsToInsert = flashcardsData.map((card, index) => ({
      set_id: flashcardSet.id,
      front_text: card.front.trim(),
      back_text: card.back.trim(),
      position: index,
    }))

    const { error: cardsError } = await supabase.from("flashcards").insert(flashcardsToInsert)

    if (cardsError) {
      console.error("Error inserting flashcards:", cardsError)
      // Clean up the set if flashcards failed to insert
      await supabase.from("flashcard_sets").delete().eq("id", flashcardSet.id)
      return NextResponse.json({ error: "Failed to create flashcards" }, { status: 500 })
    }

    return NextResponse.json({
      setId: flashcardSet.id,
      title: flashcardSet.title,
      cardCount: flashcardsData.length,
    })
  } catch (error) {
    console.error("Unexpected error in process-document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
