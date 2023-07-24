import "./globals.css";
import "tw-elements/dist/css/tw-elements.min.css";
import { robotoFont } from "@/configs/constants";

import { getServerSession } from "next-auth/next";
import dynamic from "next/dynamic";

import { authOptions } from "@/configs/init";
import { SessProvider, Nav } from "@/components";

import FlowbiteContext from "./context/FlowbiteContext";

//import NavTW from "@/components/layout/NavTW";
const NavTW = dynamic(() => import("@/components/layout/NavTW"), { ssr: false });

export const metadata = {
  title: "Frinwork",
  description: "Frinwork stock analysis",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="!scroll-smooth">
      <head>
        <link rel="stylesheet" href="/styles/globalStyles.css" />
      </head>
      <body className={`${robotoFont.className} bg-secondary_c-300 dark:bg-secondary_c-700`}>
        <SessProvider session={session!}>
          <FlowbiteContext>
            <div className="main_wrapper">
              <NavTW />
              <main>{children}</main>
            </div>
          </FlowbiteContext>
        </SessProvider>
      </body>
    </html>
  );
}
