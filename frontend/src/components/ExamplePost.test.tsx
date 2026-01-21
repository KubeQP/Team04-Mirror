import { render, screen } from "@testing-library/react"
import ExamplePost from "./ExamplePost"

describe("ExamplePost", () => {
  it("visar titel och text när data ges", () => {
    const mockData = {
      title: "Hej världen",
      body: "Detta är en testpost",
    }

    render(<ExamplePost exampleData={mockData} />)

    expect(screen.getByText("Hej världen")).toBeInTheDocument()
    expect(screen.getByText("Detta är en testpost")).toBeInTheDocument()
  })
})
