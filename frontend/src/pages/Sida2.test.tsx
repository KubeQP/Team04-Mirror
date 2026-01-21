import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import * as api from "../api/example_api"
import Sida2 from "./Sida2"

describe("Sida2", () => {
  it("laddar initialt innehåll och visar det", async () => {
    // Mocka getExampleData
    vi.spyOn(api, "getExampleData").mockResolvedValueOnce({
      title: "Testtitel",
      body: "Testinnehåll",
    })

    render(<Sida2 />)

    expect(screen.getByText(/Laddar innehåll/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Testtitel")).toBeInTheDocument()
      expect(screen.getByText("Testinnehåll")).toBeInTheDocument()
    })
  })

  it("kan ladda mer innehåll när man klickar på knappen", async () => {
    vi.spyOn(api, "getExampleData")
      .mockResolvedValueOnce({
        title: "Första laddningen",
        body: "Text 1",
      })
      .mockResolvedValueOnce({
        title: "Andra laddningen",
        body: "Text 2",
      })
      .mockResolvedValueOnce({
        title: "Tredje laddningen",
        body: "Text 3",
      })

    render(<Sida2 />)

    // Vänta på första laddningen
    await waitFor(() => {
      expect(screen.getByText("Första laddningen")).toBeInTheDocument()
    })

    // Klicka på knappen för att ladda mer
    fireEvent.click(screen.getByText("Ladda mer innehåll"))

    // Vänta på andra laddningen
    await waitFor(() => {
      expect(screen.getByText("Andra laddningen")).toBeInTheDocument()
      expect(screen.getByText("Text 2")).toBeInTheDocument()
    })

    // Klicka på knappen för att ladda mer
    fireEvent.click(screen.getByText("Ladda mer innehåll"))

    // Vänta på tredje laddningen
    await waitFor(() => {
      expect(screen.getByText("Tredje laddningen")).toBeInTheDocument()
      expect(screen.getByText("Text 3")).toBeInTheDocument()
    })
  })

  it("visar felmeddelande om API-anropet misslyckas", async () => {
    // Mocka funktionen så att den kastar ett fel
    vi.spyOn(api, "getExampleData").mockRejectedValueOnce(
      new Error("Misslyckades att hämta data")
    )

    render(<Sida2 />)

    // Förväntar sig att laddningsmeddelandet visas först
    expect(screen.getByText(/Laddar innehåll/i)).toBeInTheDocument()

    // Vänta tills felet visas
    await waitFor(() => {
      expect(
        screen.getByText(/Misslyckades att hämta data/i)
      ).toBeInTheDocument()
    })
  })
})
