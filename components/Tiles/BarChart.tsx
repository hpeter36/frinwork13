import React from "react";
import * as d3 from "d3";

type BarChartDataPoint = {
  date: Date;
  value: number;
};

export type BarChartInput = {
  title: string;
  metric: string;
  data_bar: BarChartDataPoint[];
  data_line: BarChartDataPoint[];
};

type BarChartSettings = {
  dimensions: BarChartSettingsDimensions;
  colors: BarChartSettingsColors;
  behaviour: BarChartSettingBehaviour;
};

type BarChartSettingBgColorKeys = "green" | "red" | "white";

export type BarChartSettingBehaviour = {
  bgColor: BarChartSettingBgColorKeys;
};

type BarChartSettingsColors = {
  border: string;
  bg: {
    green: string;
    red: string;
    white: string;
  };
  bar: {
    green: string;
    red: string;
  };
};

type BarChartSettingsDimensionsMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type BarChartSettingsDimensions = {
  width: number;
  height: number;
  margin: BarChartSettingsDimensionsMargins;
};

type BarChartInputProps = {
  inputs: BarChartInput;
  settings: BarChartSettings;
  chartId: string;
};

const BarChart: React.FC<BarChartInputProps> = ({
  chartId,
  settings,
  inputs,
}) => {
  const svgRef = React.useRef(null);

  const { width, height, margin } = settings.dimensions;
  const svgWidth = width + margin.left + margin.right;
  const svgHeight = height + margin.top + margin.bottom;

  // helper for bars colors
  const valuesDiff = [0];
  for (let i = 1; i < inputs.data_bar.length; i++) {
    valuesDiff.push(inputs.data_bar[i].value - inputs.data_bar[i - 1].value);
  }

  function getBgColor(color: BarChartSettingBgColorKeys) {
    switch (color) {
      case "green":
        return settings.colors.bg.green;
      case "red":
        return settings.colors.bg.red;
      case "white":
        return settings.colors.bg.white;
    }
  }

  React.useEffect(() => {
    if (inputs) {
      const svgEl = d3.select(svgRef.current);

      // Clear svg content before adding new elements
      svgEl.selectAll("*").remove();

      svgEl
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
        // .attr(
        //   "viewBox",
        //   `0 0 ${self.parentElement.node().getBoundingClientRect().width} ${
        //     self.parentElement.node().getBoundingClientRect().height
        //   }`
        // );
        .attr("preserveAspectRatio", "xMinYMin meet");

      //.attr("width", svgWidth)
      //.attr("height", svgHeight)

      const coverRect = svgEl
        .append("rect")
        .attr("id", `${chartId}_cover`)
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("fill", "white");

      const coverMainRect = svgEl
        .append("rect")
        .attr("id", `${chartId}_cover_main`)
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", getBgColor(settings.behaviour.bgColor))
        .attr("stroke", settings.colors.border)
        .attr("stroke-width", "1px");

      // main g element
      const svg = svgEl
        .append("g")
        .attr("id", `${chartId}_main_g`)
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .style("color", "black");

      // chart title
      svg
        .append("text")
        .attr("id", `${chartId}_title`)
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("font-size", "18px")
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text(inputs.title);

      // x scale
      const xScale = d3
        .scaleTime()
        .domain([
          d3.min(inputs.data_bar, (d) => d.date)!,
          d3.max(inputs.data_bar, (d) => d.date)!,
        ])
        .range([0, width]);

      // x axis def
      const xAxis = d3.axisBottom(xScale).ticks(5);
      //.tickSize(-height + margin.bottom);

      // add x axis svg element
      const xAxisGroup = svg
        .append("g")
        .attr("id", `${chartId}_axis_x_time`)
        .attr("transform", `translate(0, ${height + 5})`)
        .call(xAxis);

      // y scale
      const yScale = d3
        .scaleLinear()
        .domain([
          d3.min([
            d3.min(inputs.data_bar, (d) => d.value)!,
            d3.min(inputs.data_line, (d) => d.value)!,
          ])!,
          d3.max([
            d3.max(inputs.data_bar, (d) => d.value)!,
            d3.max(inputs.data_line, (d) => d.value)!,
          ])!,
        ])
        .range([height, 0]);

      // y axis def
      const yAxis = d3.axisLeft(yScale).ticks(5);
      //.tickSize(-width);
      //.tickFormat((val) => `${val}%`);

      // add y axis svg element
      const yAxisGroup = svg
        .append("g")
        .attr("id", `${chartId}_axis_y`)
        .attr("transform", `translate(-5,0)`)
        .call(yAxis);

      // create bars
      // x scale
      let xScaleBars = d3
        .scaleBand<Date>()
        .domain(inputs.data_bar.map((d) => d.date))
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.2);

      let zeroLine = d3.min(inputs.data_bar, (d) => d.value)!;
      zeroLine = zeroLine > 0 ? zeroLine : 0;

      const gBarsEl = svg.append("g").attr("id", `${chartId}_g_bars`);

      gBarsEl
        .selectAll(`.${chartId}_bars`)
        .data(inputs.data_bar)
        .join("rect")
        .attr("class", `${chartId}_bars`)
        //.attr("stroke", "green") // (d) => (d.value > 0 ? bar_grow_color : bar_loss_color)
        //.attr("stroke-width", 0.02 * x_scale_def_ref.bandwidth())
        .attr("fill", (d, i) =>
          valuesDiff[i] >= 0
            ? settings.colors.bar.green
            : settings.colors.bar.red
        ) // (d) => (d.value > 0 ? bar_grow_color : bar_loss_color)
        .transition()
        .attr("y", (d) => (d.value > 0 ? yScale(d.value) : yScale(zeroLine)))
        .attr("x", (d) => xScaleBars(d.date)!)
        .attr("width", xScaleBars.bandwidth)
        .attr("height", (d) => Math.abs(yScale(zeroLine) - yScale(d.value)));

      // trend line
      const gLineEl = svg.append("g").attr("id", `${chartId}_g_line`);

      const lineDef = d3
        .line<BarChartDataPoint>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value));

      gLineEl
        .selectAll(`.${chartId}_line`)
        .data(inputs.data_line)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("d", (d) => lineDef(inputs.data_line));
    }
  }, [inputs.data_bar.length]);

  return (
    <>
      <svg ref={svgRef} />
    </>
  );
};

export default BarChart;
