'use client'

import React from "react";

import {motion} from 'framer-motion'

import { FaChartLine, FaChartBar, FaChartPie } from "react-icons/fa";

const Features = () => {
  
  const featData = [
    {
      id: "feat_section_1",
      icon: <FaChartBar className="h-7 w-7" />,
      label: "Support 24/7",
      desc: "Laudantium totam quas cumque pariatur at doloremque hic quos quia eius. Reiciendis optio minus mollitia rerum labore facilis inventore voluptatem ad, quae quia sint."
    },
    {
      id: "feat_section_2",
      icon: <FaChartLine className="h-7 w-7" />,
      label: "Safe and solid",
      desc: "Eum nostrum fugit numquam, voluptates veniam neque quibusdam ullam aspernatur odio soluta, quisquam dolore animi mollitia a omnis praesentium, expedita nobis!"
    },
    {
      id: "feat_section_3",
      icon: <FaChartPie className="h-7 w-7" />,
      label: "Extremely fast",  
      desc: "Enim cupiditate, minus nulla dolor cumque iure eveniet facere ullam beatae hic voluptatibus dolores exercitationem? Facilis debitis aspernatur amet nisi?"
    },

  ];
  
  return (
    <motion.div id="home_features" className="container my-24 mx-auto md:px-6" initial={{ opacity: 0}} whileInView={{opacity: 1}} viewport={{once:true}} transition ={{duration: 2}}>
      {/* Section: Design Block */}
      <section className="mb-32 text-center">
        <h2 className="mb-20 text-3xl font-bold text-secondary_c-900 dark:text-secondary_c-100">Why is it so great?</h2>

        <div className="grid lg:grid-cols-3 lg:gap-x-12">
          {featData.map((d, index) => (
            <div className="mb-12 lg:mb-0" key={d.id}>
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
          </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Features;
