import { BubbleChart, TilesContainer } from "@/components"
import { inputsBubbleChart } from "@/components/bubbleChart/inputs"

export default async function HomePage() {

  return (
      <div className="min-h-screen">
        <BubbleChart inputs={inputsBubbleChart} />
      </div>
  )
}
