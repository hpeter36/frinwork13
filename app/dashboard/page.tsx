import React from "react";
import Link from "next/link";

import { FaChartLine, FaChartBar, FaChartPie } from "react-icons/fa";

const DashboardPage = () => {
  
  const dashboardData = [
    {
      title: "Pricing chart",
      href: "/pricingChart",
      desc: "To check a company valuation",
      icon: <FaChartLine className="w-12 h-12" />
    },
    {
      title: "Tiles chart",
      href: "/tilesChart",
      desc: "Eum nostrum fugit numquam, voluptates veniam neque quibusdam ullam aspernatur odio soluta, quisquam dolore animi mollitia a omnis praesentium, expedita nobis!",
      icon: <FaChartBar className="w-12 h-12" />
    },
    {
      title: "Another feature",
      href: "#",
      desc: "Enim cupiditate, minus nulla dolor cumque iure eveniet facere ullam beatae hic voluptatibus dolores exercitationem? Facilis debitis aspernatur amet nisi?",
      icon: <FaChartPie className="w-12 h-12" />
    }
  ]
  
  return (
    <div className="container mx-auto my-24 md:px-6">
      <section className="mb-32 text-center">
        <h2 className="mb-16 text-3xl font-bold">
          Choose the right tool for you
        </h2>
        <div className="grid gap-x-6 md:grid-cols-3 lg:gap-x-12">
          
          {dashboardData.map((d) => (
            <Link href={d.href}>
            <div className="mb-12 border rounded md:mb-0 hover:bg-primary-200 min-h-[500px]">
              <div className="inline-block p-4 mb-6 rounded-md text-primary">
                {d.icon}
              </div>
              <h5 className="mb-4 text-lg font-bold">{d.title}</h5>
              <p className="text-neutral-500 dark:text-neutral-300">
                {d.desc}
              </p>
            </div>
          </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
