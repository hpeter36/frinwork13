"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from './MultiRangeSlider.module.scss'
import styles2 from './MultiRangeSlider.module.css'

type MultiRangeSliderProps = {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  labelFormat: (value: number) => string;
};

const MultiRangeSlider = ({ min, max, onChange, labelFormat }: MultiRangeSliderProps) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // set the range width( and position) to see the slider bg
  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(+maxValRef.current.value); // Preceding with '+' converts the value from type string to type number

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [maxVal, getPercent]);

  // Get min and max values when their state changes
  useEffect(() => {
    onChange(minVal, maxVal );
  }, [minVal, maxVal, onChange]);

  return (   
    <div className={styles.container}>
      {/* min, left thumb(range input) */}
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        ref={minValRef}
        onChange={(event) => {
          const value = Math.min(+event.target.value, maxVal - 1);
          setMinVal(value);
          event.target.value = value.toString();
        }}
		className={`${styles.thumb} ${styles2.thumb2} ${minVal > max - 100 ? styles.thumb__zindex_5 : styles.thumb__zindex_3}`}     
      />

      {/* max, right thumb(range input) */}
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        ref={maxValRef}
        onChange={(event) => {
          const value = Math.max(+event.target.value, minVal + 1);
          setMaxVal(value);
          event.target.value = value.toString();
        }}
        className={`${styles.thumb}  ${styles2.thumb2} ${styles.thumb__zindex_4}`}
      />

      {/* slider track, dynamic range with changing width, left, right labels */}
      <div className={styles.slider}>
        <div className={`${styles.slider__track} !bg-green-300`} />
        <div ref={range} className={`${styles.slider__range} !bg-green-600`} />
        <div className={`${styles.slider__left_value} !text-green-600`}>{labelFormat(minVal)}</div>
        <div className={`${styles.slider__right_value} !text-green-600`}>{labelFormat(maxVal)}</div>
      </div>
    </div>
  );
};

export default MultiRangeSlider;
