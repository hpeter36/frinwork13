import { BubbleChart, TilesContainer } from "@/components"
import { inputsBubbleChart } from "@/components/bubbleChart/inputs"

export default async function Home() {

  return (
      <div className="flex min-h-screen flex-col items-center justify-between p-24">
        <BubbleChart inputs={inputsBubbleChart} />
      </div>
  )
}
