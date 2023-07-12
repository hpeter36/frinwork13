import "./globals.css";
import { robotoFont } from "@/configs/constants";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/configs/init";
import { Nav, SessProvider } from "@/components";

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
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles/globalStyles.css" />
      </head>
      <body className={robotoFont.className}>
            <SessProvider session={session!}>
              <div className="main_wrapper">
                <Nav />
                <main>{children}</main>
              </div>
            </SessProvider>
      </body>
    </html>
  );
}
