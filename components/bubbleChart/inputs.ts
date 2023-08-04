import { EnumSubscription } from "@/types";
import { BubbleChartInputInterpType, BubbleChartInputSimType } from "./types";

const groupColors = [
  "#619fca",
  "#fea456",
  "#922B21",
  "#76448A",
  "#1F618D",
  "#117A65",
  "#239B56",
  "#F1C40F",
  "#A04000",
  "#7B7D7D",
  "#2C3E50",
  "#EC7063",
  "#C39BD3",
  "#A9CCE3",
  "#A3E4D7",
];

export const inputsBubbleChartInterptype: BubbleChartInputInterpType = {
    height: 900,
    width: 1100,
    maxBubbleSize: 50,
    defSelected_plan: EnumSubscription.BASIC,
    colors: {
      light: {    
        bgColor: "#f1f5f9",
        collapsedColor: "#619fca",
        groupColors: groupColors,
      },
      dark: {
        bgColor: "#64748b",
        collapsedColor: "#619fca",
        groupColors: groupColors,
      }
     
    },
  };

  export const inputsBubbleChartSimType: BubbleChartInputSimType = {
    height: 900,
    width: 1100,
    maxBubbleSize: 50,
    defSelected_plan: EnumSubscription.BASIC,
    colors: {
      light: {    
        bgColor: "#f1f5f9",
        collapsedColor: "#619fca",
        groupColors: groupColors,
      },
      dark: {
        bgColor: "#f1f5f9",
        collapsedColor: "#619fca",
        groupColors: groupColors,
      },
    },
    simulation: {
      chargeStrength: 0.03,
      collapse: {
        useCharge: false,
        chargeForce: 1,
        xForce: 0.05,
        yForce: 0.05,
        collideForce: 0.2,
      },
      split: {
        useCharge: false,
        chargeForce: 1,
        xForce: 0.05,
        yForce: 0.03,
        collideForce: 0.2,
      },
    },
  };