import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import Sida1 from "./Sida1"

describe("Sida1", () => {
  it("visar antalet klick och ökar vid knapptryck", () => {
    render(<Sida1 />)

    // Startvärde
    expect(
      screen.getByText("Du har klickat på knappen 0 gånger.")
    ).toBeInTheDocument()

    // Klicka på knappen
    fireEvent.click(screen.getByText("Klicka här"))

    // Efter klick
    expect(
      screen.getByText("Du har klickat på knappen 1 gånger.")
    ).toBeInTheDocument()
  })
})
