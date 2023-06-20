import { EnumSubscription } from "@/types";

export const inputsBubbleChart = {
    height: 900,
    width: 1100,
    maxBubbleSize: 50,
    defSelected_plan: EnumSubscription.BASIC,
    colors: {
      collapsedColor: "#619fca",
      bgColor: "#ffffff",
    },
    simulation: {
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