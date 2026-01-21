// frontend/src/pages/Sida1.tsx
import { useState } from "react"

// src/pages/Sida1.tsx
export default function Sida1() {
  const [count, setCount] = useState(0)
  const incrementCount = () => {
    setCount((prev) => prev + 1)
  }

  return (
    <div>
      <h2>Innehåll på sida 1</h2>
      <p>Du har klickat på knappen {count} gånger.</p>
      <button onClick={incrementCount}>Klicka här</button>
    </div>
  )
}
