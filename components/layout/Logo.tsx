import React from "react";
import Link from "next/link";

const Logo = () => {
  return (
    <div className="text-3xl font-bold text-secondary_c-700 dark:text-secondary_c-100">
      <Link
        className="flex items-center mx-2 my-1 hover:text-secondary_c-900 focus:text-secondary_c-900 dark:hover:text-secondary_c-300 dark:focus:text-secondary_c-300 lg:mb-0 lg:mt-0"
        href="/"
      >
        <span className="text-primary_c-500">[</span>
        <span>fr</span>
        <span className="relative z-10 text-primary_c-500">inv</span>
        <span className="z-0 relative left-[-4px]">vork</span>
        <span className="text-primary_c-500">]</span>
      </Link>
    </div>
  );
};

export default Logo;
