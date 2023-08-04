"use client";

import { useRef, useState, useEffect } from "react";
import REGL from "regl";
import Loading from "./Loading";

import {
  makeShader,
  fetchBubbleData,
  shuffleBubbleData,
  setCollapsedPackLayoutData,
  extendBubbleData,
  getBubbleGroupsMetaData,
  setSplittedPackLayoutData,
  genToolTipDatasStruct,
  getHoveredBubbleElement,
  getLegendData,
  getSelectedSplitRbtnValueFromEnum,
  getSelectedSplitEnumFromRbtnValue,
  getSelectedSubEnumFromRbtnValue,
} from "./common";

import {
  BubbleData,
  EnumSubscription,
  ApiResponse,
  BubbleDataJson,
} from "@/types";

import {
  BubbleChartInputInterpTypeProps,
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
  EnumAnimType,
  BubbleChartToolTipData,
  EnumSelectedSplit,
  LegendData,
  LegendDataElement,
  BubbleGroupPosition,
  BubbleDatasSub,
  EnumAnimPropValueType,
  AnimDefinition,
  AnimationElement,
} from "./types";

import BubbleChartToolTip from "./BubbleChartToolTip";
import BubbleChartLegend from "./BubbleChartLegend";
import ColorToID from "./ColorToId";

import { RadioButtonGroup, RadioButton } from "../_elements";

import { hexToNormalizedRgb } from "@/utils/helpers";

import { useTwCssTheme } from "../TwCssThemeContext";


