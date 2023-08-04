"use client";

import React from "react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components";

import { FaChartLine, FaChartBar, FaChartPie } from "react-icons/fa";

const Stats = () => {
  const statsData = [
    {
      id: "stat_section_1",
      label: "Happy customers",
      icon: <FaChartBar className="h-6 w-6" />,
      animProps: { from: 0, to: 1000, durationSec: 5, additionalMetric: "+" },
    },
    {
      id: "stat_section_2",
      label: "Company analysis",
      icon: <FaChartLine className="h-6 w-6" />,
      animProps: { from: 0, to: 10000, durationSec: 5, additionalMetric: "+" },
    },
    {
      id: "stat_section_3",
      label: "Server uptime",
      icon: <FaChartPie className="h-6 w-6" />,
      animProps: { from: 0, to: 99, durationSec: 5,additionalMetric: "%" },
    },
  ];

  const fm_container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.5, delayChildren: 0.5 },
    },
  };

  const fm_item = {
    hidden: { opacity: 0, y: -100 },
    show: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      className="container my-24 mx-auto md:px-6"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={fm_container}
    >
      {/* Section: Design Block */}
      <section className="mb-32 text-center">
        <h2 className="mb-12 text-3xl font-bold text-secondary_c-900 dark:text-secondary_c-100">
          Our system in numbers
        </h2>

        <div className="grid md:grid-cols-3 lg:gap-x-12">
          {statsData.map((d, index) => (
            <motion.div className="mb-12 md:mb-0" key={d.id} variants={fm_item}>
              <div className="mb-6 inline-block rounded-md bg-terniary_c-100 p-4 text-terniary_c-700">
                {d.icon}
              </div>
              <h3 className="mb-4 text-2xl font-bold text-terniary_c-700 dark:text-terniary_c-400">
                <AnimatedCounter {...d.animProps} />
              </h3>
              <h5 className="text-lg font-medium text-secondary_c-700 dark:text-secondary_c-300">
                {d.label}
              </h5>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Stats;
