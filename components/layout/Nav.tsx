"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { navLinks } from "../../configs/constants";
import { logoPng, menuSvg, closeSvg } from "@/assets";

export default function Nav() {
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);

  const { data: session, status } = useSession();

  return (
    <nav className="flex-between w-full py-6">
      <Link href="/" className="flex-center">
        <Image src={logoPng} alt="frinwork" className="w-[124px] h-[32px]" />
      </Link>

      {/* desktop menu */}
      <ul className="items-center justify-end flex-1 hidden list-none sm:flex">
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className={`font-poppins font-normal cursor-pointer text-[16px] ${
              index === navLinks.length - 1 ? "mr-0" : "mr-10"
            }`}
            onClick={() => setActive(nav.title)}
          >
            <Link href={nav.url}>{nav.title}</Link>
          </li>
        ))}
        {/* login logout */}
        {!session && (
          <li>
            <span>You are not signed in</span>
            <a
              href={`/api/auth/signin`}
              onClick={(e) => {
                e.preventDefault();
                signIn();
              }}
            >
              Sign in
            </a>
          </li>
        )}
        {session?.user && (
          <li>
            <span>
              <small>Signed in as</small>
              <br />
              <strong>{session.user.email ?? session.user.name}</strong>
            </span>
            <a
              href={`/api/auth/signout`}
              onClick={(e) => {
                e.preventDefault();
                signOut();
              }}
            >
              Sign out
            </a>
          </li>
        )}
      </ul>

      {/* mobile menu */}
      <div className="flex-end flex-1 sm:hidden">
        <Image
          src={toggle ? closeSvg : menuSvg}
          alt="menu"
          className="w-[28px] h-[28px] object-contain"
          onClick={() => setToggle(!toggle)}
        />

        <div
          className={`${
            !toggle ? "hidden" : "flex"
          } p-6 absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl`}
        >
          <ul className="flex flex-col items-start justify-end flex-1 list-none">
            {navLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`font-poppins font-medium cursor-pointer text-[16px] ${
                  index === navLinks.length - 1 ? "mb-0" : "mb-4"
                }`}
                onClick={() => setActive(nav.title)}
              >
                <a href={`${nav.url}`}>{nav.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
