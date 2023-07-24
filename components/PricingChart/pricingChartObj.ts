import * as d3 from "d3";
import { D3BrushEvent, BrushSelection } from "d3";
import { EnumApiResponseStatus } from "../../types";

type AxesBarCharts = {
  xAxisDef: d3.ScaleBand<Date> | null;
  yAxisDef: d3.ScaleLinear<number, number, never> | null;
  yAxisSvgDef: d3.Axis<d3.NumberValue> | null;
  yAxisSvgObj: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null;
};

export type InitVisInput = {
  chartType: ChartType;
  symbol: string;
  compName: string;
  updateComp: boolean;
};

type BarChartId =
  | "so_bar_chart"
  | "rev_bar_chart"
  | "rev_perc_bar_chart"
  | "fcf_rollsum_bar_chart"
  | "fcf_rollsum_perc_bar_chart"
  | "nics_rollsum_bar_chart"
  | "nics_rollsum_perc_bar_chart"
  | "ebitda_rollsum_bar_chart"
  | "ebitda_rollsum_perc_bar_chart"
  | "bookval_bar_chart";

export type ChartType =
  | "ct_pricing_sales"
  | "ct_pricing_fcf"
  | "ct_pricing_earnings"
  | "ct_pricing_ebitda"
  | "ct_pricing_bookval";

type SubChartType = "rev" | "fcf_rollsum" | "nics_rollsum" | "ebitda_rollsum";

export type FairPriceType = "fairp_type_historical" | "fairp_type_industrial";

type FairPriceEstimValues = {
  date: string[];
  fair_price: number[];
};

type FairPriceFqIndDataElement = {
  period_end_date: string[];
  comp_c: number[];
  fair_price: number[];
};

type FairPriceIndDataElement = {
  date: Date;
  comp_c: number | null;
  value: number;
};

type PriceHistoryData = {
  date: string[];
  s_adj_close: number[];
};

type FairPriceStats = {
  id: string;
  name: string;
  data_c: number;
  curr_val: number;
  avg: number;
  min: number;
  max: number;
};

type FairPriceHistoryPerf = {
  start_date: string;
  end_date: string;
  roi: number;
  cagr: number;
};

interface RequestCalcFairPriceFQFairPCommon {
  period_end_date: string[];
  sharesBasic: number[];
  fair_price: number[];
}

export type RequestCalcFairPriceError = {
  can_chart: boolean;
  msg: string;
};

export interface RequestCalcFairPriceCommon {
  can_chart: boolean;
  daily_fair_p_estim: FairPriceEstimValues;
  daily_fair_p_estim_ind: FairPriceEstimValues;
  fq_fair_p: RequestCalcFairPriceFQFairPCommon[];
  fq_fair_p_ind: FairPriceFqIndDataElement[];
  hds: PriceHistoryData;
  hist_perf: FairPriceHistoryPerf;
  stats: FairPriceStats;
}

type RequestCalcFairPriceSales = RequestCalcFairPriceCommon & {
  daily_pts: {
    // egységesíthető, mindnél ua. a struct
    date: string[];
    daily_pts: number[];
  };
  fq_fair_p: [
    RequestCalcFairPriceFQFairPCommon & {
      sales_rollsum: number[]; // ua. struct
      sales_rollsum_perc: number[];
    } // ua. struct
  ];
};

type RequestCalcFairPriceFcf = RequestCalcFairPriceCommon & {
  ratio_ptfcf: number; // unique
  daily_ptfcf: {
    date: string[];
    daily_ptfcf: number[];
  };
  fq_fair_p: [
    RequestCalcFairPriceFQFairPCommon & {
      fcf_rollsum: number[];
      fcf_rollsum_perc: number[];
      ncfo: number[]; // unique
      capex: number[]; // unique
    }
  ];
};

type RequestCalcFairPriceEarn = RequestCalcFairPriceCommon & {
  ratio_pte: number; // unique
  daily_pte: {
    date: string[];
    daily_pte: number[];
  };
  fq_fair_p: [
    RequestCalcFairPriceFQFairPCommon & {
      nics_rollsum: number[];
      nics_rollsum_perc: number[];
    }
  ];
};

type RequestCalcFairPriceEbitda = RequestCalcFairPriceCommon & {
  ratio_ptebitda: number; // unique
  daily_ev_to_ebitda: {
    date: string[];
    daily_ev_to_ebitda: number[];
  };
  fq_fair_p: [
    RequestCalcFairPriceFQFairPCommon & {
      ebitda_rollsum: number[];
      ebitda_rollsum_perc: number[];
    }
  ];
};

type RequestCalcFairPriceBookval = RequestCalcFairPriceCommon & {
  ratio_ptb: number; // unique
  daily_ptb: {
    date: string[];
    daily_ptb: number[];
  };
  fq_fair_p: [
    RequestCalcFairPriceFQFairPCommon & {
      bookVal: number[]; // unique
      // + nincs rollsum, perc
    }
  ];
};

type StandardDataStructDateElement = {
  date: Date;
  value: number;
};

type StandardDataStructPEDElement = {
  period_end_date: Date;
  value: number;
};

type HdsAreaDataElement = {
  x: Date;
  y0: number;
  y1: number;
};

type CompanyPricingChartStats = {
  name: string;
  data_full_min: number;
  data_full_max: number;
  data_full_avg: number;
  data_sel_min: number;
  data_sel_max: number;
  data_sel_avg: number;
  data_avg_count: number;
  data_curr_val: number;
  price_full_min: number;
  price_full_max: number;
  price_sel_min: number;
  price_sel_max: number;
  date_full_min: Date | null;
  date_full_max: Date | null;
  date_sel_min: Date | null;
  date_sel_max: Date | null;
  hist_perf: FairPriceHistoryPerf | null;
};

type CompanyPricingChartRecessionDatesElement =
  | {
      from: Date;
      to: Date;
      desc: string;
    }
  | undefined;

// ------------main input
export type CompanyPricingChartInputs = {
  holderClass: string;
  size: {
    width: number;
    height: number; // heightMainChart, gradient date filter?
    margins: {
      top: number;
      left: number;
      right: number;
      bottom: number;
    };
  };
  apperance: {
    mainChart: {
      title: {
        size: string;
        color: string;
      };
      loadingScreen: {
        colorBg: string;
      };
      errorMsg: {
        size: string;
        color: string;
      };
      revBars: {
        text: string;
        color: string;
      };
      revPercBars: {
        text: string;
        colorGrowth: string;
        colorLoss: string;
      };
      fcfRollSumBars: {
        text: string;
        colorGrowth: string;
        colorLoss: string;
      };
      fcfRollSumPercBars: {
        text: string;
        colorGrowth: string;
        colorLoss: string;
      };
      nicsRollSumBars: {
        text: string;
        colorGrowth: string;
        colorLoss: string;
      };
      nicsRollSumPercBars: {
        text: string;
        colorGrowth: string;
        colorLoss: string;
      };
      ebitdaRollSumBars: {
        text: string;
        colorGrowth: string;
        colorLoss: string;
      };
      ebitdaRollSumPercBars: {
        text: string;
        colorGrowth: string;
        colorLoss: string;
      };
      bookValBars: {
        text: string;
        colorGrowth: string;
        colorLoss: string;
      };
      fcfStackedBars: {
        colorNcfo: string;
        colorCapex: string;
        opacity: number;
      };
      soBars: {
        text: string;
        color: string;
      };
      fairPriceLine: {
        color: string;
      };
      recessionBars: {
        color: string;
        colorStroke: string;
        widthBarBorder: number;
        opacity: number;
      };
      tooltip: {
        colorCircle: string;
        sizeCircle: number;
        colorHelperLines: string;
        widthHelperLines: number;
        colorBg: string;
      };
      performance: {
        colorBg: string;
        colorLine: string;
        widthLine: number;
      };
    };
    gradientChart: {
      colorStart: string;
      colorMid: string;
      colorEnd: string;
      colorLine: string;
      widthLine: string;
      colorAvgLine: string;
      widthAvgLine: string;
      colorYLabel: string; // + label size
    };
    dateFilter: {
      colorArea: string;
      colorYLabel: string;
    };
  };
  state: {
    showRevBars: boolean;
    showRevPercBars: boolean;
    showFcfRollBars: boolean;
    showFcfRollPercBars: boolean;
    showFcfStackedBars: boolean;
    showNicsRollBars: boolean;
    showNicsRollPercBars: boolean;
    showEbitdaRollBars: boolean;
    showEbitdaRollPercBars: boolean;
    showBookvalBars: boolean;
    showSoBars: boolean;
    showPrices: boolean;
    isLogScale: boolean;
    showDw: boolean;
  };
};

// -------------------------------------------------
export default class CompanyPricingChart {
  private inputs_json: CompanyPricingChartInputs;

  // --------general
  private startDate: Date;
  private endDate: Date;
  private chart_start: Date | null = null;
  private chart_end: Date | null = null;
  private chartType: ChartType | null = null;
  private title_text: string = "";
  private fairp_type: FairPriceType;
  private ticker_name: string | null = null;

  private soData: StandardDataStructDateElement[] | null = null;
  private hds_filtered: StandardDataStructDateElement[] | null = null;
  private fair_prices_hist: FairPriceIndDataElement[] | null = null;
  private fair_prices_hist_curr: StandardDataStructDateElement[] | null = null;
  private fair_prices_ind: FairPriceIndDataElement[] | null = null;
  private fair_prices_ind_curr: StandardDataStructDateElement[] | null = null;

  // active selected fair price values
  private fair_prices: FairPriceIndDataElement[] | null = null;
  private fair_prices_curr: StandardDataStructDateElement[] | null = null;

  private revData: StandardDataStructDateElement[] | null = null;
  private revPercData: StandardDataStructDateElement[] | null = null;
  private fcf_rollsum_data: StandardDataStructDateElement[] | null = null;
  private fcf_rollsum_perc_data: StandardDataStructDateElement[] | null = null;
  private fcf_stacked_data_ncfo_data: StandardDataStructDateElement[] | null =
    null;
  private fcf_stacked_data_capex_data: StandardDataStructDateElement[] | null =
    null;
  private fcf_stacked_line_data: StandardDataStructDateElement[] | null = null;
  private nics_rollsum_data: StandardDataStructDateElement[] | null = null;
  private nics_rollsum_perc_data: StandardDataStructDateElement[] | null = null;
  private ebitda_rollsum_data: StandardDataStructDateElement[] | null = null;
  private ebitda_rollsum_perc_data: StandardDataStructDateElement[] | null =
    null;
  private bookValData: StandardDataStructDateElement[] | null = null;
  private hds_areas_data: HdsAreaDataElement[][] | null = null;
  private gauge_metric_filtered: StandardDataStructDateElement[] | null = null;

  private gradientChartHeight: number | null = null;
  private dateFilterHeight: number | null = null;

  private showed_rev_bars: boolean;
  private showed_rev_perc_bars: boolean;
  private showed_fcf_roll_bars: boolean;
  private showed_fcf_roll_perc_bars: boolean;
  private showed_fcf_stacked_chart: boolean;
  private showed_nics_roll_bars: boolean;
  private showed_nics_roll_perc_bars: boolean;
  private showed_ebitda_roll_bars: boolean;
  private showed_ebitda_roll_perc_bars: boolean;
  private showed_bookval_bars: boolean;
  private showed_so_bars: boolean;
  private showed_prices: boolean;
  private show_dw: boolean;
  private showed_dw: boolean;
  private is_init: boolean;

  private stats: CompanyPricingChartStats;
  private recessionDates: CompanyPricingChartRecessionDatesElement[];

  // --------helpers
  private lastFitFairP: number;
  private lastFqDateExceeded: boolean;

  private recessionDatesFiltered:
    | CompanyPricingChartRecessionDatesElement[]
    | null = null;

  // --------scales
  private gradientColorScale: d3.ScaleLinear<number, number, never> | null =
    null;
  private x_rec_bars: d3.ScaleTime<number, number, never> | null = null;
  private x_selection_gradient_chart: d3.ScaleTime<
    number,
    number,
    never
  > | null = null;
  private yGradientChart: d3.ScaleLinear<number, number, never> | null = null;
  private xDateFilter: d3.ScaleTime<number, number, never> | null = null;
  private yDateFilter: d3.ScaleLinear<number, number, never> | null = null;
  private x_axis_def_fcf_stacked_ncfo: d3.ScaleBand<Date> | null = null;
  private x_axis_def_fcf_stacked_capex: d3.ScaleBand<Date> | null = null;
  private y_axis_def_fcf_stacked: d3.ScaleLinear<number, number, never> | null =
    null;
  private x: d3.ScaleTime<number, number, never> | null = null;
  private y:
    | d3.ScaleLinear<number, number, never>
    | d3.ScaleLogarithmic<number, number, never>
    | null = null;

  // d3 objects
  private line_obj_gradient_chart: d3.Line<StandardDataStructDateElement> | null =
    null;
  private dateFilterarea: d3.Area<StandardDataStructDateElement> | null = null;
  private brush: d3.BrushBehavior<unknown> | null = null;
  private line_def_fcf_stacked: d3.Line<StandardDataStructDateElement> | null =
    null;
  private line_fair_p: d3.Line<StandardDataStructDateElement> | null = null;
  private line_hds: d3.Line<StandardDataStructDateElement> | null = null;
  private hdsArea_green: d3.Area<HdsAreaDataElement> | null = null;
  private hdsArea_red: d3.Area<HdsAreaDataElement> | null = null;

  // d3 axes
  private xAxisCallGradientChart: d3.Axis<Date | d3.NumberValue> | null = null;
  private yAxisCallGradientChart: d3.Axis<d3.NumberValue> | null = null;
  private xAxisCallDateFilter: d3.Axis<Date | d3.NumberValue> | null = null;
  private yAxisCallDateFilter: d3.Axis<d3.NumberValue> | null = null;
  private y_axis_svg_def_fcf_stacked: d3.Axis<d3.NumberValue> | null = null;
  private xAxisCall: d3.Axis<Date | d3.NumberValue> | null = null;
  private yAxisCall: d3.Axis<d3.NumberValue> | null = null;

  // bar chart axes
  private axes_so_chart: AxesBarCharts | null = null;
  private axes_rev_chart: AxesBarCharts | null = null;
  private axes_rev_perc_chart: AxesBarCharts | null = null;
  private axes_fcf_rollsum_chart: AxesBarCharts | null = null;
  private axes_fcf_rollsum_perc_chart: AxesBarCharts | null = null;
  private axes_nics_rollsum_chart: AxesBarCharts | null = null;
  private axes_nics_rollsum_perc_chart: AxesBarCharts | null = null;
  private axes_ebitda_rollsum_chart: AxesBarCharts | null = null;
  private axes_ebitda_rollsum_perc_chart: AxesBarCharts | null = null;
  private axes_bookval_chart: AxesBarCharts | null = null;

  // --------nodes
  private mainChartSvgNode: d3.Selection<
    SVGSVGElement,
    unknown,
    HTMLElement,
    any
  >;
  private g: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private g_loading: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

  private loading_info_text: d3.Selection<SVGTextElement, unknown, HTMLElement, any> | null = null;

  private tooltip_dw: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private dw_text: d3.Selection<
    SVGTextElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private rect_perf_svg: d3.Selection<
    SVGRectElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private line_perf_svg: d3.Selection<
    SVGLineElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private line_perf_helper_svg: d3.Selection<
    SVGLineElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private html_tooltip_cont: d3.Selection<
    HTMLDivElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private label_lastp: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private label_fairp: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private tooltip_rec: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private tooltip: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null =
    null;
  private tooltip_bars: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;

  private svgGradientChart: d3.Selection<
    SVGSVGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private gradientChartBg: d3.Selection<
    SVGLinearGradientElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private title: d3.Selection<
    SVGTextElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private error_msg_svg: d3.Selection<
    SVGTextElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private rec_bars_svg: d3.Transition<
    d3.BaseType | SVGRectElement,
    CompanyPricingChartRecessionDatesElement,
    d3.BaseType,
    unknown
  > | null = null;
  private gradientChartAvgLineSvg: d3.Selection<
    SVGLineElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private gradientChartLineSvg: d3.Selection<
    SVGPathElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private xAxisGradientChart: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private yAxisGradientChart: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private tooltip_df: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private svgDateFilter: d3.Selection<
  SVGSVGElement,
  unknown,
  HTMLElement,
  any
> | null = null;
  private xAxisDateFilter: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private yAxisDateFilter: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private areaPath: d3.Selection<
    SVGPathElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private brushComponent: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private y_axis_svg_obj_fcf_stacked: d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private xAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null =
    null;
  private yAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null =
    null;
  private fairp_hds_line: d3.Selection<
    SVGPathElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private line_fairp_curr: d3.Selection<
    SVGPathElement,
    unknown,
    HTMLElement,
    any
  > | null = null;
  private line_hds_svg: d3.Selection<
    SVGPathElement,
    StandardDataStructDateElement[],
    HTMLElement,
    any
  > | null = null;
  private line_svg_obj_fcf_stacked: d3.Selection<
    SVGPathElement,
    StandardDataStructDateElement[],
    HTMLElement,
    any
  > | null = null;
  private circles_svg_obj_fcf_stacked: d3.Selection<
    d3.BaseType | SVGCircleElement,
    StandardDataStructDateElement,
    d3.BaseType,
    unknown
  > | null = null;
  private fairp_curr_circle: d3.Selection<
    SVGCircleElement,
    StandardDataStructDateElement,
    d3.BaseType,
    unknown
  > | null = null;

  private dateFilterChartNode: d3.Selection<
    HTMLDivElement,
    unknown,
    HTMLElement,
    any
  > | null = null;

  private path_chart_loader = 'assets/pricingChart/chart_loader.svg';

