import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { keyframes } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

const statItem = style({
  display: "flex",
  flexDirection: "column",
  fontFamily: primary,
  userSelect: "none",
  gap: 4,
  ...fontSize.s,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.m,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.l,
      gap: 8,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h3,
      gap: 12,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.h2,
    },
  },
})

export const pillClass = recipe({
  base: {
    ...fontSize.m,
    textAlign: "center",
    borderRadius: 8,
    paddingInline: 4,
    paddingBlock: 0,
    color: "white",
    "@media": {
      [mediaQuery({ p: "l", l: "m" })]: {
        ...fontSize.h3,
        paddingInline: 8,
        paddingBlock: 2,
      },
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
        0px 0px 10px -5px ${kolor(10)}
      `,
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
    boxShadow: `0 0 0 0 ${alpha(color.bone60, 0.2)}`,
  },
  "50%": {
    transform: "scale(1) translate(50%, 50%)",
    boxShadow: `0 0 10px 100px ${alpha(color.bone60, 0)}`,
  },
  "100%": {
    transform: "scale(0.9) translate(50%, 50%)",
    boxShadow: `0 0 0 0 ${alpha(color.bone60, 0)}`,
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
        color: color.bone30,
        "::before": {
          background: `radial-gradient(circle, ${alpha(color.bone60, 0.3)}, ${alpha(color.bone60, 0)})`,
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