// component
const BubbleChartInterpType: React.FC<BubbleChartInputInterpTypeProps> = ({
  inputs,
}) => {
  // component functions
  //----------------------anim gpu interp

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
		  fragColor = ${props.endColor ? "mix(startColor, endColor, t)" : "startColor"};
  
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
            setToolTipCompanyData(
              getHoveredBubbleElement(
                packData,
                gl.current!,
                canvasRef.current!,
                mouse_x.current,
                mouse_y.current,
                isCanvasMouseOver.current,
                colorIdConverter.current!
              )
            );
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

  //----------------- data functions

  async function getData(subId: EnumSubscription) {
    let dataToRet =
      bubbleData.current[EnumSubscription[subId] as keyof BubbleDatas];

    // if we didn't loaded the data yet
    if (dataToRet === undefined) {
      try {
        // try catch miatt ... | undefined return val ha nincs végső throw
        let bubbleDataWithMeta = await fetchBubbleData(subId);
        let bubbleDataShuffled = shuffleBubbleData(bubbleDataWithMeta.data);
        const bubbleDataPacked = extendBubbleData(
          bubbleDataShuffled,
          colorIdConverter.current!,
          inputs.maxBubbleSize
        );
        let packDataAct = setCollapsedPackLayoutData(
          bubbleDataPacked,
          positionCenter,
          colorCollapsedNorm
        );

        // get split layout meta(data structure for splitted layout)
        // get bubble groups meta data for exchange, sector groupping
        const layoutExhData = getBubbleGroupsMetaData(
          bubbleDataWithMeta.meta.exchanges,
          BubbleSplittedType.EXCHANGE,
          actColors.groupColors
        );

        const layoutSectorData = getBubbleGroupsMetaData(
          bubbleDataWithMeta.meta.sectors,
          BubbleSplittedType.SECTOR,
          actColors.groupColors
        );

        setSplittedPackLayoutData(
          packDataAct,
          layoutExhData,
          BubbleSplittedType.EXCHANGE,
          positionCenter
        );
        setSplittedPackLayoutData(
          packDataAct,
          layoutSectorData,
          BubbleSplittedType.SECTOR,
          positionCenter
        );

        // cache data
        dataToRet = {
          meta: bubbleDataWithMeta.meta,
          data: bubbleDataPacked,
          layoutMetaExch: layoutExhData,
          layoutMetaSector: layoutSectorData,
        };
        bubbleData.current[EnumSubscription[subId] as keyof BubbleDatas] =
          dataToRet;

        // return cloned data
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

  // ----------------- tooltip

  const documentMouseMoveEvent = (e: MouseEvent) => {
    mouse_x.current = e.clientX;
    mouse_y.current = e.clientY;
  };

  const canvasMouseOverEvent = (e: MouseEvent) => {
    isCanvasMouseOver.current = true;
  } 

  const canvasMouseLeaveEvent = (e: MouseEvent) => {
      isCanvasMouseOver.current = false;
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

  //---------------------------------------------
  //----------------------funcs end--------------

  // inputs
  // theme and colors
  const {mode, toggleMode} = useTwCssTheme();
  const actTheme = mode;
  const actColors =
    actTheme === "light" ? inputs.colors.light : inputs.colors.dark;

  // inner inputs
  //esetleg useMemo ezek
  const positionCenter: BubbleGroupPosition = {
    x: inputs.width * 0.5,
    y: inputs.height * 0.5,
  }; // pr ???
  const colorCollapsedNorm = hexToNormalizedRgb(actColors.collapsedColor);
  let pr = 1;

  // working vars
  // refs
  let colorBgNorm = useRef(hexToNormalizedRgb(actColors.bgColor) as REGL.Vec4);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  //let frameloop = useRef<REGL.Cancellable | null>(null);
  let regl = useRef<REGL.Regl | null>(null);
  let gl = useRef<WebGLRenderingContext | null>(null);
  let animation = useRef<REGL.DrawCommand | null>(null);
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
  let mouse_x = useRef<number>(0);
  let mouse_y = useRef<number>(0);
  let prevAnim = useRef<AnimationElement | null>(null);
  let actAnim = useRef<AnimationElement | null>(null);
  let nextAnims = useRef<AnimationElement[]>([]);

  // states
  const [selectedSplit, setSelectedSplit] = useState(
    EnumSelectedSplit.COLLAPSED
  );
  const [selectedPlan, setSelectedPlan] = useState(inputs.defSelected_plan);
  let [toolTipCompanyData, setToolTipCompanyData] =
    useState<BubbleChartToolTipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    else {
      // exec the next one if have
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
        return packData.map((d) => [positionCenter.x, positionCenter.y]);
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

  // change bubble bg if theme changes
  useEffect(() => {
    colorBgNorm.current = hexToNormalizedRgb(actColors.bgColor) as REGL.Vec4;
  }, [actTheme]);

  useEffect(() => {
    // to get mouse position
    document.addEventListener("mousemove", documentMouseMoveEvent);

    // animation exec event
    const checkForAnimExec = setInterval(() => {
      execAnimation();
    }, 200);

    // change bg test
    // const changeBg = setInterval(() => {
    //   const c = Math.random() > 0.5 ? "#64748b" : "#f1f5f9";
    //   colorBgNorm.current = hexToNormalizedRgb(c) as REGL.Vec4;
    // }, 5000);

    const handleUseEffect = async () => {
      // init canvas, regl
      canvasRef.current!.setAttribute("class", "regl-canvas");
      pr = 1; // window.devicePixelRatio || 1,  telómon 2.75 a pixel ratio -> sokkal nagyobb canvas felbontás !!!
      canvasRef.current!.setAttribute("height", `${pr * inputs.height}`);
      canvasRef.current!.setAttribute("width", `${pr * inputs.width}`);
      //canvas.style.width = width + "px"; !!!

      gl.current = canvasRef.current!.getContext("webgl")!;
      gl.current.getExtension("OES_standard_derivatives");
      regl.current = REGL(gl.current);

      // init mouse over, mouse leave events
      canvasRef.current?.addEventListener("mouseover", canvasMouseOverEvent );
      canvasRef.current?.addEventListener("mouseleave", canvasMouseLeaveEvent );

      // init shader to able to get tooltip data
      animation.current = makeShader(regl.current);

      // init helpers
      colorIdConverter.current = new ColorToID(gl.current);

      //console.log(`selected_plan: ${selected_plan.current}`);

      // get bubble data
      subDataAct.current = await getData(selectedPlan);
      setLegendData(
        getLegendData(selectedSplit, subDataAct.current!, actColors.groupColors)
      );

      //console.log("useffect, subDataAct");
      //console.log(subDataAct.current);

      //setTest("Second");

      // await makeAnimationForInterpCircles(animData);

      //await simulationInitial(subDataAct.current!.data);
      //console.log("await simulationInitial ended");

      // disable loading screen first time
      if (isLoading) setIsLoading(false);

      // add and execute initial animation
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
      document.removeEventListener("mousemove", documentMouseMoveEvent);
      canvasRef.current?.removeEventListener("mouseover", canvasMouseOverEvent)
      canvasRef.current?.removeEventListener("mouseleave", canvasMouseLeaveEvent)
      clearInterval(checkForAnimExec);
    };
  }, []);

  // events
  // change subscription radio boxes
  function changeSubscriptionEvent(event: React.ChangeEvent<HTMLInputElement>) {
    (async () => {
      const selectedSubscription = getSelectedSubEnumFromRbtnValue(
        event.target.value
      );

      switch (selectedSubscription) {
        case EnumSubscription.FREE:
          if (selectedPlan != EnumSubscription.FREE) {
            console.log("cbx_free selected event");
            // disappear bubbles
            animInterrupted.current = true;

            // disappearing bubble anim
            addAnimation([
              {
                type: EnumAnimType.DISAPPEARING_BUBBLES,
                dataSource: selectedPlan, // previous value
                animMetaData: null,
              },
            ]);

            setSelectedPlan(EnumSubscription.FREE);
            // let cbxCollElement = document.getElementById(
            //   "#cbx_coll"
            // ) as HTMLInputElement;
            //cbxCollElement.checked = true;

            subDataAct.current = await getData(selectedSubscription);
            setSelectedSplit(EnumSelectedSplit.COLLAPSED);
            setLegendData(
              getLegendData(
                EnumSelectedSplit.COLLAPSED,
                subDataAct.current!,
                actColors.groupColors
              )
            );

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
        case EnumSubscription.BASIC:
          if (selectedPlan != EnumSubscription.BASIC) {
            console.log("cbx_basic selected event");

            // disappear bubbles
            animInterrupted.current = true;

            // disappearing bubble anim
            addAnimation([
              {
                type: EnumAnimType.DISAPPEARING_BUBBLES,
                dataSource: selectedPlan, // previous value
                animMetaData: null,
              },
            ]);

            setSelectedPlan(EnumSubscription.BASIC);
            // let cbxCollElement = document.getElementById(
            //   "#cbx_coll"
            // ) as HTMLInputElement;
            //cbxCollElement.checked = true;

            subDataAct.current = await getData(selectedSubscription);
            setSelectedSplit(EnumSelectedSplit.COLLAPSED);
            setLegendData(
              getLegendData(
                EnumSelectedSplit.COLLAPSED,
                subDataAct.current!,
                actColors.groupColors
              )
            );

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
        case EnumSubscription.PREMIUM:
          if (selectedPlan != EnumSubscription.PREMIUM) {
            console.log("cbx_premium selected event");

            // disappear bubbles
            animInterrupted.current = true;

            // disappearing bubble anim
            addAnimation([
              {
                type: EnumAnimType.DISAPPEARING_BUBBLES,
                dataSource: selectedPlan, // previous value
                animMetaData: null,
              },
            ]);

            setSelectedPlan(EnumSubscription.PREMIUM);
            // let cbxCollElement = document.getElementById(
            //   "#cbx_coll"
            // ) as HTMLInputElement;
            // cbxCollElement.checked = true;

            subDataAct.current = await getData(selectedSubscription);

            setSelectedSplit(EnumSelectedSplit.COLLAPSED);
            setLegendData(
              getLegendData(
                EnumSelectedSplit.COLLAPSED,
                subDataAct.current!,
                actColors.groupColors
              )
            );

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
      const selectedSplitFromInput = getSelectedSplitEnumFromRbtnValue(
        event.target.value
      );

      switch (selectedSplitFromInput) {
        case EnumSelectedSplit.COLLAPSED:
          if (selectedSplit != EnumSelectedSplit.COLLAPSED) {
            // select previously used group metadata
            // const groupMetaToUse = EnumSelectedSplit.SPLITTED_EXCH
            //   ? subDataAct.current!.layoutMetaExch
            //   : subDataAct.current!.layoutMetaSector;

            animInterrupted.current = true;

            setSelectedSplit(EnumSelectedSplit.COLLAPSED);
            setLegendData(
              getLegendData(
                EnumSelectedSplit.COLLAPSED,
                subDataAct.current!,
                actColors.groupColors
              )
            );

            // collapsed anim
            addAnimation([
              {
                type: EnumAnimType.COLLAPSING_BUBBLES,
                dataSource: selectedPlan,
                animMetaData: null,
              },
            ]);

            // await simulationGroupBubbles(
            //   subDataAct.current!.data,
            //   groupMetaToUse!
            // );
          }
          break;
        case EnumSelectedSplit.SPLITTED_EXCH:
          if (selectedSplit != EnumSelectedSplit.SPLITTED_EXCH) {
            console.log("cbx_spl_exch selected event");

            animInterrupted.current = true;
            setSelectedSplit(EnumSelectedSplit.SPLITTED_EXCH);
            setLegendData(
              getLegendData(
                EnumSelectedSplit.SPLITTED_EXCH,
                subDataAct.current!,
                actColors.groupColors
              )
            );

            // split anim
            addAnimation([
              {
                type: EnumAnimType.SPLITTED_EXCH_BUBBLES,
                dataSource: selectedPlan,
                animMetaData: null,
              },
            ]);

            // await simulationSplitBubbles(
            //   subDataAct.current!.data,
            //   bubbleGroupsMetaExch.current!
            // );
          }
          break;
        case EnumSelectedSplit.SPLITTED_SECTOR:
          if (selectedSplit != EnumSelectedSplit.SPLITTED_SECTOR) {
            console.log("cbx_spl_sector selected event");

            animInterrupted.current = true;
            setSelectedSplit(EnumSelectedSplit.SPLITTED_SECTOR);
            setLegendData(
              getLegendData(
                EnumSelectedSplit.SPLITTED_SECTOR,
                subDataAct.current!,
                actColors.groupColors
              )
            );

            // split anim
            addAnimation([
              {
                type: EnumAnimType.SPLITTED_SECTOR_BUBBLES,
                dataSource: selectedPlan,
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

  // show loading screen
  // if(isLoading)
  //   return (
  //   <div className="flex flex-col items-center justify-items-center">
  //     Loading...
  //   </div>
  //   )

  return (
    <div className="flex flex-col items-center justify-items-center">
      {/* loading screen */}
      {isLoading && (
        <div className="absolute w-[1100px] h-[900px] z-10">
          <Loading />
        </div>
      )}

      {/* heading */}
      <h2 className="mb-12 text-3xl font-bold text-secondary_c-900 dark:text-secondary_c-100">
        Our investment universe
      </h2>

      <div className="flex w-1/2">
        {/* select plan */}
        <div className="flex items-center justify-center w-full">
          <div>
            <RadioButtonGroup
              groupName="cbx_sub_bubble_chart_interp_type"
              labels={["Free", "Basic", "Premium"]}
              values={["cbx_free", "cbx_basic", "cbx_premium"]}
              onChange={(
                event: React.ChangeEvent<HTMLInputElement>,
                selected: string
              ) => changeSubscriptionEvent(event)}
              defaultCheckedValue="cbx_basic"
            />
          </div>
        </div>

        {/* split by */}
        <div className="flex items-center justify-center w-full">
          <div>
            <RadioButton
              groupName="cbx_split_bubble_chart_interp_type"
              label="Collapse"
              value="cbx_coll"
              onChange={splitCollapseEvent}
              checked={
                getSelectedSplitRbtnValueFromEnum(selectedSplit) === "cbx_coll"
              }
            />
            <RadioButton
              groupName="cbx_split_bubble_chart_interp_type"
              label="Split by exchange"
              value="cbx_spl_exch"
              onChange={splitCollapseEvent}
              checked={
                getSelectedSplitRbtnValueFromEnum(selectedSplit) ===
                "cbx_spl_exch"
              }
            />
            <RadioButton
              groupName="cbx_split_bubble_chart_interp_type"
              label="Split by sector"
              value="cbx_spl_sector"
              onChange={splitCollapseEvent}
              checked={
                getSelectedSplitRbtnValueFromEnum(selectedSplit) ===
                "cbx_spl_sector"
              }
            />
          </div>
        </div>
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

export default BubbleChartInterpType;
