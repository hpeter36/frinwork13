import { BubbleChartInterpType, BubbleChartSimType } from "@/components"
import { inputsBubbleChartInterptype, inputsBubbleChartSimType } from "@/components/bubbleChart/inputs"

import { authOptions } from "@/configs/init";

import dynamic from "next/dynamic";
import { getServerSession } from "next-auth/next";

//import NavTW from "@/components/layout/NavTW";
import Hero from "./index_page/Hero";
import Stats from "./index_page/Stats/Stats";
import Features from "./index_page/Features";
import FeatureDescription from "./index_page/FeatureDescription";
import Quote from "../components/Quote";
import Team from "./index_page/Team";
//import Subscribe from "./index_page/Subscribe";
const Subscribe = dynamic(() => import("./index_page/Subscribe"), { ssr: false });
import Footer from "./index_page/Footer";

import Notification from "./index_page/Notification";

export default async function HomePage(request: Request) {

  const session = await getServerSession(authOptions);

  return (
      <div className="min-h-screen">
        <Notification />
        <Hero />
        <Stats />
        <BubbleChartInterpType inputs={inputsBubbleChartInterptype} />
        <BubbleChartSimType inputs={inputsBubbleChartSimType} />
        <Features />
        <FeatureDescription />
        <Quote />
        <Team />
        <Subscribe />
        <Footer />
      </div>
  )
}
