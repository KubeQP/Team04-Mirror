import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Läs tidigare val eller systeminställning vid start
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null
    if (saved) {
      setTheme(saved)
      document.documentElement.dataset.theme = saved
    } else {
      const prefersDark = globalThis.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches
      const initial = prefersDark ? "dark" : "light"
      setTheme(initial)
      document.documentElement.dataset.theme = initial
    }
  }, [])

  // Växla tema
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    document.documentElement.dataset.theme = next
    localStorage.setItem("theme", next)
  }

  return (
    <button onClick={toggleTheme} id="theme-toggle-button">
      {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
    </button>
  )
}
