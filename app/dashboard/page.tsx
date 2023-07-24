import React from "react";
import Link from "next/link";

import { FaChartLine, FaChartBar, FaChartPie } from "react-icons/fa";

const DashboardPage = () => {
  
  const dashboardData = [
    {
      title: "Pricing chart",
      desc: "To check a company valuation",
      icon: <FaChartLine className="h-6 w-6" />
    },
    {
      title: "Tiles chart",
      desc: "Eum nostrum fugit numquam, voluptates veniam neque quibusdam ullam aspernatur odio soluta, quisquam dolore animi mollitia a omnis praesentium, expedita nobis!",
      icon: <FaChartBar className="h-6 w-6" />
    },
    {
      title: "Another feature",
      desc: "Enim cupiditate, minus nulla dolor cumque iure eveniet facere ullam beatae hic voluptatibus dolores exercitationem? Facilis debitis aspernatur amet nisi?",
      icon: <FaChartPie className="h-6 w-6" />
    }
  ]
  
  return (
    <div className="container my-24 mx-auto md:px-6">
      <section className="mb-32 text-center">
        <h2 className="mb-16 text-3xl font-bold">
          Choose the right tool for you
        </h2>
        <div className="grid gap-x-6 md:grid-cols-3 lg:gap-x-12">
          
          {dashboardData.map((d) => (
            <Link href="/pricingChart">
            <div className="mb-12 md:mb-0 rounded border hover:bg-primary-200">
              <div className="mb-6 inline-block rounded-md p-4 text-primary">
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
