import { style } from "@vanilla-extract/css"
import { alpha, color, hueVariants } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { fontSize } from "@/styles/fontSize"
import { keyframes } from "@vanilla-extract/css"
import { mediaQuery } from "@/styles/breakpoints"

const statItem = style({
  display: "flex",
  flexDirection: "column",
  ...fontSize.l,
  gap: 8,
  "@media": {
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h2,
      gap: 12,
    },
  },
})

export const pillClass = recipe({
  base: {
    ...fontSize.h3,
    textAlign: "center",
    borderRadius: 8,
    paddingInline: 8,
    paddingBlock: 2,
    color: "white",
    "@media": {
      [mediaQuery({ p: "l", l: "m" })]: {
        ...fontSize.h2,
        paddingInline: 12,
        paddingBlock: 4,
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${kolor(50)}, ${kolor(40)})`,
      boxShadow: `1px 1px 2px 0 inset ${kolor(60)},
        -1px -1px 2px 0px inset ${kolor(30)},
        0px 0px 0px 1px ${kolor(30)},
        0px 0px 0px 3px ${alpha(kolor(30), 0.1)},
        0px 0px 5px -3px ${kolor(10)},
        0px 0px 10px -5px ${kolor(10)}`,
    })),
  },
})

const pulseMild = keyframes({
  "0%": {
    transform: "scale(0.9) translate(50%, 50%)",
    boxShadow: `0 0 0 0 ${alpha(color.gold60, 0.2)}`,
  },
  "50%": {
    transform: "scale(1) translate(50%, 50%)",
    boxShadow: `0 0 10px 100px ${alpha(color.gold60, 0)}`,
  },
  "100%": {
    transform: "scale(0.9) translate(50%, 50%)",
    boxShadow: `0 0 0 0 ${alpha(color.gold60, 0)}`,
  },
})
const pulseModerate = keyframes({
  "0%": {
    transform: "scale(0.9) translate(50%, 50%)",
    boxShadow: `0 0 0 0 ${alpha(color.bronze60, 0.2)}`,
  },
  "50%": {
    transform: "scale(1) translate(50%, 50%)",
    boxShadow: `0 0 10px 100px ${alpha(color.bronze60, 0)}`,
  },
  "100%": {
    transform: "scale(0.9) translate(50%, 50%)",
    boxShadow: `0 0 0 0 ${alpha(color.bronze60, 0)}`,
  },
})

const pulseUrgent = keyframes({
  "0%": {
    transform: "scale(0.9) translate(50%, 50%)",
    boxShadow: `0 0 0 0 ${alpha(color.crack60, 0.2)}`,
  },
  "50%": {
    transform: "scale(1) translate(50%, 50%)",
    boxShadow: `0 0 10px 100px ${alpha(color.crack60, 0)}`,
  },
  "100%": {
    transform: "scale(0.9) translate(50%, 50%)",
    boxShadow: `0 0 0 0 ${alpha(color.crack60, 0)}`,
  },
})

export const pointsContainerClass = style({
  display: "flex",
  gap: 32,
})

export const pointsClass = style([
  statItem,
  {
    color: color.bam30,
  },
])

export const penaltyClass = style([
  statItem,
  {
    color: color.crack30,
  },
])

export const movesClass = recipe({
  base: [
    statItem,
    {
      color: color.dot30,
      transition: "color 0.3s ease",
      "::before": {
        content: "",
        position: "absolute",
        zIndex: -1,
        right: 0,
        bottom: 0,
        width: 400,
        height: 400,
        pointerEvents: "none",
        transformOrigin: "bottom right",
        borderRadius: "50%",
      },
    },
  ],
  variants: {
    urgency: {
      normal: {},
      mild: {
        color: color.gold30,
        "::before": {
          background: `radial-gradient(circle, ${alpha(color.gold60, 0.3)}, ${alpha(color.gold60, 0)})`,
          animation: `${pulseMild} 1.5s infinite ease-in-out`,
        },
      },
      moderate: {
        color: color.bronze30,
        "::before": {
          background: `radial-gradient(circle, ${alpha(color.bronze60, 0.3)}, ${alpha(color.bronze60, 0)})`,
          animation: `${pulseModerate} 1.5s infinite ease-in-out`,
        },
      },
      urgent: {
        color: color.crack30,
        "::before": {
          background: `radial-gradient(circle, ${alpha(color.crack60, 0.3)}, ${alpha(color.crack60, 0)})`,
          animation: `${pulseUrgent} 1.5s infinite ease-in-out`,
        },
      },
    },
  },
})

export const statLabel = style({
  letterSpacing: "0.05em",
})
