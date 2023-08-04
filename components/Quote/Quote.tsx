"use cliemt";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const Quote = () => {
  type QuoteElement = {
    id: number;
    quote: string;
    author: string;
  };

  const quoteList: QuoteElement[] = [
    {
      id: 0,
      quote:
        "In the short run, the market is a voting machine. In the long run, it is a weighing machine.",
      author: "Benjamin Graham",
    },
    {
      id: 1,
      quote:
        "The individial investor should act consistently as an investor and not as a speculator.",
      author: "Benjamin Graham",
    },
    { id: 2, quote: "Invest for the long-term.", author: "Lou Simpson" },
    {
      id: 3,
      quote:
        "The entrance strategy is actually more important than the exit strategy.",
      author: "Edward Lampert",
    },
    {
      id: 4,
      quote:
        "Far more money has been lost by investors trying to anticipate corrections, than lost in the corrections themselves.",
      author: "Peter Lynch",
    },
    {
      id: 5,
      quote:
        "You make most of your money in a bear market, you just don’t realize it at the time.",
      author: "Shelby Cullom Davis",
    },
    {
      id: 6,
      quote:
        "The stock market is a device to transfer money from the impatient to the patient.",
      author: "Warren Buffett",
    },
    {
      id: 7,
      quote: "Behind every stock is a company. Find out what it’s doing.",
      author: "Peter Lynch",
    },
    {
      id: 8,
      quote:
        "Invest for the long haul. Don’t get too greedy and don’t get too scared.",
      author: "Shelby M.C. Davis",
    },
    {
      id: 9,
      quote:
        "I will tell you how to become rich. Close the doors. Be fearful when others are greedy. Be greedy when others are fearful.",
      author: "Warren Buffett",
    },
    {
      id: 10,
      quote:
        "The intelligent investor is a realist who sells to optimists and buys from pessimists.",
      author: "Benjamin Graham",
    },
    {
      id: 11,
      quote:
        "The stock market is filled with individuals who know the price of everything, but the value of nothing.",
      author: "Phillip Fisher",
    },
    {
      id: 12,
      quote: "Time in the market beats timing the market.",
      author: "Ken Fisher",
    },
    {
      id: 13,
      quote: "In investing, what is comfortable is rarely profitable.",
      author: "Robert Arnott",
    },
  ];

  const fm_quote_cont = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 1 } },
  };

  const fm_quote = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 1 } },
  };

  const getActQuote = () => {
    // get quotes not seen before
    const filterNotSeenQuotes = () =>
      quoteList.filter(
        (quote) =>
          seenQuotes.current.find((seenQ) => seenQ === quote) === undefined
      );
    let notSeenQuotes = filterNotSeenQuotes();

    // all quotes shown, reset
    if (notSeenQuotes.length == 0) {
      seenQuotes.current = [];
      notSeenQuotes = filterNotSeenQuotes();
    }

    const actId = Math.round(Math.random() * (notSeenQuotes.length - 1));
    return notSeenQuotes[actId];
  };

  const seenQuotes = useRef<QuoteElement[]>([]);
  const [actQuote, setActQuote] = useState<QuoteElement>(quoteList[0]); // () => getActQuote()

  useEffect(() => {
    const sched = setTimeout(() => {
      setActQuote(getActQuote());
    }, 5000);

    return () => {
      clearTimeout(sched);
    };
  });

  return (
    <motion.div
      className="flex items-center justify-center min-h-[200px]"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={fm_quote_cont}
    >
																							{/* key to remount div */}
      <motion.div className=" w-6/12 text-center" variants={fm_quote} initial="hidden" animate="show" key={actQuote.id}>
        <span className="text-3xl italic">"{actQuote.quote}"</span>
        <br />
        <b className="text-3xl italic">{actQuote.author}</b>
      </motion.div>
    </motion.div>
  );
};

export default Quote;
