"use client";

import React, { useEffect, useState } from "react";
import { Collapse, Dropdown, initTE, Ripple } from "tw-elements";

import { signIn, signOut, useSession } from "next-auth/react";
import { navLinks, LoginState } from "../../configs/constants";

import Link from "next/link";
import { usePathname } from "next/navigation";

import DarkThemeToggle from "../_mui/DarkThemeToggle";

import Logo from "./Logo";

const NavTW = () => {
  const [active, setActive] = useState("Home");
  const { data: session, status } = useSession();
  const pathName = usePathname();

  useEffect(() => {
    initTE({ Collapse, Dropdown, Ripple });
  }, []);

  type PageLinksMetaArrKeys =
    | "home"
    | "dashboard"
    | "common"
    | "pricingchart"
    | "tileschart"
    | "otherpage";

  function getPageLinksMetaArrKey(page_url: string): PageLinksMetaArrKeys {
    switch (page_url) {
      case "/":
        return "home";

      // protected pages
      case "/dashboard":
        return "dashboard";
      case "/pricingChart":
        return "pricingchart";
      case "/tilesChart":
        return "tileschart";

      // commmon pages
      case "/other_page":
        return "otherpage";

      // common
      case "common":
        return "common";
      default:
        return "home";
    }
  }

  return (
    // Main navigation container
    <nav
      className="sticky top-0 z-10 flex items-center justify-between w-full py-2 shadow-lg flex-nowrap bg-secondary_c-300 text-neutral-500 hover:text-neutral-700 focus:text-neutral-700 dark:bg-secondary_c-700 lg:flex-wrap lg:justify-start lg:py-4"
      data-te-navbar-ref
    >
      <div className="flex flex-wrap items-center justify-between w-full px-3">
        {/* logo */}
        {/* <div>
          <Link
            className="flex items-center mx-2 my-1 text-neutral-900 hover:text-neutral-900 focus:text-neutral-900 lg:mb-0 lg:mt-0"
            href="/"
          >
            <img
              src="/logo.png"
              style={{ height: "40px" }}
              alt="TE Logo"
              loading="lazy"
            />
          </Link>
        </div> */}
        <Logo />

        {/* Hamburger button for mobile view */}
        <button
          className="block px-2 bg-transparent border-0 text-neutral-500 hover:no-underline hover:shadow-none focus:no-underline focus:shadow-none focus:outline-none focus:ring-0 dark:text-neutral-200 lg:hidden"
          type="button"
          data-te-collapse-init
          data-te-target="#navbarSupportedContent7"
          aria-controls="navbarSupportedContent7"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          {/* Hamburger icon */}
          <span className="[&>svg]:w-7">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7"
            >
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {/* Collapsible navbar container */}
        <div
          className="!visible mt-2 hidden flex-grow items-center lg:mt-0 lg:!flex lg:basis-auto"
          id="navbarSupportedContent7"
          data-te-collapse-item
        >
          {/* page related links */}
          <ul
            className="flex flex-col pl-0 ml-auto list-style-none lg:mt-1 lg:flex-row"
            data-te-navbar-nav-ref
          >
            {/* menu items */}
            {navLinks[getPageLinksMetaArrKey(pathName)].map((navObj) => {
              if (
                (navObj.auth === LoginState.LOGOUT && !session) || // logout only pages
                (navObj.auth === LoginState.LOGIN && session) || // login only pages
                navObj.auth === LoginState.BOTH
              ) {
                // doesn't matter login state
                return (
                  <li
                    key={navObj.id}
                    className="pl-2 lg:my-0 lg:pl-2 lg:pr-1"
                    data-te-nav-item-ref
                  >
                    <Link
                      className={`${
                        active == navObj.title ? "active" : ""
                      } text-neutral-500 transition duration-200 hover:text-neutral-700 hover:ease-in-out focus:text-neutral-700 disabled:text-black/30 motion-reduce:transition-none dark:text-neutral-200 dark:hover:text-neutral-400 dark:focus:text-neutral-400 lg:px-2 [&.active]:text-black/90 dark:[&.active]:text-neutral-400`}
                      aria-current={active == navObj.title ? "page" : undefined}
                      href={navObj.url}
                      data-te-nav-link-ref
                      onClick={(e) => setActive(navObj.title)}
                    >
                      {navObj.title}
                    </Link>
                  </li>
                );
              }
            })}

            {/* not logged in and "/" route, show log in link */}
            {pathName === "/" && !session && (
              <li className="pl-2 lg:my-0 lg:pl-2 lg:pr-1" data-te-nav-item-ref>
                <Link
                  className="text-neutral-500 transition duration-200 hover:text-neutral-700 hover:ease-in-out focus:text-neutral-700 disabled:text-black/30 motion-reduce:transition-none dark:text-neutral-200 dark:hover:text-neutral-400 dark:focus:text-neutral-400 lg:px-2 [&.active]:text-black/90 dark:[&.active]:text-neutral-400"
                  href="/api/auth/signin"
                  data-te-nav-link-ref
                  onClick={(e) => {
                    e.preventDefault();
                    signIn(undefined, {
                      redirect: true,
                      callbackUrl: `${window.location.origin}/dashboard`,
                    });
                  }}
                >
                  Create an account
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* common links */}
        <div
          className="!visible mt-2 hidden flex-grow items-center lg:mt-0 lg:!flex lg:basis-auto"
          id="navbarSupportedContent7"
          data-te-collapse-item
        >
          <ul
            className="flex flex-col pl-0 ml-auto list-style-none lg:mt-1 lg:flex-row"
            data-te-navbar-nav-ref
          >
            {navLinks["common"].map((navObj) => {
              if (
                (navObj.auth === LoginState.LOGOUT && !session) || // logout only pages
                (navObj.auth === LoginState.LOGIN && session) || // login only pages
                navObj.auth === LoginState.BOTH
              ) {
                return (
                  <li
                    className="pl-2 lg:my-0 lg:pl-2 lg:pr-1"
                    data-te-nav-item-ref
                    key={navObj.id}
                  >
                    <Link
                      className={`${
                        active == navObj.title ? "active" : ""
                      } text-neutral-500 transition duration-200 hover:text-neutral-700 hover:ease-in-out focus:text-neutral-700 disabled:text-black/30 motion-reduce:transition-none dark:text-neutral-200 dark:hover:text-neutral-400 dark:focus:text-neutral-400 lg:px-2 [&.active]:text-black/90 dark:[&.active]:text-neutral-400`}
                      aria-current={active == navObj.title ? "page" : undefined}
                      href={navObj.url}
                      data-te-nav-link-ref
                      onClick={(e) => setActive(navObj.title)}
                    >
                      {navObj.title}
                    </Link>
                  </li>
                );
              }
            })}
          </ul>

          <ul
            className="flex flex-col pl-0 ml-auto list-style-none lg:mt-1 lg:flex-row"
            data-te-navbar-nav-ref
          >
            <li className="pl-2 lg:my-0 lg:pl-2 lg:pr-1" data-te-nav-item-ref>
              {/* User related elements */}
              {/* Logged out */}
              {!session && (
                <div>
                  <Link
                    className="text-neutral-500 transition duration-200 hover:text-neutral-700 hover:ease-in-out focus:text-neutral-700 disabled:text-black/30 motion-reduce:transition-none dark:text-neutral-200 dark:hover:text-neutral-400 dark:focus:text-neutral-400 lg:px-2 [&.active]:text-black/90 dark:[&.active]:text-neutral-400"
                    href={`/api/auth/signin`}
                    onClick={(e) => {
                      e.preventDefault();
                      signIn(undefined, {
                        redirect: true,
                        callbackUrl: `${window.location.origin}/dashboard`,
                      });

                      // signIn("credentials", {
                      //   username: data?.username,
                      //   password: data?.password,
                      //   redirect: false,
                      // }).then((response) => {
                      //   if (response?.error) {
                      //     // show notification for user
                      //   } else {
                      //     // redirect to destination page
                      //   }
                      // });
                    }}
                  >
                    Sign in
                  </Link>
                </div>
              )}

              {/* Logged in */}
              {session?.user && (
                <>
                  {/* logged in user related functions */}

                  {/* sign out */}
                  <div>
                    <span>
                      <strong>
                        {session?.user?.email ?? session?.user?.name}
                      </strong>
                    </span>
                    <Link
                      className="text-neutral-500 transition duration-200 hover:text-neutral-700 hover:ease-in-out focus:text-neutral-700 disabled:text-black/30 motion-reduce:transition-none dark:text-neutral-200 dark:hover:text-neutral-400 dark:focus:text-neutral-400 lg:px-2 [&.active]:text-black/90 dark:[&.active]:text-neutral-400"
                      href={`/api/auth/signout`}
                      onClick={(e) => {
                        e.preventDefault();
                        signOut({
                          redirect: true,
                          callbackUrl: `${window.location.origin}`,
                        });
                      }}
                    >
                      Sign out
                    </Link>
                  </div>
                </>
              )}
            </li>
          </ul>
        </div>

        {/* Dark theme toggle */}
        <DarkThemeToggle />
      </div>
    </nav>
  );
};

export default NavTW;
