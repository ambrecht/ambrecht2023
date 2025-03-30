"use server"

interface SaveTextParams {
  text: string
  wordCount: number
  letterCount: number
}

export async function saveText({ text, wordCount, letterCount }: SaveTextParams) {
  try {
    const response = await fetch("https://api.ambrecht.de/api/typewriter/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      body: JSON.stringify({
        text,
        wordCount,
        letterCount,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Save error:", error)
    return { success: false, error: (error as Error).message }
  }
}

