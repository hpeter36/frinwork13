import { BubbleData, EnumSubscription, BubbleDataJsonMeta } from "@/types";

export type LegendDataElement = {
  title: string;
  colorBodyHex: string;
  colorBorderHex: string;
};

export type LegendData = {
  title: string;
  data: LegendDataElement[];
};

type BubbleChartColors = {
  bgColor: string;
  collapsedColor: string;
  groupColors: string[];
};

interface BubbleChartInput {
  height: number;
  width: number;
  maxBubbleSize: number; // px
  defSelected_plan: EnumSubscription;
  colors: {
    light: BubbleChartColors;
    dark: BubbleChartColors;
  };
}

// na ide milyen inputokat?
export interface BubbleChartInputInterpType extends BubbleChartInput {}

export interface BubbleChartInputSimType extends BubbleChartInput {
  simulation: {
    chargeStrength: number;
    collapse: {
      useCharge: boolean; // valami enyhébb strength képlet?
      chargeForce: number;
      xForce: number;
      yForce: number;
      collideForce: number; // useCollide?
    };
    split: {
      useCharge: boolean;
      chargeForce: number;
      xForce: number;
      yForce: number;
      collideForce: number;
    };
  };
}

export type BubbleChartInputInterpTypeProps = {
  inputs: BubbleChartInputInterpType;
};

export type BubbleChartInputSimTypeProps = {
	inputs: BubbleChartInputSimType;
  };

export interface BubbleDataPacked extends BubbleData, d3.SimulationNodeDatum {
  r: number;
  x: number;
  x_exch?: number | undefined;
  x_sector?: number | undefined;
  y: number;
  y_exch?: number | undefined;
  y_sector?: number | undefined;
  xOrig?: number;
  yOrig?: number;
  color?: number[];
  color_exch?: number[];
  color_sector?: number[];
}

export interface MSIC_Props {
  startTime: number;
}

// -------------------- bubble general

export type BubbleGroupPosition = {
  x: number;
  y: number;
};

type BubbleSplittedLayoutElement = {
  name: string;
  split_color: string;
  position: BubbleGroupPosition; // x,y amit a packEnclose visszaad pont a közepe a körnek
  split_color_norm: number[];
  r: number;
};

export enum BubbleSplittedType {
  EXCHANGE,
  SECTOR,
}

export type BubbleSplittedLayout = {
  type: BubbleSplittedType;
  values: { [key: string]: BubbleSplittedLayoutElement };
};

export type BubbleDataBySplit = {
  [key: string]: {
    data: BubbleDataPacked[];
    enclosingCircle: d3.PackCircle | null;
  };
};

export type PackCircleWithGroupKey = {
  groupKey: string;
  x: number;
  y: number;
  r: number;
};

// ------------------------ anim simulation d3

export interface MS_Attributes {
  positionStart: number[][];
  startR: number[];
  index: number[];
  startColor: number[][];
}

export interface MS_Uniforms {
  stageWidth: number;
  stageHeight: number;
}

export interface MakeShaderProps {
  dataLength: number;
  positionStart: number[][];
  startR: number[];
  index: number[];
  startColor: number[][];
}

export type ForcePositionFunc = (d: BubbleDataPacked) => number;

type BubbleGroupColorInterpMeta = {
  groupId: string;
  interpFunc: (t: number) => string;
  actColor: number[] | undefined;
};

export type BubbleGroupColorInterpMetas = {
  [key: string]: BubbleGroupColorInterpMeta;
};

export type BubbleDatasSub = {
  meta: BubbleDataJsonMeta;
  data: BubbleDataPacked[];
  layoutMetaExch: BubbleSplittedLayout;
  layoutMetaSector: BubbleSplittedLayout;
};

export type BubbleDatas = {
  PREMIUM: BubbleDatasSub | undefined;
  BASIC: BubbleDatasSub | undefined;
  FREE: BubbleDatasSub | undefined;
};

export enum EnumSelectedSplit {
  COLLAPSED,
  SPLITTED_EXCH,
  SPLITTED_SECTOR,
}

// ------------------------Anim manager

export enum EnumAnimType {
  NONE,
  APPEARING_BUBBLES,
  DISAPPEARING_BUBBLES,
  COLLAPSING_BUBBLES,
  SPLITTED_EXCH_BUBBLES,
  SPLITTED_SECTOR_BUBBLES,
}

export interface CircleInterpData {
  index: number[] | undefined;
  positionStart: number[][]; // x,y
  startColor: number[][]; // normalized color
  startR: number[];
  positionEnd?: number[][]; // x,y
  endColor?: number[][];
  endR?: number[];
}

export type CircleInterpAnimData = {
  delayByIndex: number;
  duration: number; // ms
  isInterruptable: boolean;
  isEnding: boolean;
  circleData: CircleInterpData;
};

export type AnimationElement = {
  type: EnumAnimType;
  dataSource: EnumSubscription;
  animMetaData: CircleInterpAnimData | null;
};

export enum EnumAnimPropValueType {
  NONE,
  POS_CENTER,
  POS_ORIG,
  POS_SPLIT_EXCH,
  POS_SPLIT_SECTOR,
  R_ORIG,
  R_ZERO,
  COLOR_ORIG,
  COLOR_SPLIT_EXCH,
  COLOR_SPLIT_SECTOR,
}

export type AnimDefinition = {
  delayByIndex: number; // ms
  duration: number; // ms
  isInterruptable: boolean;
  isEnding: boolean;
  prevAnimType: EnumAnimType;
  nextAnimType: EnumAnimType;
  propMapping: AnimPropMapping | null;
};

type AnimPropMapping = {
  positionStart: EnumAnimPropValueType;
  positionEnd: EnumAnimPropValueType;
  startColor: EnumAnimPropValueType;
  endColor: EnumAnimPropValueType;
  startR: EnumAnimPropValueType;
  endR: EnumAnimPropValueType;
};

// -------------------- BubbleChartToolTip

export type BubbleChartToolTipData = {
  isCanvasMouseOver: boolean;
  position: { x: number; y: number };
  data: {
    name: string;
    symbol: string;
    exchange: string;
    sector: string;
    industry: string;
    m_cap: number;
    first_fin_fq_date: string;
    last_fin_fq_date: string;
    description: string;
    company_website: string;
  };
};

export type BubbleChartToolTipInputProps = {
  inputs: BubbleChartToolTipData | null;
};

export type BubbleChartLegendInputProps = {
  inputs: LegendData;
};