  // ctor
  constructor(inputs_json: CompanyPricingChartInputs) {
    this.inputs_json = inputs_json;

    // vars
    this.fairp_type = "fairp_type_historical";
    this.showed_rev_bars = this.inputs_json.state.showRevBars;
    this.showed_rev_perc_bars = this.inputs_json.state.showRevPercBars;
    this.showed_fcf_roll_bars = this.inputs_json.state.showFcfRollBars;
    this.showed_fcf_roll_perc_bars = this.inputs_json.state.showFcfRollPercBars;
    this.showed_fcf_stacked_chart = this.inputs_json.state.showFcfStackedBars;
    this.showed_nics_roll_bars = this.inputs_json.state.showNicsRollBars;
    this.showed_nics_roll_perc_bars =
      this.inputs_json.state.showNicsRollPercBars;
    this.showed_ebitda_roll_bars = this.inputs_json.state.showEbitdaRollBars;
    this.showed_ebitda_roll_perc_bars =
      this.inputs_json.state.showEbitdaRollPercBars;
    this.showed_bookval_bars = this.inputs_json.state.showBookvalBars;
    this.showed_so_bars = this.inputs_json.state.showSoBars;
    this.showed_prices = this.inputs_json.state.showPrices;
    this.show_dw = this.inputs_json.state.showDw;
    this.showed_dw = this.show_dw;
    this.is_init = true;

    this.stats = {
      name: "",
      data_full_min: 0,
      data_full_max: 0,
      data_full_avg: 0,
      data_sel_min: 0,
      data_sel_max: 0,
      data_sel_avg: 0,
      data_avg_count: 0,
      data_curr_val: 0,
      price_full_min: 0,
      price_full_max: 0,
      price_sel_min: 0,
      price_sel_max: 0,
      date_full_min: null,
      date_full_max: null,
      date_sel_min: null,
      date_sel_max: null,
      hist_perf: null,
    };

    this.recessionDates = [
      {
        from: new Date("1980-01-01"),
        to: new Date("1980-07-01"),
        desc: "Energy crisis recession",
      },
      {
        from: new Date("1981-07-01"),
        to: new Date("1982-11-01"),
        desc: "Iran/energy crisis recession",
      },
      {
        from: new Date("1990-07-01"),
        to: new Date("1991-03-01"),
        desc: "Oil price shock",
      },
      {
        from: new Date("2001-03-01"),
        to: new Date("2001-11-01"),
        desc: "Dot-com bubble",
      },
      {
        from: new Date("2007-12-01"),
        to: new Date("2009-06-01"),
        desc: "Great Recession",
      },
      {
        from: new Date("2020-02-01"),
        to: new Date("2020-04-01"),
        desc: "COVID-19 recession",
      },
    ];

    this.startDate = new Date("1970-01-01");
    this.endDate = new Date(); // current date
    this.lastFitFairP = 0;
    this.lastFqDateExceeded = true;

    // create basic structure
    // main svg
    this.mainChartSvgNode = d3
      .select(`.${this.inputs_json.holderClass}`)
      .append("div")
      .attr("class", "company-pricing-chart")
      .append("svg");

    // gradient svg node
    const gradientChartNode = d3
      .select(`.${this.inputs_json.holderClass}`)
      .append("div")
      .attr("class", "company-pricing-chart-gradient-chart");

    // date filter svg node
    this.dateFilterChartNode = d3
      .select(`.${this.inputs_json.holderClass}`)
      .append("div")
      .attr("class", "company-pricing-chart-date-filter");

    // size of svg
    const svgWidth =
      this.inputs_json.size.width +
      this.inputs_json.size.margins.left +
      this.inputs_json.size.margins.right;
    const svgHeight =
      this.inputs_json.size.height +
      this.inputs_json.size.margins.top +
      this.inputs_json.size.margins.bottom;

    // set main svg
    this.mainChartSvgNode
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
      .attr("id", "pricing-chart-svg");

    // create main g node
    this.g = this.mainChartSvgNode
      .append("g")
      .attr("id", "g_pc_main")
      .attr(
        "transform",
        `translate(${this.inputs_json.size.margins.left}, ${this.inputs_json.size.margins.top})`
      );

    // add rect to catch mouse move events
    this._initDataWindowHelperRect();

    // element groups g-s
    // rec bars g-s
    this.g.append("g").attr("id", "g_rec_bars");

    // g_[chart_name]
    // bar chart g-s
    this.g.append("g").attr("id", "g_rev_bar_chart");
    this.g.append("g").attr("id", "g_rev_perc_bar_chart");
    this.g.append("g").attr("id", "g_so_bar_chart");
    this.g.append("g").attr("id", "g_fcf_rollsum_bar_chart");
    this.g.append("g").attr("id", "g_fcf_rollsum_perc_bar_chart");
    this.g.append("g").attr("id", "g_fcf_stacked_chart");
    this.g.append("g").attr("id", "g_fcf_stacked_chart_circles");
    this.g.append("g").attr("id", "g_nics_rollsum_bar_chart");
    this.g.append("g").attr("id", "g_nics_rollsum_perc_bar_chart");
    this.g.append("g").attr("id", "g_ebitda_rollsum_bar_chart");
    this.g.append("g").attr("id", "g_ebitda_rollsum_perc_bar_chart");
    this.g.append("g").attr("id", "g_bookval_bar_chart");

    // price g-s
    this.g.append("g").attr("id", "g_hds_helper");
    this.g.append("g").attr("id", "g_hds_areas");
    this.g.append("g").attr("id", "g_fairp_line");
    this.g.append("g").attr("id", "g_fairp_helper");
    this.g.append("g").attr("id", "g_fairp_circles");

    // performance g
    this.g.append("g").attr("id", "g_perf");

    // loading screen g-s
    this.g_loading = this.g.append("g").attr("id", "g_loading");

    // init performance chart
    this._init_performance_subchart();

    // init html tooltip
    this._init_html_tooltip();

    // add last price labels to chart
    this._initLastPriceLabels();

    // tooltip recession
    this._initRecessionTooltip();

    // tooltip history data
    this._initHdsTooltip();

    // bars tooltip
    this._initBarsTooltip();

    // tooltips text background filter
    let filterDef = this.mainChartSvgNode.append("defs");
    let filter = filterDef
      .append("filter")
      .attr("id", "textBackground")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 1)
      .attr("height", 1);
    filter
      .append("feFlood")
      .attr("flood-color", this.inputs_json.apperance.mainChart.tooltip.colorBg)
      .attr("result", "txtBackground");
    let filterMerge = filter.append("feMerge");
    filterMerge.append("feMergeNode").attr("in", "txtBackground");
    filterMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // date filter gradient
    this.gradientColorScale = d3
      .scaleLinear()
      .range([
        this.inputs_json.apperance.gradientChart.colorStart,
        this.inputs_json.apperance.gradientChart.colorMid,
        this.inputs_json.apperance.gradientChart.colorEnd,
      ] as Iterable<number>); // !!!

    this.gradientChartBg = filterDef
      .append("linearGradient")
      .attr("id", "gradientChartBg")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    // prepare chart title
    this.title = this.g
      .append("text")
      .attr("id", "pricing-chart-title")
      .attr("x", this.inputs_json.size.width / 2)
      .attr("y", -20)
      .attr("font-size", this.inputs_json.apperance.mainChart.title.size)
      .attr("fill", this.inputs_json.apperance.mainChart.title.color)
      .attr("text-anchor", "middle")
      .text("");

    // prepare error text
    this.error_msg_svg = this.g
      .append("text")
      .attr("id", "pricing-chart-error-msg")
      .attr("x", this.inputs_json.size.width / 2)
      .attr("y", this.inputs_json.size.height / 2)
      .attr("font-size", this.inputs_json.apperance.mainChart.errorMsg.size)
      .attr("fill", this.inputs_json.apperance.mainChart.errorMsg.color)
      .attr("text-anchor", "middle")
      .text("");

    // init gradient chart
    this._init_gradient_chart();

