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
      animProps: { from: 0, to: 1000, durationSec: 5 },
    },
    {
      id: "stat_section_2",
      label: "Growth",
      icon: <FaChartLine className="h-6 w-6" />,
      animProps: { from: 0, to: 70, durationSec: 5 },
    },
    {
      id: "stat_section_3",
      label: "Projects",
      icon: <FaChartPie className="h-6 w-6" />,
      animProps: { from: 0, to: 49, durationSec: 5 },
    },

  ];

  return (
    <motion.div
      className="container my-24 mx-auto md:px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 2 }}
    >
      {/* Section: Design Block */}
      <section className="mb-32 text-center">
        <h2 className="mb-12 text-3xl font-bold text-secondary_c-900 dark:text-secondary_c-100">
          There are good reasons to
          <u className="text-primary_c-500">
            &nbsp;be proud
          </u>
        </h2>

        <div className="grid md:grid-cols-3 lg:gap-x-12">
          {statsData.map((d, index) => (
             <div className="mb-12 md:mb-0" key={d.id}>
             <div className="mb-6 inline-block rounded-md bg-terniary_c-100 p-4 text-terniary_c-700">
               {d.icon}
             </div>
             <h3 className="mb-4 text-2xl font-bold text-terniary_c-700 dark:text-terniary_c-400">
               <AnimatedCounter {...d.animProps} />
             </h3>
             <h5 className="text-lg font-medium text-secondary_c-700 dark:text-secondary_c-300">
               {d.label}
             </h5>
           </div>
          ))}
        </div>

      </section>
    </motion.div>
  );
};

export default Stats;
