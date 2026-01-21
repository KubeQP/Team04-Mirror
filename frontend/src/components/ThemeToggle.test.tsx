import { describe, it, beforeEach, afterEach, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ThemeToggle from "./ThemeToggle"

describe("ThemeToggle", () => {
  const getTheme = () => document.documentElement.dataset.theme

  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  afterEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it("visas med korrekt initial text baserat på systeminställning", () => {
    // Vi simulerar att systemet är i dark mode
    vi.spyOn(globalThis, "matchMedia").mockReturnValue({
      matches: true,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      media: "",
    })

    render(<ThemeToggle />)
    expect(getTheme()).toBe("dark")
    expect(screen.getByRole("button")).toHaveTextContent("☀️ Light mode")
  })

  it("växlar mellan dark och light mode vid klick", () => {
    render(<ThemeToggle />)

    const button = screen.getByRole("button")

    // Initialt läge
    const initialTheme = getTheme()
    expect(["light", "dark"]).toContain(initialTheme)

    // Klick för att växla
    fireEvent.click(button)
    const toggledTheme = getTheme()
    expect(toggledTheme).not.toBe(initialTheme)

    // Texten uppdateras
    if (toggledTheme === "dark") {
      expect(button).toHaveTextContent("☀️ Light mode")
    } else {
      expect(button).toHaveTextContent("🌙 Dark mode")
    }
  })

  it("sparar valt tema i localStorage", () => {
    render(<ThemeToggle />)
    const button = screen.getByRole("button")

    fireEvent.click(button)
    const currentTheme = getTheme()
    expect(localStorage.getItem("theme")).toBe(currentTheme)
  })

  it("respekterar tidigare sparat tema från localStorage", () => {
    localStorage.setItem("theme", "light")

    render(<ThemeToggle />)
    expect(getTheme()).toBe("light")
    expect(screen.getByRole("button")).toHaveTextContent("🌙 Dark mode")
  })
})
