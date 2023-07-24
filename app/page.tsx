import { BubbleChart } from "@/components"
import { inputsBubbleChart } from "@/components/bubbleChart/inputs"

import { authOptions } from "@/configs/init";

import dynamic from "next/dynamic";
import { getServerSession } from "next-auth/next";

//import NavTW from "@/components/layout/NavTW";
import Hero from "./index_page/Hero";
import Stats from "./index_page/Stats/Stats";
import Features from "./index_page/Features";
import FeatureDescription from "./index_page/FeatureDescription";
import Quote from "./index_page/Quote";
import Team from "./index_page/Team";
//import Subscribe from "./index_page/Subscribe";
const Subscribe = dynamic(() => import("./index_page/Subscribe"), { ssr: false });
import Footer from "./index_page/Footer";

export default async function HomePage(request: Request) {

  const session = await getServerSession(authOptions);

  // redirect to "dashboard" page if logged in

  return (
      <div className="min-h-screen">
        <Hero />
        <Stats />
        {/* <BubbleChart inputs={inputsBubbleChart} /> */}
        <Features />
        <FeatureDescription />
        <Quote />
        <Team />
        <Subscribe />
        <Footer />
      </div>
  )
}
