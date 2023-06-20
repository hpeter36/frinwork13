"use client";

import React, { useEffect, useRef, useState } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import SearchCompany from "../SearchCompany";
import { ApiResponse, CompanyMetaData } from "../../types";

import {
  ChartTypeMetaElement,
  ControlPanelCbxVals,
  CommonControlPanelCbxMeta,
  CommonControlPanelCbxKeys,
  ControlPanelCbxKeys,
} from "./types";

import { getCookie, setCookie } from "../../utils/cookies";
import CompanyPricingChart, {
  CompanyPricingChartInputs,
  InitVisInput,
  ChartType,
  FairPriceType,
} from "./pricingChartObj";

import {
  pricingChartInputs,
  initialValsMeta,
  chartTypeMeta,
  initialCommonCpCbxMeta,
} from "./inputs";

// refactor
// comp search hordozható
//    comp meta search comp res, minden ami kellhet az oldalra
//    increment_company_load_count-ot is ez állítsa amikor kiválasztja a user
// chart_type, ticker (compName) inputok, search adja vissza ezeket, chart type default vagy cookie vagy a kiválasztott
// akkor kellene buttonon def state-t állítani amikor ready, nem useeffectkor
// --------------------------------------------------------------------------------
const PricingChart: React.FC = () => {
  
  // states
  // const [compMeta, setCompMeta] = useState<CompanyMetaData | null>(null);
  //const [selectedChartType, setSelectedChartType] =
  //  useState<ChartTypeMetaElement | null>(null);
  const [selectedFairPriceType, setSelectedFairPriceType] = useState("");
  const [selectedCpCbxVals, setSelectedCpCbxVals] =
    useState<ControlPanelCbxVals | null>(null);
  const [commonCpCbxMeta, setCommonCpCbxMeta] =
    useState<CommonControlPanelCbxMeta | null>(null);

  // refs
  const compMeta = useRef<CompanyMetaData | null>(null);
  const selectedChartType = useRef<ChartTypeMetaElement | null>(null);
  const pricingChartObj = useRef<CompanyPricingChart | null>(null);

  // functions
  function setInitialOrReadCookieValue(key: string) {
    const cookieVal = getCookie(initialValsMeta[key].cookieName);
    if (cookieVal === undefined) {
      setCookie(initialValsMeta[key].cookieName, initialValsMeta[key].initVal);
      return initialValsMeta[key].initVal;
    }
    return cookieVal;
  }

  const handleChartTypeSelectEvent = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // get index from selected value
    const selectedVal = event.target.value;
    let valSplitted = selectedVal.split("_");
    const i = Number(valSplitted[valSplitted.length - 1]);

    // set cookie and selected element meta
    setCookie("comp_p_chart_type", chartTypeMeta[i].id);
    const ctMeta: ChartTypeMetaElement = {
      idx: chartTypeMeta[i].idx,
      id: chartTypeMeta[i].id,
      label: chartTypeMeta[i].label,
      fpMetricName: chartTypeMeta[i].fpMetricName,
    };

    //console.log(`foundCtMeta eve: ${JSON.stringify(ctMeta)}`);

    selectedChartType.current = ctMeta;
    //setSelectedChartType(ctMeta);

    // selectedChartType.id - chartType
    // compMeta?.ticker
    // compMeta?.name

    // LoadDataAndCharts(ticker);
    //  symbol cookie
    //  compPricingChart.setLoadingState
    //  compPricingChart.InitVis(chartType, symbol, compName)
  };

  const handleFairPriceTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    //console.log(`change fairp type: ${event.target.value}`);
    pricingChartObj.current?.ToggleFairPriceType(
      event.target.value as FairPriceType
    );
  };

  const handleCommonCpCbxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    // save new value to cbx data array
    const cookieVal = event.target.checked ? "1" : "0";
    setCommonCpCbxMeta((prevVal) => {
      return {
        ...prevVal!,
        [key]: {
          label: prevVal![key as CommonControlPanelCbxKeys].label,
          initVal: prevVal![key as CommonControlPanelCbxKeys].initVal,
          value: cookieVal,
        },
      };
    });
    // update cookie
    setCookie(
      initialValsMeta[`selectedCommonCpCbx_${key}`].cookieName,
      cookieVal
    );

    if (key === "so") {
      pricingChartObj.current!.ShowHideSharesOutstanding(event.target.checked);
    } else if (key === "price") {
      pricingChartObj.current!.ShowHidePrices(event.target.checked);
    } else if (key === "perf") {
      pricingChartObj.current!.TogglePerformanceChart(event.target.checked);
    } else if (key === "scale") {
      pricingChartObj.current!.ToggleLogYScale(event.target.checked);
    } else if (key === "dw") {
      pricingChartObj.current!.ToggleDataWindow(event.target.checked);
    }
  };

  const handleCpCbxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    // save new value to cbx data array
    const cookieVal = event.target.checked ? "1" : "0";
    setSelectedCpCbxVals((prevVal) => {
      return { ...prevVal, [key]: cookieVal };
    });

    // update cookie
    setCookie(initialValsMeta[`selectedCpCbx_${key}`].cookieName, cookieVal);

    if (key === "rev" || key === "revp") {
      const revCbxState = selectedCpCbxVals!["rev"] === "1" ? true : false;
      const revpCbxState = selectedCpCbxVals!["revp"] === "1" ? true : false;
      pricingChartObj.current?.ManageBars("rev", revCbxState, revpCbxState);
    } else if (key === "fcf_rollsum" || key === "fcf_rollsum_perc") {
      const fcfCbxState =
        selectedCpCbxVals!["fcf_rollsum"] === "1" ? true : false;
      const fcfpCbxState =
        selectedCpCbxVals!["fcf_rollsum_perc"] === "1" ? true : false;
      pricingChartObj.current?.ManageBars(
        "fcf_rollsum",
        fcfCbxState,
        fcfpCbxState
      );
    } else if (key === "nics_rollsum" || key === "nics_rollsum_perc") {
      const nicsCbxState =
        selectedCpCbxVals!["nics_rollsum"] === "1" ? true : false;
      const nicspCbxState =
        selectedCpCbxVals!["nics_rollsum_perc"] === "1" ? true : false;
      pricingChartObj.current?.ManageBars(
        "nics_rollsum",
        nicsCbxState,
        nicspCbxState
      );
    } else if (key === "ebitda_rollsum" || key === "ebitda_rollsum_perc") {
      const ebitdaCbxState =
        selectedCpCbxVals!["ebitda_rollsum"] === "1" ? true : false;
      const ebitdapCbxState =
        selectedCpCbxVals!["ebitda_rollsum_perc"] === "1" ? true : false;
      pricingChartObj.current?.ManageBars(
        "ebitda_rollsum",
        ebitdaCbxState,
        ebitdapCbxState
      );
    } else if (key === "capex") {
      pricingChartObj.current?.ShowHideFcfStackedChart(event.target.checked);
    } else if (key === "bookval") {
      pricingChartObj.current?.ShowHideBookValSubChart(event.target.checked);
    }
  };

  function handleResetDateFilterButtonClick() {
    pricingChartObj.current?.ClearDateFilter();
  }
  function handle3YrsDateFilterButtonClick() {
    pricingChartObj.current?.SetDateFilterXyrs(3);
  }
  function handle5YrsDateFilterButtonClick() {
    pricingChartObj.current?.SetDateFilterXyrs(5);
  }
  function handle10YrsDateFilterButtonClick() {
    pricingChartObj.current?.SetDateFilterXyrs(10);
  }

  function handleSetCompanySymbolCallback(compMetaIn: CompanyMetaData) {
    compMeta.current = compMetaIn;
    //setCompMeta(compMeta);
  }

  function setDefaultChartTypeRadioValue() {
    const foundCtMeta = chartTypeMeta.find(
      (d) => d.id === setInitialOrReadCookieValue("selectedChartType")
    )!;

    //console.log(`foundCtMeta def: ${JSON.stringify(foundCtMeta)}`);

    selectedChartType.current = {
      idx: foundCtMeta.idx,
      id: foundCtMeta.id,
      label: foundCtMeta.label,
      fpMetricName: foundCtMeta.fpMetricName,
    };

    // setSelectedChartType({
    //   idx: foundCtMeta.idx,
    //   id: foundCtMeta.id,
    //   label: foundCtMeta.label,
    //   fpMetricName: foundCtMeta.fpMetricName,
    // });
  }

  async function setDefaultSymbol() {
    // get def symbol
    const defSymbol = setInitialOrReadCookieValue("selectedSymbol") as string;

    // get meta data for symbol
    const respData: ApiResponse = await fetch(
      `/api/getCompMeta?ticker=${defSymbol}`
    ).then((resp) => resp.json());

    const compMetaTmp = respData.data as CompanyMetaData;

    //console.log(`compMetaTmp ${compMetaTmp}`);

    // set company meta data
    compMeta.current = {
      ticker: compMetaTmp.ticker,
      name: compMetaTmp.name,
      country: compMetaTmp.country,
      exchange: compMetaTmp.exchange,
      industry: compMetaTmp.industry,
      sector: compMetaTmp.sector,
      description: compMetaTmp.description,
    };
  }

  function setDefaultControlPanelCbxStates() {
    const cpCbxVals: ControlPanelCbxVals = {};
    chartTypeMeta.forEach((ctMeta) => {
      return ctMeta.cPanelElements.forEach((cpMeta) => {
        const val = setInitialOrReadCookieValue(
          `selectedCpCbx_${cpMeta.id}`
        ) as string;
        cpCbxVals[cpMeta.id as ControlPanelCbxKeys] = val;
      });
    });
    setSelectedCpCbxVals(cpCbxVals);
  }

  function setDefaultCommonCpCbxStates() {
    Object.keys(initialCommonCpCbxMeta).forEach((key) => {
      const val = setInitialOrReadCookieValue(
        `selectedCommonCpCbx_${key}`
      ) as string;
      initialCommonCpCbxMeta[key as CommonControlPanelCbxKeys].initVal = val;
      initialCommonCpCbxMeta[key as CommonControlPanelCbxKeys].value = val;
    });
    setCommonCpCbxMeta(initialCommonCpCbxMeta);
  }

  // comp. init
  useEffect(() => {
    const handleUseEffect = async () => {
      // set default values
      await setDefaultSymbol();
      setDefaultChartTypeRadioValue();
      setDefaultControlPanelCbxStates();
      setDefaultCommonCpCbxStates();

      // init chart
      pricingChartObj.current = new CompanyPricingChart(pricingChartInputs);

      //console.log(`useffect ${JSON.stringify(selectedChartType)}`);

      const inputsVis: InitVisInput = {
        chartType: selectedChartType.current!.id,
        symbol: compMeta.current!.ticker,
        compName: compMeta.current!.name,
      };
      pricingChartObj.current.InitVis(inputsVis);
    };
    handleUseEffect();
  }, []);

  return (
    <div className="company-pricing-chart-container">
      {/* --------- header --------- */}
      <div className="flex justify-center items-center h-[100px]">
        <h1>{`${compMeta.current && compMeta.current.ticker} data`}</h1>
      </div>
      {/* --------- search bar --------- */}
      <div className="flex justify-center items-center h-[200px]">
        <SearchCompany callbackSetCompMeta={handleSetCompanySymbolCallback} />
      </div>
      {/* --------- select chart type --------- */}
      <div className="company-pricing-chart-select-chart">
        <FormControl>
          <FormLabel id="company-pricing-chart-select-chart-group-label">
            Chart Type
          </FormLabel>
          {chartTypeMeta.map((val, i) => {
            return (
              <FormControlLabel
                key={`${val}_${i}`}
                value={`${val.id}_${i}`}
                control={
                  <Radio
                    onChange={handleChartTypeSelectEvent}
                    checked={selectedChartType.current?.id === val.id}
                  />
                }
                label={val.label}
              />
            );
          })}
        </FormControl>
      </div>

      {/* --------- select fair price type --------- */}
      <div className="company-pricing-chart-control-panel-fairp-type">
        <FormControl>
          <FormLabel id="company-pricing-chart-control-panel-fairp-type-group-label">
            Fair price type
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="company-pricing-chart-control-panel-fairp-type-group-label"
            defaultValue="fairp_type_historical"
            name="company-pricing-chart-control-panel-fairp-type-group"
            onChange={handleFairPriceTypeChange}
          >
            <FormControlLabel
              value="fairp_type_historical"
              control={<Radio />}
              label={`fairp_type_historical ${selectedChartType.current?.fpMetricName}`}
            />
            <FormControlLabel
              value="fairp_type_industrial"
              control={<Radio />}
              label={`Fair price by ${selectedChartType.current?.fpMetricName} industrial average`}
            />
          </RadioGroup>
        </FormControl>
      </div>

      {/* --------- control panel elements --------- */}
      <div className="flex flex-wrap company-pricing-chart-control-panel">
        {/* unique cp cbx-es per chart type */}
        {chartTypeMeta.map((ctMeta, i) => {
          return ctMeta.cPanelElements.map((cpMeta, j) => {
            return (
              <FormControlLabel
                key={`${cpMeta.id}_${(i + 1) * (j + 1)}`}
                control={
                  <Checkbox
                    checked={
                      selectedCpCbxVals
                        ? selectedCpCbxVals[
                            cpMeta.id as ControlPanelCbxKeys
                          ] !== "0"
                        : false
                    }
                    onChange={(e) => handleCpCbxChange(e, cpMeta.id)}
                  />
                }
                label={cpMeta.label}
                sx={{
                  display:
                    selectedChartType.current?.id === ctMeta.id
                      ? "block"
                      : "none",
                }}
              />
            );
          });
        })}

        {/* common cp cbx-es */}
        {Object.keys(initialCommonCpCbxMeta).map((key, i) => (
          <FormControlLabel
            key={`${key}_${i}`}
            control={
              <Checkbox
                checked={
                  commonCpCbxMeta
                    ? commonCpCbxMeta[key as CommonControlPanelCbxKeys]
                        ?.value !== "0"
                    : false
                }
                onChange={(e) => handleCommonCpCbxChange(e, key)}
              />
            }
            label={
              initialCommonCpCbxMeta[key as CommonControlPanelCbxKeys]?.label
            }
          />
        ))}
      </div>

      {/* date manip buttons */}
      <div className="pricing_chart_cp_elem company-pricing-chart-control-panel-date-filter">
        <Stack spacing={2} direction="row">
          <Button
            variant="contained"
            onClick={handleResetDateFilterButtonClick}
          >
            Reset date filter
          </Button>
          <Button variant="contained" onClick={handle3YrsDateFilterButtonClick}>
            Select 3 years of data
          </Button>
          <Button variant="contained" onClick={handle5YrsDateFilterButtonClick}>
            Select 5 years of data
          </Button>
          <Button
            variant="contained"
            onClick={handle10YrsDateFilterButtonClick}
          >
            Select 10 years of data
          </Button>
        </Stack>
      </div>
      {/* pricing chart */}
      <div className="company-pricing-chart-main"></div>
      <div className="company-pricing-chart-compinfo"></div>
      <div className="company-pricing-chart-debug"></div>
    </div>
  );
};

export default PricingChart;
