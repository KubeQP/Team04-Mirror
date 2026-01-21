// src/App.tsx
import { Link, Outlet } from "react-router-dom"
import ThemeToggle from "./components/ThemeToggle"

export default function App() {
  return (
    <div id="app-container">
      <header>
        <div className="theme-button">
          <ThemeToggle />
        </div>
        <h1>Tidtagning</h1>
        <nav id="main-nav">
          <Link to="/">Startsida</Link>
          <Link to="/sida1">Sida 1</Link>
          <Link to="/sida2">Sida 2</Link>
        </nav>
        <hr />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
