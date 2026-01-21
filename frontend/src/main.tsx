// src/main.tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import "./index.css"
import router from "./router"

/*
  Detta är huvudskriptet som länkas från index.html. Det skapar en React-applikation
  och renderar den i elementet med id "root" i index.html. RouterProvider används
  för att hantera navigering i applikationen.
*/

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
