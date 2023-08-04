"use client";

import React, { useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import TWEEN from "@tweenjs/tween.js";
import REGL from "regl";
import ColorToID from "./ColorToId";
import Loading from "./Loading";
import { RadioButtonGroup, RadioButton } from "../_elements";
import BubbleChartLegend from "./BubbleChartLegend";
import BubbleChartToolTip from "./BubbleChartToolTip";

import {
  makeShader,
  fetchBubbleData,
  shuffleBubbleData,
  extendBubbleData,
  setCollapsedPackLayoutData,
  getBubbleGroupsMetaData,
  setSplittedPackLayoutData,
  getLegendData,
  getHoveredBubbleElement,
  getSelectedSplitRbtnValueFromEnum,
  getSelectedSplitEnumFromRbtnValue,
  getSelectedSubEnumFromRbtnValue,
} from "./common";

import {
  BubbleDatas,
  BubbleDatasSub,
  BubbleChartToolTipData,
  LegendData,
  BubbleChartInputSimTypeProps,
  BubbleDataPacked,
  MakeShaderProps,
  ForcePositionFunc,
  BubbleSplittedLayout,
  BubbleGroupColorInterpMetas,
  BubbleSplittedType,
  EnumSelectedSplit,
  BubbleGroupPosition,
} from "./types";

import { EnumSubscription } from "@/types";

import { hexToNormalizedRgb } from "@/utils/helpers";

const BubbleChartSimType: React.FC<BubbleChartInputSimTypeProps> = ({
  inputs,
}) => {
  // inner inputs
  //esetleg useMemo ezek
  const actTheme = "light";
  const actColors =
    actTheme === "light" ? inputs.colors.light : inputs.colors.dark;
  const positionCenter: BubbleGroupPosition = {
    x: inputs.width * 0.5,
    y: inputs.height * 0.5,
  }; // pr ???
  const colorCollapsedNorm = hexToNormalizedRgb(actColors.collapsedColor);
  const colorBgNorm = hexToNormalizedRgb(actColors.bgColor) as REGL.Vec4;
  let pr = 1;
  let chargeStrength = inputs.simulation.chargeStrength;

  // working vars
  // refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let frameloop = useRef<REGL.Cancellable | null>(null);
  let regl = useRef<REGL.Regl | null>(null);
  let gl = useRef<WebGLRenderingContext | null>(null);
  let animation = useRef<REGL.DrawCommand | null>(null);
  let animInterrupted = useRef<boolean>(false);
  const colorIdConverter = useRef<ColorToID | null>(null);
  let isCanvasMouseOver = useRef<boolean>(false);
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

  // !!! nem kapnak értéket
  let bubbleGroupsMetaExch = useRef<BubbleSplittedLayout | null>(null);
  let bubbleGroupsMetaSector = useRef<BubbleSplittedLayout | null>(null);

  // states
  const [selectedSplit, setSelectedSplit] = useState(
    EnumSelectedSplit.COLLAPSED
  );
  const [selectedPlan, setSelectedPlan] = useState(inputs.defSelected_plan);
  const [legendData, setLegendData] = useState<LegendData>({
    title: "",
    data: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // to get mouse position
    document.addEventListener("mousemove", mouseMoveEvent);

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
      canvasRef.current?.addEventListener("mouseover", (e) => {
        isCanvasMouseOver.current = true;
      });
      canvasRef.current?.addEventListener("mouseleave", (e) => {
        isCanvasMouseOver.current = false;
      });

      // init shader to able to get tooltip data
      animation.current = makeShader(regl.current);

      // init helpers
      colorIdConverter.current = new ColorToID(gl.current);

      // get bubble data
      subDataAct.current = await getData(selectedPlan);
      setLegendData(
        getLegendData(selectedSplit, subDataAct.current!, actColors.groupColors)
      );

      // disable loading screen first time
      if (isLoading) setIsLoading(false);

      await simulationInitial(subDataAct.current!.data);
    };

    handleUseEffect();

    // copy for cleanup phase
    const reglRef = regl.current;

    // cleanup code(unmount)
    return () => {
      if (reglRef !== null) reglRef.destroy();
      document.removeEventListener("mousemove", mouseMoveEvent);
    };
  }, []);

  function simulationInitial(packData: BubbleDataPacked[]) {
    return new Promise<void>((resolve, reject) => {
      let is_ended = false;

      animInterrupted.current = false;

      console.log("simulationInitial started");

      let simulation = forceBubbles(positionCenter.x, positionCenter.y, true);
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
          color: colorBgNorm,
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

        regl.current!.clear({
          color: colorBgNorm,
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
    chargeStrength = chargeForce;

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
    return -Math.pow(d.r!, 2.0) * chargeStrength;
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
          ? d3.interpolateRgb(actColors.collapsedColor, elem.split_color)
          : d3.interpolateRgb(elem.split_color, actColors.collapsedColor),
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

      console.log("splittedLayout");
      console.log(splittedLayout);

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
        inputs.simulation.split.useCharge,
        inputs.simulation.split.chargeForce,
        inputs.simulation.split.xForce,
        inputs.simulation.split.yForce,
        inputs.simulation.split.collideForce
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
          color: colorBgNorm,
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
          color: colorBgNorm,
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
        positionCenter.x,
        positionCenter.y,
        inputs.simulation.collapse.useCharge,
        inputs.simulation.collapse.chargeForce,
        inputs.simulation.collapse.xForce,
        inputs.simulation.collapse.yForce,
        inputs.simulation.collapse.collideForce
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
          color: colorBgNorm,
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
          color: colorBgNorm,
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
          frameloop.cancel();
          //frameloop = null;
          tweenBubblesOriginalPosition(
            packData,
            "x",
            "xOrig",
            "y",
            "yOrig",
            1000
          );
          resolve();
        }
      });
    });
  }

  // -------------- js tween animation
  function tweenAnimate() {
    requestAnimationFrame(tweenAnimate);

    TWEEN.update();

    regl.current!.clear({
      color: colorBgNorm,
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

        console.log("setSplittedPackLayoutData layoutExhData");
        console.log(layoutExhData);

        setSplittedPackLayoutData(
          packDataAct,
          layoutSectorData,
          BubbleSplittedType.SECTOR,
          positionCenter
        );

        console.log("setSplittedPackLayoutData layoutSectorData");
        console.log(layoutSectorData);

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

  //------------ tooltip
  const mouseMoveEvent = (e: MouseEvent) => {
    mouse_x.current = e.clientX;
    mouse_y.current = e.clientY;
  };

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

            // disappearing bubble anim !!!
            // addAnimation([
            //   {
            //     type: EnumAnimType.DISAPPEARING_BUBBLES,
            //     dataSource: selected_plan.current,
            //     animMetaData: null,
            //   },
            //]);

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
            //setTest("Thrid");

            // appear bubbles
            await simulationInitial(subDataAct.current!.data);
          }
          break;
        case EnumSubscription.BASIC:
          if (selectedPlan != EnumSubscription.BASIC) {
            console.log("cbx_basic selected event");

            // disappear bubbles
            animInterrupted.current = true;

            // disappearing bubble anim
            // addAnimation([
            //   {
            //     type: EnumAnimType.DISAPPEARING_BUBBLES,
            //     dataSource: selected_plan.current,
            //     animMetaData: null,
            //   },
            // ]);

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
            // addAnimation([
            //   {
            //     type: EnumAnimType.APPEARING_BUBBLES,
            //     dataSource: EnumSubscription.BASIC,
            //     animMetaData: null,
            //   },
            // ]);

            await simulationInitial(subDataAct.current!.data);
          }
          break;
        case EnumSubscription.PREMIUM:
          if (selectedPlan != EnumSubscription.PREMIUM) {
            console.log("cbx_premium selected event");
            // disappear bubbles
            animInterrupted.current = true;

            // disappearing bubble anim
            // addAnimation([
            //   {
            //     type: EnumAnimType.DISAPPEARING_BUBBLES,
            //     dataSource: selected_plan.current,
            //     animMetaData: null,
            //   },
            // ]);

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
            // addAnimation([
            //   {
            //     type: EnumAnimType.APPEARING_BUBBLES,
            //     dataSource: EnumSubscription.PREMIUM,
            //     animMetaData: null,
            //   },
            // ]);
            await simulationInitial(subDataAct.current!.data);
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

      // select previously used group metadata
      const groupMetaToUse =
        selectedSplitFromInput === EnumSelectedSplit.SPLITTED_EXCH
          ? subDataAct.current!.layoutMetaExch
          : subDataAct.current!.layoutMetaSector;

      switch (selectedSplitFromInput) {
        case EnumSelectedSplit.COLLAPSED:
          if (selectedSplit != EnumSelectedSplit.COLLAPSED) {
            animInterrupted.current = true;

            setSelectedSplit(EnumSelectedSplit.COLLAPSED);
            setLegendData(
              getLegendData(
                EnumSelectedSplit.COLLAPSED,
                subDataAct.current!,
                actColors.groupColors
              )
            );

            await simulationGroupBubbles(
              subDataAct.current!.data,
              groupMetaToUse
            );
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
            await simulationSplitBubbles(
              subDataAct.current!.data,
              groupMetaToUse
            );
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
            await simulationSplitBubbles(
              subDataAct.current!.data,
              groupMetaToUse
            );
          }
          break;
      }
    })();
  }

  return (
    <div className="flex flex-col items-center justify-items-center">
      {isLoading && (
        <div className="absolute w-[1100px] h-[900px] z-10">
          <Loading />
        </div>
      )}

      {/* select plan */}
      <div>
        <RadioButtonGroup
          groupName="cbx_sub_bubble_chart_sim_type"
          labels={["Free", "Basic", "Premium"]}
          values={["cbx_free", "cbx_basic", "cbx_premium"]}
          onChange={(
            event: React.ChangeEvent<HTMLInputElement>,
            selected: string
          ) => changeSubscriptionEvent(event)}
          defaultCheckedValue="cbx_basic"
        />
      </div>

      {/* split by */}
      <div>
        <RadioButton
          groupName="cbx_split_bubble_chart_sim_type"
          label="Collapse"
          value="cbx_coll"
          onChange={splitCollapseEvent}
          checked={
            getSelectedSplitRbtnValueFromEnum(selectedSplit) === "cbx_coll"
          }
        />
        <RadioButton
          groupName="cbx_split_bubble_chart_sim_type"
          label="Split by exchange"
          value="cbx_spl_exch"
          onChange={splitCollapseEvent}
          checked={
            getSelectedSplitRbtnValueFromEnum(selectedSplit) === "cbx_spl_exch"
          }
        />
        <RadioButton
          groupName="cbx_split_bubble_chart_sim_type"
          label="Split by sector"
          value="cbx_spl_sector"
          onChange={splitCollapseEvent}
          checked={
            getSelectedSplitRbtnValueFromEnum(selectedSplit) ===
            "cbx_spl_sector"
          }
        />
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

export default BubbleChartSimType;
