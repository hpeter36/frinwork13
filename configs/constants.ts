import { Roboto } from "next/font/google";

// Roboto font
export const robotoFont = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export enum LoginState {
  LOGIN,
  LOGOUT,
  BOTH,
}

const navLinksLoggedIn = [
  {
    id: "dashboard_dashboard",
    title: "Dashboard",
    url: "/dashboard",
    auth: LoginState.LOGIN,
  },
  {
    id: "dashboard_pricing_chart",
    title: "Pricing chart",
    url: "/pricingChart",
    auth: LoginState.LOGIN,
  },
  {
    id: "dashboard_tiles_chart",
    title: "Tiles chart",
    url: "/tilesChart",
    auth: LoginState.LOGIN,
  },
];

export const navLinks = {
  // opening page
  home: [
    {
      id: "home_home",
      title: "Home",
      url: "#home_home",
      auth: LoginState.LOGOUT,
    },
    {
      id: "home_features",
      title: "Our Solutions",
      url: "#home_features",
      auth: LoginState.LOGOUT,
    },
    {
      id: "home_team",
      title: "Our Team",
      url: "#home_team",
      auth: LoginState.LOGOUT,
    }
  ],

  // protected pages
  dashboard: navLinksLoggedIn,
  pricingchart: navLinksLoggedIn,
  tileschart: navLinksLoggedIn,

  // common pages
  otherpage: navLinksLoggedIn,

  // shows common links(not real link)
  common: [
    {
      id: "common_home",
      title: "Home",
      url: "/",
      auth: LoginState.LOGOUT,
    },
    {
      id: "common_other_page",
      title: "Other page",
      url: "/other_page",
      auth: LoginState.BOTH,
    },
  ],
};
