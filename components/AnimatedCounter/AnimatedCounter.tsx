"use client";

import React, { useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useInView,
  animate,
} from "framer-motion";

type AnimatedCounterProps = {
  from: number;
  to: number;
  durationSec?: number;
  additionalMetric?: string;
};

const AnimatedCounter = ({
  from,
  to,
  durationSec,
  additionalMetric,
}: AnimatedCounterProps) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef(null);
  const inView = useInView(ref);

  // while in view, animate the count
  useEffect(() => {
    if (inView) {
      //const iterDur = iterDurationMilliSec ? (iterDurationMilliSec / (to - from)) : 2;
      animate(count, to, { duration: durationSec ? durationSec : 2 });
    }
  }, [count, inView, to]);

  return (
    <div>
      <motion.span ref={ref}>{rounded}</motion.span>
      <span>{additionalMetric}</span>
    </div>
  );
};

export default AnimatedCounter;
