import {
  packSiblings as d3_packSiblings,
  max as d3_max,
  scaleSqrt as d3_scaleSqrt,
  PackRadius as d3_PackRadius,
  packEnclose as d3_packEnclose,
  PackCircle as d3_PackCircle,
} from "d3";
import REGL from "regl";
import {
  MS_Uniforms,
  MS_Attributes,
  MakeShaderProps,
  BubbleDatasSub,
} from "./types";
import {
  ApiResponse,
  EnumSubscription,
  BubbleDataJson,
  BubbleData,
} from "@/types";

import {
  BubbleDataPacked,
  BubbleGroupPosition,
  BubbleSplittedType,
  BubbleSplittedLayout,
  PackCircleWithGroupKey,
  BubbleDataBySplit,
  EnumAnimType,
  BubbleChartToolTipData,
  EnumSelectedSplit,
  LegendData,
  LegendDataElement,
} from "./types";

import { hexToNormalizedRgb } from "@/utils/helpers";
import ColorToID from "./ColorToId";

//------------------- data functions ----------------

export async function fetchBubbleData(selected_plan: EnumSubscription) {
  // get data from server
  const resp = await fetch(`/api/getBubbleChartData?sub_id=${selected_plan}`);

  // get response
  let respDataJson: ApiResponse = await resp.json();
  respDataJson = await respDataJson; // ez ide teljesen felesleges !!!

  // check for response
  if (respDataJson.status !== "STATUS_OK") {
    throw Error(`Error when fetch data: ${respDataJson.data as string}`);
  }

  return respDataJson.data as BubbleDataJson;
}

export function shuffleBubbleData(array: BubbleData[]) {
  let currentIndex = array.length,
    randomIndex; // ????????????? !!!

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

export function extendBubbleData(
  bubbleDataExtended: BubbleData[],
  colorIdConverter: ColorToID,
  maxBubbleSize: number
) {
  // add id, color id
  bubbleDataExtended.forEach((d, i) => {
    d.id = i;
    d.colorId = colorIdConverter!.createColor(d.id);
  });

  // set r
  // get radius scale
  const maxMcapVal = d3_max(bubbleDataExtended, (d: BubbleData) => d.m_cap);
  const radiusScale = d3_scaleSqrt()
    .range([0, maxBubbleSize])
    .domain([0, maxMcapVal!]); // m_cap as circle area

  // create packed data struct add r based on market cap value
  let packData: BubbleDataPacked[] = bubbleDataExtended.map((d) => {
    return { ...d, r: radiusScale(d.m_cap), x: 0, y: 0 };
  });

  return packData;
}

export function setCollapsedPackLayoutData(
  packData: BubbleDataPacked[],
  positionCenter: BubbleGroupPosition,
  colorCollapsedNorm: [number, number, number, number]
) {
  // packing( add x, y coords)
  let packDataAct = d3_packSiblings<BubbleDataPacked>(packData);

  // correct, add info to data(for pack)
  packDataAct.forEach((d) => {
    d.x = positionCenter.x + d.x;
    d.y = positionCenter.y + d.y;
    d.xOrig = d.x; // ezek most nem is kellenek interp animhoz
    d.yOrig = d.y;
    d.color = colorCollapsedNorm;
  });

  return packDataAct;
}

export function getBubbleGroupsMetaData(
  groupKeys: string[],
  splitType: BubbleSplittedType,
  groupColors: string[]
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

export function setSplittedPackLayoutData(
  packData: BubbleDataPacked[],
  splitLayoutToUse: BubbleSplittedLayout,
  splitType: BubbleSplittedType,
  positionCenter: BubbleGroupPosition
) {
  // get data grouped by split(clone orig data)
  const dataBySplit = getDataBySplit(packData, splitType); // structuredClone(, JSON.parse(JSON.stringify(...

  console.log("setSplittedPackLayoutData dataBySplit (exch, sector as key and prep. data)");
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
    const packLayout = d3_packSiblings<d3_PackRadius>(
      splittedDataStruct[splitVal].data.map((d) => {
        return { r: d.r };
      })
    );

    console.log(`setSplittedPackLayoutData splitVal ${splitVal} packLayout`);
    console.log(packLayout);
	console.log(`setSplittedPackLayoutData splitVal ${splitVal} splittedDataStruct[splitVal].data`);
    console.log(splittedDataStruct[splitVal].data);

    // get enclosing pack d.x,y,r -> enclosing circle center x,y,r
    // r meghat itt a lényeges, x,y ~ 0
    const enclosingPackMeta = d3_packEnclose<d3_PackCircle>(packLayout);
    splittedDataStruct[splitVal].enclosingCircle = enclosingPackMeta;
    enclosedCircles.push({
      groupKey: splitVal,
      x: enclosingPackMeta.x,
      y: enclosingPackMeta.y,
      r: enclosingPackMeta.r,
    });

	console.log(`setSplittedPackLayoutData splitVal ${splitVal} enclosingPackMeta`);
    console.log(enclosingPackMeta);

	// update each company split criteria x,y coords
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

	console.log(`setSplittedPackLayoutData splittedDataStruct splitVal ${splitVal} (filled x_exch, x_sector,y...)`);
    console.log(splittedDataStruct[splitVal]);
  }

  const rInc = 0; // px
  enclosedCircles.forEach((d) => d.r + rInc);

  // pack of enclosing circles(layout)
  // override existing ~ 0 x,y
  const outerCirclePackLayout =
    d3_packSiblings<PackCircleWithGroupKey>(enclosedCircles);

  console.log("setSplittedPackLayoutData outerCirclePackLayout");
  console.log(outerCirclePackLayout);

  // save new x,y values to our data struct
  for (const group of outerCirclePackLayout) {
    splittedDataStruct[group.groupKey].enclosingCircle!.x = group.x;
    splittedDataStruct[group.groupKey].enclosingCircle!.y = group.y;
  }

  // get the r of our final circle
  const outerCircleEnclosingPackMeta = d3_packEnclose<d3_PackCircle>(
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
          positionCenter.x;
        d.y_exch =
          splittedDataStruct[groupKey].enclosingCircle!.y +
          d.y_exch! +
          positionCenter.y;
        d.color_exch = layoutMeta!.split_color_norm;
      } else {
        d.x_sector =
          splittedDataStruct[groupKey].enclosingCircle!.x +
          d.x_sector! +
          positionCenter.x;
        d.y_sector =
          splittedDataStruct[groupKey].enclosingCircle!.y +
          d.y_sector! +
          positionCenter.y;
        d.color_sector = layoutMeta!.split_color_norm;
      }
    });
  }

  // exch, sector x,y + outerCircleEnclosingPackMeta.r
  // vagy a bubble center-hez igazítom az a legjobb

  console.log("setSplittedPackLayoutData splittedDataStruct");
  console.log(splittedDataStruct);
}

