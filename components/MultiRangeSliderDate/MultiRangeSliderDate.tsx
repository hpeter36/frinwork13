"use client";

// ez igazéból nem is kell

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from './MultiRangeSliderDate.module.scss'
import styles2 from './MultiRangeSliderDate.module.css'

type MultiRangeSliderDateProps = {
  min: Date;
  max: Date;
  onChange: (min: Date, max: Date) => void;
};

type MultiRangeSliderDateData = {
  index: number;
  value: Date;
}

const MultiRangeSliderDate = ({ min, max, onChange }: MultiRangeSliderDateProps) => {
  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);

  const minIndex = useRef<number>(0);
  const maxIndex = useRef<number>(0);
  const [actMinVal, setActMinVal] = useState(0);
  const [actMaxVal, setActMaxVal] = useState(0);
  const [data, setData] = useState<MultiRangeSliderDateData[]>(() => generateData(min, max));

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - minIndex.current) / (maxIndex.current - minIndex.current)) * 100)
  ,
    [min, max]
  );

  function generateData(startDate: Date, endDate: Date): MultiRangeSliderDateData[] {
    const data: MultiRangeSliderDateData[] = [];
    let currentDate = new Date(startDate);
  
    let i = 0;
    minIndex.current = i;
    setActMinVal(i)
    while (currentDate <= endDate) {
      data.push({index: i, value:new Date(currentDate)});
      currentDate.setDate(currentDate.getDate() + 1);
      i++;
    }
    maxIndex.current = i -1;
    setActMaxVal(maxIndex.current)
  
    return data;
  }

  // set the range width( and position) to see the slider bg
  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(actMinVal);
      const maxPercent = getPercent(+maxValRef.current.value); // Preceding with '+' converts the value from type string to type number

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [actMinVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(actMaxVal);

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [actMaxVal, getPercent]);

  // Get min and max values when their state changes
  useEffect(() => {
    onChange( data[actMinVal].value , data[actMaxVal].value );
  }, [actMinVal, actMaxVal, onChange]);

  return (   
    <div className={styles.container}>
      {/* min, left thumb(range input) */}
      <input
        type="range"
        min={minIndex.current}
        max={maxIndex.current}
        value={actMinVal}
        ref={minValRef}
        onChange={(event) => {
          const value = Math.min(+event.target.value, actMaxVal - 1);
          setActMinVal(value);
          event.target.value = value.toString();
        }}
		className={`${styles.thumb} ${styles2.thumb2} ${actMinVal > maxIndex.current - 100 ? styles.thumb__zindex_5 : styles.thumb__zindex_3}`}     
      />

      {/* max, right thumb(range input) */}
      <input
        type="range"
        min={minIndex.current}
        max={maxIndex.current}
        value={actMaxVal}
        ref={maxValRef}
        onChange={(event) => {
          const value = Math.max(+event.target.value, actMinVal + 1);
          setActMaxVal(value);
          event.target.value = value.toString();
        }}
        className={`${styles.thumb}  ${styles2.thumb2} ${styles.thumb__zindex_4}`}
      />

      {/* slider track, dynamic range with changing width, left, right labels */}
      <div className={styles.slider}>
        <div className={`${styles.slider__track} !bg-green-300`} />
        <div ref={range} className={`${styles.slider__range} !bg-green-600`} />
        <div className={`${styles.slider__left_value} !text-green-600`}>{data[actMinVal].value.toDateString()}</div>
        <div className={`${styles.slider__right_value} !text-green-600`}>{data[actMaxVal].value.toDateString()}</div>
      </div>
    </div>
  );
};

export default MultiRangeSliderDate;
