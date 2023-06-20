import { ChartType } from "./pricingChartObj";

export type InitialValsMeta = {
  [key: string]: { initVal: any; cookieName: string };
};

export type CommonControlPanelCbxKeys =
  | "so"
  | "price"
  | "perf"
  | "scale"
  | "dw";

export type CommonControlPanelCbxMeta = {
  [K in CommonControlPanelCbxKeys]: {
    label: string;
    initVal: string;
    value: string;
  };
};

export type ControlPanelCbxKeys =
  | "rev"
  | "revp"
  | "fcf_rollsum"
  | "fcf_rollsum_perc"
  | "capex"
  | "nics_rollsum"
  | "nics_rollsum_perc"
  | "ebitda_rollsum"
  | "ebitda_rollsum_perc"
  | "bookval";
export type ControlPanelCbxVals = {
  [K in ControlPanelCbxKeys]?: string;
};

type ControlPanelMetaElement = {
  id: string;
  label: string;
};

export type ChartTypeMetaElement = {
  idx: number;
  id: ChartType;
  label: string;
  fpMetricName: string;
};

export type ChartTypeMeta = {
  idx: number;
  id: ChartType;
  label: string;
  fpMetricName: string;
  cPanelElements: { id: string; label: string }[];
};
