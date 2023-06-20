import { Roboto } from "next/font/google";

// Roboto font
export const robotoFont = Roboto({
	weight: ["300", "400", "500", "700"],
	subsets: ["latin"],
	display: "swap",
	fallback: ["Helvetica", "Arial", "sans-serif"],
  });

export const navLinks = [
	{
	  id: "home",
	  title: "Home",
	  url: "/",
	},
	{
	  id: "pricing_chart",
	  title: "Pricing chart",
	  url: "/pricingChart",
	},
	{
		id: "tiles_chart",
		title: "Tiles chart",
		url: "/tilesChart",
	  },
	{
	  id: "other_page",
	  title: "Other page",
	  url: "/other_page",
	},
  ];