//------------------- webgl ----------------
export const makeShader = (reglObj: REGL.Regl) =>
  // data: BubbleDataPacked[], colorCol = "color"
  reglObj<MS_Uniforms, MS_Attributes, MakeShaderProps>({
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
      stageWidth: reglObj.context("drawingBufferWidth"),
      stageHeight: reglObj.context("drawingBufferHeight"),
    },
    count: (context, props) => props.dataLength,
    primitive: "points",
  });

//------------------- tooltip funcs ----------------

export function genToolTipDatasStruct(
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

function readPixelFromWebGLCanvas(
  gl: WebGLRenderingContext,
  canvasRef: HTMLCanvasElement,
  mouse_x: number,
  mouse_y: number
) {
  //console.log(`x ${mouse_x} y ${mouse_y}`);

  // mouse -> canvas coord
  const { x: c_s_x, y: c_s_y } = canvasRef.getClientRects()[0];
  const c_x = mouse_x - c_s_x;
  const c_y = canvasRef.clientHeight - (mouse_y - c_s_y);
  //console.log(`x ${c_x} y ${c_y}`);
  let pixel = new window.Uint8Array(4);
  gl.readPixels(c_x, c_y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  //console.log(`r ${pixel[0]} g ${pixel[1]} b ${pixel[2]} a ${pixel[3]}`);

  return pixel;
}

export function getHoveredBubbleElement(
  packData: BubbleDataPacked[],
  gl: WebGLRenderingContext,
  canvasRef: HTMLCanvasElement,
  mouse_x: number,
  mouse_y: number,
  isCanvasMouseOver: boolean,
  colorIdConverter: ColorToID
): BubbleChartToolTipData | null {
  const pixelColor = readPixelFromWebGLCanvas(gl, canvasRef, mouse_x, mouse_y);
  const compIndex = colorIdConverter.getID(
    pixelColor[0],
    pixelColor[1],
    pixelColor[2],
    pixelColor[3]
  );

  //console.log(`pixelColor: ${pixelColor}`);

  if (compIndex < packData.length) {
    const d = packData[compIndex];
    return {
      isCanvasMouseOver: isCanvasMouseOver,
      position: { x: mouse_x, y: mouse_y },
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

//------------------- legend funcs ----------------

function adjustColor(color: string, amount: number) {
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
}

export function getLegendData(
  splitType: EnumSelectedSplit,
  subDataAct: BubbleDatasSub,
  groupColors: string[]
): LegendData {
  let title: string;
  let data: LegendDataElement[];
  switch (splitType) {
    // colapsed
    case EnumSelectedSplit.COLLAPSED:
      title = "No split is selected";
      data = [];
      break;

    // splitted by exchange
    case EnumSelectedSplit.SPLITTED_EXCH:
      title = "Split by exchange";
      data = subDataAct.meta.exchanges.map((d, i) => {
        return {
          title: d.replace("_", " "),
          colorBodyHex: groupColors[i],
          colorBorderHex: adjustColor(groupColors[i], -20),
        };
      });
      break;

    // splitted by sector
    case EnumSelectedSplit.SPLITTED_SECTOR:
      title = "Split by sector";
      data = subDataAct.meta.sectors.map((d, i) => {
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

//------------------- UI ----------------

export function getSelectedSubRbtnValueFromEnum(
  selectedSplitEnum: EnumSubscription
) {
  switch (selectedSplitEnum) {
    case EnumSubscription.FREE:
      return "cbx_free";
    case EnumSubscription.BASIC:
      return "cbx_basic";
    case EnumSubscription.PREMIUM:
      return "cbx_premium";
    default:
      break;
  }
}

export function getSelectedSubEnumFromRbtnValue(selectedSplitStr: string) {
  switch (selectedSplitStr) {
    case "cbx_free":
      return EnumSubscription.FREE;
    case "cbx_basic":
      return EnumSubscription.BASIC;
    case "cbx_premium":
      return EnumSubscription.PREMIUM;
    default:
      break;
  }
}

export function getSelectedSplitRbtnValueFromEnum(
  selectedSplitEnum: EnumSelectedSplit
) {
  switch (selectedSplitEnum) {
    case EnumSelectedSplit.COLLAPSED:
      return "cbx_coll";
    case EnumSelectedSplit.SPLITTED_EXCH:
      return "cbx_spl_exch";
    case EnumSelectedSplit.SPLITTED_SECTOR:
      return "cbx_spl_sector";
    default:
      break;
  }
}

export function getSelectedSplitEnumFromRbtnValue(selectedSplitStr: string) {
  switch (selectedSplitStr) {
    case "cbx_coll":
      return EnumSelectedSplit.COLLAPSED;
    case "cbx_spl_exch":
      return EnumSelectedSplit.SPLITTED_EXCH;
    case "cbx_spl_sector":
      return EnumSelectedSplit.SPLITTED_SECTOR;
    default:
      break;
  }
}

// not used
// egyedi layoutot is lehet bizonyos group countoknál vagy az alatt
function getSplittedRectLayout(
  numOfGroups: number,
  width: number,
  height: number
) {
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
  console.log(width);

  // iterate over groups, set x,y (for incomplete row too)
  let ret = [];
  for (let i = 0; i < numOfGroups; i++) {
    let actRow = Math.floor(i / numOfGroupsPerRow) + 1;
    let actElem = i % numOfGroupsPerRow;

    console.log("x");
    console.log((border + widthInc * actElem) * width);

    ret.push({
      x: (border + widthInc * actElem) * width,
      y: (border + heightInc * actRow) * height,
    });
  }

  // correct x for incomplete rows
  for (let i = 0; i < incompleteRowGroupC; i++) {
    let actElem = (i % numOfGroupsPerRow) + 1;
    let widthIncMod = (1 - 2 * border) / (incompleteRowGroupC + 1);
    ret[ret.length + i - incompleteRowGroupC].x =
      (border + widthIncMod * actElem) * width;
  }

  return ret;
}
