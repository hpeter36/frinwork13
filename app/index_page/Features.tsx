'use client'

import React from "react";

import {motion} from 'framer-motion'

import { FaChartLine, FaChartBar, FaChartPie } from "react-icons/fa";
import { json } from "sequelize";

const Features = () => {
  
  const featData = [
    {
      id: "feat_section_1",
      icon: <FaChartBar className="h-7 w-7" />,
      label: "Unique company analysis",
      desc: "We provide a unique way to find massive value in US companies."
    },
    {
      id: "feat_section_2",
      icon: <FaChartLine className="h-7 w-7" />,
      label: "Stock screener",
      desc: "Every stock is monitored in our system and provides the best investments to our clients"
    },
    {
      id: "feat_section_3",
      icon: <FaChartPie className="h-7 w-7" />,
      label: "Buy/sell alert for custom criterias",  
      desc: "Want to buy a stock under a given condition? Get events as soon the event happens!"
    },

  ];

  const fm_container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { delayChildren: 0.5, duration: 1 },
    },
  };

  const fm_item_center = {
    hidden: { opacity: 0, x: 0, y: 0},
    show: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };
  const fm_item_left = JSON.parse(JSON.stringify(fm_item_center));
  fm_item_left.hidden.x = -100;
  const fm_item_right = JSON.parse(JSON.stringify(fm_item_center));
  fm_item_right.hidden.x = 100;
  const fm_items = [fm_item_left, fm_item_center, fm_item_right]
  
  return (
    <motion.div id="home_features" className="container my-24 mx-auto md:px-6" initial="hidden" whileInView="show" viewport={{once:true}} variants={fm_container}>
      {/* Section: Design Block */}
      <section className="mb-32 text-center">
        <h2 className="mb-20 text-3xl font-bold text-secondary_c-900 dark:text-secondary_c-100">Our solutions</h2>

        <div className="grid lg:grid-cols-3 lg:gap-x-12">
          {featData.map((d, index) => (
            <motion.div className="mb-12 lg:mb-0" key={d.id} variants={fm_items[index]}>
            <div className="block h-full rounded-lg bg-white dark:bg-secondary_c-700 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] ">
              <div className="flex justify-center">
                <div className="-mt-8 inline-block rounded-full  bg-terniary_c-100 p-4 text-terniary_c-700 shadow-md">
                  {d.icon}
                </div>
              </div>
              <div className="p-6">
                <h5 className="mb-4 text-lg font-semibold text-secondary_c-900 dark:text-secondary_c-100">{d.label}</h5>
                <p className="text-secondary_c-700 dark:text-secondary_c-300">
                 {d.desc}
                </p>
              </div>
            </div>
          </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Features;
