import { CompanyPricingChartInputs } from "./pricingChartObj";
import {
  CommonControlPanelCbxMeta,
  ChartTypeMeta,
  InitialValsMeta,
} from "./types";

export const pricingChartInputs: CompanyPricingChartInputs = {
  holderClass: "company-pricing-chart-main",
  size: {
    width: 1000,
    height: 500,
    margins: {
      top: 50,
      left: 100,
      right: 100,
      bottom: 50,
    },
  },
  apperance: {
    mainChart: {
      title: {
        size: "20px",
        color: "black",
      },
      loadingScreen: {
        colorBg: "#a6a612",
      },
      errorMsg: {
        size: "14px",
        color: "black",
      },
      revBars: {
        text: "TTM revenue",
        color: "#7FC0F9",
      },
      revPercBars: {
        text: "TTM Revenue change %",
        colorGrowth: "#7FC0F9",
        colorLoss: "#ffb1c1",
      },
      fcfRollSumBars: {
        text: "TTM free cash flow",
        colorGrowth: "#7FC0F9",
        colorLoss: "#ffb1c1",
      },
      fcfRollSumPercBars: {
        text: "TTM free cash flow change %",
        colorGrowth: "#7FC0F9",
        colorLoss: "#ffb1c1",
      },
      nicsRollSumBars: {
        text: "TTM net income common stock",
        colorGrowth: "#7FC0F9",
        colorLoss: "#ffb1c1",
      },
      nicsRollSumPercBars: {
        text: "TTM net income common stock change %",
        colorGrowth: "#7FC0F9",
        colorLoss: "#ffb1c1",
      },
      ebitdaRollSumBars: {
        text: "TTM EBITDA",
        colorGrowth: "#7FC0F9",
        colorLoss: "#ffb1c1",
      },
      ebitdaRollSumPercBars: {
        text: "TTM EBITDA change %",
        colorGrowth: "#7FC0F9",
        colorLoss: "#ffb1c1",
      },
      bookValBars: {
        text: "Book value",
        colorGrowth: "#7FC0F9",
        colorLoss: "#ffb1c1",
      },
      fcfStackedBars: {
        colorNcfo: "#e41a1c",
        colorCapex: "#377eb8",
        opacity: 1.0,
      },
      soBars: {
        text: "Shares Outstanding",
        color: "#ffcd56",
      },
      fairPriceLine: {
        color: "#000000",
      },
      recessionBars: {
        color: "#a7a5a9",
        colorStroke: "#8f8d92",
        widthBarBorder: 2,
        opacity: 1.0,
      },
      tooltip: {
        colorCircle: "black",
        sizeCircle: 4,
        colorHelperLines: "#6F257F",
        widthHelperLines: 2,
        colorBg: "#fff333",
      },
      performance: {
        colorBg: "#cacdd0",
        colorLine: "black",
        widthLine: 2,
      },
    },
    gradientChart: {
      colorStart: "#99ff00",
      colorMid: "#ffff00",
      colorEnd: "#ff0000",
      colorLine: "black",
      widthLine: "1px",
      colorAvgLine: "#6F257F",
      widthAvgLine: "1px",
      colorYLabel: "black",
    },
    dateFilter: {
      colorArea: "#CCC",
      colorYLabel: "black",
    },
  },
  state: {
    showRevBars: false,
    showRevPercBars: false,
    showFcfRollBars: false,
    showFcfRollPercBars: false,
    showFcfStackedBars: false,
    showNicsRollBars: false,
    showNicsRollPercBars: false,
    showEbitdaRollBars: false,
    showEbitdaRollPercBars: false,
    showBookvalBars: false,
    showSoBars: false,
    showPrices: true,
    isLogScale: false,
    showDw: false,
  },
};

export const initialCommonCpCbxMeta: CommonControlPanelCbxMeta = {
  so: {
    label: "Shares outstanding",
    initVal: "0",
    value: "0",
  },
  price: {
    label: "Prices",
    initVal: "1",
    value: "1",
  },
  perf: {
    label: "Performance",
    initVal: "0",
    value: "0",
  },
  scale: {
    label: "Log scale",
    initVal: "0",
    value: "0",
  },
  dw: {
    label: "Data Window",
    initVal: "0",
    value: "0",
  },
};

