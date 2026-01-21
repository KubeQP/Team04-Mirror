// frontend/src/components/ExamplePost.tsx
import type { ExampleData } from "../types"

/*
  Här skapar vi en egen komponent som representerar ett inlägg.
  Den tar emot data som props, vars typ vi definierar nedan,
  och renderar en rubrik och en text.
  Denna komponent kan återanvändas för att visa olika inlägg.
  Den används i Sida2.tsx för att visa dynamiskt innehåll.
*/

export interface ExamplePostProps {
  exampleData: ExampleData
}

export default function ExamplePost({
  exampleData,
}: Readonly<ExamplePostProps>) {
  return (
    <div className="example-post">
      <h3>{exampleData.title}</h3>
      <p>{exampleData.body}</p>
    </div>
  )
}
