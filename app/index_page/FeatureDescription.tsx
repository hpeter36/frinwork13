'use client'

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const FeatureDescription = () => {
  const featDescData = [
    {
      id: "feat_desc_section_1",
      title: "Unique company analysis",
      text: "Ut pretium ultricies dignissim. Sed sit amet mi eget urna placerat vulputate. Ut vulputate est non quam dignissim elementum. Donec a ullamcorper diam.",
      img: {
        imgPath: "https://mdbcdn.b-cdn.net/img/new/standard/city/028.jpg",
        imgAlt: "alttext 1",
      },
      isImgLeft: true,
    },
    {
      id: "feat_desc_section_2",
      title: "Stock screener",
      text: "Duis sagittis, turpis in ullamcorper venenatis, ligula nibh porta dui, sit amet rutrum enim massa in ante. Curabitur in justo at lorem laoreet ultricies. Nunc ligula felis, sagittis eget nisi vitae, sodales vestibulum purus. Vestibulum nibh ipsum, rhoncus vel sagittis nec, placerat vel justo. Duis faucibus sapien eget tortor finibus, a eleifend lectus dictum. Cras tempor convallis magna id rhoncus. Suspendisse potenti. Nam mattis faucibus imperdiet. Proin tempor lorem at neque tempus aliquet. Phasellus at ex volutpat, varius arcu id, aliquam lectus. Vestibulum mattis felis quis ex pharetra luctus. Etiam luctus sagittis massa, sed iaculis est vehicula ut.",
      img: {
        imgPath: "https://mdbcdn.b-cdn.net/img/new/standard/city/033.jpg",
        imgAlt: "alttext 1",
      },
      isImgLeft: false,
    },
    {
      id: "feat_desc_section_3",
      title: "Buy/sell alert for custom criterias",
      text: "Sed sollicitudin purus sed nulla dignissim ullamcorper. Aenean tincidunt vulputate libero, nec imperdiet sapien pulvinar id Nullam scelerisque odio vel lacus faucibus, tincidunt feugiat augue ornare. Proin ac dui vel lectus eleifend vestibulum et lobortis risus. Nullam in commodo sapien. Curabitur ut erat congue sem finibus eleifend egestas eu metus. Sed ut dolor id magna rutrum ultrices ut eget libero. Duis vel porttitor odio. Ut pulvinar sed turpis ornare tincidunt. Donec luctus, mi euismod dignissim malesuada, lacus lorem commodo leo, tristique blandi ante mi id metus. Integer et vehicula leo, vitae interdum lectus. Praesent nulla purus, commodo at euismod nec, blandit ultrices erat. Aliquam eros ipsum, interdum et mattis vitae, faucibus vitae justo. Nulla condimentum hendrerit leo, in feugiat ipsum condimentum ac. Maecenas sed blandit dolor.",
      img: {
        imgPath: "https://mdbcdn.b-cdn.net/img/new/standard/city/079.jpg",
        imgAlt: "alttext 1",
      },
      isImgLeft: true,
    },
  ];

  const fm_item_1_left = {
    hidden: { opacity: 0, x: -100 },
    show: { opacity: 1, x: 0, transition: {duration: 2} },
  };
  const fm_item_2_right = JSON.parse(JSON.stringify(fm_item_1_left));
  fm_item_2_right.hidden.x = 100;
  const fm_item_3_left = JSON.parse(JSON.stringify(fm_item_1_left));
  const fm_items = [fm_item_1_left, fm_item_2_right, fm_item_3_left];

  return (
    <div className="container my-24 mx-auto md:px-6" id="section-feat-desc">
      <section className="mb-32">

        {featDescData.map((d, index) => (
          <motion.div
            className={`mb-16 flex flex-wrap ${
              !d.isImgLeft && "lg:flex-row-reverse"
            }`}
            key={d.id}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }} variants={fm_items[index]}
          >
            <div className="mb-6 w-full shrink-0 grow-0 basis-auto lg:mb-0 lg:w-6/12 lg:pr-6">
              <div
                className="ripple relative overflow-hidden rounded-lg bg-cover bg-[50%] bg-no-repeat shadow-lg dark:shadow-black/20"
                data-te-ripple-init
                data-te-ripple-color="light"
              >
                <img
                  src={d.img.imgPath}
                  className="w-full"
                  alt={d.img.imgAlt}
                />
                <Link href="#!">
                  <div className="absolute top-0 right-0 bottom-0 left-0 h-full w-full overflow-hidden bg-[hsl(0,0%,98.4%,0.2)] bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-100"></div>
                </Link>
              </div>
            </div>

            <div className="w-full shrink-0 grow-0 basis-auto lg:w-6/12 lg:pl-6">
              <h3 className="mb-4 text-2xl font-bold text-secondary_c-900 dark:text-secondary_c-100">
                {d.title}
              </h3>
              <p className="text-secondary_c-700 dark:text-secondary_c-300">
                {d.text}
              </p>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default FeatureDescription;
