
import { BubbleChartLegendInputProps } from "./types";

const BubbleChartLegend: React.FC<BubbleChartLegendInputProps> = (inputs) => {
	return (
	  <>
		<ul className="flex">
		  {inputs.inputs.data.map((d, i) => (
			<li key={i} className="flex items-center ml-3">
			  <span
				className="inline-block w-4 h-4 mr-3 border-[2px]"
				style={{
				  backgroundColor: d.colorBodyHex,
				  borderColor: d.colorBorderHex,
				}}
			  ></span>
			  <p className="text-black">{d.title}</p>
			</li>
		  ))}
		</ul>
	  </>
	);
  };

  export default BubbleChartLegend;
  