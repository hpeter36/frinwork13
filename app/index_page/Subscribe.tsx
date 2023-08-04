"use client";

import React from "react";

import { motion } from "framer-motion";
import { Button } from "@mui/material";

const Subscribe = () => {

  const fm_item_left = {
    hidden: { opacity: 0, x: -100 },
    show: { opacity: 1, x: 0, transition: { duration: 2 } },
  };

  return (
    <motion.div
      id="home_subscribe"
      className="container mx-auto my-24 md:px-6"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={fm_item_left}
    >
      {/* Section: Design Block */}
      <section className="mb-32 text-center lg:text-left">
        <div className="flex flex-wrap justify-center">
          <div className="w-full px-3 shrink-0 grow-0 basis-auto md:w-10/12 lg:w-11/12 xl:w-10/12">
            <div className="grid items-center gap-x-6 lg:grid-cols-2">
              <div className="mb-10 lg:mb-0">
                <h2 className="text-3xl font-bold dark:text-secondary_c-900">
                  Want to hear about us?
                  <br />
                  <span className="text-primary_c-500">
                    Subscribe to the newsletter
                  </span>
                </h2>
              </div>

              <div className="flex-row mb-6 md:mb-0 md:flex">
                <div
                  className="relative w-full mb-3 md:mr-3 md:mb-0 xl:w-96"
                  data-te-input-wrapper-init
                >
                  <input
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-[1px] bg-transparent py-[0.32rem] px-3 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 placeholder:text-secondary_c-500 dark:placeholder:text-secondary_c-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:peer-focus:text-secondary_c-100 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                    id="exampleFormControlInput2"
                    placeholder="Enter your email"
                  />
                  <label
                    htmlFor="exampleFormControlInput2"
                    className="pointer-events-none absolute top-0 left-3 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-secondary_c-500 dark:text-secondary_c-100 transition-all duration-200 ease-out peer-focus:-translate-y-[1.5rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[1.5rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:peer-focus:text-secondary_c-100"
                  >
                    Enter your email
                  </label>
                </div>
                <Button variant="contained">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Subscribe;