export const chartTypeMeta: ChartTypeMeta[] = [
  {
    idx: 0,
    id: "ct_pricing_sales",
    label: "Fair price by sales",
    fpMetricName: "P/S",
    cPanelElements: [
      { id: "rev", label: "TTM rolling revenue" },
      { id: "revp", label: "TTM rolling revenue change %" },
    ],
  },
  {
    idx: 1,
    id: "ct_pricing_fcf",
    label: "Fair price by free cash flow",
    fpMetricName: "P/FCF",
    cPanelElements: [
      { id: "fcf_rollsum", label: "TTM rolling free cash flow" },
      { id: "fcf_rollsum_perc", label: "TTM rolling free cash flow change %" },
      { id: "capex", label: "Capex" },
    ],
  },
  {
    idx: 2,
    id: "ct_pricing_earnings",
    label: "Fair price by earnings",
    fpMetricName: "P/E",
    cPanelElements: [
      { id: "nics_rollsum", label: "TTM net income common stock" },
      {
        id: "nics_rollsum_perc",
        label: "TTM net income common stock change %",
      },
    ],
  },
  {
    idx: 3,
    id: "ct_pricing_ebitda",
    label: "Fair price by EBITDA",
    fpMetricName: "EV/EBITDA",
    cPanelElements: [
      { id: "ebitda_rollsum", label: "TTM EBITDA" },
      { id: "ebitda_rollsum_perc", label: "TTM EBITDA change %" },
    ],
  },
  {
    idx: 4,
    id: "ct_pricing_bookval",
    label: "Fair price by Book value",
    fpMetricName: "P/B",
    cPanelElements: [{ id: "bookval", label: "Book value" }],
  },
];

// initial values at first visit(no cookies is set)
export const initialValsMeta: InitialValsMeta = {
  selectedSymbol: { initVal: "MSFT", cookieName: "comp_p_ticker" },
  selectedChartType: {
    initVal: "ct_pricing_sales",
    cookieName: "comp_p_chart_type",
  },
  selectedCpCbx_rev: {
    initVal: "0",
    cookieName: "comp_p_chart_show_rev_bars",
  },
  selectedCpCbx_revp: {
    initVal: "0",
    cookieName: "comp_p_chart_show_rev_perc_bars",
  },
  selectedCpCbx_fcf_rollsum: {
    initVal: "0",
    cookieName: "comp_p_chart_show_fcf_rollsum_bars",
  },
  selectedCpCbx_fcf_rollsum_perc: {
    initVal: "0",
    cookieName: "comp_p_chart_show_fcf_rollsum_perc_bars",
  },
  selectedCpCbx_capex: {
    initVal: "0",
    cookieName: "comp_p_chart_show_capex_bars",
  },
  selectedCpCbx_nics_rollsum: {
    initVal: "0",
    cookieName: "comp_p_chart_show_nics_rollsum_bars",
  },
  selectedCpCbx_nics_rollsum_perc: {
    initVal: "0",
    cookieName: "comp_p_chart_show_nics_rollsum_perc_bars",
  },
  selectedCpCbx_ebitda_rollsum: {
    initVal: "0",
    cookieName: "comp_p_chart_show_ebitda_rollsum_bars",
  },
  selectedCpCbx_ebitda_rollsum_perc: {
    initVal: "0",
    cookieName: "comp_p_chart_show_ebitda_rollsum_perc_bars",
  },
  selectedCpCbx_bookval: {
    initVal: "0",
    cookieName: "comp_p_chart_show_bookval_bars",
  },
  // common
  selectedCommonCpCbx_so: {
    initVal: "0",
    cookieName: "comp_p_chart_show_so_bars",
  },
  selectedCommonCpCbx_price: {
    initVal: "0",
    cookieName: "comp_p_chart_show_prices",
  },
  selectedCommonCpCbx_perf: {
    initVal: "0",
    cookieName: "comp_p_chart_show_perf",
  },
  selectedCommonCpCbx_scale: {
    initVal: "0",
    cookieName: "comp_p_chart_is_log_scale",
  },
  selectedCommonCpCbx_dw: {
    initVal: "0",
    cookieName: "comp_p_chart_show_dw",
  },
};