    // init datefilter
    this._init_date_filter();
  }

  public InitVis(inputs: InitVisInput) {
    let self = this;
    self.chartType = inputs.chartType;

    self.startDate = new Date("1970-01-01");
    self.endDate = new Date();

    self._visualize(true, self.chartType, inputs.updateComp, inputs);
  }

  private async _visualize(
    is_init: boolean,
    chart_type: ChartType,
    updateComp: boolean,
    init_inputs: InitVisInput | null = null
  ) {
    let self = this;

    if (is_init) {

      // clear the whole chart
      self._clearChart();
      self._clearGradientChart();
      self._hideElement(self.svgGradientChart!);
      self._clearDateFilter();
      self._hideElement(self.svgDateFilter!);

      // init loading screen
      self._init_loading_screen();

      // set chart title
      self.ticker_name = init_inputs!.symbol;
      self.title_text = `${init_inputs!.compName}(${
        self.ticker_name
      }) pricing (${init_inputs!.chartType}) chart`;
      d3.select("#pricing-chart-title").text(self.title_text);

      self._initDataWindowTooltip();

      self._clearDateFilterFilterGui();

      self._initRecessionBars();

      self.axes_so_chart = {
        xAxisDef: null,
        yAxisDef: null,
        yAxisSvgDef: null,
        yAxisSvgObj: null,
      };

      self._init_bar_chart(
        "so_bar_chart",
        self.axes_so_chart,
        self.inputs_json.apperance.mainChart.soBars.text,
        self._formatNumber
      );

      self._initChartSpecificSubCharts(chart_type);

      self._init_hds_xy_axis(self.inputs_json.state.isLogScale);
      self._init_fairp_lines();
      self._init_hds_lines();
      self._init_hds_area_chart();
    }

    // set loading state
    self._show_loading_screen();

    // !!!!!!!test
    //self.startDate = new Date('2020-01-19')
    //self.endDate = new Date('2023-01-20')

    let endDate = new Date(self.endDate);
    endDate.setDate(endDate.getDate() + 1);

    //  update company 
    let url = `/api/updateComp?symbol=${self.ticker_name}`
    if(updateComp)
    {
      self.loading_info_text!.text("Update company data...");
      await fetch(url);
    }

    // data request url
    let ct_arr = chart_type.split("_");
    let ct = ct_arr[ct_arr.length - 1];
    url = `/api/calcFairP?fairp_type=${ct}&ticker=${
      self.ticker_name
    }&start_date=${self.startDate.toISOString().split("T")[0]}&end_date=${
      endDate.toISOString().split("T")[0]
    }`;

    // get data
    self.loading_info_text!.text("Getting company data...");
    fetch(url)
      .then((resp) => resp.json())
      .then(
        (req_data: {
          data: RequestCalcFairPriceCommon | RequestCalcFairPriceError;
          status: EnumApiResponseStatus;
        }) => {

          // can be charted?
          if (req_data.data.can_chart) {
            self._hideErrorMessage();
          }
          // cannot be charted
          else {
            self._hide_loading_screen();
            self._hideAllElements();
            self._showErrorMessage(
              (req_data.data as RequestCalcFairPriceError).msg
            );
            return;
          }

          const data = req_data.data as RequestCalcFairPriceCommon;

          // data prepare
          self.chart_start = new Date(data.fq_fair_p[0].period_end_date[0]);
          self.chart_end = new Date(data.hds.date[data.hds.date.length - 1]);

          if (is_init) {
            self.stats.name = data.stats.name;
            self.stats.date_full_min = self.chart_start;
            self.stats.date_full_max = self.chart_end;
            self.stats.data_full_avg = data.stats.avg;
            self.stats.data_full_min = data.stats.min;
            self.stats.data_full_max = data.stats.max;
          }
          self.stats.date_sel_min = self.chart_start;
          self.stats.date_sel_max = self.chart_end;
          self.stats.data_avg_count = data.stats.data_c;
          self.stats.data_sel_avg = data.stats.avg;
          self.stats.data_sel_min = data.stats.min;
          self.stats.data_sel_max = data.stats.max;
          self.stats.data_curr_val = data.stats.curr_val;
          self.stats.hist_perf = data.hist_perf;

          // convert data
          self.soData = data.fq_fair_p[0].period_end_date.map((d, i) => {
            return {
              date: new Date(d),
              value: data.fq_fair_p[0].sharesBasic[i],
            };
          });

          self.hds_filtered = data.hds.date.map((d, i) => {
            return {
              date: new Date(d),
              value: data.hds.s_adj_close[i],
            };
          });

          self.fair_prices_hist = data.fq_fair_p[0].period_end_date.map(
            (d, i) => {
              return {
                date: new Date(d),
                value: data.fq_fair_p[0].fair_price[i],
                comp_c: null,
              };
            }
          );

          self.fair_prices_hist_curr = data.daily_fair_p_estim.date.map(
            (d, i) => {
              return {
                date: new Date(d),
                value: data.daily_fair_p_estim.fair_price[i],
              };
            }
          );

          self.fair_prices_ind = [];
          if (data.fq_fair_p_ind[0].period_end_date.length > 0) {
            self.fair_prices_ind = data.fq_fair_p_ind[0].period_end_date.map(
              (d, i) => {
                return {
                  date: new Date(d),
                  value: data.fq_fair_p_ind[0].fair_price[i],
                  comp_c: data.fq_fair_p_ind[0].comp_c[i],
                };
              }
            );
          }

          self.fair_prices_ind_curr = [];
          if (data.daily_fair_p_estim_ind.date.length > 0) {
            self.fair_prices_ind_curr = data.daily_fair_p_estim_ind.date.map(
              (d, i) => {
                return {
                  date: new Date(d),
                  value: data.daily_fair_p_estim_ind.fair_price[i],
                };
              }
            );
          }

          // set fair price data source
          if (self.fair_prices_ind.length == 0)
            self.fairp_type = "fairp_type_historical";
          self._get_fair_price_data_source(self.fairp_type);

          self._getChartSpecificData(chart_type, data);

          // get last estimated fair price
          data.daily_fair_p_estim.date.length > 0
            ? (self.lastFitFairP =
                self.fair_prices_curr![self.fair_prices_curr!.length - 1].value)
            : (self.lastFitFairP = 0);

          // get min max chart y prices
          let min_max_p_arr = self._getMinMaxPrices(
            self.hds_filtered,
            self.fair_prices!,
            self.fair_prices_curr!
          );

          self.stats.price_sel_min = min_max_p_arr[0]!;
          self.stats.price_sel_max = min_max_p_arr[1]!;

          // show debug info
          self._updateDebugConsole(data.stats.id);

          // draw recession bars
          self._filterRecessionDates(self.chart_start, self.chart_end);
          self._updateRecessionBars();

          // draw so bars
          self._update_bar_chart(
            "so_bar_chart",
            self.soData,
            self.axes_so_chart!,
            self.inputs_json.apperance.mainChart.soBars.color,
            "#ffb1c1", // !!! külön grow, loss colorok
            self.showed_so_bars,
            self.inputs_json.apperance.mainChart.soBars.text,
            self._formatNumber
          );

          // draw charts
          // [chart_start, chart_end] ???
          // d3.extent(self.hds_filtered, (d) => d.date)
          self._update_hds_lines(
            self.chart_start,
            self.chart_end,
            min_max_p_arr[0]!,
            min_max_p_arr[1]!
          );

          // draw unique charts for specific chart type
          self._updateChartSpecificSubCharts(chart_type);

          self._update_fair_price_and_hds_areas();

          self._update_performance_subchart();

          // init date filter box
          if (is_init) {
            self._update_date_filter();
          }
          self._update_gradient_chart();

          // remove loading screen
          self._hide_loading_screen();

          // load gauge chart
          //if (is_init) {
          //self.compPricingGaugeChart.initVis();
          //self.compPricingGaugeChart.generateTicks(
          //  self.stats.data_full_min,
          //  self.stats.data_full_max
          //);
          //}
          //self.compPricingGaugeChart.SetChart(self.stats, self.stats.name);
        }
      )
      .catch((e) => {
        self._hide_loading_screen();
        self._hideAllElements();

        // get & show error message
        let errorMsg = "unknown error";
        if (typeof e === "string") errorMsg = e;
        if (e instanceof Error) {
          errorMsg = e.message;
          console.log(e.stack);
        }
        self._showErrorMessage(errorMsg);
        console.log(errorMsg); // !!!
      });
  }

  private _get_fair_price_data_source(fairp_type: FairPriceType) {
    let self = this;

    self.fairp_type = fairp_type;

    if (self.fairp_type == "fairp_type_historical") {
      self.fair_prices = self.fair_prices_hist;
      self.fair_prices_curr = self.fair_prices_hist_curr;
    } else {
      self.fair_prices = self.fair_prices_ind;
      self.fair_prices_curr = self.fair_prices_ind_curr;
    }
  }

  private _getChartSpecificData(
    chart_type: ChartType,
    data: any // !!!
  ) {
    let self = this;

    switch (chart_type) {
      // sales chart data
      case "ct_pricing_sales":
        const data_act_sales = data as RequestCalcFairPriceSales;

        self.revData = data_act_sales.fq_fair_p[0].period_end_date.map(
          (d, i) => {
            return {
              date: new Date(d),
              value: data_act_sales.fq_fair_p[0].sales_rollsum[i],
            };
          }
        );

        self.revPercData = data_act_sales.fq_fair_p[0].period_end_date.map(
          (d, i) => {
            return {
              date: new Date(d),
              value: data_act_sales.fq_fair_p[0].sales_rollsum_perc[i],
            };
          }
        );

        // data for gradient chart
        self.gauge_metric_filtered = data_act_sales.daily_pts.date.map(
          (d, i) => {
            return {
              date: new Date(d),
              value: data_act_sales.daily_pts.daily_pts[i],
            };
          }
        );

        break;

      // fcf chart data
      case "ct_pricing_fcf":
        const data_act_fcf = data as RequestCalcFairPriceFcf;

        self.fcf_rollsum_data = data_act_fcf.fq_fair_p[0].period_end_date.map(
          (d, i) => {
            return {
              date: new Date(d),
              value: data_act_fcf.fq_fair_p[0].fcf_rollsum[i],
            };
          }
        );

        self.fcf_rollsum_perc_data =
          data_act_fcf.fq_fair_p[0].period_end_date.map((d, i) => {
            return {
              date: new Date(d),
              value: data_act_fcf.fq_fair_p[0].fcf_rollsum_perc[i],
            };
          });

        // fcf ncfo - capex chart data
        self.fcf_stacked_data_ncfo_data =
          data_act_fcf.fq_fair_p[0].period_end_date.map((d, i) => {
            return {
              date: new Date(d),
              value: data_act_fcf.fq_fair_p[0].ncfo[i],
            };
          });

        self.fcf_stacked_data_capex_data =
          data_act_fcf.fq_fair_p[0].period_end_date.map((d, i) => {
            return {
              date: new Date(d),
              value: data_act_fcf.fq_fair_p[0].capex[i],
            };
          });

        self.fcf_stacked_line_data =
          data_act_fcf.fq_fair_p[0].period_end_date.map((d, i) => {
            return {
              date: new Date(d),
              value:
                data_act_fcf.fq_fair_p[0].ncfo[i] +
                data_act_fcf.fq_fair_p[0].capex[i],
            };
          });



        // data for gradient chart
        self.gauge_metric_filtered = data_act_fcf.daily_ptfcf.date.map(
          (d, i) => {
            return {
              date: new Date(d),
              value: data_act_fcf.daily_ptfcf.daily_ptfcf[i],
            };
          }
        );
        break;

      // earnings chart data
      case "ct_pricing_earnings":
        const data_act_earn = data as RequestCalcFairPriceEarn;

        self.nics_rollsum_data = data_act_earn.fq_fair_p[0].period_end_date.map(
          (d, i) => {
            return {
              date: new Date(d),
              value: data_act_earn.fq_fair_p[0].nics_rollsum[i],
            };
          }
        );

        self.nics_rollsum_perc_data =
          data_act_earn.fq_fair_p[0].period_end_date.map((d, i) => {
            return {
              date: new Date(d),
              value: data_act_earn.fq_fair_p[0].nics_rollsum_perc[i],
            };
          });

        // data for gradient chart
        self.gauge_metric_filtered = data_act_earn.daily_pte.date.map(
          (d, i) => {
            return {
              date: new Date(d),
              value: data_act_earn.daily_pte.daily_pte[i],
            };
          }
        );
        break;

      // ebitda chart data
      case "ct_pricing_ebitda":
        const data_act_ebitda = data as RequestCalcFairPriceEbitda;

        self.ebitda_rollsum_data =
          data_act_ebitda.fq_fair_p[0].period_end_date.map((d, i) => {
            return {
              date: new Date(d),
              value: data_act_ebitda.fq_fair_p[0].ebitda_rollsum[i],
            };
          });

        self.ebitda_rollsum_perc_data =
          data_act_ebitda.fq_fair_p[0].period_end_date.map((d, i) => {
            return {
              date: new Date(d),
              value: data_act_ebitda.fq_fair_p[0].ebitda_rollsum_perc[i],
            };
          });

        // data for gradient chart
        self.gauge_metric_filtered =
          data_act_ebitda.daily_ev_to_ebitda.date.map((d, i) => {
            return {
              date: new Date(d),
              value: data_act_ebitda.daily_ev_to_ebitda.daily_ev_to_ebitda[i],
            };
          });
        break;

      // bookval chart data
      case "ct_pricing_bookval":
        const data_act_bookval = data as RequestCalcFairPriceBookval;

        self.bookValData = data_act_bookval.fq_fair_p[0].period_end_date.map(
          (d, i) => {
            return {
              date: new Date(d),
              value: data_act_bookval.fq_fair_p[0].bookVal[i],
            };
          }
        );

        // data for gradient chart
        self.gauge_metric_filtered = data_act_bookval.daily_ptb.date.map(
          (d, i) => {
            return {
              date: new Date(d),
              value: data_act_bookval.daily_ptb.daily_ptb[i],
            };
          }
        );
        break;
      default:
        break;
    }
  }

  private _initChartSpecificSubCharts(chart_type: ChartType) {
    let self = this;

    switch (chart_type) {
      case "ct_pricing_sales":
        // init rev bar chart
        self.axes_rev_chart = {
          xAxisDef: null,
          yAxisDef: null,
          yAxisSvgDef: null,
          yAxisSvgObj: null,
        };

        self._init_bar_chart(
          "rev_bar_chart",
          self.axes_rev_chart,
          self.inputs_json.apperance.mainChart.revBars.text,
          self._formatNumber
        );

        // init rev perc bar chart
        self.axes_rev_perc_chart = {
          xAxisDef: null,
          yAxisDef: null,
          yAxisSvgDef: null,
          yAxisSvgObj: null,
        };

        self._init_bar_chart(
          "rev_perc_bar_chart",
          self.axes_rev_perc_chart,
          self.inputs_json.apperance.mainChart.revPercBars.text,
          self._formatNumberPerc
        );
        break;

      case "ct_pricing_fcf":
        // init fcf_rollsum bar chart
        self.axes_fcf_rollsum_chart = {
          xAxisDef: null,
          yAxisDef: null,
          yAxisSvgDef: null,
          yAxisSvgObj: null,
        };

        self._init_bar_chart(
          "fcf_rollsum_bar_chart",
          self.axes_fcf_rollsum_chart,
          self.inputs_json.apperance.mainChart.fcfRollSumBars.text,
          self._formatNumber
        );

        // init fcf_rollsum_perc bar chart
        self.axes_fcf_rollsum_perc_chart = {
          xAxisDef: null,
          yAxisDef: null,
          yAxisSvgDef: null,
          yAxisSvgObj: null,
        };

        self._init_bar_chart(
          "fcf_rollsum_perc_bar_chart",
          self.axes_fcf_rollsum_perc_chart,
          self.inputs_json.apperance.mainChart.fcfRollSumPercBars.text,
          self._formatNumberPerc
        );

        // init fcf ncfo - capex chart
        self._init_fcf_stacked_chart();

        break;

      case "ct_pricing_earnings":
        // init nics_rollsum bar chart
        self.axes_nics_rollsum_chart = {
          xAxisDef: null,
          yAxisDef: null,
          yAxisSvgDef: null,
          yAxisSvgObj: null,
        };

        self._init_bar_chart(
          "nics_rollsum_bar_chart",
          self.axes_nics_rollsum_chart,
          self.inputs_json.apperance.mainChart.nicsRollSumBars.text,
          self._formatNumber
        );

        // init nics_rollsum_perc bar chart
        self.axes_nics_rollsum_perc_chart = {
          xAxisDef: null,
          yAxisDef: null,
          yAxisSvgDef: null,
          yAxisSvgObj: null,
        };

        self._init_bar_chart(
          "nics_rollsum_perc_bar_chart",
          self.axes_nics_rollsum_perc_chart,
          self.inputs_json.apperance.mainChart.nicsRollSumPercBars.text,
          self._formatNumberPerc
        );

        break;

      case "ct_pricing_ebitda":
        // init ebitda_rollsum bar chart
        self.axes_ebitda_rollsum_chart = {
          xAxisDef: null,
          yAxisDef: null,
          yAxisSvgDef: null,
          yAxisSvgObj: null,
        };

        self._init_bar_chart(
          "ebitda_rollsum_bar_chart",
          self.axes_ebitda_rollsum_chart,
          self.inputs_json.apperance.mainChart.ebitdaRollSumBars.text,
          self._formatNumber
        );

        // init ebitda_rollsum_perc bar chart
        self.axes_ebitda_rollsum_perc_chart = {
          xAxisDef: null,
          yAxisDef: null,
          yAxisSvgDef: null,
          yAxisSvgObj: null,
        };

        self._init_bar_chart(
          "ebitda_rollsum_perc_bar_chart",
          self.axes_ebitda_rollsum_perc_chart,
          self.inputs_json.apperance.mainChart.ebitdaRollSumPercBars.text,
          self._formatNumberPerc
        );
        break;

      case "ct_pricing_bookval":
        // init bookVal bar chart
        self.axes_bookval_chart = {
          xAxisDef: null,
          yAxisDef: null,
          yAxisSvgDef: null,
          yAxisSvgObj: null,
        };

        self._init_bar_chart(
          "bookval_bar_chart",
          self.axes_bookval_chart,
          self.inputs_json.apperance.mainChart.bookValBars.text,
          self._formatNumber
        );
        break;
      default:
        break;
    }
  }

  private _updateChartSpecificSubCharts(chart_type: ChartType) {
    let self = this;

    switch (chart_type) {
      case "ct_pricing_sales":
        // draw rev bars
        self._update_bar_chart(
          "rev_bar_chart",
          self.revData!,
          self.axes_rev_chart!,
          self.inputs_json.apperance.mainChart.revBars.color,
          "#ffb1c1", // !!!
          self.showed_rev_bars && !self.showed_rev_perc_bars,
          self.inputs_json.apperance.mainChart.revBars.text,
          self._formatNumber
        );

        // draw rev perc bars
        self._update_bar_chart(
          "rev_perc_bar_chart",
          self.revPercData!,
          self.axes_rev_perc_chart!,
          self.inputs_json.apperance.mainChart.revPercBars.colorGrowth,
          self.inputs_json.apperance.mainChart.revPercBars.colorLoss,
          self.showed_rev_bars && self.showed_rev_perc_bars,
          self.inputs_json.apperance.mainChart.revPercBars.text,
          self._formatNumberPerc
        );

        break;
      case "ct_pricing_fcf":
        // draw fcf_rollsum bar chart
        self._update_bar_chart(
          "fcf_rollsum_bar_chart",
          self.fcf_rollsum_data!,
          self.axes_fcf_rollsum_chart!,
          self.inputs_json.apperance.mainChart.fcfRollSumBars.colorGrowth,
          self.inputs_json.apperance.mainChart.fcfRollSumBars.colorLoss,
          self.showed_fcf_roll_bars && !self.showed_fcf_roll_perc_bars,
          self.inputs_json.apperance.mainChart.fcfRollSumBars.text,
          self._formatNumber
        );

        // draw fcf_rollsum_perc bar chart
        self._update_bar_chart(
          "fcf_rollsum_perc_bar_chart",
          self.fcf_rollsum_perc_data!,
          self.axes_fcf_rollsum_perc_chart!,
          self.inputs_json.apperance.mainChart.fcfRollSumPercBars.colorGrowth,
          self.inputs_json.apperance.mainChart.fcfRollSumPercBars.colorLoss,
          self.showed_fcf_roll_bars && self.showed_fcf_roll_perc_bars,
          self.inputs_json.apperance.mainChart.fcfRollSumPercBars.text,
          self._formatNumberPerc
        );

        // draw fcf ncfo - capex chart
        self._update_fcf_stacked_chart();
        break;

      case "ct_pricing_earnings":
        // draw nics_rollsum bar chart
        self._update_bar_chart(
          "nics_rollsum_bar_chart",
          self.nics_rollsum_data!,
          self.axes_nics_rollsum_chart!,
          self.inputs_json.apperance.mainChart.nicsRollSumBars.colorGrowth,
          self.inputs_json.apperance.mainChart.nicsRollSumBars.colorLoss,
          self.showed_nics_roll_bars && !self.showed_nics_roll_perc_bars,
          self.inputs_json.apperance.mainChart.nicsRollSumBars.text,
          self._formatNumber
        );

        // draw nics_rollsum_perc bar chart
        self._update_bar_chart(
          "nics_rollsum_perc_bar_chart",
          self.nics_rollsum_perc_data!,
          self.axes_nics_rollsum_perc_chart!,
          self.inputs_json.apperance.mainChart.nicsRollSumPercBars.colorGrowth,
          self.inputs_json.apperance.mainChart.nicsRollSumPercBars.colorLoss,
          self.showed_nics_roll_bars && self.showed_nics_roll_perc_bars,
          self.inputs_json.apperance.mainChart.nicsRollSumPercBars.text,
          self._formatNumberPerc
        );
        break;

      case "ct_pricing_ebitda":
        // draw ebitda_rollsum bar chart
        self._update_bar_chart(
          "ebitda_rollsum_bar_chart",
          self.ebitda_rollsum_data!,
          self.axes_ebitda_rollsum_chart!,
          self.inputs_json.apperance.mainChart.ebitdaRollSumBars.colorGrowth,
          self.inputs_json.apperance.mainChart.ebitdaRollSumBars.colorLoss,
          self.showed_ebitda_roll_bars && !self.showed_ebitda_roll_perc_bars,
          self.inputs_json.apperance.mainChart.ebitdaRollSumBars.text,
          self._formatNumber
        );

        // draw ebitda_rollsum_perc bar chart
        self._update_bar_chart(
          "ebitda_rollsum_perc_bar_chart",
          self.ebitda_rollsum_perc_data!,
          self.axes_ebitda_rollsum_perc_chart!,
          self.inputs_json.apperance.mainChart.ebitdaRollSumPercBars
            .colorGrowth,
          self.inputs_json.apperance.mainChart.ebitdaRollSumPercBars.colorLoss,
          self.showed_ebitda_roll_bars && self.showed_ebitda_roll_perc_bars,
          self.inputs_json.apperance.mainChart.ebitdaRollSumPercBars.text,
          self._formatNumberPerc
        );

        break;
      case "ct_pricing_bookval":
        // draw bookVal bar chart
        self._update_bar_chart(
          "bookval_bar_chart",
          self.bookValData!,
          self.axes_bookval_chart!,
          self.inputs_json.apperance.mainChart.bookValBars.colorGrowth,
          self.inputs_json.apperance.mainChart.bookValBars.colorLoss,
          self.showed_bookval_bars,
          self.inputs_json.apperance.mainChart.bookValBars.text,
          self._formatNumber
        );
        break;

      default:
        break;
    }
  }

  public SetDateFilterXyrs(years: number) {
    let self = this;

    // get full range px
    let sel = self.xDateFilter!.range();

    // px -> date
    let newValues = sel.map(self.xDateFilter!.invert);

    // end date the last date value
    self.endDate = newValues[1];

    // calc start date from end date
    self.startDate = new Date(
      self.endDate.getTime() - 1000 * 60 * 60 * 24 * 365 * years // approx
    );

    // handle start date overindexing
    if (self.startDate < newValues[0]) self.startDate = newValues[0];

    // do brush
    self.brushComponent!.call(self.brush!.move,
      [self.xDateFilter!(self.startDate), self.xDateFilter!(self.endDate)]);
  }

  private _updateDebugConsole(metricId: string) {
    let self = this;
    d3.select(".company-pricing-chart-debug").html(
      `<div>${metricId} full min ${self.stats.data_full_min.toFixed(2)}</div> 
      <div>${metricId} full max ${self.stats.data_full_max.toFixed(2)}</div>
      <div>${metricId} full avg ${self.stats.data_full_avg.toFixed(2)}</div>
      <div>${metricId} sel min ${self.stats.data_sel_min.toFixed(2)}</div> 
      <div>${metricId} sel max ${self.stats.data_sel_max.toFixed(2)}</div> 
      <div>${metricId} sel avg ${self.stats.data_sel_avg.toFixed(2)}</div>
      <div>${metricId} sel avg count ${self.stats.data_avg_count.toFixed(
        2
      )}</div>
      <div>${metricId} sel curr ${self.stats.data_curr_val.toFixed(2)}</div>`
    );
  }

  private _init_loading_screen() {
    let self = this;

    // add the overlay rect
    if (d3.select("#pricing-chart-loading-overlay-rect").size() == 0) {
    self.g_loading
      .append("rect")
      .attr("id", "pricing-chart-loading-overlay-rect")
      .attr("width", self.inputs_json.size.width)
      .attr("height", self.inputs_json.size.height)
      .attr("fill", self.inputs_json.apperance.mainChart.loadingScreen.colorBg)
      .attr("opacity", 0.8)
      .attr("pointer-events", "none");
    }

    // load and add icon svg(if not present)
    if (d3.select("#chart_loader_pc").size() == 0) {
      d3.xml(self.path_chart_loader).then((data) => {
        self.g_loading.node()!.appendChild(data.documentElement.children[0]);

        // set the logo
        d3.select("#chart_loader") // select its orig. name and rename it
          .attr("id", "chart_loader_pc")
          .attr(
            "transform",
            `translate(${self.inputs_json.size.width / 2},${
              self.inputs_json.size.height / 1.5
            }), rotate(180)`
          );
      });
    }

    // add info text
    if (d3.select("#pricing-chart-loading-info-text").size() == 0) {
      
      self.loading_info_text = self.g_loading
      .append("text")
      .attr("id", "pricing-chart-loading-info-text")
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-size", self.inputs_json.size.width * 0.02)
      .attr("transform",
      `translate(${self.inputs_json.size.width / 2},${
      (self.inputs_json.size.height / 1.5) + 20
      })`)
      .text("");
    }
  }

  private _show_loading_screen() {
    let self = this;

    self._disable_mouse_events();
    self._showElement(self.g_loading);

    //let loader_elem = d3
    //    .select("#chart_loader_pc")
    //    .style("display", "inline");
    //  if (loader_elem != undefined) self._showElement(loader_elem, 1.0);
  }

  private _hide_loading_screen() {
    let self = this;
    self._hideElement(self.g_loading);
    self._enable_mouse_events();

    //d3.select("#chart_loader_pc")
    //  .transition()
    //  //.delay(1000) // valami bekavar, nincs transi mert valamivel még nem végez fentebb
    //  .attr("opacity", 0)
    //  .on("end", function () {
    //    d3.select(this).attr("visibility", "hidden").style("display", "none");
    //});
  }

  private _clearChart() {
    let self = this;

    // clear chart
    self.title!.text("");

    // clear last price labels
    self._hideElement(self.label_lastp!);
    self._hideElement(self.label_fairp!);

    // clear bars
    d3.selectAll(".rec_bars").remove();
    d3.selectAll(".rev_bars").remove();
    d3.selectAll(".rev_perc_bars").remove();
    d3.selectAll(".so_bars").remove();

    // clear prices
    d3.select("#line_hds_helper").remove();
    d3.select("#line_hds").remove();
    d3.selectAll(".hds_area").remove();
    d3.select("#line_fair_p_helper").remove();
    d3.select("#line_fair_p").remove();
    d3.select("#line_fair_p_current").remove();
    d3.selectAll(".fair_p_circles").remove();
    d3.select("#fair_p_circle_current").remove();

    //d3.select("#pricing-chart-title").remove();

    // x axis
    d3.select(".x-axis").remove();

    // clear y axes
    d3.selectAll(".y_axis").remove();
    d3.selectAll(".y_axis_label").remove();
  }

  private _hideErrorMessage() {
    let self = this;
    if (self.error_msg_svg != undefined) self._hideElement(self.error_msg_svg);
  }

  private _showErrorMessage(msg: string) {
    let self = this;
    self.error_msg_svg!.text(msg);
    self._showElement(self.error_msg_svg!, 1.0, 1500);
  }

  private _hideElement(
    d3_sel: d3.Selection<any, any, any, any>,
    remove = false
  ) {
    d3_sel
      .transition()
      .attr("opacity", 0)
      .on("end", function () {
        d3.select(this).attr("visibility", "hidden").style("display", "none");

        // remove element
        remove == true ? d3_sel.remove() : undefined;
      });
  }

  private _showElement(
    d3_sel: d3.Selection<any, any, any, any>,
    opacity = 1.0,
    durationMs = 700
  ) {
    d3_sel
      .transition()
      .duration(durationMs)
      .attr("opacity", opacity)
      .attr("visibility", "visible")
      .style("display", "inline");
  }

  private _hideAllElements() {
    let self = this;

    // clear last price labels
    self._hideElement(self.label_lastp!);
    self._hideElement(self.label_fairp!);

    // clear bars
    self._hideElement(d3.selectAll(".rec_bars"));
    let subChartIds = ["rev", "fcf_rollsum", "nics_rollsum", "ebitda_rollsum"];
    for (const c_id of subChartIds) {
      self._hideElement(d3.selectAll(`.${c_id}_bar_chart_bars`));
      self._hideElement(d3.selectAll(`.${c_id}_perc_bar_chart_bars`));
    }
    self._hideElement(d3.selectAll(".fcf_stacked_chart_bars"));
    self._hideElement(d3.select("#fcf_stacked_chart_line"));
    self._hideElement(d3.selectAll(".fcf_stacked_chart_circles"));

    self._hideElement(d3.selectAll(".bookval_bar_chart_bars"));
    self._hideElement(d3.selectAll(".so_bar_chart_bars"));

    // clear prices
    self._hideElement(self.line_hds_svg!);
    self._hideElement(d3.select("#line_hds_helper"));
    self._hideElement(d3.selectAll(".hds_area"));
    self._hideElement(d3.select("#line_fair_p_helper"));
    self._hideElement(d3.select("#line_fair_p"));
    self._hideElement(d3.select("#line_fair_p_current"));
    self._hideElement(d3.selectAll(".fair_p_circles"));
    self._hideElement(d3.select("#fair_p_circle_current"));

    // date filter
    //self._hideElement(d3.select("#pricing-chart-date-filter-bg"));
    //self._hideElement(d3.select("#pricing-chart-date-filter-y-label"));
    //self._hideElement(self.dateFilterAvgLineSvg);
    //self._hideElement(self.dateFilterLineSvg);
    //self._hideElement(self.xAxisDateFilter);

    //d3.select("#pricing-chart-title").remove();

    // x axis
    //self._hideElement(d3.select(".x-axis"));

    // clear y axes
    //self._hideElement(d3.selectAll(".y_axis"));
    //self._hideElement(d3.selectAll(".y_axis_label"));
  }

  private _getYForLine(lineNode: SVGPathElement, x_coord: number) {
    let beginning = 0,
      end = lineNode!.getTotalLength(),
      target = null,
      pos = null;

    while (true) {
      target = Math.floor((beginning + end) / 2);
      pos = lineNode.getPointAtLength(target);
      if ((target === end || target === beginning) && pos.x !== x_coord) {
        break;
      }
      if (pos.x > x_coord) end = target;
      else if (pos.x < x_coord) beginning = target;
      else break; //position found
    }

    return pos;
  }

  private _getScaleCorrRange(min_max_vals_arr: number[]) {
    return [
      min_max_vals_arr[0] >= 0
        ? min_max_vals_arr[0] * 0.995
        : min_max_vals_arr[0] * 1.005,
      min_max_vals_arr[1] >= 0
        ? min_max_vals_arr[1] * 1.005
        : min_max_vals_arr[1] * 0.995,
    ];
  }

  _getMinMaxPrices(
    hds: StandardDataStructDateElement[],
    fairpData: StandardDataStructDateElement[],
    fairpDataCurr: StandardDataStructDateElement[]
  ) {
    // min max prices for y axis
    let hist_p_min = d3.min([
      d3.min(fairpData, (d) => d.value)!,
      d3.min(hds, (d) => d.value)!,
      d3.min(fairpDataCurr, (d) => d.value)!,
    ]);

    let hist_p_max = d3.max([
      d3.max(fairpData, (d) => d.value)!,
      d3.max(hds, (d) => d.value)!,
      d3.max(fairpDataCurr, (d) => d.value)!,
    ]);

    return [hist_p_min, hist_p_max];
  }

  private _getNearestData(data: StandardDataStructDateElement[], date: Date) {
    let value = data.filter((d) => d.date.getTime() <= date.getTime());
    if (value.length > 0) return value[value.length - 1].value;
    else return undefined;
  }

  private _formatNumber(x: d3.NumberValue) {
    const formatSi = d3.format(".4s");
    const s = formatSi(x);
    switch (s[s.length - 1]) {
      case "G":
        return s.slice(0, -1) + "B"; // billions
      case "k":
        return s.slice(0, -1) + "K"; // thousands
    }
    return s;
  }

  private _formatNumberPerc(d: d3.NumberValue) {
    return `${(d.valueOf() * 100).toFixed(2)}%`;
  }

  // html tooltip
  private _init_html_tooltip() {
    let self = this;

    // tooltip box
    self.html_tooltip_cont = d3
      .select("body")
      .append("div")
      .attr("class", "pricing-chart-html-tooltip")
      .style(
        "background-color",
        self.inputs_json.apperance.mainChart.tooltip.colorBg
      )
      .style("opacity", 0);
  }

  private _update_initial_html_tooltip(
    x_cord: number,
    y_cord: number,
    html_content: string
  ) {
    let self = this;

    self
      .html_tooltip_cont!.style("left", x_cord + "px")
      .style("top", y_cord - 28 + "px")
      .html(html_content)
      .transition()
      .style("opacity", 1.0);
  }

  private _update_html_tooltip(x_cord: number, y_cord: number) {
    let self = this;
    self
      .html_tooltip_cont!.style("left", x_cord + "px")
      .style("top", y_cord - 28 + "px");
  }

  private _hide_html_tooltip() {
    let self = this;
    self.html_tooltip_cont!.transition().style("opacity", 0);
  }

  // ------------------ hds --------------------

  private _init_hds_xy_axis(yIsLog: boolean) {
    let self = this;

    // init x scale
    self.x = d3.scaleTime().range([0, self.inputs_json.size.width]);
    self.xAxisCall = d3.axisBottom(self.x).ticks(5);
    self.xAxis = self.g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${self.inputs_json.size.height})`);

    // init y scale
    self._initPriceYAxisScale(yIsLog);
    self.yAxisCall = d3
      .axisLeft(self.y!)
      .ticks(6)
      .tickFormat(self._formatNumber);

    self.yAxis = self.g
      .append("g")
      .attr("class", "y_axis")
      .attr("id", `y_axis_price`)
      .attr("opacity", 1.0);

    self.yAxis
      .append("text")
      .attr("class", "y_axis_label")
      .attr("id", "y_axis_label_price")
      .attr("transform", "rotate(-90)")
      .attr("y", -50) //resp
      .attr("x", (self.inputs_json.size.height / 2) * -1)
      .attr("font-size", self.inputs_json.size.width * 0.02) //resp
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Real and fair price");
  }

  private _init_hds_lines() {
    let self = this;

    // helper line object definition for hds
    self.line_hds = d3
      .line<StandardDataStructDateElement>()
      .x((d) => self.x!(d.date))
      .y((d) => self.y!(d.value));

    // hds line
    self.line_hds_svg = d3
      .select<SVGPathElement, StandardDataStructDateElement[]>("#g_hds_helper")
      .append("path")
      .attr("class", "line_hds")
      .attr("id", "line_hds")
      .attr("stroke", "black")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("pointer-events", "none");

    // hds helper line
    d3.select<SVGPathElement, StandardDataStructDateElement[]>("#g_hds_helper")
      .append("path")
      .attr("class", "line_helper")
      .attr("id", "line_hds_helper")
      .attr("stroke", "grey")
      .attr("fill", "none")
      .attr("stroke-width", 10)
      .attr("pointer-events", () => (self.show_dw ? "none" : "stroke"))
      .attr("opacity", 0)
      .attr("cursor", "pointer")
      .on(
        "mouseover",
        function (mouseEvent) {
          // all areas darker
          d3.selectAll(".hds_area")
            //.transition(200)
            .attr("fill", function () {
              return d3
                .color(d3.select(this).attr("fill"))!
                .darker()
                .formatHex();
            })
            .attr("opacity", 1.0);

          // show tooltip
          d3.select("#tooltip")
            //.transition()
            .attr("opacity", 1.0);
        }
        //}
      )
      .on("mouseout", function (mouseEvent) {
        d3.selectAll(".hds_area")
          //.transition(200)
          .attr("fill", function () {
            return d3.select(this).attr("class").indexOf("hds_area_green") != -1
              ? "green"
              : "red"; // !!!
          })
          .attr("opacity", 1.0);

        // hide tooptip
        d3.select("#tooltip")
          //.transition()
          .attr("opacity", 0);
        //}
      })
      .on("mousemove", function (mouseEvent) {
        self._show_price_tooltip("Real Price", this, mouseEvent);
      });
  }

  private _update_hds_lines(
    x_min: Date,
    x_max: Date,
    y_min: number,
    y_max: number
  ) {
    let self = this;

    // x
    self.x!.domain([x_min, x_max]);
    self.xAxisCall!.scale(self.x!);
    self.xAxis!.transition().call(self.xAxisCall!);

    // y
    self.y!.domain(self._getScaleCorrRange([y_min, y_max]));
    self.yAxisCall!.scale(self.y!);
    self.yAxis!.transition().call(self.yAxisCall!);

    // hds line
    self
      .line_hds_svg!.data([self.hds_filtered!])
      .attr("opacity", () => (self.showed_prices ? 1.0 : 0))
      .attr("visibility", () => (self.showed_prices ? "visible" : "hidden"))
      .style("display", () => (self.showed_prices ? "inline" : "none"))
      .attr("d", (d) => self.line_hds!(d));

    // hds helper line
    d3.select("#line_hds_helper")
      .data([self.hds_filtered!])
      .attr("visibility", () => (self.showed_prices ? "visible" : "hidden"))
      .style("display", () => (self.showed_prices ? "inline" : "none"))
      .attr("d", (d) => self.line_hds!(d));
  }

  private _calculate_hds_area_chart(
    hds_data: StandardDataStructDateElement[],
    fairp_line_svg_obj: SVGPathElement,
    fairp_curr_line_svg_obj: SVGPathElement
  ) {
    let self = this;

    // recalculate red, green areas
    let hds_areas: HdsAreaDataElement[][] = [];
    hds_areas[0] = [];
    let fpIndex = 0;
    let is_red = false;
    let area_arr_index = 1;

    let fp_last_index = self.fair_prices!.length - 1;
    let curr_fairp_svg_obj = undefined;

    hds_data.map(function (d, i) {
      // iterate fp index if needed
      if (
        fp_last_index > fpIndex &&
        d.date > self.fair_prices![fpIndex + 1].date
      ) {
        fpIndex++;
      }

      // sync fq, d1 data dates
      if (d.date >= self.fair_prices![fpIndex].date) {
        // !!! itt néha hiba, nincs date

        // not the current fair price(line) range
        if (fp_last_index > fpIndex) curr_fairp_svg_obj = fairp_line_svg_obj;
        else curr_fairp_svg_obj = fairp_curr_line_svg_obj;

        // get y px cordinate for fairp line
        let fp_line_y = self._getYForLine(
          curr_fairp_svg_obj,
          self.x!(d.date)
        ).y;

        // green area
        hds_areas[0].push({
          x: d.date,
          y0: 0,
          y1:
            //d.s_adj_close > self.fair_prices[fpIndex].value
            d.value > self.y!.invert(fp_line_y)
              ? self.y!.invert(fp_line_y) // self.fair_prices[fpIndex].value
              : d.value,
        });

        // new red area, price is higher than fair price line data
        //if (!is_red && d.s_adj_close > self.fair_prices[fpIndex].value) {
        if (!is_red && d.value > self.y!.invert(fp_line_y)) {
          is_red = true;
          hds_areas[area_arr_index] = [];
        }

        // red area currently, price is higher than fair price line data
        //if (is_red && d.s_adj_close > self.fair_prices[fpIndex].value) {
        if (is_red && d.value > self.y!.invert(fp_line_y)) {
          hds_areas[area_arr_index].push({
            x: d.date,
            y0: self.y!.invert(fp_line_y), // self.fair_prices[fpIndex].value
            y1: d.value,
          });
        }

        // close red area
        //if (is_red && d.s_adj_close < self.fair_prices[fpIndex].value) {
        if (is_red && d.value < self.y!.invert(fp_line_y)) {
          is_red = false;
          area_arr_index++;
        }
      }
    });

    return hds_areas;
  }

  private _init_hds_area_chart() {
    let self = this;

    // red ,green area object definitions
    self.hdsArea_green = d3
      .area<HdsAreaDataElement>()
      .x((d) => self.x!(d.x))
      .y0(self.inputs_json.size.height)
      .y1((d) => self.y!(d.y1));

    self.hdsArea_red = d3
      .area<HdsAreaDataElement>()
      .x((d) => self.x!(d.x))
      .y0((d) => self.y!(d.y0))
      .y1((d) => self.y!(d.y1));
  }

  private _update_hds_areas() {
    let self = this;

    // remove red, green areas
    d3.selectAll(".hds_area_green").remove();
    d3.selectAll(".hds_area_red").remove();

    //draw green, red hds areas
    let hdsAreaPath_green = d3
      .select("#g_hds_areas")
      .append("path")
      .data([self.hds_areas_data![0]])
      .attr("class", "hds_area hds_area_green")
      .attr("fill", "green")
      .attr("pointer-events", () => (self.show_dw ? "none" : "all"))
      .attr("visibility", () => (self.showed_prices ? "visible" : "hidden"))
      .style("display", () => (self.showed_prices ? "inline" : "none"))
      .on("mouseover", function (mouseEvent) {
        d3.selectAll(".hds_area")
          //.transition(200)
          .attr("fill", function () {
            return d3.color(d3.select(this).attr("fill"))!.darker().formatHex();
          })
          .attr("opacity", 1.0);
        d3.select("#tooltip").attr("opacity", 1.0);
      })
      .on("mouseout", function (mouseEvent) {
        d3.selectAll(".hds_area")
          //.transition(200)
          .attr("fill", function () {
            return d3.select(this).attr("class").indexOf("hds_area_green") != -1
              ? "green"
              : "red";
          })
          .attr("opacity", 1.0);
        d3.select("#tooltip").attr("opacity", 0);
      })
      .on("mousemove", function (mouseEvent) {
        self._show_price_tooltip(
          "Real Price",
          d3
            .select<SVGPathElement, StandardDataStructDateElement[]>(
              "#line_hds_helper"
            )
            .node()!,
          mouseEvent
        );
      })
      .transition()
      .attr("d", self.hdsArea_green!(self.hds_areas_data![0]))
      .attr("opacity", () => (self.showed_prices ? 1.0 : 0));

    for (let i = 1; i < self.hds_areas_data!.length; i++) {
      d3.select("#g_hds_areas")
        .append("path")
        .data([self.hds_areas_data![i]])
        .attr("class", "hds_area hds_area_red")
        .attr("fill", "red")
        .attr("pointer-events", () => (self.show_dw ? "none" : "all"))
        .attr("visibility", () => (self.showed_prices ? "visible" : "hidden"))
        .style("display", () => (self.showed_prices ? "inline" : "none"))
        .on("mouseover", function (mouseEvent) {
          d3.selectAll(".hds_area")
            //.transition(200)
            .attr("fill", function () {
              return d3
                .color(d3.select(this).attr("fill"))!
                .darker()
                .formatHex();
            })
            .attr("opacity", 1.0);
          d3.select("#tooltip").attr("opacity", 1.0);
        })
        .on("mouseout", function (mouseEvent) {
          d3.selectAll(".hds_area")
            //.transition(200)
            .attr("fill", function () {
              return d3.select(this).attr("class").indexOf("hds_area_green") !=
                -1
                ? "green"
                : "red";
            })
            .attr("opacity", 1.0);
          d3.select("#tooltip").attr("opacity", 0);
        })
        .on("mousemove", function (mouseEvent) {
          self._show_price_tooltip(
            "Real Price",
            d3
              .select<SVGPathElement, StandardDataStructDateElement[]>(
                "#line_hds_helper"
              )
              .node()!,
            mouseEvent
          );
        })
        .transition()
        .attr("d", self.hdsArea_red!(self.hds_areas_data![i]))
        .attr("opacity", () => (self.showed_prices ? 1.0 : 0));
    }
  }

  private _initHdsTooltip() {
    let self = this;

    self.tooltip = self.mainChartSvgNode
      .append("g")
      .attr("id", "tooltip")
      .attr("opacity", 0);

    self.tooltip
      .append("text")
      .attr("id", "tooltip-text")
      .attr("x", 0)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("padding", 1)
      .style("filter", "url(#textBackground)");

    // prepare circle for hover
    self.tooltip
      .append("circle")
      .style("fill", "none")
      .attr("stroke", self.inputs_json.apperance.mainChart.tooltip.colorCircle)
      .attr("r", self.inputs_json.apperance.mainChart.tooltip.sizeCircle);

    // prepare hover lines
    // x line
    self.tooltip
      .append("line")
      .attr("id", "tooltip-line-x")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr(
        "stroke",
        self.inputs_json.apperance.mainChart.tooltip.colorHelperLines
      )
      .attr("stroke-dasharray", "3,3")
      .attr(
        "stroke-width",
        self.inputs_json.apperance.mainChart.tooltip.widthHelperLines
      );

    // y line
    self.tooltip
      .append("line")
      .attr("id", "tooltip-line-y")
      .attr("y1", 0)
      .attr("y1", 0)
      .attr(
        "stroke",
        self.inputs_json.apperance.mainChart.tooltip.colorHelperLines
      )
      .attr("stroke-dasharray", "3,3")
      .attr(
        "stroke-width",
        self.inputs_json.apperance.mainChart.tooltip.widthHelperLines
      );

    // axis texts
    // x
    self.tooltip
      .append("text")
      .attr("id", "tooltip-axis-x-text")
      .attr("y", 0)
      .style("padding", 1)
      .style("filter", "url(#textBackground)");

    // y
    self.tooltip
      .append("text")
      .attr("id", "tooltip-axis-y-text")
      .attr("x", 0)
      .style("padding", 1)
      .style("filter", "url(#textBackground)");
  }

  public ToggleLogYScale(isLog: boolean) {
    let self = this;

    // scale
    self._initPriceYAxisScale(isLog);
    self._setPriceYAxisScale(
      self.stats.price_sel_min,
      self.stats.price_sel_max
    );

    self.yAxisCall!.scale(self.y!);
    self.yAxis!.transition().call(self.yAxisCall!);

    // redraw hds, fair price
    d3.select<SVGPathElement, StandardDataStructDateElement[]>(
      "#line_fair_p_helper"
    ).attr("d", (d) => self.line_fair_p!(d));
    d3.select<SVGPathElement, StandardDataStructDateElement[]>("#line_fair_p")
      .transition()
      .attr("d", (d) => self.line_fair_p!(d));
    self.line_hds_svg!.transition().attr("d", (d) => self.line_hds!(d));
    d3.select<SVGPathElement, StandardDataStructDateElement[]>(
      "#line_hds_helper"
    ).attr("d", (d) => self.line_hds!(d));
    d3.selectAll<SVGPathElement, HdsAreaDataElement[]>(".hds_area_green")
      .transition()
      .attr("d", (d) => self.hdsArea_green!(d));
    d3.selectAll<SVGPathElement, HdsAreaDataElement[]>(".hds_area_red")
      .transition()
      .attr("d", (d) => self.hdsArea_red!(d));
    d3.selectAll<SVGCircleElement, FairPriceIndDataElement>(".fair_p_circles")
      .transition()
      .attr("cx", (d) => self.x!(d.date))
      .attr("cy", (d) => self.y!(d.value));
    d3.select<SVGCircleElement, StandardDataStructDateElement[]>(
      "#line_fair_p_current"
    )
      .transition()
      .attr("d", (d) => self.line_fair_p!(d));
    self;
    d3.select<SVGGElement, StandardDataStructDateElement>(
      "#pricing-chart-label-lastp"
    )
      .transition()
      .attr(
        "transform",
        (d) =>
          `translate(${self.x!(d.date) + self.inputs_json.size.margins.left},${
            self.y!(d.value) + self.inputs_json.size.margins.top
          })`
      );
    self;
    d3.select<SVGGElement, StandardDataStructDateElement>(
      "#pricing-chart-label-fairp"
    )
      .transition()
      .attr(
        "transform",
        (d) =>
          `translate(${self.x!(d.date) + self.inputs_json.size.margins.left},${
            self.y!(d.value) + self.inputs_json.size.margins.top
          })`
      );
  }

  private _setPriceYAxisScale(y_min: number, y_max: number) {
    let self = this;
    self.y!.domain([y_min, y_max]);
  }

  private _initPriceYAxisScale(isLog: boolean) {
    let self = this;

    // change only price y scale
    if (isLog) {
      self.y = d3.scaleLog().range([self.inputs_json.size.height, 0]);

      //self.yDateFilter;
    } else {
      self.y = d3.scaleLinear().range([self.inputs_json.size.height, 0]);
    }
  }

  private _initBarsTooltip() {
    let self = this;

    self.tooltip_bars = self.mainChartSvgNode
      .append("g")
      .attr("id", "tooltip_bars")
      .attr("opacity", 0);

    let tb_text = self.tooltip_bars
      .append("text")
      .attr("id", "tooltip-bars-text")
      .attr("x", 0)
      .attr("y", 0)
      .style("padding", 1)
      .style("filter", "url(#textBackground)");

    tb_text
      .append("tspan")
      .attr("id", "tooltip-bars-text-name")
      .attr("x", 0)
      .attr("dy", "1.2em");
    tb_text
      .append("tspan")
      .attr("id", "tooltip-bars-text-date")
      .attr("x", 0)
      .attr("dy", "1.2em");
    tb_text
      .append("tspan")
      .attr("id", "tooltip-bars-text-value")
      .attr("x", 0)
      .attr("dy", "1.2em");
  }

  // ------------------- fair price --------------
  private _init_fairp_lines() {
    let self = this;

    // line fair price line def
    self.line_fair_p = d3
      .line<StandardDataStructDateElement>()
      .x((d) => self.x!(d.date))
      .y((d) => self.y!(d.value));

    // fair price line
    self.fairp_hds_line = d3
      .select("#g_fairp_line") // a red green area számítás ebből a vonal object koodinátákból veszi az adatot
      .append("path")
      .attr("id", "line_fair_p")
      //.attr("cursor", "pointer")
      .attr("pointer-events", "none")
      .attr("fill", "none")
      .attr("stroke", self.inputs_json.apperance.mainChart.fairPriceLine.color)
      .attr("stroke-width", 2)
      .on("mouseover", function (mouseEvent) {})
      .on("mouseout", function (mouseEvent) {})
      .on("mousemove", function (mouseEvent) {});

    // fair price helper line
    d3.select("#g_fairp_helper")
      .append("path")
      .attr("class", "line_helper")
      .attr("id", "line_fair_p_helper")
      .attr("stroke", "grey") // !!!
      .attr("fill", "none")
      .attr("stroke-width", 10)
      .attr("pointer-events", () => (self.show_dw ? "none" : "stroke"))
      .attr("opacity", 0)
      .attr("cursor", "pointer")
      .on("mouseover", function (mouseEvent) {
        let line = d3.select("#line_fair_p");

        // current line darker and opacity 1
        let darkerColor = d3.color(line.attr("stroke"))!.darker().formatHex();
        line
          //.transition()
          .attr("stroke", darkerColor)
          .attr("opacity", 1.0);

        // show tooltip
        d3.select("#tooltip")
          //.transition()
          .attr("opacity", 1.0);
      })
      .on("mouseout", function (mouseEvent) {
        let line = d3.select("#line_fair_p");

        // make original color
        line
          //.transition()
          .attr(
            "stroke",
            self.inputs_json.apperance.mainChart.fairPriceLine.color
          )
          .attr("opacity", 1.0);

        // hide tooptip
        d3.select("#tooltip")
          //.transition()
          .attr("opacity", 0);
      })
      .on("mousemove", function (mouseEvent) {
        self._show_price_tooltip(
          "Fair Price",
          d3
            .select<SVGPathElement, StandardDataStructDateElement[]>(
              "#line_fair_p"
            )
            .node()!,
          mouseEvent
        );
      });

    // fair price current line
    self.line_fairp_curr = d3
      .select("#g_fairp_line")
      .append("path")
      .attr("id", "line_fair_p_current")
      .attr("fill", "none")
      .attr("stroke-linecap", "round")
      .attr("stroke-dasharray", "5,5")
      .attr("stroke", self.inputs_json.apperance.mainChart.fairPriceLine.color)
      .attr("stroke-width", 2)
      .attr("pointer-events", "none")
      .on("mouseover", function (mouseEvent) {})
      .on("mouseout", function (mouseEvent) {})
      .on("mousemove", function (mouseEvent) {});
  }

  private _update_fair_price_lines() {
    let self = this;

    // fair price line
    // draw fair price line
    self
      .fairp_hds_line!.attr("opacity", () => (self.showed_prices ? 1.0 : 0))
      .attr("visibility", () => (self.showed_prices ? "visible" : "hidden"))
      .style("display", () => (self.showed_prices ? "inline" : "none"))
      .data([self.fair_prices!])
      //.transition()  // ha transition engedélyezve, nem esett egybe a fp line és fp circles !
      .attr("d", (d) => self.line_fair_p!(d));

    // draw fair price helper line
    d3.select("#line_fair_p_helper")
      .data([self.fair_prices!])
      .attr("visibility", () => (self.showed_prices ? "visible" : "hidden"))
      .style("display", () => (self.showed_prices ? "inline" : "none"))
      .attr("d", (d) => self.line_fair_p!(d));

    // fair price current line
    // self.lastFqDateExceeded = true;

    // self.line_fairp_curr
    //   .data([self.fair_prices_curr])
    //   .attr(
    //     "visibility",
    //     () =>
    //       self.showed_prices && self.lastFqDateExceeded ? "visible" : "hidden" // show hide-al tömörebb !!!
    //   )
    //   .attr("opacity", () =>
    //     self.showed_prices && self.lastFqDateExceeded ? 1.0 : 0
    //   )
    //   .style("display", () =>
    //     self.showed_prices && self.lastFqDateExceeded ? "inline" : "none"
    //   )
    //   .attr("d", (d) => self.line_fair_p(d));
  }

  private _update_fair_price_current_line_and_circle() {
    let self = this;

    //if (self.lastFitFairP > 0) {
    self.lastFqDateExceeded = true;

    // let diff =
    //   self.fair_prices[self.fair_prices.length - 1].value -
    //   self.fair_prices_curr[0].value;
    // self.fair_prices_curr = self.fair_prices_curr.map((d) => {
    //   return {
    //     date: d.date,
    //     value: d.value + diff,
    //   };
    // });

    self.fair_prices_curr!.unshift(
      self.fair_prices![self.fair_prices!.length - 1]
    );

    // line
    self
      .line_fairp_curr!.data([self.fair_prices_curr!])
      //.attr("pointer-events", () => (self.show_dw ? "none" : "all"))
      .attr("d", (d) => self.line_fair_p!(d))
      .attr(
        "visibility",
        () =>
          self.showed_prices && self.lastFqDateExceeded ? "visible" : "hidden" // show hide-al tömörebb !!!
      )
      .attr("opacity", () =>
        self.showed_prices && self.lastFqDateExceeded ? 1.0 : 0
      )
      .style("display", () =>
        self.showed_prices && self.lastFqDateExceeded ? "inline" : "none"
      );

    // fair price current circle
    let cr = self._getFairPCircleSize(self.fair_prices!.length);

    self.fairp_curr_circle = d3
      .select("#g_fairp_circles")
      .selectAll("#fair_p_circle_current")
      .data([self.fair_prices_curr![self.fair_prices_curr!.length - 1]])
      .enter()
      .append("circle")
      .attr("id", "fair_p_circle_current")
      .attr("class", "fair_p_circles")
      .style("fill", "white")
      .attr("stroke-dasharray", "2,2")
      .attr("stroke", "black")
      .attr(
        "visibility",
        () =>
          self.showed_prices && self.lastFqDateExceeded ? "visible" : "hidden" // show hide-al tömörebb !!!
      )
      .attr("opacity", () =>
        self.showed_prices && self.lastFqDateExceeded ? 1.0 : 0
      )
      .style("display", () =>
        self.showed_prices && self.lastFqDateExceeded ? "inline" : "none"
      )
      .on("mouseover", function (mouseEvent) {
        let d = d3.select(this).data()[0] as StandardDataStructDateElement;

        let txt = `
        <span>Fair Price last(estim)</span>
        <span>${new Date(d.date).toISOString().split("T")[0]}</span>
        <span>${self._formatNumber(d.value)}</span>`;

        self._mouseover_fp_circles(
          d3.select(this).node(),
          self,
          mouseEvent,
          txt
        );
      })
      .on("mouseout", function (mouseEvent) {
        self._mouseout_fp_circles(d3.select(this).node(), self, mouseEvent);
      })
      .on("mousemove", function (mouseEvent) {
        self._mousemove_fp_circles(d3.select(this).node(), self, mouseEvent);
      })
      .attr("cx", (d) => self.x!(d.date))
      .attr("cy", (d) => self.y!(d.value))
      .attr("r", cr);
    //}
  }

  private _update_fair_price_circles() {
    let self = this;

    // remove fair price circles
    d3.select("#g_fairp_circles").selectAll(".fair_p_circles").remove();

    let cr = self._getFairPCircleSize(self.fair_prices!.length);

    // draw fair price circles
    d3.select("#g_fairp_circles")
      .selectAll(".fair_p_circles")
      .data(self.fair_prices!)
      .enter()
      .append("circle")
      .attr("pointer-events", () => (self.show_dw ? "none" : "all"))
      .attr("class", "fair_p_circles")
      .style("fill", "white")
      .attr("stroke", "black")
      .attr("visibility", () => (self.showed_prices ? "visible" : "hidden"))
      .style("display", () => (self.showed_prices ? "inline" : "none"))
      .on("mouseover", function (mouseEvent) {
        let d = d3.select(this).data()[0] as FairPriceIndDataElement;

        let txt = `
        <span>Fair Price exact</span>
        <span>${new Date(d.date).toISOString().split("T")[0]}</span>
        <span>${self._formatNumber(d.value)}</span>`;

        self.fairp_type == "fairp_type_industrial"
          ? (txt = `${txt}<span>Company count: ${d.comp_c}</span>`)
          : undefined;

        self._mouseover_fp_circles(
          d3.select(this).node(),
          self,
          mouseEvent,
          txt
        );
      })
      .on("mouseout", function (mouseEvent) {
        self._mouseout_fp_circles(d3.select(this).node(), self, mouseEvent);
      })
      .on("mousemove", function (mouseEvent) {
        self._mousemove_fp_circles(d3.select(this).node(), self, mouseEvent);
      })
      .transition()
      .attr("cx", (d) => self.x!(d.date))
      .attr("cy", (d) => self.y!(d.value))
      .attr("r", cr)
      .attr("opacity", () => (self.showed_prices ? 1.0 : 0));
  }

  private _update_fair_price_and_hds_areas() {
    let self = this;

    self._update_fair_price_lines();
    self._update_fair_price_circles();
    self._update_fair_price_current_line_and_circle();

    // calculate hds area data
    self.hds_areas_data = self._calculate_hds_area_chart(
      self.hds_filtered!,
      self.fairp_hds_line!.node()!,
      self.line_fairp_curr!.node()!
    );

    self._update_hds_areas();
    self._update_last_price_labels();
  }

  private _mouseover_fp_circles(
    node: d3.BaseType | SVGFEFuncRElement,
    self_in: CompanyPricingChart,
    mouseEvent: any,
    text: string
  ) {
    // circle color to black
    d3.select(node).transition().duration(200).style("fill", "black");

    // show price y axis
    d3.selectAll(".y_axis").transition().attr("opacity", 0);
    self_in.yAxis!.transition().attr("opacity", 1.0);

    self_in._update_initial_html_tooltip(
      mouseEvent.pageX,
      mouseEvent.pageY,
      text
    );
  }

  private _mouseout_fp_circles(
    node: d3.BaseType | SVGFEFuncRElement,
    self_in: CompanyPricingChart,
    mouseEvent: any
  ) {
    // circle color white
    d3.select(node).transition().duration(200).style("fill", "white");

    self_in._hide_html_tooltip();
  }

  private _mousemove_fp_circles(
    node: d3.BaseType | SVGFEFuncRElement,
    self_in: CompanyPricingChart,
    mouseEvent: any
  ) {
    // get data
    let d = d3.select(node).data()[0];

    d3.select(node).style("fill", "black");

    self_in._update_html_tooltip(mouseEvent.pageX, mouseEvent.pageY);
  }

  private _getFairPCircleSize(circleCount: number) {
    let cr = 100 / circleCount; // resp
    if (cr > 4) cr = 4;
    if (cr < 1) cr = 1;
    return cr;
  }

  public ToggleFairPriceType(fairp_type: FairPriceType) {
    let self = this;

    if (self.fairp_type != fairp_type) {
      if (
        fairp_type == "fairp_type_industrial" &&
        self.fair_prices_ind!.length == 0
      ) {
        alert(
          // !!!
          "Industrial fair price cannot be shown, no calculated industrial fair price data available"
        );
        return;
      }

      self._get_fair_price_data_source(fairp_type);
      // enter() helyett joinok ???
      self._update_fair_price_and_hds_areas();
    }
  }

  // -------------- last price labels ---------------------
  private _initLastPriceLabels() {
    let self = this;

    // last price label
    self.label_lastp = self.mainChartSvgNode
      .append("g")
      .attr("id", "pricing-chart-label-lastp")
      .attr("opacity", 1)
      .attr("pointer-events", "none");

    let text_lastp = self.label_lastp
      .append("text")
      .attr("id", "pricing-chart-label-lastp-text")
      .attr("x", 0)
      .attr("y", -5)
      .attr("text-anchor", "start")
      .style("padding", 1)
      .style("filter", "url(#textBackground)");

    // fairp label
    self.label_fairp = self.mainChartSvgNode
      .append("g")
      .attr("id", "pricing-chart-label-fairp")
      .attr("opacity", 1)
      .attr("pointer-events", "none");

    let text_fairpp = self.label_fairp
      .append("text")
      .attr("id", "pricing-chart-label-fairp-text")
      .attr("x", 0)
      .attr("y", -5)
      .attr("text-anchor", "start")
      .style("padding", 1)
      .style("filter", "url(#textBackground)");
  }

  private _update_last_price_labels() {
    let self = this;

    // draw last price label
    const lastData = self.hds_filtered![self.hds_filtered!.length - 1];
    let lastp = lastData.value;
    const lastDate = lastData.date;
    self
      .label_lastp!.datum({ date: lastDate, value: lastp })
      .attr(
        "transform",
        `translate(${self.x!(lastDate) + self.inputs_json.size.margins.left},${
          self.y!(lastp) + self.inputs_json.size.margins.top
        })`
      )
      .select("text")
      .text(self._formatNumber(lastp));

    self.showed_prices
      ? self._showElement(self.label_lastp!)
      : self._hideElement(self.label_lastp!);

    // draw last fairp label
    //let last_fp = self.fair_prices[self.fair_prices.length - 1].value;
    if (self.lastFitFairP > 0) {
      self
        .label_fairp!.datum({ date: lastDate, value: self.lastFitFairP })
        .attr(
          "transform",
          `translate(${
            self.x!(lastDate) + self.inputs_json.size.margins.left
          },${self.y!(self.lastFitFairP) + self.inputs_json.size.margins.top})`
        )
        .select("text")
        .text(self._formatNumber(self.lastFitFairP));

      self.showed_prices && self.lastFqDateExceeded
        ? self._showElement(self.label_fairp!)
        : self._hideElement(self.label_fairp!);
    }
  }

  private _getMousePosAtElement(event: MouseEvent)
  {
    const self = this;

    // get main svg node, dims
    const mainSvgNode = self.mainChartSvgNode.node()
    const mainSvgPxDims = mainSvgNode!.getBoundingClientRect();

    // mouse px position relative to main svg 
    const mousePosSvgPxX = event.clientX - mainSvgPxDims!.x; // mainSvgNode.clientX?
    const mousePosSvgPxY= event.clientY - mainSvgPxDims!.y; // mainSvgNode.clientY?

    // svg viewbox width, height
    const mainSvgViewBox = mainSvgNode!.getAttribute("viewBox")!.split(" ");
    const mainSvgViewBoxWidth = parseFloat(mainSvgViewBox[2]);
    const mainSvgViewBoxHeight = parseFloat(mainSvgViewBox[3]);

    // px -> viewbox pos
    const svgMouseX = (mousePosSvgPxX / mainSvgPxDims.width) * (mainSvgViewBoxWidth);
    const svgMouseY = (mousePosSvgPxY / mainSvgPxDims.height) * (mainSvgViewBoxHeight);
    
    return { x: svgMouseX, y: svgMouseY };
  }

  private _show_price_tooltip(
    price_type_text: string,
    node_obj: SVGPathElement,
    mouseEvent: MouseEvent
  ) {
    let self = this;
    let line = d3.select(node_obj);
    let lineNode = line.node();

    const mouseSvgXY = self._getMousePosAtElement(mouseEvent); 

    // search for y line chart area coordinate from x chart koord
    let pos = self._getYForLine(lineNode!, mouseSvgXY.x - self.inputs_json.size.margins.left);

    //set tooltip axes rulers positions
    self
      .tooltip!.select("#tooltip-line-x")
      .attr("x2", (mouseSvgXY.x * -1.0) + self.inputs_json.size.margins.left)
      .attr("y2", 0);
    self
      .tooltip!.select("#tooltip-line-y")
      .attr("x2", 0)
      .attr("y2", self.inputs_json.size.height - pos.y);

    // set tooltip axes text positions
    self
      .tooltip!.select("#tooltip-axis-x-text")
      .attr("x", (mouseSvgXY.x * -1) + self.inputs_json.size.margins.left) // itt az aktív y tengely kell pld. barok esetén !!!
      .text(d3.format("~s")(self.y!.invert(pos.y))); //  y text

    self
      .tooltip!.select("#tooltip-axis-y-text")
      .attr("y", self.inputs_json.size.height - pos.y)
      .text(self.x!.invert(mouseSvgXY.x - self.inputs_json.size.margins.left).toISOString().split("T")[0]); // date text

    self.tooltip!.select("#tooltip-text").text(price_type_text);

    // update tooltip position
    self.tooltip!.attr(
      "transform",
      `translate(${mouseSvgXY.x},${
        pos.y + self.inputs_json.size.margins.top
      })`
    );
  }

  public ShowHidePrices(is_show: boolean) {
    let self = this;

    // show
    if (is_show) {
      self._showElement(d3.selectAll(".hds_area"), 1.0);
      self._showElement(self.line_hds_svg!);
      d3.select("#line_hds_helper").style("display", "inline");
      d3.select("#line_fair_p_helper").style("display", "inline");
      self._showElement(d3.select("#line_fair_p"), 1.0);
      self._showElement(d3.selectAll(".fair_p_circles"), 1.0);
      self._showElement(self.fairp_curr_circle!, 1.0);
      self._showElement(self.label_lastp!);

      if (self.lastFqDateExceeded) {
        self._showElement(d3.select("#line_fair_p_current"), 1.0);
        self._showElement(d3.select("#fair_p_circle_current"), 1.0);
        self._showElement(self.label_fairp!, 1.0);
      }

      self.showed_prices = true;
    }
    // hide
    else {
      self._hideElement(d3.selectAll(".hds_area"));
      self._hideElement(self.line_hds_svg!);
      d3.select("#line_hds_helper").style("display", "none");
      d3.select("#line_fair_p_helper").style("display", "none");
      self._hideElement(d3.select("#line_fair_p"));
      self._hideElement(d3.selectAll(".fair_p_circles"));
      self._hideElement(d3.select("#line_fair_p_current"));
      self._hideElement(d3.select("#fair_p_circle_current"));
      self._hideElement(self.label_lastp!);
      self._hideElement(self.label_fairp!);
      self.showed_prices = false;
    }
  }

  // ------------------- bar charts --------------------

  private _init_bar_chart(
    chart_id: BarChartId,
    x_y_axes: AxesBarCharts,
    y_axis_label_text: string,
    y_format_func: (d: number) => string
  ) {
    let self = this;

    // x scale
    let x_scale_def_ref = d3
      .scaleBand<Date>()
      .range([0, self.inputs_json.size.width])
      .paddingInner(0.3)
      .paddingOuter(0.2);
    // .align(0.3) ???

    let y_scale_def_ref = d3
      .scaleLinear()
      .range([self.inputs_json.size.height, 0]);
    y_scale_def_ref.tickFormat(6, ".0%");
    let y_axis_svg_def = d3.axisLeft(y_scale_def_ref).ticks(6);

    let y_axis_id = `y_axis_${chart_id}`;
    let y_axis_svg_obj = self.g
      .append("g")
      .attr("class", "y_axis")
      .attr("id", y_axis_id)
      .attr("opacity", 0);

    y_axis_svg_obj
      .append("text")
      .attr("class", "y_axis_label")
      .attr("id", `${y_axis_id}_label`)
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", (self.inputs_json.size.height / 2) * -1)
      .attr("font-size", self.inputs_json.size.width * 0.02)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(y_axis_label_text);

    x_y_axes.xAxisDef = x_scale_def_ref;
    x_y_axes.yAxisDef = y_scale_def_ref;
    x_y_axes.yAxisSvgDef = y_axis_svg_def;
    x_y_axes.yAxisSvgObj = y_axis_svg_obj;
  }

  private _update_bar_chart(
    chart_id: BarChartId,
    bar_data: StandardDataStructDateElement[],
    x_y_axes: AxesBarCharts,
    bar_grow_color: string,
    bar_loss_color: string,
    show_chart_cond: boolean,
    tooltip_text: string,
    y_format_func: (d: d3.NumberValue) => string
  ) {
    let self = this;

    let x_scale_def_ref = x_y_axes.xAxisDef;
    let y_scale_def_ref = x_y_axes.yAxisDef;
    let y_axis_svg_def = x_y_axes.yAxisSvgDef;
    let y_axis_svg_obj = x_y_axes.yAxisSvgObj;

    x_scale_def_ref!.domain(bar_data.map((d) => d.date));
    y_scale_def_ref!.domain(
      self._getScaleCorrRange([
        d3.min(bar_data, (d) => d.value)!,
        d3.max(bar_data, (d) => d.value)!,
      ])
    );

    y_axis_svg_def!.scale(y_scale_def_ref!);
    y_axis_svg_obj!.transition().call(y_axis_svg_def!);

    let zeroLine = d3.min(bar_data, (d) => d.value)!;
    zeroLine = zeroLine > 0 ? zeroLine : 0;

    d3.select(`#g_${chart_id}`)
      .selectAll(`.${chart_id}_bars`)
      .data(bar_data)
      .join("rect")
      .attr("class", `barchart_bars ${chart_id}_bars`)
      .attr("stroke", (d) => (d.value > 0 ? bar_grow_color : bar_loss_color))
      .attr("stroke-width", 0.02 * x_scale_def_ref!.bandwidth())
      .attr("pointer-events", () => (self.show_dw ? "none" : "all"))
      .attr("fill", (d) => (d.value > 0 ? bar_grow_color : bar_loss_color))
      .attr("visibility", () => (show_chart_cond ? "visible" : "hidden"))
      .style("display", () => (show_chart_cond ? "inline" : "none"))
      .on("mouseover", function (mouseEvent) {
        let d = d3.select(this).data()[0] as StandardDataStructDateElement;
        self._mouseover_bars(
          this as SVGRectElement,
          self,
          mouseEvent,
          `y_axis_${chart_id}`,
          tooltip_text,
          d.date,
          y_format_func(d.value)
        );
      })
      .on("mouseout", function (mouseEvent) {
        let d = d3.select(this).data()[0] as StandardDataStructDateElement;
        self._mouseout_bars(
          this as SVGRectElement,
          self,
          mouseEvent,
          `y_axis_${chart_id}`,
          d.value > 0 ? bar_grow_color : bar_loss_color,
          1.0
        );
      })
      .on("mousemove", function (mouseEvent) {
        let d = d3.select(this).data()[0] as StandardDataStructDateElement;
        self._show_bars_tooltip(
          tooltip_text,
          d.date,
          y_format_func(d.value), // !!! , (d.value * 100).toFixed(2) + "%", self._formatNumber(d.value)
          mouseEvent,
          self
        );
      })
      .transition()
      .attr("opacity", () => (show_chart_cond ? 1.0 : 0))
      .attr("y", (d) =>
        d.value > 0 ? y_scale_def_ref!(d.value) : y_scale_def_ref!(zeroLine)
      )
      .attr("x", (d) => x_scale_def_ref!(d.date)!)
      .attr("width", x_scale_def_ref!.bandwidth)
      .attr("height", (d) =>
        Math.abs(y_scale_def_ref!(zeroLine) - y_scale_def_ref!(d.value))
      );

    x_y_axes.xAxisDef = x_scale_def_ref;
    x_y_axes.yAxisDef = y_scale_def_ref;
    x_y_axes.yAxisSvgDef = y_axis_svg_def;
    x_y_axes.yAxisSvgObj = y_axis_svg_obj;
  }

  private _show_bars_tooltip(
    name: string,
    date: Date,
    valStr: string,
    mouseEvent: any,
    self_in: CompanyPricingChart
  ) {
    // assign metric name, date, value to tooltip element
    d3.select("#tooltip-bars-text-name").text(name);
    d3.select("#tooltip-bars-text-date").text(date.toISOString().split("T")[0]);
    d3.select("#tooltip-bars-text-value").text(valStr);

    const mouseSvgXY = self_in._getMousePosAtElement(mouseEvent); 

    // set tooltip location
    let tooltip_bars = d3
      .select("#tooltip_bars")
      .attr(
        "transform",
        `translate(${mouseSvgXY.x},${mouseSvgXY.y})`
      );

    self_in._showElement(tooltip_bars, 1.0, 200);
  }

  private _mouseout_bars(
    node_obj: SVGRectElement,
    self_in: CompanyPricingChart,
    mouseEvent: any,
    y_axis_svg_obj_id: string,
    bars_color: string,
    bars_opacity: number
  ) {
    let bar = d3.select(node_obj);

    // make original color
    bar.transition().attr("fill", bars_color).attr("opacity", bars_opacity);

    // hide axis
    d3.select(`#${y_axis_svg_obj_id}`).transition().attr("opacity", 0);
    self_in.yAxis!.transition().attr("opacity", 1.0);

    // hide tooltip
    self_in._hideElement(d3.select("#tooltip_bars"));
  }

  private _mouseover_bars(
    node_obj: SVGRectElement,
    self_in: CompanyPricingChart,
    mouseEvent: any,
    y_axis_svg_obj_id: string,
    tooltip_text: string,
    date: Date,
    value: string
  ) {
    let bar = d3.select(node_obj);

    // current bar darker and opacity 1
    let darkerColor = d3.color(bar.attr("fill"))!.darker().formatHex();
    bar.transition().attr("fill", darkerColor); //.attr("opacity", 1.0);, ha 0.3 az opacity

    // show axis
    d3.selectAll(".y_axis").transition().attr("opacity", 0);
    d3.select(`#${y_axis_svg_obj_id}`).transition().attr("opacity", 1.0);

    // tooltip
    self_in._show_bars_tooltip(tooltip_text, date, value, mouseEvent, self_in);
  }

  public ManageBars(
    subchart_id: SubChartType,
    is_show: boolean,
    show_perc: boolean
  ) {
    let self = this;

    switch (subchart_id) {
      case "rev":
        self.showed_rev_bars = is_show;
        self.showed_rev_perc_bars = show_perc;
        break;
      case "fcf_rollsum":
        self.showed_fcf_roll_bars = is_show;
        self.showed_fcf_roll_perc_bars = show_perc;
        break;
      case "nics_rollsum":
        self.showed_nics_roll_bars = is_show;
        self.showed_nics_roll_perc_bars = show_perc;
        break;
      case "ebitda_rollsum":
        self.showed_ebitda_roll_bars = is_show;
        self.showed_ebitda_roll_perc_bars = show_perc;
        break;
      default:
        break;
    }

    // show rev bars hide rev%
    if (is_show && !show_perc) {
      self._showElement(d3.selectAll(`.${subchart_id}_bar_chart_bars`), 1.0);
      self._hideElement(d3.selectAll(`.${subchart_id}_perc_bar_chart_bars`));
    }

    // hide rev bars show rev%
    if (is_show && show_perc) {
      self._hideElement(d3.selectAll(`.${subchart_id}_bar_chart_bars`));
      self._showElement(d3.selectAll(`.${subchart_id}_perc_bar_chart_bars`));
    }

    // hide both
    if (!is_show) {
      self._hideElement(d3.selectAll(`.${subchart_id}_bar_chart_bars`));
      self._hideElement(d3.selectAll(`.${subchart_id}_perc_bar_chart_bars`));
    }
  }

  public ShowHideBookValSubChart(is_show: boolean) {
    let self = this;

    self.showed_bookval_bars = is_show;

    if (is_show) self._showElement(d3.selectAll(".bookval_bar_chart_bars"));
    else self._hideElement(d3.selectAll(".bookval_bar_chart_bars"));
  }

  public ShowHideSharesOutstanding(is_show: boolean) {
    let self = this;

    if (is_show) {
      self._showElement(d3.selectAll(".so_bar_chart_bars"), 1.0);
      self.showed_so_bars = true;
    } else {
      self._hideElement(d3.selectAll(".so_bar_chart_bars"));
      self.showed_so_bars = false;
    }
  }

  // ---------------fcf stacked chart ------------------

  private _init_fcf_stacked_chart() {
    let self = this;

    // x axes
    self.x_axis_def_fcf_stacked_ncfo = d3
      .scaleBand<Date>()
      .range([0, self.inputs_json.size.width])
      .paddingInner(0.3) //resp
      .paddingOuter(0.2);

    self.x_axis_def_fcf_stacked_capex = d3
      .scaleBand<Date>()
      .range([0, self.inputs_json.size.width])
      .paddingInner(0.3) //resp
      .paddingOuter(0.2);

    self.y_axis_def_fcf_stacked = d3
      .scaleLinear()
      .range([self.inputs_json.size.height, 0]);
    self.y_axis_def_fcf_stacked.tickFormat(6, "~s");

    self.y_axis_svg_def_fcf_stacked = d3
      .axisLeft(self.y_axis_def_fcf_stacked)
      .ticks(6);

    self.y_axis_svg_obj_fcf_stacked = self.g
      .append("g")
      .attr("class", "y_axis")
      .attr("id", `y_axis_fcf_stacked`)
      .attr("opacity", 0);

    self.y_axis_svg_obj_fcf_stacked
      .append("text")
      .attr("class", "y_axis_label")
      .attr("id", "y_axis_label_fcf_stacked")
      .attr("transform", "rotate(-90)")
      .attr("y", -50) //resp
      .attr("x", (self.inputs_json.size.height / 2) * -1)
      .attr("font-size", self.inputs_json.size.width * 0.02)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Cash flow");

    self.line_def_fcf_stacked = d3
      .line<StandardDataStructDateElement>()
      .x((d) => {return (self.x_axis_def_fcf_stacked_ncfo!(d.date)! + (self.x_axis_def_fcf_stacked_ncfo!.bandwidth()/2))}) 
      .y((d) => self.y_axis_def_fcf_stacked!(d.value));

    //self.y_axis_svg_obj_fcf_stacked.call(self.y_axis_svg_def_fcf_stacked);
  }

  private _update_fcf_stacked_chart() {
    let self = this;

    // x axis
    self.x_axis_def_fcf_stacked_ncfo!.domain(
      self.fcf_stacked_data_ncfo_data!.map((d) => d.date)!
    );
    self.x_axis_def_fcf_stacked_capex!.domain(
      self.fcf_stacked_data_capex_data!.map((d) => d.date)!
    );

    // y axis
    self.y_axis_def_fcf_stacked!.domain(
      self._getScaleCorrRange([
        d3.min(self.fcf_stacked_data_capex_data!, (d) => d.value)!,
        d3.max(self.fcf_stacked_data_ncfo_data!, (d) => d.value)!,
      ])
    );

    self.y_axis_svg_def_fcf_stacked!.scale(self.y_axis_def_fcf_stacked!);
    self
      .y_axis_svg_obj_fcf_stacked!.transition()
      .call(self.y_axis_svg_def_fcf_stacked!);

    //const subgroups = ["ncfo", "capex"];
    //const stackedData = d3.stack().keys(subgroups)(self.fcf_stacked_data);
    //stackedData.forEach((arr, i) => arr.forEach((d, i2) => (d.key = arr.key)));

    // const color = d3
    //   .scaleOrdinal()
    //   .domain(subgroups)
    //   .range(["#e41a1c", "#377eb8"]);

    // ncfo bars
    d3.select("#g_fcf_stacked_chart")
      .selectAll(".fcf_stacked_chart_ncfo_bars")
      .data(self.fcf_stacked_data_ncfo_data!)
      .join("rect")
      .attr(
        "class",
        "barchart_bars barchart_bars fcf_stacked_chart_bars fcf_stacked_chart_ncfo_bars"
      )
      .attr("id", "fcf_stacked_chart_ncfo_bars")
      .attr(
        "stroke",
        d3
          .color(self.inputs_json.apperance.mainChart.fcfStackedBars.colorNcfo)!
          .darker()
          .formatHex()
      )
      .attr(
        "stroke-width",
        0.02 * self.x_axis_def_fcf_stacked_ncfo!.bandwidth()
      )
      .attr(
        "fill",
        self.inputs_json.apperance.mainChart.fcfStackedBars.colorNcfo
      )
      .attr("pointer-events", () => (self.show_dw ? "none" : "all"))
      .attr("visibility", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? "visible"
          : "hidden"
      )
      .style("display", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? "inline"
          : "none"
      )
      .on("mouseover", function (mouseEvent) {
        if (self.showed_fcf_stacked_chart) {
          let d = d3.select(this).data()[0] as StandardDataStructDateElement;
          self._mouseover_bars(
            this as SVGRectElement,
            self,
            mouseEvent,
            "y_axis_fcf_stacked",
            "Net Cash Flow From Operation",
            d.date,
            self._formatNumber(d.value)
          );
        }
      })
      .on("mouseout", function (mouseEvent) {
        if (self.showed_fcf_stacked_chart) {
          self._mouseout_bars(
            this as SVGRectElement,
            self,
            mouseEvent,
            "y_axis_fcf_stacked",
            self.inputs_json.apperance.mainChart.fcfStackedBars.colorNcfo,
            self.inputs_json.apperance.mainChart.fcfStackedBars.opacity
          );
        }
      })
      .on("mousemove", function (mouseEvent) {
        if (self.showed_fcf_stacked_chart) {
          let d = d3.select(this).data()[0] as StandardDataStructDateElement;
          self._show_bars_tooltip(
            "Net Cash Flow From Operation",
            d.date,
            self._formatNumber(d.value),
            mouseEvent,
            self
          );
        }
      })
      .transition()
      .attr("opacity", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? self.inputs_json.apperance.mainChart.fcfStackedBars.opacity
          : 0
      )
      .attr("y", (d) =>
        d.value > 0
          ? self.y_axis_def_fcf_stacked!(d.value)
          : self.y_axis_def_fcf_stacked!(0)
      )
      .attr("x", (d) => self.x_axis_def_fcf_stacked_ncfo!(d.date)!)
      .attr("width", self.x_axis_def_fcf_stacked_ncfo!.bandwidth)
      .attr("height", (d) =>
        Math.abs(
          self.y_axis_def_fcf_stacked!(0) -
            self.y_axis_def_fcf_stacked!(d.value)
        )
      );

    // capex bars
    d3.select("#g_fcf_stacked_chart")
      .selectAll(".fcf_stacked_chart_capex_bars")
      .data(self.fcf_stacked_data_capex_data!)
      .join("rect")
      .attr(
        "class",
        "barchart_bars fcf_stacked_chart_bars fcf_stacked_chart_capex_bars"
      )
      .attr("id", "fcf_stacked_chart_capex_bars")
      .attr(
        "stroke",
        d3
          .color(
            self.inputs_json.apperance.mainChart.fcfStackedBars.colorCapex
          )!
          .darker()
          .formatHex()
      )
      .attr(
        "stroke-width",
        0.02 * self.x_axis_def_fcf_stacked_capex!.bandwidth()
      )
      .attr(
        "fill",
        self.inputs_json.apperance.mainChart.fcfStackedBars.colorCapex
      )
      .attr("pointer-events", () => (self.show_dw ? "none" : "all"))
      .attr("visibility", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? "visible"
          : "hidden"
      )
      .style("display", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? "inline"
          : "none"
      )
      .on("mouseover", function (mouseEvent) {
        if (self.showed_fcf_stacked_chart) {
          let d = d3.select(this).data()[0] as StandardDataStructDateElement;
          self._mouseover_bars(
            this as SVGRectElement,
            self,
            mouseEvent,
            "y_axis_fcf_stacked",
            "Capital Expenses",
            d.date,
            self._formatNumber(d.value)
          );
        }
      })
      .on("mouseout", function (mouseEvent) {
        if (self.showed_fcf_stacked_chart) {
          self._mouseout_bars(
            this as SVGRectElement,
            self,
            mouseEvent,
            "y_axis_fcf_stacked",
            self.inputs_json.apperance.mainChart.fcfStackedBars.colorCapex,
            self.inputs_json.apperance.mainChart.fcfStackedBars.opacity
          );
        }
      })
      .on("mousemove", function (mouseEvent) {
        if (self.showed_fcf_stacked_chart) {
          let d = d3.select(this).data()[0] as StandardDataStructDateElement;
          self._show_bars_tooltip(
            "Capital Expenses",
            d.date,
            self._formatNumber(d.value),
            mouseEvent,
            self
          );
        }
      })
      .transition()
      .attr("opacity", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? self.inputs_json.apperance.mainChart.fcfStackedBars.opacity
          : 0
      )
      .attr("y", (d) =>
        d.value > 0
          ? self.y_axis_def_fcf_stacked!(d.value)
          : self.y_axis_def_fcf_stacked!(0)
      )
      .attr("x", (d) => self.x_axis_def_fcf_stacked_capex!(d.date)!)
      .attr("width", self.x_axis_def_fcf_stacked_capex!.bandwidth)
      .attr("height", (d) =>
        Math.abs(
          self.y_axis_def_fcf_stacked!(0) -
            self.y_axis_def_fcf_stacked!(d.value)
        )
      );

    // ncfo - capex diff line
    d3.select("#fcf_stacked_chart_line").remove();
    self.line_svg_obj_fcf_stacked = d3
      .select("#g_fcf_stacked_chart")
      .append("path")
      .data([self.fcf_stacked_line_data!])
      .attr("class", "fcf_stacked_chart_line")
      .attr("id", "fcf_stacked_chart_line")
      .attr("stroke", "black")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("pointer-events", "none")
      .attr("visibility", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? "visible"
          : "hidden"
      )
      .style("display", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? "inline"
          : "none"
      )
      .attr("opacity", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? 1.0
          : 0
      );

    self
      .line_svg_obj_fcf_stacked!.transition()
      .attr("d", (d) => self.line_def_fcf_stacked!(d));

    // ncfo - capex diff circles
    let cr = self._getFairPCircleSize(self.fcf_stacked_line_data!.length);
    self.circles_svg_obj_fcf_stacked = d3
      .select("#g_fcf_stacked_chart_circles")
      .selectAll(".fcf_stacked_chart_circles")
      .data(self.fcf_stacked_line_data!)
      .join("circle")
      .attr("class", "fcf_stacked_chart_circles")
      .style("fill", "white")
      .attr("stroke", "black")
      .attr("pointer-events", () => (self.show_dw ? "none" : "all"))
      .attr("visibility", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? "visible"
          : "hidden"
      )
      .style("display", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? "inline"
          : "none"
      )
      .attr("opacity", () =>
        self.showed_fcf_stacked_chart && self.chartType == "ct_pricing_fcf"
          ? 1.0
          : 0
      )
      .on("mouseover", function (mouseEvent) {
        let d = d3.select(this).data()[0] as StandardDataStructDateElement;

        let txt = `
        <span>Free Cash Flow</span>
        <span>${new Date(d.date).toISOString().split("T")[0]}</span>
        <span>${self._formatNumber(d.value)}</span>`;

        self._mouseover_fp_circles(
          d3.select(this).node(),
          self,
          mouseEvent,
          txt
        );
      })
      .on("mouseout", function (mouseEvent) {
        self._mouseout_fp_circles(d3.select(this).node(), self, mouseEvent);
      })
      .on("mousemove", function (mouseEvent) {
        self._mousemove_fp_circles(d3.select(this).node(), self, mouseEvent);
      });

    const bandwidth = self.x_axis_def_fcf_stacked_ncfo!.bandwidth();

    self.circles_svg_obj_fcf_stacked
      .transition()
      .attr("cx", (d) => (self.x_axis_def_fcf_stacked_ncfo!(d.date)!) + bandwidth/2)
      .attr("cy", (d) => self.y_axis_def_fcf_stacked!(d.value))
      .attr("r", cr);

    // ---------------
    // d3.select("#g_fcf_stacked_chart")
    //   .selectAll("g")
    //   .data(stackedData)
    //   .join("g")
    //   .selectAll("rect")
    //   .data((d) => d)
    //   .join("rect")
    //   .attr("class", "fcf_stacked_chart_bars")
    //   .attr("fill", (d) => color(d.key))
    //   .attr("stroke", (d) => d3.color(color(d.key)).darker())
    //   .attr("stroke-width", 0.02 * self.x_axis_def_fcf_stacked.bandwidth())
    //   .attr("pointer-events", () => (self.show_dw ? "none" : "all"))
    //   .attr("visibility", () =>
    //     self.showed_fcf_stacked_chart ? "visible" : "hidden"
    //   )
    //   .style("display", () =>
    //     self.showed_fcf_stacked_chart ? "inline" : "none"
    //   )

    //   .on("mouseover", function (mouseEvent) {
    //     let d = d3.select(this).data()[0];
    //     self._mouseover_bars(
    //       this,
    //       self,
    //       mouseEvent,
    //       "y_axis_fcf_stacked",
    //       d.key,
    //       d.data.group,
    //       self._formatNumber(d[1])
    //     );
    //   })
    //   .on("mouseout", function (mouseEvent) {
    //     let d = d3.select(this).data()[0];
    //     self._mouseout_bars(
    //       this,
    //       self,
    //       mouseEvent,
    //       "y_axis_fcf_stacked",
    //       color(d.key),
    //       1.0
    //     );
    //   })
    //   .on("mousemove", function (mouseEvent) {})
    //   .transition()
    //   .attr("opacity", () => (self.showed_fcf_stacked_chart ? 1.0 : 0))
    //   .attr("x", (d) => self.x_axis_def_fcf_stacked(d.data.group))
    //   .attr("y", (d) => self.y_axis_def_fcf_stacked(d[1]))
    //   .attr("height", (d, i) => {
    //     let h =
    //       self.y_axis_def_fcf_stacked(d[0]) - self.y_axis_def_fcf_stacked(d[1]);
    //     console.log(`i ${i} h ${h}`); // - a jó
    //     return h;
    //   })
    //   .attr("width", self.x_axis_def_fcf_stacked.bandwidth);
  }

  public ShowHideFcfStackedChart(is_show: boolean) {
    let self = this;

    if (is_show) {
      self._showElement(d3.selectAll(".fcf_stacked_chart_bars"));
      self._showElement(self.line_svg_obj_fcf_stacked!);
      self._showElement(self.circles_svg_obj_fcf_stacked!);
      self.showed_fcf_stacked_chart = true;
    } else {
      self._hideElement(d3.selectAll(".fcf_stacked_chart_bars"));
      self._hideElement(self.line_svg_obj_fcf_stacked!);
      self._hideElement(self.circles_svg_obj_fcf_stacked!);
      self.showed_fcf_stacked_chart = false;
    }
  }

  // -------------- recession bars -------------

  private _filterRecessionDates(chart_from: Date, chart_to: Date) {
    let self = this;
    self.recessionDatesFiltered = self.recessionDates.map((d) => {
      let from = d!.from;
      let to = d!.to;

      // recession falls outside of chart dates range
      if (chart_from > to) return undefined;

      if (chart_to < from) return undefined;

      // recession 100% overlaps chart date
      if (chart_from > from && to > chart_to)
        return { from: chart_from, to: chart_to, desc: d!.desc };

      // regular case
      if (chart_from <= from && to <= chart_to)
        return { from: from, to: to, desc: d!.desc };

      // recesion is partially in chart
      if (from < chart_from && to > chart_from)
        return { from: chart_from, to: to, desc: d!.desc };

      if (from < chart_to && to > chart_to)
        return { from: from, to: chart_to, desc: d!.desc };

      return undefined;
    });
    self.recessionDatesFiltered = self.recessionDatesFiltered.filter(
      (d) => d != undefined
    );
  }

  private _initRecessionBars() {
    let self = this;

    self.x_rec_bars = d3.scaleTime().range([0, self.inputs_json.size.width]);
  }

  private _updateRecessionBars() {
    let self = this;

    self.x_rec_bars!.domain([self.chart_start!, self.chart_end!]);

    // let bar_y_pos = self.y_so_bar(d3.max(self.soData, (d) => d.value));
    let bar_y_pos = 0;

    self.rec_bars_svg = d3
      .select("#g_rec_bars")
      .selectAll(".rec_bars")
      .data(self.recessionDatesFiltered!)
      .join("rect")
      .attr("class", "rec_bars")
      .attr(
        "stroke",
        self.inputs_json.apperance.mainChart.recessionBars.colorStroke
      )
      .attr(
        "stroke-width",
        self.inputs_json.apperance.mainChart.recessionBars.widthBarBorder
      )
      .attr("fill", self.inputs_json.apperance.mainChart.recessionBars.color)
      .attr("visibility", () =>
        self.recessionDatesFiltered!.length > 0 ? "visible" : "hidden"
      )
      .style("display", () =>
        self.recessionDatesFiltered!.length > 0 ? "inline" : "none"
      )
      .attr("pointer-events", () => (self.show_dw ? "none" : "all"))
      .on("mouseover", function (mouseEvent) {
        if (!self.show_dw) {

          // get bar obj and data
          let bar = d3.select(this);
          let d = bar.data()[0] as CompanyPricingChartRecessionDatesElement;
          
          // make bar darker
          const darkerColor = d3.color(bar.attr("fill"))!.darker().formatHex();
          bar.transition().attr("fill", darkerColor);
          
          // set tooltip texts
          d3.select("#tooltip-rec-text-name").text(d!.desc);
          d3.select("#tooltip-rec-text-dates").text(
            `${d!.from.toISOString().split("T")[0]} - ${
              d!.to.toISOString().split("T")[0]
            }`
          );

          const mouseSvgXY = self._getMousePosAtElement(mouseEvent); 

          // set tooltip position
          self.tooltip_rec!.attr(
            "transform",
            `translate(${mouseSvgXY.x},${mouseSvgXY.y})`
          );

          self._showElement(self.tooltip_rec!, 1.0, 200);
        }
      })
      .on("mouseout", function (mouseEvent) {
        let bar = d3.select(this);
        bar
          .transition()
          .attr(
            "fill",
            self.inputs_json.apperance.mainChart.recessionBars.color
          )
          .attr(
            "opacity",
            self.inputs_json.apperance.mainChart.recessionBars.opacity
          );

        // hide tooltip
        self._hideElement(self.tooltip_rec!);
      })
      .on("mousemove", function (mouseEvent) {})
      .transition()
      .attr("opacity", () =>
        self.recessionDatesFiltered!.length > 0
          ? self.inputs_json.apperance.mainChart.recessionBars.opacity
          : 0
      )
      .attr("y", (d) => bar_y_pos)
      .attr("x", (d) => self.x_rec_bars!(d!.from))
      .attr("width", (d) => self.x_rec_bars!(d!.to) - self.x_rec_bars!(d!.from))
      .attr("height", (d) => self.inputs_json.size.height - bar_y_pos);
  }

  private _initRecessionTooltip() {
    let self = this;

    self.tooltip_rec = self.mainChartSvgNode
      .append("g")
      .attr("id", "tooltip-rec")
      .attr("opacity", 0)
      .attr("pointer-events", "none");

    let text_rec = self.tooltip_rec
      .append("text")
      .attr("id", "tooltip-rec-text")
      .attr("x", 0)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("padding", 1)
      .style("filter", "url(#textBackground)");

    text_rec
      .append("tspan")
      .attr("id", "tooltip-rec-text-name")
      .attr("x", 0)
      .attr("dy", "1.2em");

    text_rec
      .append("tspan")
      .attr("id", "tooltip-rec-text-dates")
      .attr("x", 0)
      .attr("dy", "1.2em");
  }

  // -------------- data window ----------------

  private _initDataWindowHelperRect() {
    let self = this;

    // add rect to catch mouse move events
    self.g
      .append("rect")
      .attr("id", "data_window_overlay")
      .attr("width", this.inputs_json.size.width)
      .attr("height", this.inputs_json.size.height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseout", function (mouseEvent) {
        // hide data window tooltip
        self
          .tooltip_dw!.transition()
          .duration(200)
          .attr("opacity", 0)
          .attr("visibility", "hidden");
        self.showed_dw = false;
      })
      .on("mouseenter", function (mouseEvent) {
        if (self.show_dw && !self.showed_dw) {
          // show data window tooltip
          self
            .tooltip_dw!.transition()
            .duration(200)
            .attr("opacity", 1.0)
            .attr("visibility", "visible");
        }
        self.showed_dw = true;
      })
      .on("mousemove", function (mouseEvent) {
        if (self.show_dw && self.showed_dw) {
          
          const mouseSvgXY = self._getMousePosAtElement(mouseEvent);

          // get pixel values
          let xPix = mouseEvent.offsetX - self.inputs_json.size.margins.left;
          let yPix = mouseEvent.offsetY - self.inputs_json.size.margins.top;

          xPix = mouseSvgXY.x - self.inputs_json.size.margins.left;
          yPix = mouseSvgXY.y - self.inputs_json.size.margins.top;

          // get dates from pixels
          let date = self.x_rec_bars!.invert(xPix);
          let date_str = date.toISOString().split("T")[0];

          self
            .tooltip_dw!.select("#tooltip-dw-text-date")
            .text(`Date: ${date_str}`);

          // get data to show
          self._getDataAndShow(
            self.hds_filtered!,
            date,
            "hds",
            "Price",
            self._formatNumber
          );
          self._getDataAndShow(
            self.fair_prices!,
            date,
            "fp",
            "Fair price",
            self._formatNumber
          );
          self._getDataAndShow(
            self.soData!,
            date,
            "so",
            "Shares outstanding",
            self._formatNumber
          );

          self._getAndShowChartSpecificData(self.chartType!, date);

          // move data window tooltip position
          self.tooltip_dw!.attr(
            "transform",
            `translate(${xPix},${
              yPix
            })`
          );
        }
      });
  }

  private _createDataWindowTextBox(data_id: string) {
    let self = this;

    self
      .dw_text!.append("tspan")
      .attr("id", `tooltip-dw-text-${data_id}`)
      .attr("x", 0)
      .attr("dy", "1.2em"); //resp
  }

  private _initDataWindowTooltip() {
    let self = this;

    d3.select("#tooltip-dw").remove();
    self.tooltip_dw = self.mainChartSvgNode
      .append("g")
      .attr("id", "tooltip-dw")
      .attr("opacity", 0)
      .attr("pointer-events", "none");

    self.dw_text = self.tooltip_dw
      .append("text")
      .attr("id", "tooltip-dw-text")
      .attr("x", 0)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("padding", 1)
      .style("filter", "url(#textBackground)");

    self._createDataWindowTextBox("date");
    self._createDataWindowTextBox("hds");
    self._createDataWindowTextBox("fp");
    self._createDataWindowTextBox("so");

    // chart specific texts
    self._initChartSpecificDataWindowTooltip(self.chartType!);
  }

  private _initChartSpecificDataWindowTooltip(chart_type: string) {
    let self = this;

    switch (chart_type) {
      case "ct_pricing_sales":
        self._createDataWindowTextBox("rev");
        self._createDataWindowTextBox("rev_perc");
        break;
      case "ct_pricing_fcf":
        self._createDataWindowTextBox("fcf_rollsum");
        self._createDataWindowTextBox("fcf_rollsum_perc");
        self._createDataWindowTextBox("ncfo");
        self._createDataWindowTextBox("capex");
        break;
      case "ct_pricing_earnings":
        self._createDataWindowTextBox("nics_rollsum");
        self._createDataWindowTextBox("nics_rollsum_perc");
        break;
      case "ct_pricing_ebitda":
        self._createDataWindowTextBox("ebitda_rollsum");
        self._createDataWindowTextBox("ebitda_rollsum_perc");
        break;
      case "ct_pricing_bookval":
        self._createDataWindowTextBox("bookVal");
        break;
      default:
        break;
    }
  }

  private _getAndShowChartSpecificData(chart_type: ChartType, date: Date) {
    let self = this;

    switch (chart_type) {
      case "ct_pricing_sales":
        self._getDataAndShow(
          self.revData!,
          date,
          "rev",
          "TTM Revenue",
          self._formatNumber
        );
        self._getDataAndShow(
          self.revPercData!,
          date,
          "rev_perc",
          "TTM Revenue change %",
          self._formatNumberPerc
        );
        break;
      case "ct_pricing_fcf":
        self._getDataAndShow(
          self.fcf_rollsum_data!,
          date,
          "fcf_rollsum",
          "TTM free cash flow",
          self._formatNumber
        );
        self._getDataAndShow(
          self.fcf_rollsum_perc_data!,
          date,
          "fcf_rollsum_perc",
          "TTM free cash flow change %",
          self._formatNumberPerc
        );
        self._getDataAndShow(
          self.fcf_stacked_data_ncfo_data!,
          date,
          "ncfo",
          "Net cash flow from operations",
          self._formatNumber
        );
        self._getDataAndShow(
          self.fcf_stacked_data_capex_data!,
          date,
          "capex",
          "Capital expenses",
          self._formatNumber
        );
        break;
      case "ct_pricing_earnings":
        self._getDataAndShow(
          self.nics_rollsum_data!,
          date,
          "nics_rollsum",
          "TTM net income common stock",
          self._formatNumber
        );
        self._getDataAndShow(
          self.nics_rollsum_perc_data!,
          date,
          "nics_rollsum_perc",
          "TTM net income common stock change %",
          self._formatNumberPerc
        );
        break;
      case "ct_pricing_ebitda":
        self._getDataAndShow(
          self.ebitda_rollsum_data!,
          date,
          "ebitda_rollsum",
          "TTM EBITDA",
          self._formatNumber
        );
        self._getDataAndShow(
          self.ebitda_rollsum_perc_data!,
          date,
          "ebitda_rollsum_perc",
          "TTM EBITDA change %",
          self._formatNumberPerc
        );
        break;
      case "ct_pricing_bookval":
        self._getDataAndShow(
          self.bookValData!,
          date,
          "bookVal",
          "Book value",
          self._formatNumber
        );
        break;
      default:
        break;
    }
  }

  private _getDataAndShow(
    data: StandardDataStructDateElement[],
    date: Date,
    data_key: string,
    label_text: string,
    format_func: (x: number) => string
  ) {
    let self = this;

    // get data
    let value = self._getNearestData(data, date);

    // show in tooltip
    self
      .tooltip_dw!.select(`#tooltip-dw-text-${data_key}`)
      .text(`${label_text}: ${value == undefined ? "-" : format_func(value)}`);
  }

  ToggleDataWindow(is_show: boolean) {
    let self = this;
    self.show_dw = is_show;
    if (self.show_dw) self._disable_mouse_events();
    else self._enable_mouse_events();
  }

  // -------------- date filter -------------------
  private _init_date_filter() {
    const self = this;

    self.dateFilterHeight = self.inputs_json.size.height / 3;

    // size of svg
    const svgWidth =
      self.inputs_json.size.width +
      self.inputs_json.size.margins.left +
      self.inputs_json.size.margins.right;
    const svgHeight =
      self.dateFilterHeight +
      self.inputs_json.size.margins.top +
      self.inputs_json.size.margins.bottom;

    // svg
    self.svgDateFilter = //d3.select(".company-pricing-chart-date-filter")
      //self.dateFilterChartNode!
      d3
        .select(".company-pricing-chart-date-filter")
        .append("svg")
        .attr("id", "pricing-chart-date-filter-svg")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    // svg -> g
    const gDateFilter = self.svgDateFilter!
      .append("g")
      .attr(
        "transform",
        `translate(${self.inputs_json.size.margins.left}, ${self.inputs_json.size.margins.top})`
      );

    // gradient holder bg
    gDateFilter
      .append("rect")
      .attr("id", "pricing-chart-date-filter-bg")
      .attr("width", self.inputs_json.size.width)
      .attr("height", self.dateFilterHeight)
      .attr("fill", "none")
      .attr("pointer-events", "none");

    // tooltip - from, to , duration texts
    self.tooltip_df = self.svgDateFilter
      .append("g")
      .attr("id", "tooltip-df")
      .attr("opacity", 0);

    self.tooltip_df
      .append("text")
      .attr("id", "tooltip-df-from-text")
      .attr("y", self.dateFilterHeight + self.inputs_json.size.margins.top)
      .attr("text-anchor", "middle")
      .style("padding", 1)
      .style("filter", "url(#textBackground)");

    self.tooltip_df
      .append("text")
      .attr("id", "tooltip-df-to-text")
      .attr("y", self.dateFilterHeight + self.inputs_json.size.margins.top)
      .attr("text-anchor", "middle")
      .style("padding", 1)
      .style("filter", "url(#textBackground)");

    self.tooltip_df
      .append("text")
      .attr("id", "tooltip-df-dur-text")
      .attr(
        "y",
        (self.dateFilterHeight +
          self.inputs_json.size.margins.top +
          self.inputs_json.size.margins.bottom) /
          2
      )
      .attr("text-anchor", "middle")
      .style("padding", 1)
      .style("filter", "url(#textBackground)");

    // date filter x, y scales
    self.xDateFilter = d3.scaleTime().range([0, self.inputs_json.size.width]);
    self.xDateFilter.tickFormat(5, "%Y");
    self.yDateFilter = d3.scaleLinear().range([self.dateFilterHeight, 0]);

    // init area obj
    self.dateFilterarea = d3
      .area<StandardDataStructDateElement>()
      .x((d) => self.xDateFilter!(d.date))
      .y0(self.dateFilterHeight)
      .y1((d) => self.yDateFilter!(d.value));

    // x-axis
    self.xAxisCallDateFilter = d3.axisBottom(self.xDateFilter).ticks(5);

    self.xAxisDateFilter = gDateFilter
      .append("g")
      .attr("id", "pricing-chart-x_axis_date_filter")
      .attr("transform", `translate(0, ${self.dateFilterHeight})`);
    self._hideElement(self.xAxisDateFilter);

    // y axis
    self.yAxisCallDateFilter = d3.axisLeft(self.yDateFilter).ticks(4);
    //.tickFormat((d) => `${parseInt(d / 1000)}k`)

    self.yAxisDateFilter = gDateFilter
      .append("g")
      .attr("id", "pricing-chart-y_axis_date_filter")
      .attr("opacity", 1.0);
    self._hideElement(self.yAxisDateFilter);

    // y label
    self.yAxisDateFilter
      .append("text")
      .attr("id", "pricing-chart-date-filter-y-label")
      .attr("x", (self.dateFilterHeight / 2) * -1)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("fill", self.inputs_json.apperance.dateFilter.colorYLabel)
      .attr("transform", "rotate(-90)");

    self.yAxisDateFilter.transition().call(self.yAxisCallDateFilter);

    // hds as area
    self.areaPath = gDateFilter
      .append("path")
      .attr("id", "date_filter_area")
      .attr("fill", self.inputs_json.apperance.dateFilter.colorArea);

    // brush event
    let _selection: BrushSelection | null;
    const _doBrush = function (e: D3BrushEvent<[number, number]>) {
      _selection = e.selection;
      self._handleBrushEvent(_selection!);

      //if (self.chartType == "ct_pricing_sales") self._updateChart();
    };
    // initialize brush component
    self.brush = d3
      .brushX()
      .handleSize(10)
      .extent([
        [0, 0],
        [self.inputs_json.size.width, self.dateFilterHeight],
      ])
      // when scroll date slider
      .on("brush", (e: any, d: any) => _doBrush(e))
      .on("start", () => {})
      .on("end", () => {
        // get brush values at the end of the event
        self._handleBrushEvent(_selection!);
        self._visualize(false, self.chartType!, false);
      });

    // append brush component
    self.brushComponent = gDateFilter.append("g").attr("class", "brush");

    self.brushComponent!.call(self.brush);
  }

  private _update_date_filter() {
    let self = this;

    self._showElement(self.svgDateFilter!);

    // set current selection x axis domain
    self.xDateFilter!.domain(self.x!.domain());
    self.xAxisCallDateFilter!.scale(self.xDateFilter!);
    self.xAxisDateFilter!.transition().call(self.xAxisCallDateFilter!);
    self._showElement(self.xAxisDateFilter!);

    // set y axis domain
    self.yDateFilter!.domain(
      self._getScaleCorrRange([
        d3.min(self.hds_filtered!, (d) => d.value)!,
        d3.max(self.hds_filtered!, (d) => d.value)!,
      ])
    );
    self.yAxisCallDateFilter!.scale(self.yDateFilter!);
    self.yAxisDateFilter!.transition().call(self.yAxisCallDateFilter!);
    self._showElement(self.yAxisDateFilter!);

    // set date filter area(hds)
    self.areaPath!.attr("d", self.dateFilterarea!(self.hds_filtered!));
    self._showElement(self.areaPath!);
  }

  private _handleBrushEvent(selection: BrushSelection) {
    let self = this;

    const selXy = selection as [number, number];

    const sel =
      selection == undefined
        ? self.xDateFilter!.range()
        : [selXy[0], selXy[1]];

    const newValues = sel.map((d) => self.xDateFilter!.invert(d));
    self.startDate = newValues[0];
    self.endDate = newValues[1];
    let dateDiff =
      (self.endDate.getTime() - self.startDate.getTime()) / 1000 / 60 / 60 / 24;

    let xCoordFrom = self.xDateFilter!(self.startDate);
    let xCoordTo = self.xDateFilter!(self.endDate);

    // show how many years of data is selected
    const selYears = (
      (self.endDate.getTime() - self.startDate.getTime()) /
      (60 * 60 * 24 * 1000) /
      365
    ).toFixed(2);

    // set title with selected date interval
    self.title!.text(`${self.title_text} (${selYears} years)`);

    // show date, duration days texts
    d3.select("#tooltip-df-from-text")
      .attr("x", xCoordFrom + self.inputs_json.size.margins.left)
      .text(self.xDateFilter!.invert(xCoordFrom).toISOString().split("T")[0]);
    d3.select("#tooltip-df-to-text")
      .attr("x", xCoordTo + self.inputs_json.size.margins.left)
      .text(self.xDateFilter!.invert(xCoordTo).toISOString().split("T")[0]);
    d3.select("#tooltip-df-dur-text")
      .attr(
        "x",
        self.inputs_json.size.margins.left +
          xCoordFrom +
          (xCoordTo - xCoordFrom) / 2
      )
      .text(dateDiff.toFixed(2) + " days");

    self.tooltip_df!.attr("opacity", 1.0);
  }

  public _clearDateFilter()
  {
    let self = this;

    //self._hideElement(self.xAxisDateFilter!);
    //self._hideElement(self.yAxisDateFilter!);
    self._hideElement(self.areaPath!)

    // set the original start and end date for chart
    // let sel = self.xDateFilter!.range();
    // let newValues = sel.map((d) => self.xDateFilter!.invert(d));
    // self.startDate = newValues[0];
    // self.endDate = newValues[1];

    // clear selection
    self._clearDateFilterFilterGui();

  }

  private _clearDateFilterFilterGui() {
    // hide hds area chart on date filter
    d3.select("#pricing-chart-date-filter-svg .selection").style(
      "display",
      "none"
    );
    d3.select("#pricing-chart-date-filter-svg .handle--w").style(
      "display",
      "none"
    );
    d3.select("#pricing-chart-date-filter-svg .handle--e").style(
      "display",
      "none"
    );

    d3.select("#tooltip-df").attr("opacity", 0);

    //d3.select("#pricing-chart-date-filter-svg .brush").call(self.brush.move, null);
  }

  public ClearDateFilter() {
    let self = this;
    let sel = self.xDateFilter!.range();
    let newValues = sel.map((d) => self.xDateFilter!.invert(d));
    self.startDate = newValues[0];
    self.endDate = newValues[1];

    self.title!.text(`${self.title_text}`);

    self._clearDateFilterFilterGui();

    //d3.select("#pricing-chart-date-filter-svg .brush").call(self.brush.move, null);
    self._visualize(false, self.chartType!, false);
  }

  //-------------------------gradient chart---------------------------

  private _init_gradient_chart() {
    let self = this;

    self.gradientChartHeight = self.inputs_json.size.height / 3;

    const svgWidth =
      self.inputs_json.size.width +
      self.inputs_json.size.margins.left +
      self.inputs_json.size.margins.right;
    const svgHeight =
      self.gradientChartHeight +
      self.inputs_json.size.margins.top +
      self.inputs_json.size.margins.bottom;

    // svg
    self.svgGradientChart = d3
      .select(".company-pricing-chart-gradient-chart")
      .append("svg")
      .attr("id", "pricing-chart-gradient-chart-svg")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    // svg -> g
    const gGradientChart = self.svgGradientChart
      .append("g")
      .attr(
        "transform",
        `translate(${self.inputs_json.size.margins.left}, ${self.inputs_json.size.margins.top})`
      );

    // gradient holder bg
    gGradientChart
      .append("rect")
      .attr("id", "pricing-chart-gradient-chart-bg")
      .attr("width", self.inputs_json.size.width)
      .attr("height", self.gradientChartHeight)
      .attr("fill", "none")
      .attr("pointer-events", "none");

    // x, y scales
    // megfelelő x scale !!!
    self.x_selection_gradient_chart = d3
      .scaleTime()
      .range([0, self.inputs_json.size.width]);
    self.x_selection_gradient_chart.tickFormat(5, "%Y");

    self.yGradientChart = d3.scaleLinear().range([self.gradientChartHeight, 0]);

    // date filter line def
    self.line_obj_gradient_chart = d3
      .line<StandardDataStructDateElement>()
      .x((d) => self.x_selection_gradient_chart!(d.date))
      .y((d) => self.yGradientChart!(d.value));

    // init avg line svg obj
    self.gradientChartAvgLineSvg = gGradientChart
      .append("line")
      .attr("id", "pricing-chart-gradient-chart-avg-line")
      .attr("x1", 0)
      .attr("x2", self.inputs_json.size.width)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", self.inputs_json.apperance.gradientChart.colorAvgLine)
      .attr("stroke-dasharray", "3,3")
      .attr(
        "stroke-width",
        self.inputs_json.apperance.gradientChart.widthAvgLine
      )
      .attr("visibility", "hidden")
      .style("display", "none");

    // init line svg obj
    self.gradientChartLineSvg = gGradientChart
      .append("path")
      .attr("id", "pricing-chart-gradient-chart-line")
      .attr("fill", "none")
      .attr("stroke", self.inputs_json.apperance.gradientChart.colorLine)
      .attr("stroke-width", self.inputs_json.apperance.gradientChart.widthLine)
      .attr("visibility", "hidden")
      .style("display", "none");

    // x-axis
    self.xAxisCallGradientChart = d3
      .axisBottom(self.x_selection_gradient_chart) // .scale(...) helyett
      .ticks(5);

    self.xAxisGradientChart = gGradientChart
      .append("g")
      .attr("id", "x_axis_gradient_chart")
      .attr("transform", `translate(0, ${self.gradientChartHeight})`);
    self._hideElement(self.xAxisGradientChart);

    // y axis
    self.yAxisCallGradientChart = d3
      .axisLeft(self.yGradientChart) // .scale()
      .ticks(4);
    //.tickFormat((d) => `${parseInt(d / 1000)}k`)

    d3.select("#pricing-chart-y_axis_gradient_chart").remove();

    self.yAxisGradientChart = gGradientChart
      .append("g")
      .attr("class", "y_axis_gradient_chart")
      .attr("id", "pricing-chart-y_axis_gradient_chart")
      .attr("opacity", 1.0);

    // y label
    self.yAxisGradientChart
      .append("text")
      .attr("id", "pricing-chart-gradient_chart-y-label")
      .attr("x", (self.gradientChartHeight / 2) * -1)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("fill", self.inputs_json.apperance.gradientChart.colorYLabel)
      .attr("transform", "rotate(-90)");

    self.yAxisGradientChart.transition().call(self.yAxisCallGradientChart);
  }

  private _update_gradient_chart() {
    let self = this;

    self._showElement(self.svgGradientChart!);

    // bg gradient setup
    let val_min = d3.min(self.gauge_metric_filtered!, (d) => d.value)!;
    let val_max = d3.max(self.gauge_metric_filtered!, (d) => d.value)!;
    self.gradientColorScale!.domain([
      val_min,
      val_min + (val_max - val_min) / 2,
      val_max,
    ]);

    // fill grad colors (100 count)
    let gradData = [];
    let valIndex = 0;
    for (let i = 0; i < 100; i++) {
      valIndex = Math.round(self.gauge_metric_filtered!.length * (i / 100));
      gradData.push({
        offset: `${i}%`,
        color: self.gradientColorScale!(
          self.gauge_metric_filtered![valIndex].value
        ),
      });
    }
    gradData.push({
      offset: "100%",
      color: self.gradientColorScale!(
        self.gauge_metric_filtered![self.gauge_metric_filtered!.length - 1]
          .value
      ),
    });

    self
      .gradientChartBg!.selectAll("stop")
      .data(gradData)
      .join("stop")
      .attr("offset", function (d) {
        return d.offset;
      })
      .attr("stop-color", function (d) {
        return d.color;
      });

    let gradBgSvg = d3
      .select("#pricing-chart-gradient-chart-bg")
      .style("fill", "url(#gradientChartBg)");
    self._showElement(gradBgSvg);

    // set current selection x axis domain
    self.x_selection_gradient_chart!.domain(self.x!.domain());
    self.xAxisGradientChart!.transition().call(self.xAxisCallGradientChart!);
    self._showElement(self.xAxisGradientChart!);

    // change y label text
    let df_y_label = d3
      .select("#pricing-chart-gradient_chart-y-label")
      .text(self.stats.name);

    // set y axis domain
    self.yGradientChart!.domain(
      self._getScaleCorrRange([
        d3.min(self.gauge_metric_filtered!, (d) => d.value)!,
        d3.max(self.gauge_metric_filtered!, (d) => d.value)!,
      ])
    );
    self.yAxisCallGradientChart!.scale(self.yGradientChart!);
    self.yAxisGradientChart!.transition().call(self.yAxisCallGradientChart!);
    self._showElement(self.yAxisGradientChart!);

    // draw line and avg. lines
    self
      .gradientChartLineSvg!.data([self.gauge_metric_filtered!])
      //.transition()
      .attr("d", (d) => self.line_obj_gradient_chart!(d));
    self._showElement(self.gradientChartLineSvg!);

    // draw avg. line
    self
      .gradientChartAvgLineSvg!.attr(
        "y1",
        self.yGradientChart!(self.stats.data_sel_avg)
      )
      .attr("y2", self.yGradientChart!(self.stats.data_sel_avg));
    self._showElement(self.gradientChartAvgLineSvg!);
  }

  private _clearGradientChart()
  {
    const self = this;

    self._hideElement(d3
      .select("#pricing-chart-gradient-chart-bg"));
    self._hideElement(self.gradientChartLineSvg!);
    self._hideElement(self.gradientChartAvgLineSvg!);
    
  }

  //---------------------------Performance---------------------
  private _init_performance_subchart() {
    let self = this;

    self.rect_perf_svg = d3
      .select("#g_perf")
      .append("rect")
      .attr("id", "pricing-chart-perf-subchart-bg-rect")
      .attr("width", self.inputs_json.size.width)
      .attr("height", self.inputs_json.size.height)
      .attr("fill", self.inputs_json.apperance.mainChart.performance.colorBg)
      .attr("pointer-events", "all")
      .attr("opacity", 0.7);

    self.line_perf_svg = d3
      .select("#g_perf")
      .append("line")
      .attr("id", "pricing-chart-perf-subchart-mark-line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr(
        "stroke",
        self.inputs_json.apperance.mainChart.performance.colorLine
      )
      .attr("stroke-dasharray", "3,3")
      .attr(
        "stroke-width",
        self.inputs_json.apperance.mainChart.performance.widthLine
      );

    self.line_perf_helper_svg = d3
      .select("#g_perf")
      .append("line")
      .attr("id", "pricing-chart-perf-subchart-helper-line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "transparent")
      .attr("stroke-width", 20)
      .attr("opacity", 0)
      .on("mouseover", function (mouseEvent) {
        let first_hds = self.hds_filtered![0];
        let last_hds = self.hds_filtered![self.hds_filtered!.length - 1];

        self.stats.hist_perf;
        let txt = `
        <span>Historical price performance</span>
        <span>Start date: ${
          new Date(self.stats.hist_perf!.start_date).toISOString().split("T")[0]
        }</span>
        <span>End date: ${
          new Date(self.stats.hist_perf!.end_date).toISOString().split("T")[0]
        }</span>
        <span>ROI: ${self._formatNumberPerc(self.stats.hist_perf!.roi)}</span>
        <span>CAGR: ${self._formatNumberPerc(self.stats.hist_perf!.cagr)}</span>
        `;

        self._update_initial_html_tooltip(
          mouseEvent.pageX,
          mouseEvent.pageY,
          txt
        );
      })
      .on("mouseout", function (mouseEvent) {
        self._hide_html_tooltip();
      })
      .on("mousemove", function (mouseEvent) {
        self._update_html_tooltip(mouseEvent.pageX, mouseEvent.pageY);
      });

    self._hide_performance_subchart();
  }

  private _update_performance_subchart() {
    let self = this;

    self._showElement(self.rect_perf_svg!, 0.7);

    let first_hds = self.hds_filtered![0];
    let last_hds = self.hds_filtered![self.hds_filtered!.length - 1];

    self
      .line_perf_svg!.attr("x1", self.x!(first_hds.date))
      .attr("y1", self.y!(first_hds.value))
      .attr("x2", self.x!(last_hds.date))
      .attr("y2", self.y!(last_hds.value));

    self
      .line_perf_helper_svg!.attr("x1", self.x!(first_hds.date))
      .attr("y1", self.y!(first_hds.value))
      .attr("x2", self.x!(last_hds.date))
      .attr("y2", self.y!(last_hds.value));
  }

  private _hide_performance_subchart() {
    let self = this;

    self._hideElement(d3.select("#g_perf"));
  }

  private _show_performance_subchart() {
    let self = this;

    self._showElement(d3.select("#g_perf"));
  }

  public TogglePerformanceChart(is_show: boolean) {
    let self = this;
    is_show
      ? self._show_performance_subchart()
      : self._hide_performance_subchart();
  }

  private _disable_mouse_events() {
    let self = this;

    // bars
    d3.selectAll(".barchart_bars").attr("pointer-events", "none");
    d3.selectAll(".rec_bars").attr("pointer-events", "none");

    // hds
    d3.selectAll(".hds_area").attr("pointer-events", "none");
    d3.select("#line_hds_helper").attr("pointer-events", "none");

    // fair price
    d3.select("#line_fair_p_helper").attr("pointer-events", "none");
    d3.selectAll(".fair_p_circles").attr("pointer-events", "none");
    d3.select("#fair_p_circle_current").attr("pointer-events", "none");

    d3.selectAll(".fcf_stacked_chart_circles").attr("pointer-events", "none");
    d3.select("#g_perf").attr("pointer-events", "none");

    // kikommenteltek - self.line_fairp_curr, self.line_hds_svg, d3.select("#line_fair_p")
  }

  private _enable_mouse_events() {
    let self = this;

    // bars
    d3.selectAll(".barchart_bars").attr("pointer-events", () =>
      self.show_dw ? "none" : "all"
    );
    d3.selectAll(".rec_bars").attr("pointer-events", () =>
      self.show_dw ? "none" : "all"
    );

    // hds
    d3.selectAll(".hds_area").attr("pointer-events", () =>
      self.show_dw ? "none" : "all"
    );
    d3.select("#line_hds_helper").attr("pointer-events", "stroke");

    // fair price
    d3.select("#line_fair_p_helper").attr("pointer-events", () =>
      self.show_dw ? "none" : "stroke"
    );
    d3.selectAll(".fair_p_circles").attr("pointer-events", () =>
      self.show_dw ? "none" : "all"
    );
    d3.select("#fair_p_circle_current").attr("pointer-events", "all");

    d3.selectAll(".fcf_stacked_chart_circles").attr("pointer-events", () =>
      self.show_dw ? "none" : "all"
    );
    d3.select("#g_perf").attr("pointer-events", "all");
  }
}
