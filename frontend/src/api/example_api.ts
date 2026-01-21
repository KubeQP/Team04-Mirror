// frontend/src/api/example_api.ts
import type { ExampleData } from "../types"

export async function getExampleData(): Promise<ExampleData> {
  // Anropa en API-tjänst för att hämta exempeldata
  const randomDelay = Math.floor(Math.random() * 500) + 500
  // Simulera en fördröjning för att efterlikna ett långsamt API-anrop
  await new Promise((resolve) => setTimeout(resolve, randomDelay))

  const randomId = Math.floor(Math.random() * 100) + 1
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${randomId}`
  )

  if (!response.ok) {
    throw new Error("Nätverksfel: " + response.statusText)
  }

  return response.json()
}

export function buildRequestPayload(userId: number) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      timestamp: new Date().toISOString(),
    }),
  }
}
