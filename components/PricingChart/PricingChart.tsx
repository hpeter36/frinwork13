"use client";

import styles from "./PricingChart.module.css";

import React, { useEffect, useRef, useState } from "react";

import { RadioButtonGroup, RadioButton, CheckBox, Button } from "../_elements";
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
import { isConstructorDeclaration } from "typescript";

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
  const [selectedChartType, setSelectedChartType] =
    useState<ChartTypeMetaElement>(() => setDefaultChartTypeRadioValue());
  const [selectedFairPriceType, setSelectedFairPriceType] = useState("fairp_type_historical");
  const [selectedCpCbxVals, setSelectedCpCbxVals] =
    useState<ControlPanelCbxVals | null>(null);
  const [commonCpCbxMeta, setCommonCpCbxMeta] =
    useState<CommonControlPanelCbxMeta | null>(null);

  // refs
  const compMeta = useRef<CompanyMetaData | null>(null);
  const pricingChartObj = useRef<CompanyPricingChart | null>(null);
  const lastCpCbxKey = useRef<string | null>(null);

  // functions
  function setInitialOrReadCookieValue(key: string) {
    const cookieVal = getCookie(initialValsMeta[key].cookieName);
    if (cookieVal === undefined) {
      setCookie(initialValsMeta[key].cookieName, initialValsMeta[key].initVal);
      return initialValsMeta[key].initVal;
    }
    return cookieVal;
  }

  useEffect(() => {
    console.log("useffect selectedChartType usestate change");
    console.log(selectedChartType);
  }, [selectedChartType]);

  const handleChartTypeSelectEvent = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // get index from selected value
    const selectedVal = event.target.value;
    let valSplitted = selectedVal.split("_");
    const i = Number(valSplitted[valSplitted.length - 1]);

    // set cookie and selected element meta
    setCookie("comp_p_chart_type", chartTypeMeta[i].id);

    // save selection to state
    const ctMeta: ChartTypeMetaElement = {
      idx: chartTypeMeta[i].idx,
      id: chartTypeMeta[i].id,
      label: chartTypeMeta[i].label,
      fpMetricName: chartTypeMeta[i].fpMetricName,
    };

    setSelectedChartType(ctMeta);

    // reinit chart
    const inputsVis: InitVisInput = {
      chartType: ctMeta.id,
      symbol: compMeta.current!.ticker,
      compName: compMeta.current!.name,
    };
    pricingChartObj.current!.InitVis(inputsVis);

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
    setSelectedFairPriceType(event.target.value);
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

  useEffect(() => {
    const key = lastCpCbxKey.current;

    // manage chart
    // rev
    if (key === "rev" || key === "revp") {
      const revCbxState = selectedCpCbxVals!["rev"] === "1" ? true : false;
      const revpCbxState = selectedCpCbxVals!["revp"] === "1" ? true : false;
      pricingChartObj.current?.ManageBars("rev", revCbxState, revpCbxState);
    }
    // fcf
    else if (key === "fcf_rollsum" || key === "fcf_rollsum_perc") {
      const fcfCbxState =
        selectedCpCbxVals!["fcf_rollsum"] === "1" ? true : false;
      const fcfpCbxState =
        selectedCpCbxVals!["fcf_rollsum_perc"] === "1" ? true : false;
      pricingChartObj.current?.ManageBars(
        "fcf_rollsum",
        fcfCbxState,
        fcfpCbxState
      );
    }
    // nics
    else if (key === "nics_rollsum" || key === "nics_rollsum_perc") {
      const nicsCbxState =
        selectedCpCbxVals!["nics_rollsum"] === "1" ? true : false;
      const nicspCbxState =
        selectedCpCbxVals!["nics_rollsum_perc"] === "1" ? true : false;
      pricingChartObj.current?.ManageBars(
        "nics_rollsum",
        nicsCbxState,
        nicspCbxState
      );
    }
    // ebitda
    else if (key === "ebitda_rollsum" || key === "ebitda_rollsum_perc") {
      const ebitdaCbxState =
        selectedCpCbxVals!["ebitda_rollsum"] === "1" ? true : false;
      const ebitdapCbxState =
        selectedCpCbxVals!["ebitda_rollsum_perc"] === "1" ? true : false;
      pricingChartObj.current?.ManageBars(
        "ebitda_rollsum",
        ebitdaCbxState,
        ebitdapCbxState
      );
    }
    // capex
    else if (key === "capex") {
      const capexChecked = selectedCpCbxVals!["capex"] === "1" ? true : false;
      pricingChartObj.current?.ShowHideFcfStackedChart(capexChecked);
    }
    // bookval
    else if (key === "bookval") {
      const bookvalChecked =
        selectedCpCbxVals!["bookval"] === "1" ? true : false;
      pricingChartObj.current?.ShowHideBookValSubChart(bookvalChecked);
    }
  }, [selectedCpCbxVals]);

  const handleCpCbxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    lastCpCbxKey.current = key;

    // get cbx input
    const cookieVal = event.target.checked ? "1" : "0";

    // update cookie
    setCookie(initialValsMeta[`selectedCpCbx_${key}`].cookieName, cookieVal);

    // save new value to cbx data array
    setSelectedCpCbxVals((prevVal) => {
      return { ...prevVal, [key]: cookieVal };
    });
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

    return {
      idx: foundCtMeta.idx,
      id: foundCtMeta.id,
      label: foundCtMeta.label,
      fpMetricName: foundCtMeta.fpMetricName,
    };
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
        chartType: selectedChartType.id,
        symbol: compMeta.current!.ticker,
        compName: compMeta.current!.name,
      };
      pricingChartObj.current.InitVis(inputsVis);
    };
    handleUseEffect();
  }, []);

  return (
    <div className="flex flex-col">
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
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
          Chart Type
        </h3>
        <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          {chartTypeMeta.map((val, i) => {
            return (
              <li key={`${val.id}_${i}`} className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                <RadioButton
                  // key={`${val.id}_${i}`}
                  groupName="radiog_select_chart_type"
                  label={val.label}
                  value={`${val.id}_${i}`}
                  onChange={handleChartTypeSelectEvent}
                  checked = {selectedChartType.id === val.id}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {/* --------- select fair price type --------- */}
      <div className="company-pricing-chart-control-panel-fairp-type">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
          Fair price type
        </h3>
        <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
            <RadioButton
              groupName="radiog_select_fairp_type"
              label={`fairp_type_historical ${selectedChartType.fpMetricName}`}
              value="fairp_type_historical"
              onChange={handleFairPriceTypeChange}
              checked={"fairp_type_historical" === selectedFairPriceType}
            />
          </li>
          <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
            <RadioButton
              groupName="radiog_select_fairp_type"
              label={`Fair price by ${selectedChartType.fpMetricName} industrial average`}
              value="fairp_type_industrial"
              onChange={handleFairPriceTypeChange}
              checked={"fairp_type_industrial" === selectedFairPriceType}
            />
          </li>
        </ul>
      </div>

      {/* --------- control panel elements --------- */}
      <div className="flex flex-wrap company-pricing-chart-control-panel">
        {/* unique cp cbx-es per chart type */}
        <div className="flex">
          {chartTypeMeta.map((ctMeta, i) => {
            return ctMeta.cPanelElements.map((cpMeta, j) => {
              return (
                <CheckBox
                  key={`${cpMeta.id}_${(i + 1) * (j + 1)}`}
                  label={cpMeta.label}
                  checked={
                    selectedCpCbxVals
                      ? selectedCpCbxVals[cpMeta.id as ControlPanelCbxKeys] !==
                        "0"
                      : false
                  }
                  onChange={(e) => handleCpCbxChange(e, cpMeta.id)}
                  twStyle={
                    selectedChartType.id === ctMeta.id ? "block" : "hidden"
                  }
                />
              );
            });
          })}

          {/* common cp cbx-es */}
          {Object.keys(initialCommonCpCbxMeta).map((key, i) => (
            <CheckBox
              key={`${key}_${i}`}
              label={
                initialCommonCpCbxMeta[key as CommonControlPanelCbxKeys]?.label
              }
              checked={
                commonCpCbxMeta
                  ? commonCpCbxMeta[key as CommonControlPanelCbxKeys]?.value !==
                    "0"
                  : false
              }
              onChange={(e) => handleCommonCpCbxChange(e, key)}
            />
          ))}
        </div>

        {/* date manip buttons */}
        <div>
          <Button
            label="Reset date filter"
            onClick={handleResetDateFilterButtonClick}
          />
          <Button
            label="Select 3 years of data"
            onClick={handle3YrsDateFilterButtonClick}
          />
          <Button
            label="Select 5 years of data"
            onClick={handle5YrsDateFilterButtonClick}
          />
          <Button
            label="Select 10 years of data"
            onClick={handle10YrsDateFilterButtonClick}
          />
        </div>
        </div>
        {/* pricing chart */}
        <div className=" p-9">
          <div className="company-pricing-chart-main"></div>
          <div className="company-pricing-chart-compinfo"></div>
          <div className="company-pricing-chart-debug"></div>
        </div>
    </div>
  );
};

export default PricingChart;
