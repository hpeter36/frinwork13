'use client'

import React, {useRef, useEffect} from 'react'
import {motion, useMotionValue, useTransform, useInView, animate} from 'framer-motion'

type AnimatedCounterProps = {
	from: number;
	to: number;
	durationSec?: number;
  };
  

const AnimatedCounter = ({from, to, durationSec}: AnimatedCounterProps) => {

	const count = useMotionValue(from);
	const rounded = useTransform(count, (latest) => Math.round(latest));
	const ref = useRef(null);
	const inView = useInView(ref);

	// while in view, animate the count
	useEffect(() => {
		if (inView) {
		//const iterDur = iterDurationMilliSec ? (iterDurationMilliSec / (to - from)) : 2;
		animate(count, to, { duration: durationSec? durationSec: 2});
		}
	}, [count, inView, to]);

	return (
		<motion.span ref={ref}>{rounded}</motion.span>
	)
}

export default AnimatedCounter