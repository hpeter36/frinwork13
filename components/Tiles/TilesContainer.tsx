"use client";

import React, { useRef } from "react";
import { useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/dist/Flip";
import { useDebounce } from "react-use";

import Loading from "../bubbleChart/Loading";

gsap.registerPlugin(Flip);

import { ApiResponse, CompanyMetaData } from "../../types";
import { ApiResponse_GetTilesData } from "@/app/api/getTilesData/route";
import BarChart from "./BarChart";
import { BarChartInput, BarChartSettingBehaviour } from "./BarChart";
import SearchCompany from "../SearchCompany";
import MultiRangeSlider from "../MultiRangeSlider/MultiRangeSlider";

import styles from "./TilesContainer.module.css";

const TilesContainer: React.FC = () => {
  const [barChartDatas, setBarChartDatas] = useState<BarChartInput[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const barChartNodes = useRef<(HTMLDivElement | null)[]>([]);

  const sliderValue = useRef<number[]>([1, 100]);
  const sliderValueFinal = useRef<number[]>([1, 100]);
  const fullPeriod = useRef<Date[]>([]);

  const [selectedCompMetaData, setSelectedCompMetaData] =
    useState<CompanyMetaData>({
      ticker: "MSFT",
      name: "",
      country: "",
      exchange: "",
      industry: "",
      sector: "",
      description: "",
    });

  function convertPercToDateStr(
    startDateFullStr: Date,
    endDateFullStr: Date,
    percVal: number
  ) {
    const startDateFullTs = Number(startDateFullStr);
    const endDateFullTs = Number(endDateFullStr);
    const percDateTs =
      startDateFullTs + (endDateFullTs - startDateFullTs) * (percVal / 100);
    return new Date(percDateTs).toISOString().split("T")[0];
  }

  React.useEffect(() => {
    const handleUseEffect = async () => {
      console.log(sliderValueFinal.current);

      // construct api query
      let qry = `/api/getTilesData?symbol=${selectedCompMetaData.ticker}`;

      // not first run,
      if (fullPeriod.current.length > 0) {
        // get number -> dates
        const startDateStr = convertPercToDateStr(
          fullPeriod.current[0],
          fullPeriod.current[1],
          sliderValueFinal.current[0]
        );
        const endDateStr = convertPercToDateStr(
          fullPeriod.current[0],
          fullPeriod.current[1],
          sliderValueFinal.current[1]
        );

        console.log(`sd ${startDateStr} ed ${endDateStr}`);

        qry = `${qry}&start_date=${startDateStr}&end_date=${endDateStr}`;
      }

      // get response
      const resp = await fetch(qry); // start_date, end_date
      let respDataJson: ApiResponse = await resp.json();
      respDataJson = await respDataJson;
      const tilesData = respDataJson.data as ApiResponse_GetTilesData;

      // set full data periods
      if (fullPeriod.current.length == 0) {
        fullPeriod.current = [
          new Date(tilesData.dates[0]),
          new Date(tilesData.dates[tilesData.dates.length - 1]),
        ];
      }

      // cre4ate data struct
      const barChartsDatasTmp: BarChartInput[] = [];
      tilesData.datas.forEach((barChartData) => {
        // construct each BarChartInput
        const barChartinput: BarChartInput = {
          title: barChartData.title,
          metric: barChartData.metric,
          data_bar: tilesData!.dates.map((d, i) => {
            return {
              date: new Date(d),
              value: barChartData.data_bar[i],
            };
          }),
          data_line: tilesData!.dates.map((d, i) => {
            return {
              date: new Date(d),
              value: barChartData.data_line[i],
            };
          }),
        };

        barChartsDatasTmp.push(barChartinput);
      });
      setBarChartDatas(barChartsDatasTmp);

      if (isLoading) setIsLoading(false);
    };
    handleUseEffect();
  }, [sliderValueFinal.current, selectedCompMetaData.ticker]);

  // ez majd serverről jön kalkulálva !!!
  const chartBehaviourSettings: BarChartSettingBehaviour = { bgColor: "green" };

  const settings = {
    dimensions: {
      width: 600,
      height: 300,
      margin: {
        top: 50,
        right: 30,
        bottom: 30,
        left: 60,
      },
    },
    colors: {
      border: "blue",
      bg: {
        green: "#b0edb0",
        red: "#ed8d8d",
        white: "#f3f3f3",
      },
      bar: {
        green: "#58c658",
        red: "#c65858",
      },
    },
    behaviour: chartBehaviourSettings,
  };

  function handleBarChartClick(i: number) {
    console.log(`Element clicked: ${i}`);
    console.log(barChartNodes.current[i]!.getAttribute("class"));

    // get state
    //const state = Flip.getState(cards);

    // get current element is active or not
    const isCardActive = barChartNodes.current[i]?.classList.contains(
      styles["card-active"]
    );

    // not active card clicked
    if (!isCardActive) {
      const state = Flip.getState(barChartNodes.current);

      barChartNodes.current.forEach((card) => {
        // for each card, remove active class if the element has
        if (card?.classList.contains(styles["card-active"]))
          card?.classList.remove(styles["card-active"]);

        // for each card, add inactive class if it does not have
        if (!card?.classList.contains(styles["card-inactive"]))
          card?.classList.add(styles["card-inactive"]);
      });

      // make actual card active
      barChartNodes.current[i]?.classList.remove(styles["card-inactive"]);
      barChartNodes.current[i]?.classList.add(styles["card-active"]);

      Flip.from(state, {
        duration: 2,
        ease: "expo.out",
        absolute: true,
      });
    }
  }

  const handleSliderChange = (actMinValue: number, actMaxValue: number) => {
    sliderValue.current = [actMinValue, actMaxValue];
    console.log(sliderValue.current);
  };

  function labelFormat(value: number) {
    if (fullPeriod.current.length == 0) return "";

    return convertPercToDateStr(
      fullPeriod.current[0],
      fullPeriod.current[1],
      value
    );
  }

  // if we stop dragging date slider
  useDebounce(
    () => {
      sliderValueFinal.current = sliderValue.current;
      console.log(`final ${sliderValueFinal.current}`);

    },
    500,
    [sliderValue.current]
  );

  function handleSetCompanySymbolCallback(compMeta: CompanyMetaData) {
    setSelectedCompMetaData(compMeta);
    if (!isLoading) setIsLoading(true);
   
  }

  //  sliderValue adott slider min max 1...100 onchange-nél set
  // value-> date label format

  return (
    <div>
      <div className="flex items-center justify-center">
        <h1>{`${selectedCompMetaData.ticker} data`}</h1>
      </div>
      <div className="flex items-center justify-center">
        <SearchCompany callbackSetCompMeta={handleSetCompanySymbolCallback} />
      </div>
      <div className="flex justify-center h-[200px]">
        <MultiRangeSlider
          min={1}
          max={100}
          onChange={handleSliderChange}
          labelFormat={labelFormat}
        />
      </div>
      <div className="grid grid-cols-6 gap-12 tiles_container">
        {/* loading screen */}
        {isLoading && (
          <div className="absolute w-full h-[900px] z-10">
            <Loading />
          </div>
        )}
        {!isLoading && barChartDatas?.map((d, i) => {
          //barChartNodes.current[i] = useRef<HTMLDivElement | null>(null);
          return (
            <div
              ref={(el) => (barChartNodes.current[i] = el)}
              key={`bar_chart_container_${i}`}
              className="col-span-3 card_element"
              onClick={() => handleBarChartClick(i)}
            >
              <BarChart
                chartId={`bar_chart_${i}`}
                settings={settings}
                inputs={d}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TilesContainer;
