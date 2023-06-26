'use client'

import { useRef, useEffect} from "react";

import { BubbleChartToolTipInputProps } from "./types"

const BubbleChartToolTip: React.FC<BubbleChartToolTipInputProps> = (inputs) => {
	const toolTipRef = useRef<HTMLDivElement>(null);
	const numberFormatter = useRef<Intl.NumberFormat>(
	  new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD", // db comp currency szerint !!!
  
		minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
		maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
	  })
	);
  
	// set x,y coordinates if we have input data
	inputs.inputs &&
	  toolTipRef.current?.style.setProperty(
		"top",
		`${inputs.inputs.position.y + 2}px`
	  );
	inputs.inputs &&
	  toolTipRef.current?.style.setProperty(
		"left",
		`${inputs.inputs.position.x + 2}px`
	  );
  
	return (
	  <>
		<div
		  ref={toolTipRef}
		  id="bubble-tooltip"
		  className={`w-[500px] text-black fixed ${inputs.inputs && inputs.inputs.isCanvasMouseOver ? 'block' : 'hidden'}`}
		>
		  <div className="flex">
			<div className="flex flex-col w-1/3">
			  <h4 className="p-1 text-sm font-semibold bg-slate-300">Name</h4>
			  <div className="p-3 pl-1 bg-slate-200">
				<span className="text-xl break-words">
				  {inputs.inputs ? inputs.inputs.data.name : "-"}
				</span>
			  </div>
			</div>
			<div className="flex flex-col grow">
			  <h4 className="p-1 text-sm font-semibold bg-slate-300">Symbol</h4>
			  <div className="flex items-center h-full p-3 pl-1 bg-slate-200">
				<span className="text-xl break-words">
				  {inputs.inputs ? inputs.inputs.data.symbol : "-"}
				</span>
			  </div>
			</div>
			<div className="flex flex-col w-1/3">
			  <h4 className="p-1 text-sm font-semibold bg-slate-300">
				Market cap
			  </h4>
			  <div className="flex items-center h-full p-3 pl-1 bg-slate-200">
				<span className="text-xl">
				  {inputs.inputs
					? numberFormatter.current.format(inputs.inputs.data.m_cap)
					: "-"}
				</span>
			  </div>
			</div>
		  </div>
		  <div className="flex">
			<div className="flex flex-col grow">
			  <h4 className="p-1 text-sm font-semibold bg-slate-300">Exchange</h4>
			  <div className="flex items-center h-full p-1 bg-slate-200">
				<span className="text-lg">
				  {inputs.inputs ? inputs.inputs.data.exchange : "-"}
				</span>
			  </div>
			</div>
			<div className="flex flex-col w-1/3">
			  <h4 className="p-1 text-sm font-semibold bg-slate-300">Sector</h4>
			  <div className="flex items-center h-full p-1 bg-slate-200">
				<span className="text-lg break-words">
				  {inputs.inputs ? inputs.inputs.data.sector : "-"}{" "}
				</span>
			  </div>
			</div>
			<div className="flex flex-col w-1/3">
			  <h4 className="p-1 text-sm font-semibold bg-slate-300">Industry</h4>
			  <div className="flex items-center h-full p-1 bg-slate-200">
				<span className="text-lg break-words">
				  {inputs.inputs ? inputs.inputs.data.industry : "-"}
				</span>
			  </div>
			</div>
		  </div>
		  <div className="flex">
			<div className="flex flex-col grow">
			  <h4 className="p-1 text-sm font-semibold bg-slate-300">
				First FQ date
			  </h4>
			  <div className="flex items-center p-1 bg-slate-200">
				<span>
				  {inputs.inputs ? inputs.inputs.data.first_fin_fq_date : "-"}
				</span>
			  </div>
			</div>
			<div className="flex flex-col grow">
			  <h4 className="p-1 text-sm font-semibold bg-slate-300">
				Last FQ date
			  </h4>
			  <div className="flex items-center p-1 bg-slate-200">
				<span>
				  {inputs.inputs ? inputs.inputs.data.last_fin_fq_date : "-"}
				</span>
			  </div>
			</div>
		  </div>
		  <div className="flex">
			<div className="flex flex-col grow">
			  <h4 className="p-1 text-sm font-semibold bg-slate-300">
				Description
			  </h4>
			  <div className="flex items-center justify-center h-full p-3 bg-slate-200">
				<span className="text-sm break-words">
				  {inputs.inputs ? inputs.inputs.data.description : "-"}
				</span>
			  </div>
			</div>
		  </div>
		  <div className="flex flex-col bg-slate-300">
			<div className="mr-3">
			  <h4 className="p-1 text-sm font-semibold">Website</h4>
			</div>
			<div className="flex items-center justify-center bg-slate-200">
			  <span>
				<a href="#">
				  {inputs.inputs ? inputs.inputs.data.company_website : "-"}
				</a>
			  </span>
			</div>
		  </div>
		</div>
	  </>
	);
  };

  export default BubbleChartToolTip;