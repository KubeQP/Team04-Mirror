// frontend/src/pages/Sida2.tsx
import { useEffect, useState } from "react"
import { getExampleData } from "../api/example_api"
import ExamplePost from "../components/ExamplePost"
import type { ExampleData } from "../types"

export default function Sida2() {
  const [data1, setData1] = useState<ExampleData | null>(null)
  const [loading1, setLoading1] = useState(true)
  const [error1, setError1] = useState<string | null>(null)

  const [data2, setData2] = useState<ExampleData | null>(null)
  const [loading2, setLoading2] = useState(false)
  const [error2, setError2] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getExampleData()
        setData1(result)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError1(err.message)
        } else if (typeof err === "string") {
          setError1(err)
        } else {
          setError1("Ett okänt fel inträffade")
        }
      } finally {
        setLoading1(false)
      }
    }

    fetchData()
  }, [])

  const fetchMoreData = async () => {
    setLoading2(true)
    setError2(null)
    setData2(null)
    try {
      const result = await getExampleData()
      setData2(result)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError2(err.message)
      } else if (typeof err === "string") {
        setError2(err)
      } else {
        setError2("Ett okänt fel inträffade")
      }
    } finally {
      setLoading2(false)
    }
  }

  return (
    <div>
      <h2>Innehåll på sida 2</h2>
      <p>
        Nedan innehåll laddas dynamiskt!{" "}
        <span className="text-muted text-semibold">
          *Oooh... Such wow! Much awesome!*
        </span>
      </p>

      <div className="card">
        {loading1 && <p>Laddar innehåll...</p>}
        {error1 && <p style={{ color: "red" }}>Fel: {error1}</p>}
        {data1 && <ExamplePost exampleData={data1} />}
      </div>

      <hr />

      <p>Klicka här för att ladda mer dynamiskt innehåll:</p>
      <button onClick={fetchMoreData} disabled={loading2}>
        {loading2 ? "Laddar..." : "Ladda mer innehåll"}
      </button>
      {(data2 || loading2 || error2) && (
        <div className="card">
          {loading2 && <p>Laddar mer innehåll...</p>}
          {error2 && <p style={{ color: "red" }}>Fel: {error2}</p>}
          {data2 && <ExamplePost exampleData={data2} />}
        </div>
      )}
    </div>
  )
}
