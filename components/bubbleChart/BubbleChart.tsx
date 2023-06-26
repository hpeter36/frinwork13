'use client'

import { useRef, useState, useEffect} from "react";
import * as d3 from "d3";
import { PackRadius } from "d3";
import TWEEN from "@tweenjs/tween.js";
import REGL from "regl";

import { 
	BubbleData, 
	EnumSubscription, 
	ApiResponse, 
	BubbleDataJson 
} from "@/types";

import { 
	BubbleChartInputProps, 
	NormalizeColorsInputs, 
	NormalizedType,
	CircleInterpData,
	CircleInterpAnimData,
	MSIC_Props,
	BubbleDataPacked,
	MakeShaderProps,
	BubbleSplittedType,
	BubbleSplittedLayout,
	BubbleDatas,
	BubbleDataBySplit,
	PackCircleWithGroupKey,
	MS_Uniforms,
	MS_Attributes,
	ForcePositionFunc,
	BubbleGroupColorInterpMetas,
	EnumAnimType,
	BubbleChartToolTipData,
	EnumSelectedSplit,
	LegendData,
	LegendDataElement,
	BubbleGroupPosition,
	BubbleDatasSub,
	EnumAnimPropValueType,
	AnimDefinition,
	AnimationElement

} from "./types";

import BubbleChartToolTip from "./BubbleChartToolTip";
import BubbleChartLegend from "./BubbleChartLegend";
import ColorToID from "./ColorToId";

const groupColors = [
	"#619fca",
	"#fea456",
	"#922B21",
	"#76448A",
	"#1F618D",
	"#117A65",
	"#239B56",
	"#F1C40F",
	"#A04000",
	"#7B7D7D",
	"#2C3E50",
	"#EC7063",
	"#C39BD3",
	"#A9CCE3",
	"#A3E4D7",
  ];

  // component
const BubbleChart: React.FC<BubbleChartInputProps> = (inputs) => {
	// component functions
	//-----------------colors
	function trimValues(val: number) {
	  return +val.toFixed(1);
	}
  
	function hexToNormalizedRgb(hex: string) {
	  const r = parseInt(hex.substring(1, 3), 16);
	  const g = parseInt(hex.substring(3, 5), 16);
	  const b = parseInt(hex.substring(5, 7), 16);
  
	  return [trimValues(r / 255), g / 255, b / 255, 1.0];
	}
  
	// !!!
	function normalizeColors(colors: NormalizeColorsInputs) {
	  let normalized: NormalizedType = {};
  
	  function normalizedColorsSub(
		colors: NormalizeColorsInputs,
		dstColors: NormalizedType
	  ) {
		for (let c in colors) {
		  const color = colors[c];
		  if (typeof color === "string") {
			dstColors[c] = hexToNormalizedRgb(color);
		  } else {
			if (!dstColors[c]) dstColors[c] = {} as NormalizedType;
			normalizedColorsSub(color, dstColors[c] as NormalizedType);
		  }
		}
	  }
  
	  normalizedColorsSub(colors, normalized);
	  return normalized;
	}
  
	//----------------------anim gpu interp
  
	const makeVertexShaderForInterpCircles = function (props: CircleInterpData) {
	  let vertexShader = `
		precision mediump float;
  
		// variable to send to the fragment shader
		// since the fragment shader does not have access to attributes
		varying vec4 fragColor;
		varying float pointRadius;
  
		attribute vec4 startColor;
		attribute vec2 positionStart;
		attribute float startR;
		attribute float index;
		// These are all optional and should be added conditionally
		${props.endColor ? "attribute vec4 endColor;" : ""}
		${props.positionEnd ? "attribute vec2 positionEnd;" : ""}
		${props.endR ? "attribute float endR;" : ""}
  
		uniform float stageWidth;
		uniform float stageHeight;
		uniform float pixelRatio;
		uniform float delayByIndex;
		uniform float duration;
		uniform float elapsed;
  
		// Stolen from Peter Beshai's great blog post:
		// http://peterbeshai.com/beautifully-animate-points-with-webgl-and-regl.html
		// helper function to transform from pixel space to normalized device coordinates (NDC)
		// in NDC (0,0) is the middle, (-1, 1) is the top left and (1, -1) is the bottom right.
		vec2 normalizeCoords(vec2 position) {
		  // read positions into x and y vars
		  float x = position[0];
		  float y = position[1];
  
		  return vec2(
			2.0 * ((x / stageWidth) - 0.5),
			// invert y since 1 is at the top of normalized coordinates
			// and [0,0] is in the center
			-(2.0 * ((y / stageHeight) - 0.5))
		  );
		}
  
		// Helper function to handle cubic easing
		// There are also premade easing functions available via glslify
		float easeCubicInOut(float t) {
		  t *= 2.0;
		  t = (t <= 1.0 ? t * t * t : (t -= 2.0) * t * t + 2.0) / 2.0;
  
		  if (t > 1.0) {
			t = 1.0;
		  }
  
		  return t;
		}
  
		void main () {
		  float delay = delayByIndex * index;
		  float t;
		  float pointWidth;
  
		  // if there is no duration show end state immediately
		  if (duration == 0.0) {
			t = 1.0;
		  // still in the delay interval before animating
		  } else if (elapsed < delay) {
			t = 0.0;
		  } else {
			t = easeCubicInOut((elapsed - delay) / duration);
		  }
  
		  pointWidth = ${props.endR ? "mix(startR, endR, t)" : "startR"};
		  fragColor = ${
			props.endColor ? "mix(startColor, endColor, t)" : "startColor"
		  };
  
		  pointRadius = pointWidth;
  
		  // Slightly less than total radius to add a bit of padding
		  gl_PointSize = pointWidth * 1.95;
  
		  // interpolating position
		  vec2 position = ${
			props.positionEnd
			  ? "mix(positionStart, positionEnd, t)"
			  : "positionStart"
		  };
  
		  // scale to normalized device coordinates
		  gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
		}
	  `;
  
	  return vertexShader;
	};
  
	function getShaderAttrsForInterpCircles(circleInterpData: CircleInterpData) {
	  let interpData = {
		index: regl.current!.buffer(
		  circleInterpData.positionStart.map((d, i) => i)
		),
		positionStart: regl.current!.buffer(circleInterpData.positionStart),
		startColor: regl.current!.buffer(circleInterpData.startColor),
		startR: regl.current!.buffer(circleInterpData.startR),
	  };
  
	  interpData = {
		...interpData,
		...(circleInterpData.positionEnd !== undefined && {
		  positionEnd: regl.current!.buffer(circleInterpData.positionEnd),
		}),
		...(circleInterpData.endColor !== undefined && {
		  endColor: regl.current!.buffer(circleInterpData.endColor),
		}),
		...(circleInterpData.endR !== undefined && {
		  endR: regl.current!.buffer(circleInterpData.endR),
		}),
	  };
	  return interpData;
	}
  
	const makeShaderForInterpCircles = function (animData: CircleInterpAnimData) {
	  return regl.current!({
		// Fragment shaders determine the color of pixels
		frag: `
		#extension GL_OES_standard_derivatives : enable
		precision mediump float;
  
		varying float pointRadius;
		varying vec4 fragColor;
  
		void main () {
		  float r = 0.0;
		  float delta = 0.0;
		  float alpha = 1.0;
		  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  
		   // We can make circles by taking the dot product of a coordinate,
		   // and discard any pixels that have a dot product greater than 1
		  r = dot(cxy, cxy);
  
		  delta = fwidth(r);
  
		  alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
  
		  if (r > 1.0) {
			discard;
		  }
  
		  gl_FragColor = fragColor * alpha;
		}`,
  
		// Vertex shaders determine... basically everything else!
		vert: makeVertexShaderForInterpCircles(animData.circleData),
  
		attributes: getShaderAttrsForInterpCircles(animData.circleData),
  
		// "Uniforms" are values that don't change
		uniforms: {
		  stageWidth: regl.current!.context("drawingBufferWidth"),
		  stageHeight: regl.current!.context("drawingBufferHeight"),
		  pixelRatio: regl.current!.context("pixelRatio"),
		  delayByIndex: animData.delayByIndex,
		  duration: animData.duration,
		  elapsed: (context, props: MSIC_Props) => {
			return (context.time - props.startTime) * 1000;
		  },
		},
  
		count: animData.circleData.startR.length,
		primitive: "points",
	  });
	};
  
	function makeAnimationForInterpCircles(
	  animData: CircleInterpAnimData,
	  packData: BubbleDataPacked[],
	  tooltipDataStruct: MakeShaderProps
	) {
	  return new Promise<void>((resolve, reject) => {
		let startTime: number | null = null;
  
		animInterrupted.current = false;
  
		console.log("makeAnimationForInterpCircles started, animData");
		console.log(animData);
  
		// make shader
		const animationInterp = makeShaderForInterpCircles(animData);
		const animationDuration =
		  animData.duration +
		  animData.delayByIndex * animData.circleData.startR.length;
  
		//if (frameloop.current !== null) {
		//  frameloop.current = null;
		//regl.current = REGL(gl.current!);
		//}
  
		// animation loop
		let frameloop = regl.current!.frame(({ time }) => {
		  // init start time
		  if (startTime === null) {
			startTime = time;
		  }
  
		  //mind2 bool hogy később esetleg animközben is interrupt !!!
		  //interrupt csak ha vége egyébként nem
  
		  // end anim frames
		  if ((time - startTime) * 1000 > animationDuration) {
			// show tooltip
			if (!animData.isEnding) {
			  regl.current!.clear({
				color: colorBgNorm.current,
				depth: 1,
			  });
  
			  // do tooltip anim
			  animation.current!(tooltipDataStruct);
  
			  // set tooltip text
			  setToolTipCompanyData(getHoveredBubbleElement(packData));
			}
  
			// interrupt anim if allowed
			if (animData.isInterruptable && animInterrupted.current) {
			  animInterrupted.current = false;
			  frameloop.cancel();
  
			  console.log("anim interrupted(manual ending)");
  
			  prevAnim.current = actAnim.current;
			  actAnim.current = null;
  
			  resolve();
			}
  
			// anim ending automatically after no new frames found
			if (animData.isEnding) {
			  frameloop.cancel();
  
			  console.log("anim ending automatically");
  
			  prevAnim.current = actAnim.current;
			  actAnim.current = null;
  
			  resolve();
			}
		  }
  
		  // clear the canvas
		  regl.current!.clear({
			color: colorBgNorm.current,
			depth: 1,
		  });
  
		  // do anim
		  animationInterp({ startTime });
		});
	  });
	}
  
	function getBubbleGroupsMetaData(
	  groupKeys: string[],
	  splitType: BubbleSplittedType
	) {
	  // input groups > available colors
	  if (groupKeys.length > groupColors.length)
		throw new RangeError(
		  `Error when creating bubble groups meta data, too much groups(${groupKeys.length}), maximum ${groupColors.length} allowed!`
		);
  
	  // get x,y for groups in a rectangular layout
	  //const layoutCoords = getSplittedRectLayout(groupKeys.length);
  
	  // get data structure with name, colors,etc
	  let d: BubbleSplittedLayout = { type: splitType, values: {} };
	  for (let i = 0; i < groupKeys.length; i++)
		d.values[groupKeys[i]] = {
		  name: "!!!",
		  split_color: groupColors[i],
		  split_color_norm: hexToNormalizedRgb(groupColors[i]),
		  position: { x: 0, y: 0 }, // these set later !!!
		  r: 0,
		};
  
	  return d;
	}
  
	// egyedi layoutot is lehet bizonyos group countoknál vagy az alatt
	function getSplittedRectLayout(numOfGroups: number) {
	  // inputs
	  const numOfGroupsPerRow = 4;
  
	  console.log("numOfGroups");
	  console.log(numOfGroups);
  
	  // calc initial constants
	  const rowC = Math.ceil(numOfGroups / numOfGroupsPerRow);
	  const incompleteRowGroupC = numOfGroups % numOfGroupsPerRow;
	  const border = 0.1;
	  const widthInc =
		numOfGroups < numOfGroupsPerRow
		  ? (1 - 2 * border) / (numOfGroups - 1)
		  : (1 - 2 * border) / (numOfGroupsPerRow - 1);
	  const heightInc = (1 - 2 * border) / (rowC + 1);
  
	  console.log("width.current");
	  console.log(width.current);
  
	  // iterate over groups, set x,y (for incomplete row too)
	  let ret = [];
	  for (let i = 0; i < numOfGroups; i++) {
		let actRow = Math.floor(i / numOfGroupsPerRow) + 1;
		let actElem = i % numOfGroupsPerRow;
  
		console.log("x");
		console.log((border + widthInc * actElem) * width.current);
  
		ret.push({
		  x: (border + widthInc * actElem) * width.current,
		  y: (border + heightInc * actRow) * height.current,
		});
	  }
  
	  // correct x for incomplete rows
	  for (let i = 0; i < incompleteRowGroupC; i++) {
		let actElem = (i % numOfGroupsPerRow) + 1;
		let widthIncMod = (1 - 2 * border) / (incompleteRowGroupC + 1);
		ret[ret.length + i - incompleteRowGroupC].x =
		  (border + widthIncMod * actElem) * width.current;
	  }
  
	  return ret;
	}
  
	function shuffleArray(array: BubbleData[]) {
	  let currentIndex = array.length,
		randomIndex;
  
	  // While there remain elements to shuffle.
	  while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
  
		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
		  array[randomIndex],
		  array[currentIndex],
		];
	  }
  
	  return array;
	}
  
	async function getData(subId: EnumSubscription) {
	  let dataToRet =
		bubbleData.current[EnumSubscription[subId] as keyof BubbleDatas];
	  if (dataToRet === undefined) {
		try {
		  // try catch miatt ... | undefined return val ha nincs végső throw
		  // get data from server
		  const resp = await fetch(
			`/api/getBubbleChartData?sub_id=${selected_plan.current}`
		  );
  
		  // get response
		  let respDataJson: ApiResponse = await resp.json();
		  respDataJson = await respDataJson;
  
		  // check for response
		  // const respStatus: EnumApiResponseStatus =
		  //   EnumApiResponseStatus[
		  //     respDataJson.status as keyof typeof EnumApiResponseStatus
		  //   ];
  
		  // if (respStatus !== EnumApiResponseStatus.STATUS_OK) {
		  //   throw Error(`Error when fetch data: ${respDataJson.data as string}`);
		  // }
  
		  // check for response
		  if (respDataJson.status !== "STATUS_OK") {
			throw Error(`Error when fetch data: ${respDataJson.data as string}`);
		  }
  
		  // get bubble data from response
		  const bubbleDataWithMeta = respDataJson.data as BubbleDataJson;
  
		  // shuffle data add id, color id
		  let bData = shuffleArray(bubbleDataWithMeta.data as BubbleData[]);
		  bData.forEach((d, i) => {
			d.id = i;
			d.colorId = colorIdConverter.current!.createColor(d.id);
		  });
  
		  // set r
		  // get radius scale
		  const maxMcapVal = d3.max(bData, (d: BubbleData) => d.m_cap);
		  const radiusScale = d3
			.scaleSqrt()
			.range([0, maxBubbleSize.current])
			.domain([0, maxMcapVal!]); // m_cap as circle area
  
		  // create packed data struct add r based on market cap value
		  let packData: BubbleDataPacked[] = bData.map((d) => {
			return { ...d, r: radiusScale(d.m_cap), x: 0, y: 0 };
		  });
  
		  // set collapsed layout
		  let packDataAct = setCollapsedPackLayoutData(packData);
  
		  // get split layout meta
		  // get bubble groups meta data for exchange, sector groupping
		  const layoutExhData = getBubbleGroupsMetaData(
			bubbleDataWithMeta.meta.exchanges,
			BubbleSplittedType.EXCHANGE
		  );
  
		  const layoutSectorData = getBubbleGroupsMetaData(
			bubbleDataWithMeta.meta.sectors,
			BubbleSplittedType.SECTOR
		  );
  
		  // generate r from mcap, packing layout
		  // const packData = prepareData(
		  //   bData,
		  //   layoutExhData,
		  //   layoutSectorData,
		  //   maxBubbleSize.current
		  // );
  
		  setSplittedPackLayoutData(
			packDataAct,
			layoutExhData,
			BubbleSplittedType.EXCHANGE
		  );
		  setSplittedPackLayoutData(
			packDataAct,
			layoutSectorData,
			BubbleSplittedType.SECTOR
		  );
  
		  // set layout
  
		  // cache data
		  dataToRet = {
			meta: bubbleDataWithMeta.meta,
			data: packData,
			layoutMetaExch: layoutExhData,
			layoutMetaSector: layoutSectorData,
		  };
		  bubbleData.current[EnumSubscription[subId] as keyof BubbleDatas] =
			dataToRet;
  
		  return structuredClone(dataToRet);
		} catch (e) {
		  if (typeof e === "string") console.error(e);
		  else if (e instanceof Error) console.error(e.message);
		  throw e;
		}
	  }
	  // read data from cache
	  else return structuredClone(dataToRet);
	}
  
	function getDataBySplit(
	  packData: BubbleDataPacked[],
	  splitType: BubbleSplittedType
	) {
	  let toRet: BubbleDataBySplit = {};
	  const keyToUse =
		splitType === BubbleSplittedType.EXCHANGE ? "exchange_id" : "sector_id";
	  for (const d of packData) {
		// sector or exchange value
		const splitKey = d[keyToUse];
  
		// first element in that split type
		if (toRet[splitKey] == undefined) {
		  toRet[splitKey] = { enclosingCircle: null, data: [] };
		  toRet[splitKey].data.push(d);
		}
		// not the first element
		else toRet[splitKey].data.push(d);
	  }
  
	  return toRet;
	}
  
	function setSplittedPackLayoutData(
	  packData: BubbleDataPacked[],
	  splitLayoutToUse: BubbleSplittedLayout,
	  splitType: BubbleSplittedType
	) {
	  // get data grouped by split(clone orig data)
	  const dataBySplit = getDataBySplit(packData, splitType); // structuredClone(, JSON.parse(JSON.stringify(...
  
	  console.log("dataBySplit");
	  console.log(dataBySplit);
  
	  // [groupkey] -> bubbledatapacked, d3.PackCircle,
  
	  // for each split value pack layout
	  const splittedDataStruct: BubbleDataBySplit = {};
	  const enclosedCircles: PackCircleWithGroupKey[] = [];
	  for (const splitVal in dataBySplit) {
		// initial data struct
		splittedDataStruct[splitVal] = {
		  enclosingCircle: null,
		  data: dataBySplit[splitVal].data,
		};
  
		// save original, collapsed layout x,y
		// const xy_temp = dataBySplit[splitVal].map((d) => {
		//   return {
		//     x_tmp: d.x,
		//     y_tmp: d.y,
		//   };
		// });
  
		// local pack layouts by group r -> x,y diff to center
		// centers will be set by another pack layout
		const packLayout = d3.packSiblings<PackRadius>(
		  splittedDataStruct[splitVal].data.map((d) => {
			return { r: d.r };
		  })
		);
  
		console.log("packLayout");
		console.log(packLayout);
		console.log(splittedDataStruct[splitVal].data);
  
		// get enclosing pack d.x,y,r -> enclosing circle center x,y,r
		// r meghat itt a lényeges, x,y ~ 0
		const enclosingPackMeta = d3.packEnclose<d3.PackCircle>(packLayout);
		splittedDataStruct[splitVal].enclosingCircle = enclosingPackMeta;
		enclosedCircles.push({
		  groupKey: splitVal,
		  x: enclosingPackMeta.x,
		  y: enclosingPackMeta.y,
		  r: enclosingPackMeta.r,
		});
  
		console.log("enclosingPackMeta");
		console.log(enclosingPackMeta);
  
		splittedDataStruct[splitVal].data.forEach((d, i) => {
		  // d.x = xy_temp[i].x_tmp!;
		  // d.y = xy_temp[i].y_tmp!;
  
		  // save new pack x,y coords
		  if (splitType === BubbleSplittedType.EXCHANGE) {
			d.x_exch = packLayout[i].x;
			d.y_exch = packLayout[i].y;
		  } else {
			d.x_sector = packLayout[i].x;
			d.y_sector = packLayout[i].y;
		  }
  
		  // set back original collapsed x,y-s
		  //d.x = d.xOrig!;
		  //d.y = d.yOrig!;
		});
  
		console.log("splittedDataStruct[splitVal]");
		console.log(splittedDataStruct[splitVal]);
	  }
  
	  const rInc = 0; // px
	  enclosedCircles.forEach((d) => d.r + rInc);
  
	  // pack of enclosing circles(layout)
	  // override existing ~ 0 x,y
	  const outerCirclePackLayout =
		d3.packSiblings<PackCircleWithGroupKey>(enclosedCircles);
  
	  console.log("outerCirclePackLayout");
	  console.log(outerCirclePackLayout);
  
	  // save new x,y values to our data struct
	  for (const group of outerCirclePackLayout) {
		splittedDataStruct[group.groupKey].enclosingCircle!.x = group.x;
		splittedDataStruct[group.groupKey].enclosingCircle!.y = group.y;
	  }
  
	  // get the r of our final circle
	  const outerCircleEnclosingPackMeta = d3.packEnclose<d3.PackCircle>(
		outerCirclePackLayout
	  );
  
	  // correct each company x,y bubble coords according to our new packed circles
	  for (const groupKey in splittedDataStruct) {
		// get meta for layout
		const layoutMeta = splitLayoutToUse.values[groupKey];
  
		splittedDataStruct[groupKey].data.forEach((d) => {
		  if (splitType === BubbleSplittedType.EXCHANGE) {
			d.x_exch =
			  splittedDataStruct[groupKey].enclosingCircle!.x +
			  d.x_exch! +
			  positionCenter.current.x;
			d.y_exch =
			  splittedDataStruct[groupKey].enclosingCircle!.y +
			  d.y_exch! +
			  positionCenter.current.y;
			d.color_exch = layoutMeta!.split_color_norm;
		  } else {
			d.x_sector =
			  splittedDataStruct[groupKey].enclosingCircle!.x +
			  d.x_sector! +
			  positionCenter.current.x;
			d.y_sector =
			  splittedDataStruct[groupKey].enclosingCircle!.y +
			  d.y_sector! +
			  positionCenter.current.y;
			d.color_sector = layoutMeta!.split_color_norm;
		  }
		});
	  }
  
	  // exch, sector x,y + outerCircleEnclosingPackMeta.r
	  // vagy a bubble center-hez igazítom az a legjobb
  
	  console.log("splittedDataStruct");
	  console.log(splittedDataStruct);
	}
  
	function setCollapsedPackLayoutData(packData: BubbleDataPacked[]) {
	  // packing( add x, y coords)
	  let packDataAct = d3.packSiblings<BubbleDataPacked>(packData);
  
	  // correct, add info to data(for pack)
	  packDataAct.forEach((d) => {
		d.x = positionCenter.current.x + d.x;
		d.y = positionCenter.current.y + d.y;
		d.xOrig = d.x; // ezek most nem is kellenek interp animhoz
		d.yOrig = d.y;
		d.color = colorCollapsedNorm.current;
	  });
  
	  return packDataAct;
	}
  
	const makeShader = () =>
	  // data: BubbleDataPacked[], colorCol = "color"
	  regl.current!<MS_Uniforms, MS_Attributes, MakeShaderProps>({
		frag: `
					#extension GL_OES_standard_derivatives : enable
					precision mediump float;
  
					varying float pointRadius;
					varying vec4 fragColor;
  
					void main () {
						float r = 0.0;
						float delta = 0.0;
						float alpha = 1.0;
						vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  
						r = dot(cxy, cxy);
  
						delta = fwidth(r);
  
						alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
  
						if (r > 1.0) {
							discard;
						}
  
						gl_FragColor = fragColor * alpha;
					}`,
		vert: `
					precision mediump float;
  
					varying vec4 fragColor;
					varying float pointRadius;
  
					attribute vec4 startColor;
					attribute vec2 positionStart;
					attribute float startR;
					attribute float index;
  
					uniform float stageWidth;
					uniform float stageHeight;
  
					vec2 normalizeCoords(vec2 position) {
						float x = position[0];
						float y = position[1];
  
						return vec2(
							2.0 * ((x / stageWidth) - 0.5),
							-(2.0 * ((y / stageHeight) - 0.5))
						);
					}
  
					void main () {
  
						float pointWidth;
  
						pointWidth = startR;
						fragColor = startColor;
  
						pointRadius = pointWidth;
  
						gl_PointSize = pointWidth * 1.95;
  
						vec2 position = positionStart;
						gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
					}
					  `,
		attributes: {
		  positionStart: (context, props) => props.positionStart, // regl.current!.buffer(.... .map((d) => [d.x, d.y])),
		  startR: (context, props) => props.startR, // regl.current!.buffer(data.map((d) => d.r)),
		  index: (context, props) => props.index, // regl.current!.buffer(data.map((d) => d.id)),
		  startColor: (context, props) => props.startColor, // startColor: regl.current!.buffer(data.map((d) => {return d[colorCol as keyof typeof d];//return colorCol == "color" ? d.color : d.colorId;})),
		  // colorCol as keyof BubbleDataPacked
		},
		uniforms: {
		  stageWidth: regl.current!.context("drawingBufferWidth"),
		  stageHeight: regl.current!.context("drawingBufferHeight"),
		},
		count: (context, props) => props.dataLength,
		primitive: "points",
	  });
  
	function simulationInitial(packData: BubbleDataPacked[]) {
	  return new Promise<void>((resolve, reject) => {
		let is_ended = false;
  
		animInterrupted.current = false;
  
		console.log("simulationInitial started");
  
		let simulation = forceBubbles(
		  positionCenter.current.x,
		  positionCenter.current.y,
		  true
		);
		simulation.on("end", function () {
		  is_ended = true;
		});
		//.on("tick", function () {
		//  console.log("sim");
		//});
  
		//simulation.alpha(1).restart();
  
		//if (frameloop.current !== null) {
		//  frameloop.current = null;
		//regl.current = REGL(gl.current!);
		//}
  
		let frameloop = regl.current!.frame(({ time }) => {
		  // clear canvas
		  regl.current!.clear({
			color: colorBgNorm.current,
			depth: 1,
		  });
  
		  // egységes color var !!! regl.vec4
  
		  // ehhez kellene egy saját struct ne mindig újragen !!!
		  let animData: MakeShaderProps = {
			dataLength: packData.length,
			positionStart: packData.map((d) => [d.x!, d.y!]),
			startR: packData.map((d) => d.r),
			index: packData.map((d) => d.id),
			startColor: packData.map((d) => [
			  d.colorId![0],
			  d.colorId![1],
			  d.colorId![2],
			  d.colorId![3],
			]),
		  };
  
		  // do tooltip anim
		  animation.current!(animData);
  
		  // set tooltip text
		  setToolTipCompanyData(getHoveredBubbleElement(packData));
  
		  regl.current!.clear({
			color: colorBgNorm.current,
			depth: 1,
		  });
  
		  // update color prop to real color
		  animData.startColor = packData.map((d) => [
			d.color![0],
			d.color![1],
			d.color![2],
			d.color![3],
		  ]);
  
		  // do anim
		  animation.current!(animData);
  
		  // anim interrupted
		  if (animInterrupted.current) {
			console.log("simulationInitial interrupted");
			animInterrupted.current = false;
			frameloop.cancel();
			resolve();
		  }
  
		  // if (is_ended) {
		  //   console.log("simulationInitial ended");
		  //   frameloop.cancel();
		  //   resolve();
		  // }
		});
	  });
	}
  
	function forceBubbles(
	  x_cords_f: number | ForcePositionFunc,
	  y_cords_f: number | ForcePositionFunc,
	  add_charge = false,
	  chargeForce = 0.03,
	  x_force = 0.03,
	  y_force = 0.03,
	  collide_force = 1
	) {
	  const simulation = d3.forceSimulation();
	  simulation.nodes(subDataAct.current!.data);
	  simulation
		.force(
		  "force_x",
		  d3.forceX<BubbleDataPacked>().strength(x_force).x(x_cords_f)
		)
		.force(
		  "force_y",
		  d3.forceY<BubbleDataPacked>().strength(y_force).y(y_cords_f)
		)
		.force(
		  "force_collide",
		  d3
			.forceCollide<BubbleDataPacked>()
			.strength(collide_force)
			.radius((d) => d.r!)
			.iterations(1)
		);
  
	  // set charge force for acual simulation
	  forceStrength.current = chargeForce;
  
	  if (add_charge) {
		simulation.force(
		  "force_charge",
		  d3.forceManyBody<BubbleDataPacked>().strength(calcBubbleCharge)
		);
	  }
  
	  return simulation;
	}
  
	function calcBubbleCharge(
	  d: BubbleDataPacked,
	  i: number,
	  data: BubbleDataPacked[]
	) {
	  return -Math.pow(d.r!, 2.0) * forceStrength.current;
	}
  
	// get color interp. functions for split, collapse group simulation
	function genGroupColorInterpMetas(
	  splittedLayout: BubbleSplittedLayout,
	  isSplit: boolean
	) {
	  let colorsInterp: BubbleGroupColorInterpMetas = {};
	  for (let groupMetaKey in splittedLayout.values) {
		const elem = splittedLayout.values[groupMetaKey];
		colorsInterp[groupMetaKey] = {
		  groupId: groupMetaKey,
		  interpFunc: isSplit
			? d3.interpolateRgb(colorCollapsed.current, elem.split_color)
			: d3.interpolateRgb(elem.split_color, colorCollapsed.current),
		  actColor: undefined,
		};
	  }
	  return colorsInterp;
	}
  
	// set colors for split, collapse group simulation
	function fillActColorForGroups(
	  colorsInterp: BubbleGroupColorInterpMetas,
	  simAlpha: number
	) {
	  for (let interpMetaKey in colorsInterp) {
		colorsInterp[interpMetaKey].actColor = hexToNormalizedRgb(
		  d3
			.color(colorsInterp[interpMetaKey].interpFunc(1 - simAlpha))
			?.formatHex()!
		);
	  }
	}
  
	function simulationSplitBubbles(
	  packData: BubbleDataPacked[],
	  splittedLayout: BubbleSplittedLayout
	) {
	  return new Promise<void>((resolve, reject) => {
		let is_ended = false;
		animInterrupted.current = false;
  
		// init simulation
		const simulation = forceBubbles(
		  (d) =>
			splittedLayout.values[
			  splittedLayout.type === BubbleSplittedType.EXCHANGE
				? d.exchange_id
				: d.sector_id
			].position.x,
		  (d) =>
			splittedLayout.values[
			  splittedLayout.type === BubbleSplittedType.EXCHANGE
				? d.exchange_id
				: d.sector_id
			].position.y,
		  inputs.inputs.simulation.split.useCharge,
		  inputs.inputs.simulation.split.chargeForce,
		  inputs.inputs.simulation.split.xForce,
		  inputs.inputs.simulation.split.yForce,
		  inputs.inputs.simulation.split.collideForce
		);
		simulation.on("end", function () {
		  is_ended = true;
		});
  
		//simulation.alpha(1).restart();
  
		// init color interpolation meta for each group
		let colorsInterp = genGroupColorInterpMetas(splittedLayout, true);
  
		//if (frameloop.current !== null) frameloop.current = null;
  
		// start anim
		let frameloop = regl.current!.frame(({ time }) => {
		  // clear canvas
		  regl.current!.clear({
			color: colorBgNorm.current,
			depth: 1,
		  });
  
		  let animData: MakeShaderProps = {
			dataLength: packData.length,
			positionStart: packData.map((d) => [d.x!, d.y!]),
			startR: packData.map((d) => d.r),
			index: packData.map((d) => d.id),
			startColor: packData.map((d) => [
			  d.colorId![0],
			  d.colorId![1],
			  d.colorId![2],
			  d.colorId![3],
			]),
		  };
  
		  // do tooltip anim
		  animation.current!(animData);
  
		  // set tooltip text
		  setToolTipCompanyData(getHoveredBubbleElement(packData));
  
		  fillActColorForGroups(colorsInterp, simulation.alpha());
  
		  packData.forEach((d) => {
			d.color =
			  colorsInterp[
				splittedLayout.type === BubbleSplittedType.EXCHANGE
				  ? d.exchange_id
				  : d.sector_id
			  ].actColor;
		  });
  
		  // clear canvas
		  regl.current!.clear({
			color: colorBgNorm.current,
			depth: 1,
		  });
  
		  // update color prop to real color
		  animData.startColor = packData.map((d) => [
			d.color![0],
			d.color![1],
			d.color![2],
			d.color![3],
		  ]);
  
		  // do main anim
		  animation.current!(animData);
  
		  // anim interrupted
		  if (animInterrupted.current) {
			animInterrupted.current = false;
			frameloop.cancel();
			resolve();
		  }
  
		  // if (is_ended) {
		  //   frameloop.cancel();
		  //   //frameloop = null;
		  //   resolve();
		  // }
		});
	  });
	}
  
	function simulationGroupBubbles(
	  packData: BubbleDataPacked[],
	  splittedLayout: BubbleSplittedLayout
	) {
	  return new Promise<void>((resolve, reject) => {
		let is_ended = false;
		animInterrupted.current = false;
  
		// init simulation
		const simulation = forceBubbles(
		  positionCenter.current.x,
		  positionCenter.current.y,
		  inputs.inputs.simulation.collapse.useCharge,
		  inputs.inputs.simulation.collapse.chargeForce,
		  inputs.inputs.simulation.collapse.xForce,
		  inputs.inputs.simulation.collapse.yForce,
		  inputs.inputs.simulation.collapse.collideForce
		);
		simulation!.on("end", function () {
		  is_ended = true;
		});
  
		//simulation.alpha(1).restart();
  
		// init color interpolation meta for each group
		let colorsInterp = genGroupColorInterpMetas(splittedLayout, false);
  
		//if (frameloop.current !== null) frameloop.current = null;
  
		// animation loop
		let frameloop = regl.current!.frame(({ time }) => {
		  // clear canvas
		  regl.current!.clear({
			color: colorBgNorm.current,
			depth: 1,
		  });
  
		  let animData: MakeShaderProps = {
			dataLength: packData.length,
			positionStart: packData.map((d) => [d.x!, d.y!]),
			startR: packData.map((d) => d.r),
			index: packData.map((d) => d.id),
			startColor: packData.map((d) => [
			  d.colorId![0],
			  d.colorId![1],
			  d.colorId![2],
			  d.colorId![3],
			]),
		  };
  
		  // do tooltip anim
		  animation.current!(animData);
  
		  // set tooltip text
		  setToolTipCompanyData(getHoveredBubbleElement(packData));
  
		  // interp. bubble colors
		  fillActColorForGroups(colorsInterp, simulation.alpha());
  
		  // set color for bubbles
		  packData.forEach((d) => {
			d.color =
			  colorsInterp[
				splittedLayout.type === BubbleSplittedType.EXCHANGE
				  ? d.exchange_id
				  : d.sector_id
			  ].actColor;
		  });
  
		  // clear canvas
		  regl.current!.clear({
			color: colorBgNorm.current,
			depth: 1,
		  });
  
		  // update color prop to real color
		  animData.startColor = packData.map((d) => [
			d.color![0],
			d.color![1],
			d.color![2],
			d.color![3],
		  ]);
  
		  // do anim
		  animation.current!(animData);
  
		  // if we interrupted anim
		  if (animInterrupted.current) {
			console.log("simulationGroupBubbles interrupted");
			animInterrupted.current = false; // ez kell ide ???
			frameloop.cancel();
			resolve();
		  }
  
		  // make bubbles original pos at the end of simulation
		  if (is_ended) {
			//frameloop.cancel();
			//frameloop = null;
			//tweenBubblesOriginalPosition(packData, "x", "xOrig", "y", "yOrig");
			//resolve();
		  }
		});
	  });
	}
  
	// -------------- js tween animation
	function tweenAnimate() {
	  requestAnimationFrame(tweenAnimate);
  
	  TWEEN.update();
  
	  regl.current!.clear({
		color: colorBgNorm.current,
		depth: 1,
	  });
  
	  let animData: MakeShaderProps = {
		dataLength: subDataAct.current!.data.length,
		positionStart: subDataAct.current!.data.map((d) => [d.x!, d.y!]),
		startR: subDataAct.current!.data.map((d) => d.r),
		index: subDataAct.current!.data.map((d) => d.id),
		startColor: subDataAct.current!.data.map((d) => [
		  d.color![0],
		  d.color![1],
		  d.color![2],
		  d.color![3],
		]),
	  };
  
	  animation.current!(animData);
	}
  
	function tweenBubblesOriginalPosition(
	  data: BubbleDataPacked[],
	  fromXPropName: string,
	  toXPropName: string,
	  fromYPropName: string,
	  toYPropName: string,
	  speed = 100
	) {
	  // tween x coords, külön methodba !!!
	  let fromXArr = data.map((d) => d[fromXPropName as keyof typeof d]);
	  let toXArr = data.map((d) => d[toXPropName as keyof typeof d]);
	  let tweenX = new TWEEN.Tween(fromXArr)
		.to(toXArr, speed)
		.easing(TWEEN.Easing.Cubic.InOut)
		.onUpdate(function (arrVals) {
		  data.forEach((d, i) => {
			let v = arrVals[i];
			if (typeof v === "number") {
			  d.x = v;
			}
		  });
		})
		.start();
  
	  // tween y coords
	  let fromYArr = data.map((d) => d[fromYPropName as keyof typeof d]);
	  let toYArr = data.map((d) => d[toYPropName as keyof typeof d]);
	  let tweenY = new TWEEN.Tween(fromYArr)
		.to(toYArr, speed)
		.easing(TWEEN.Easing.Cubic.InOut)
		.onUpdate(function (arrVals) {
		  data.forEach((d, i) => {
			let v = arrVals[i];
			if (typeof v === "number") {
			  d.y = v;
			}
		  });
		})
		.start();
  
	  tweenAnimate();
	}
  
	// ----------------- tooltip
  
	function genToolTipDatasStruct(
	  animType: EnumAnimType,
	  packData: BubbleDataPacked[]
	) {
	  let animData: MakeShaderProps = {
		dataLength: packData.length,
		positionStart: packData.map((d) => [d.x!, d.y!]),
		startR: packData.map((d) => d.r),
		index: packData.map((d) => d.id),
		startColor: packData.map((d) => [
		  d.colorId![0],
		  d.colorId![1],
		  d.colorId![2],
		  d.colorId![3],
		]),
	  };
	  if (animType === EnumAnimType.SPLITTED_EXCH_BUBBLES)
		animData.positionStart = packData.map((d) => [d.x_exch!, d.y_exch!]);
	  if (animType === EnumAnimType.SPLITTED_SECTOR_BUBBLES)
		animData.positionStart = packData.map((d) => [d.x_sector!, d.y_sector!]);
  
	  return animData;
	}
  
	const mouseMoveEvent = (e: MouseEvent) => {
	  mouse_x.current = e.clientX;
	  mouse_y.current = e.clientY;
	};
  
	function readPixelFromWebGLCanvas() {
	  //console.log(`x ${mouse_x} y ${mouse_y}`);
  
	  // mouse -> canvas coord
	  const { x: c_s_x, y: c_s_y } = canvasRef.current!.getClientRects()[0];
	  const c_x = mouse_x.current - c_s_x;
	  const c_y = canvasRef.current!.clientHeight - (mouse_y.current - c_s_y);
	  //console.log(`x ${c_x} y ${c_y}`);
	  let pixel = new window.Uint8Array(4);
	  gl.current!.readPixels(
		c_x,
		c_y,
		1,
		1,
		gl.current!.RGBA,
		gl.current!.UNSIGNED_BYTE,
		pixel
	  );
	  //console.log(`r ${pixel[0]} g ${pixel[1]} b ${pixel[2]} a ${pixel[3]}`);
  
	  return pixel;
	}
  
	function getHoveredBubbleElement(
	  packData: BubbleDataPacked[]
	): BubbleChartToolTipData | null {
	  const pixelColor = readPixelFromWebGLCanvas();
	  const compIndex = colorIdConverter.current!.getID(
		pixelColor[0],
		pixelColor[1],
		pixelColor[2],
		pixelColor[3]
	  );
  
	  //console.log(`pixelColor: ${pixelColor}`);
  
	  if (compIndex < packData.length) {
		const d = packData[compIndex];
		return {
		  isCanvasMouseOver: isCanvasMouseOver.current,
		  position: { x: mouse_x.current, y: mouse_y.current },
		  data: {
			name: d.name,
			symbol: d.symbol,
			exchange: d.exchange,
			sector: d.sector,
			industry: d.industry,
			m_cap: d.m_cap,
			first_fin_fq_date: d.first_fin_fq_date,
			last_fin_fq_date: d.last_fin_fq_date,
			description: d.description,
			company_website: d.company_website,
		  },
		};
	  } else return null;
	}
  
	// --------------- legend
  
	function adjustColor(color: string, amount: number) {
	  return (
		"#" +
		color
		  .replace(/^#/, "")
		  .replace(/../g, (color) =>
			(
			  "0" +
			  Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(
				16
			  )
			).substr(-2)
		  )
	  );
	}
  
	function getLegendData(splitType: EnumSelectedSplit): LegendData {
	  let title: string;
	  let data: LegendDataElement[];
	  switch (splitType) {
		case EnumSelectedSplit.COLLAPSED:
		  title = "No split is selected";
		  data = [];
		  break;
		case EnumSelectedSplit.SPLITTED_EXCH:
		  title = "Split by exchange";
		  data = subDataAct.current!.meta.exchanges.map((d, i) => {
			return {
			  title: d.replace("_", " "),
			  colorBodyHex: groupColors[i],
			  colorBorderHex: adjustColor(groupColors[i], -20),
			};
		  });
		  break;
		case EnumSelectedSplit.SPLITTED_SECTOR:
		  title = "Split by sector";
		  data = subDataAct.current!.meta.sectors.map((d, i) => {
			return {
			  title: d.replace("_", " "),
			  colorBodyHex: groupColors[i],
			  colorBorderHex: adjustColor(groupColors[i], -20),
			};
		  });
		  break;
	  }
  
	  return { title: title, data: [...data] };
	}
  
	//---------------------------------------------
	//----------------------funcs end--------------
  
	// inputs
	// get input obj
	// elég lenne csak az inputs... !!! ami statikus és nem változik
  
	const height = useRef<number>(inputs.inputs.height);
	const width = useRef<number>(inputs.inputs.width);
	let forceStrength = useRef<number>(0.03);
	const maxBubbleSize = useRef<number>(inputs.inputs.maxBubbleSize);
	let selected_plan = useRef<EnumSubscription>(inputs.inputs.defSelected_plan);
	let selected_split = useRef<EnumSelectedSplit>(EnumSelectedSplit.COLLAPSED);
  
	// inner inputs
	const colorCollapsed = useRef<string>(inputs.inputs.colors.collapsedColor); //"#b494cc";
	const positionCenter = useRef<BubbleGroupPosition>({
	  x: width.current * 0.5,
	  y: height.current * 0.5,
	}); // pr ???
	const colorCollapsedNorm = useRef<number[]>(
	  hexToNormalizedRgb(colorCollapsed.current)
	);
	const colorBgNorm = useRef<REGL.Vec4>(
	  hexToNormalizedRgb(inputs.inputs.colors.bgColor) as REGL.Vec4
	);
  
	// working vars
	const canvasRef = useRef<HTMLCanvasElement>(null);
	//let frameloop = useRef<REGL.Cancellable | null>(null);
  
	let pr = useRef<number>(1);
	let regl = useRef<REGL.Regl | null>(null);
	let gl = useRef<WebGLRenderingContext | null>(null);
	let animation = useRef<REGL.DrawCommand | null>(null);
	const cbxSplitCollRef = useRef<HTMLInputElement>(null);
	const [legendData, setLegendData] = useState<LegendData>({
	  title: "",
	  data: [],
	});
	//const [test, setTest] = useState<string>("initial");
	let animInterrupted = useRef<boolean>(false);
	const colorIdConverter = useRef<ColorToID | null>(null);
	let isCanvasMouseOver = useRef<boolean>(false);
  
	// let simulation = useRef<d3.Simulation<
	//   d3.SimulationNodeDatum,
	//   d3.SimulationLinkDatum<d3.SimulationNodeDatum>
	// > | null>(null);
	const bubbleData = useRef<BubbleDatas>({
	  PREMIUM: undefined,
	  BASIC: undefined,
	  FREE: undefined,
	});
	let subDataAct = useRef<BubbleDatasSub | null>(null);
	let [toolTipCompanyData, setToolTipCompanyData] =
	  useState<BubbleChartToolTipData | null>(null);
	let mouse_x = useRef<number>(0);
	let mouse_y = useRef<number>(0);
  
	//let bubbleGroupsMetaExch = useRef<BubbleSplittedLayout | null>(null);
	//let bubbleGroupsMetaSector = useRef<BubbleSplittedLayout | null>(null);
  
	const propMapCollToExchSplit = {
	  positionStart: EnumAnimPropValueType.POS_ORIG,
	  positionEnd: EnumAnimPropValueType.POS_SPLIT_EXCH,
	  startColor: EnumAnimPropValueType.COLOR_ORIG,
	  endColor: EnumAnimPropValueType.COLOR_SPLIT_EXCH,
	  startR: EnumAnimPropValueType.R_ORIG,
	  endR: EnumAnimPropValueType.NONE,
	};
  
	const propMapExchSplitToColl = {
	  positionStart: EnumAnimPropValueType.POS_SPLIT_EXCH,
	  positionEnd: EnumAnimPropValueType.POS_ORIG,
	  startColor: EnumAnimPropValueType.COLOR_SPLIT_EXCH,
	  endColor: EnumAnimPropValueType.COLOR_ORIG,
	  startR: EnumAnimPropValueType.R_ORIG,
	  endR: EnumAnimPropValueType.NONE,
	};
  
	const propMapCollToSectorSplit = {
	  positionStart: EnumAnimPropValueType.POS_ORIG,
	  positionEnd: EnumAnimPropValueType.POS_SPLIT_SECTOR,
	  startColor: EnumAnimPropValueType.COLOR_ORIG,
	  endColor: EnumAnimPropValueType.COLOR_SPLIT_SECTOR,
	  startR: EnumAnimPropValueType.R_ORIG,
	  endR: EnumAnimPropValueType.NONE,
	};
  
	const propMapSectorSplitToColl = {
	  positionStart: EnumAnimPropValueType.POS_SPLIT_SECTOR,
	  positionEnd: EnumAnimPropValueType.POS_ORIG,
	  startColor: EnumAnimPropValueType.COLOR_SPLIT_SECTOR,
	  endColor: EnumAnimPropValueType.COLOR_ORIG,
	  startR: EnumAnimPropValueType.R_ORIG,
	  endR: EnumAnimPropValueType.NONE,
	};
  
	const propMapCollToDisappear = {
	  positionStart: EnumAnimPropValueType.POS_ORIG,
	  positionEnd: EnumAnimPropValueType.POS_CENTER,
	  startColor: EnumAnimPropValueType.COLOR_ORIG,
	  endColor: EnumAnimPropValueType.NONE,
	  startR: EnumAnimPropValueType.R_ORIG,
	  endR: EnumAnimPropValueType.R_ZERO,
	};
  
	const propMapExchSplitToDisappear = {
	  positionStart: EnumAnimPropValueType.POS_SPLIT_EXCH,
	  positionEnd: EnumAnimPropValueType.POS_CENTER,
	  startColor: EnumAnimPropValueType.COLOR_SPLIT_EXCH,
	  endColor: EnumAnimPropValueType.COLOR_ORIG,
	  startR: EnumAnimPropValueType.R_ORIG,
	  endR: EnumAnimPropValueType.R_ZERO,
	};
  
	const propMapSectorSplitToDisappear = {
	  positionStart: EnumAnimPropValueType.POS_SPLIT_SECTOR,
	  positionEnd: EnumAnimPropValueType.POS_CENTER,
	  startColor: EnumAnimPropValueType.COLOR_SPLIT_SECTOR,
	  endColor: EnumAnimPropValueType.COLOR_ORIG,
	  startR: EnumAnimPropValueType.R_ORIG,
	  endR: EnumAnimPropValueType.R_ZERO,
	};
  
	const propMapNoneToAppearing = {
	  positionStart: EnumAnimPropValueType.POS_CENTER,
	  positionEnd: EnumAnimPropValueType.POS_ORIG,
	  startColor: EnumAnimPropValueType.COLOR_ORIG,
	  endColor: EnumAnimPropValueType.NONE,
	  startR: EnumAnimPropValueType.R_ZERO,
	  endR: EnumAnimPropValueType.R_ORIG,
	};
  
	const propMapExchToSectorSplit = {
	  positionStart: EnumAnimPropValueType.POS_SPLIT_EXCH,
	  positionEnd: EnumAnimPropValueType.POS_SPLIT_SECTOR,
	  startColor: EnumAnimPropValueType.COLOR_SPLIT_EXCH,
	  endColor: EnumAnimPropValueType.COLOR_SPLIT_SECTOR,
	  startR: EnumAnimPropValueType.R_ORIG,
	  endR: EnumAnimPropValueType.NONE,
	};
  
	const propMapSectorToExchSplit = {
	  positionStart: EnumAnimPropValueType.POS_SPLIT_SECTOR,
	  positionEnd: EnumAnimPropValueType.POS_SPLIT_EXCH,
	  startColor: EnumAnimPropValueType.COLOR_SPLIT_SECTOR,
	  endColor: EnumAnimPropValueType.COLOR_SPLIT_EXCH,
	  startR: EnumAnimPropValueType.R_ORIG,
	  endR: EnumAnimPropValueType.NONE,
	};
  
	// ami nincs benne az nem lehetséges
	const animDefinitions: AnimDefinition[] = [
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: false,
		isEnding: true,
		prevAnimType: EnumAnimType.APPEARING_BUBBLES,
		nextAnimType: EnumAnimType.DISAPPEARING_BUBBLES,
		propMapping: propMapCollToDisappear,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.APPEARING_BUBBLES,
		nextAnimType: EnumAnimType.SPLITTED_EXCH_BUBBLES,
		propMapping: propMapCollToExchSplit,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.APPEARING_BUBBLES,
		nextAnimType: EnumAnimType.SPLITTED_SECTOR_BUBBLES,
		propMapping: propMapCollToSectorSplit,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.NONE,
		nextAnimType: EnumAnimType.APPEARING_BUBBLES,
		propMapping: propMapNoneToAppearing,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.DISAPPEARING_BUBBLES,
		nextAnimType: EnumAnimType.APPEARING_BUBBLES,
		propMapping: propMapNoneToAppearing,
	  },
	  // not used transitions below
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.DISAPPEARING_BUBBLES,
		nextAnimType: EnumAnimType.SPLITTED_EXCH_BUBBLES,
		propMapping: null,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.DISAPPEARING_BUBBLES,
		nextAnimType: EnumAnimType.SPLITTED_SECTOR_BUBBLES,
		propMapping: null,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: false,
		isEnding: true,
		prevAnimType: EnumAnimType.COLLAPSING_BUBBLES,
		nextAnimType: EnumAnimType.DISAPPEARING_BUBBLES,
		propMapping: propMapCollToDisappear,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.COLLAPSING_BUBBLES,
		nextAnimType: EnumAnimType.SPLITTED_EXCH_BUBBLES,
		propMapping: propMapCollToExchSplit,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.COLLAPSING_BUBBLES,
		nextAnimType: EnumAnimType.SPLITTED_SECTOR_BUBBLES,
		propMapping: propMapCollToSectorSplit,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.SPLITTED_EXCH_BUBBLES,
		nextAnimType: EnumAnimType.COLLAPSING_BUBBLES,
		propMapping: propMapExchSplitToColl,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: false,
		isEnding: true,
		prevAnimType: EnumAnimType.SPLITTED_EXCH_BUBBLES,
		nextAnimType: EnumAnimType.DISAPPEARING_BUBBLES,
		propMapping: propMapExchSplitToDisappear,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.SPLITTED_EXCH_BUBBLES,
		nextAnimType: EnumAnimType.SPLITTED_SECTOR_BUBBLES,
		propMapping: propMapExchToSectorSplit,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.SPLITTED_SECTOR_BUBBLES,
		nextAnimType: EnumAnimType.COLLAPSING_BUBBLES,
		propMapping: propMapSectorSplitToColl,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: false,
		isEnding: true,
		prevAnimType: EnumAnimType.SPLITTED_SECTOR_BUBBLES,
		nextAnimType: EnumAnimType.DISAPPEARING_BUBBLES,
		propMapping: propMapSectorSplitToDisappear,
	  },
	  {
		delayByIndex: 2,
		duration: 1000,
		isInterruptable: true,
		isEnding: false,
		prevAnimType: EnumAnimType.SPLITTED_SECTOR_BUBBLES,
		nextAnimType: EnumAnimType.SPLITTED_EXCH_BUBBLES,
		propMapping: propMapSectorToExchSplit,
	  },
	];
  
	function getAnimDef(
	  animDefintions: AnimDefinition[],
	  prevAnimType: EnumAnimType,
	  nextAnimType: EnumAnimType
	) {
	  for (let d of animDefintions) {
		if (prevAnimType === d.prevAnimType && nextAnimType === d.nextAnimType) {
		  return d;
		}
	  }
	  return undefined;
	}
  
	async function addAnimation(anims: AnimationElement[]) {
	  // erase anim queue
	  //nextAnims.current = [];  //bool input hogy törölje a listát ???
  
	  // check for each anim to add
	  for (let animToAdd of anims) {
		// add anim
		nextAnims.current.push({
		  type: animToAdd.type,
		  dataSource: animToAdd.dataSource,
		  animMetaData: null,
		});
	  }
	}
  
	async function execAnimation() {
	  // ongoing anim, nothing to do
	  if (actAnim.current !== null) return;
	  // exec the next one if have
	  else {
		if (nextAnims.current.length > 0) {
		  // get actual element
		  actAnim.current = nextAnims.current.shift()!;
  
		  console.log(`exec act anim`);
		  console.log(actAnim.current);
  
		  // get anim data
		  const data = await getData(actAnim.current.dataSource);
  
		  // prev anim type
		  const prevAnimType =
			prevAnim.current === null ? EnumAnimType.NONE : prevAnim.current.type;
  
		  // anim meta map
		  const animDef = getAnimDef(
			animDefinitions,
			prevAnimType,
			actAnim.current.type
		  );
  
		  // anim is not valid transition, ignore it
		  if (animDef === undefined) return;
  
		  // anim meta
		  actAnim.current.animMetaData = createAnimMeta(animDef!, data.data);
  
		  // get tooltip anim data
		  const tooltipDataStruct = genToolTipDatasStruct(
			actAnim.current.type,
			data.data
		  );
  
		  // do anim
		  makeAnimationForInterpCircles(
			actAnim.current.animMetaData,
			data.data,
			tooltipDataStruct
		  );
		}
	  }
	}
  
	function createAnimMeta(
	  animDefinition: AnimDefinition,
	  packData: BubbleDataPacked[]
	): CircleInterpAnimData {
	  console.log("createAnimMeta, animdef");
	  console.log(animDefinition);
  
	  let animData: CircleInterpAnimData = {
		delayByIndex: animDefinition.delayByIndex,
		duration: animDefinition.duration,
		isEnding: animDefinition.isEnding,
		isInterruptable: animDefinition.isInterruptable,
		circleData: {
		  index: undefined, // ???
		  positionStart: createAnimPropValue(
			animDefinition.propMapping!.positionStart,
			packData
		  )! as number[][],
		  startColor: createAnimPropValue(
			animDefinition.propMapping!.startColor,
			packData
		  )! as number[][],
		  startR: createAnimPropValue(
			animDefinition.propMapping!.startR,
			packData
		  )! as number[],
		},
	  };
  
	  animData.circleData = {
		...animData.circleData,
		...(animDefinition.propMapping!.positionEnd !==
		  EnumAnimPropValueType.NONE && {
		  positionEnd: createAnimPropValue(
			animDefinition.propMapping!.positionEnd,
			packData
		  )! as number[][],
		}),
		...(animDefinition.propMapping!.endR !== EnumAnimPropValueType.NONE && {
		  endR: createAnimPropValue(
			animDefinition.propMapping!.endR,
			packData
		  )! as number[],
		}),
		...(animDefinition.propMapping!.endColor !==
		  EnumAnimPropValueType.NONE && {
		  endColor: createAnimPropValue(
			animDefinition.propMapping!.endColor,
			packData
		  )! as number[][],
		}),
	  };
  
	  return animData;
	}
  
	function createAnimPropValue(
	  animPropValueType: EnumAnimPropValueType,
	  packData: BubbleDataPacked[]
	) {
	  switch (animPropValueType) {
		case EnumAnimPropValueType.NONE:
		  throw Error("Error during createAnimPropValue, NONE passed");
		case EnumAnimPropValueType.POS_CENTER:
		  return packData.map((d) => [
			positionCenter.current.x,
			positionCenter.current.y,
		  ]);
		case EnumAnimPropValueType.POS_ORIG:
		  return packData.map((d) => [d.x!, d.y!]);
		case EnumAnimPropValueType.POS_SPLIT_EXCH:
		  return packData.map((d) => [d.x_exch!, d.y_exch!]);
		case EnumAnimPropValueType.POS_SPLIT_SECTOR:
		  return packData.map((d) => [d.x_sector!, d.y_sector!]);
		case EnumAnimPropValueType.R_ORIG:
		  return packData.map((d) => d.r);
		case EnumAnimPropValueType.R_ZERO:
		  return packData.map((d) => 0);
		case EnumAnimPropValueType.COLOR_ORIG:
		  return packData.map((d) => d.color!);
		case EnumAnimPropValueType.COLOR_SPLIT_EXCH:
		  return packData.map((d) => d.color_exch!);
		case EnumAnimPropValueType.COLOR_SPLIT_SECTOR:
		  return packData.map((d) => d.color_sector!);
  
		default:
		  break;
	  }
	}
  
	let prevAnim = useRef<AnimationElement | null>(null);
	let actAnim = useRef<AnimationElement | null>(null);
	let nextAnims = useRef<AnimationElement[]>([]);
  
	useEffect(() => {
	  // to get mouse position
	  document.addEventListener("mousemove", mouseMoveEvent);
  
	  // animation exec event
	  const checkForAnimExec = setInterval(() => {
		execAnimation();
	  }, 200);
  
	  console.log("useEffect called");
  
	  const handleUseEffect = async () => {
		// init canvas, regl
		canvasRef.current!.setAttribute("class", "regl-canvas");
		pr.current = 1; // window.devicePixelRatio || 1,  telómon 2.75 a pixel ratio -> sokkal nagyobb canvas felbontás !!!
		canvasRef.current!.setAttribute(
		  "height",
		  `${pr.current * height.current}`
		);
		canvasRef.current!.setAttribute("width", `${pr.current * width.current}`);
		//canvas.style.width = width + "px"; !!!
  
		canvasRef.current?.addEventListener("mouseover", (e) => {
		  isCanvasMouseOver.current = true;
		});
  
		canvasRef.current?.addEventListener("mouseleave", (e) => {
		  isCanvasMouseOver.current = false;
		});
  
		gl.current = canvasRef.current!.getContext("webgl")!;
		gl.current.getExtension("OES_standard_derivatives");
		regl.current = REGL(gl.current);
		animation.current = makeShader();
  
		// init helpers
		colorIdConverter.current = new ColorToID(gl.current);
  
		//console.log(`selected_plan: ${selected_plan.current}`);
  
		// get bubble data
		subDataAct.current = await getData(selected_plan.current);
		setLegendData(getLegendData(selected_split.current));
  
		//console.log("useffect, subDataAct");
		//console.log(subDataAct.current);
  
		//setTest("Second");
  
		// await makeAnimationForInterpCircles(animData);
  
		// show bubbles
		//const animData = getApperingBubblesDataStruct(subDataAct.current!.data);
		//await makeAnimationForInterpCircles(animData);
		//console.log("await makeAnimationForInterpCircles ended");
  
		//await simulationInitial(subDataAct.current!.data);
		//console.log("await simulationInitial ended");
  
		addAnimation([
		  {
			type: EnumAnimType.APPEARING_BUBBLES,
			dataSource: EnumSubscription.BASIC,
			animMetaData: null,
		  },
		]);
	  };
  
	  handleUseEffect();
  
	  // copy for cleanup phase
	  const reglRef = regl.current;
  
	  // cleanup code(unmount)
	  return () => {
		if (reglRef !== null) reglRef.destroy();
		document.removeEventListener("mousemove", mouseMoveEvent);
		clearInterval(checkForAnimExec);
	  };
	}, []);
  
	// events
	// change subscription radio boxes
	function changeSubEvent(event: React.ChangeEvent<HTMLInputElement>) {
	  (async () => {
		switch (event.target.value) {
		  case "cbx_free":
			if (selected_plan.current != EnumSubscription.FREE) {
			  console.log("cbx_free selected event");
			  // disappear bubbles
			  animInterrupted.current = true;
  
			  // disappearing bubble anim
			  addAnimation([
				{
				  type: EnumAnimType.DISAPPEARING_BUBBLES,
				  dataSource: selected_plan.current,
				  animMetaData: null,
				},
			  ]);
  
			  //setSelectedSub(EnumSubscription.FREE);
			  selected_plan.current = EnumSubscription.FREE;
			  cbxSplitCollRef.current!.checked = true;
			  // let cbxCollElement = document.getElementById(
			  //   "#cbx_coll"
			  // ) as HTMLInputElement;
			  //cbxCollElement.checked = true;
			  subDataAct.current = await getData(selected_plan.current);
			  selected_split.current = EnumSelectedSplit.COLLAPSED;
			  setLegendData(getLegendData(selected_split.current));
			  //setTest("Thrid");
  
			  // appear bubbles
			  addAnimation([
				{
				  type: EnumAnimType.APPEARING_BUBBLES,
				  dataSource: EnumSubscription.FREE,
				  animMetaData: null,
				},
			  ]);
  
			  //await simulationInitial(subDataAct.current!.data);
			}
			break;
		  case "cbx_basic":
			if (selected_plan.current != EnumSubscription.BASIC) {
			  console.log("cbx_basic selected event");
  
			  // disappear bubbles
			  animInterrupted.current = true;
  
			  // disappearing bubble anim
			  addAnimation([
				{
				  type: EnumAnimType.DISAPPEARING_BUBBLES,
				  dataSource: selected_plan.current,
				  animMetaData: null,
				},
			  ]);
  
			  //setSelectedSub(EnumSubscription.BASIC);
			  selected_plan.current = EnumSubscription.BASIC;
			  cbxSplitCollRef.current!.checked = true;
			  // let cbxCollElement = document.getElementById(
			  //   "#cbx_coll"
			  // ) as HTMLInputElement;
			  //cbxCollElement.checked = true;
			  subDataAct.current = await getData(selected_plan.current);
			  selected_split.current = EnumSelectedSplit.COLLAPSED;
			  setLegendData(getLegendData(selected_split.current));
  
			  // appear bubbles
			  addAnimation([
				{
				  type: EnumAnimType.APPEARING_BUBBLES,
				  dataSource: EnumSubscription.BASIC,
				  animMetaData: null,
				},
			  ]);
			  //await simulationInitial(subDataAct.current!.data);
			}
			break;
		  case "cbx_premium":
			if (selected_plan.current != EnumSubscription.PREMIUM) {
			  console.log("cbx_premium selected event");
			  // disappear bubbles
			  animInterrupted.current = true;
  
			  // disappearing bubble anim
			  addAnimation([
				{
				  type: EnumAnimType.DISAPPEARING_BUBBLES,
				  dataSource: selected_plan.current,
				  animMetaData: null,
				},
			  ]);
  
			  //setSelectedSub(EnumSubscription.PREMIUM);
			  selected_plan.current = EnumSubscription.PREMIUM;
			  cbxSplitCollRef.current!.checked = true;
			  // let cbxCollElement = document.getElementById(
			  //   "#cbx_coll"
			  // ) as HTMLInputElement;
			  // cbxCollElement.checked = true;
			  subDataAct.current = await getData(selected_plan.current);
  
			  selected_split.current = EnumSelectedSplit.COLLAPSED;
			  setLegendData(getLegendData(selected_split.current));
  
			  // appear bubbles
			  addAnimation([
				{
				  type: EnumAnimType.APPEARING_BUBBLES,
				  dataSource: EnumSubscription.PREMIUM,
				  animMetaData: null,
				},
			  ]);
			  //await simulationInitial(subDataAct.current!.data);
			}
			break;
		}
	  })();
	}
  
	// toggle split unsplit
	function splitCollapseEvent(event: React.ChangeEvent<HTMLInputElement>) {
	  (async () => {
		switch (event.target.value) {
		  case "cbx_coll":
			if (selected_split.current != EnumSelectedSplit.COLLAPSED) {
			  console.log("cbx_coll selected event");
  
			  // select previously used group metadata
			  // const groupMetaToUse = EnumSelectedSplit.SPLITTED_EXCH
			  //   ? subDataAct.current!.layoutMetaExch
			  //   : subDataAct.current!.layoutMetaSector;
  
			  animInterrupted.current = true;
  
			  selected_split.current = EnumSelectedSplit.COLLAPSED;
			  setLegendData(getLegendData(selected_split.current));
  
			  // collapsed anim
			  addAnimation([
				{
				  type: EnumAnimType.COLLAPSING_BUBBLES,
				  dataSource: selected_plan.current,
				  animMetaData: null,
				},
			  ]);
  
			  // await simulationGroupBubbles(
			  //   subDataAct.current!.data,
			  //   groupMetaToUse!
			  // );
			}
			break;
		  case "cbx_spl_exch":
			if (selected_split.current != EnumSelectedSplit.SPLITTED_EXCH) {
			  console.log("cbx_spl_exch selected event");
  
			  animInterrupted.current = true;
			  selected_split.current = EnumSelectedSplit.SPLITTED_EXCH;
			  setLegendData(getLegendData(selected_split.current));
  
			  // split anim
			  addAnimation([
				{
				  type: EnumAnimType.SPLITTED_EXCH_BUBBLES,
				  dataSource: selected_plan.current,
				  animMetaData: null,
				},
			  ]);
  
			  // await simulationSplitBubbles(
			  //   subDataAct.current!.data,
			  //   bubbleGroupsMetaExch.current!
			  // );
			}
			break;
		  case "cbx_spl_sector":
			if (selected_split.current != EnumSelectedSplit.SPLITTED_SECTOR) {
			  console.log("cbx_spl_sector selected event");
  
			  animInterrupted.current = true;
			  selected_split.current = EnumSelectedSplit.SPLITTED_SECTOR;
			  setLegendData(getLegendData(selected_split.current));
  
			  // split anim
			  addAnimation([
				{
				  type: EnumAnimType.SPLITTED_SECTOR_BUBBLES,
				  dataSource: selected_plan.current,
				  animMetaData: null,
				},
			  ]);
  
			  // await simulationSplitBubbles(
			  //   subDataAct.current!.data,
			  //   bubbleGroupsMetaSector.current!
			  // );
			}
			break;
		}
	  })();
	}
  
	return (
	  <div className="flex flex-col items-center justify-items-center">

		{/* select plan */}
		<div>
		  <input
			id="cbx_free"
			name="cbx_sub"
			type="radio"
			value="cbx_free"
			onChange={changeSubEvent}
		  />
		  <label htmlFor="cbx_free">Free</label>
		  <input
			id="cbx_basic"
			name="cbx_sub"
			type="radio"
			value="cbx_basic"
			onChange={changeSubEvent}
			defaultChecked
		  />
		  <label htmlFor="cbx_basic">Basic</label>
		  <input
			id="cbx_premium"
			name="cbx_sub"
			type="radio"
			value="cbx_premium"
			onChange={changeSubEvent}
		  />
		  <label htmlFor="cbx_premium">Premium</label>
		</div>

		{/* split by */}
		<div>
		  <input
			id="cbx_coll"
			name="cbx_split"
			type="radio"
			value="cbx_coll"
			onChange={splitCollapseEvent}
			defaultChecked
			ref={cbxSplitCollRef}
		  />
		  <label htmlFor="cbx_coll">Collapse</label>
		  <input
			id="cbx_spl_exch"
			name="cbx_split"
			type="radio"
			value="cbx_spl_exch"
			onChange={splitCollapseEvent}
		  />
		  <label htmlFor="cbx_spl_exch">Split by exchange</label>
		  <input
			id="cbx_spl_sector"
			name="cbx_split"
			type="radio"
			value="cbx_spl_sector"
			onChange={splitCollapseEvent}
		  />
		  <label htmlFor="cbx_spl_sector">Split by sector</label>
		</div>
		
		{/* bubble chart  */}
		<div>
		  <canvas ref={canvasRef} />
		</div>
		<div>
		  <BubbleChartLegend inputs={legendData} />
		</div>
		<div>
		  <BubbleChartToolTip inputs={toolTipCompanyData} />
		</div>
	  </div>
	);
  };

  export default BubbleChart;