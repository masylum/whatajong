import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { createVar, keyframes, style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const roundClass = style({
  display: "flex",
  flexDirection: "column",
  fontFamily: primary,
  borderRadius: 8,
  overflow: "hidden",
  border: `2px solid ${color.dot30}`,
  backgroundColor: color.dot30,
  boxShadow: `
    0px 0px 0px 1px ${color.dot30},
    0px 0px 0px 3px ${alpha(color.dot30, 0.1)},
    0px 0px 5px -3px ${color.dot10},
    0px 0px 10px -5px ${color.dot10}
  `,
  ...fontSize.s,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.m,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.h2,
    },
  },
})

export const roundTitleClass = style({
  color: color.dot90,
  textAlign: "center",
  paddingInline: 4,
  padding: 2,
  flex: 1,
})

export const roundObjectiveClass = style({
  color: color.dot30,
  background: color.dot90,
  textAlign: "center",
  paddingInline: 4,
  padding: 2,
  flex: 1,
})

export const COMBO_ANIMATION_DURATION = 200

const shakeIntensity = createVar()

const shakeAnimation = keyframes({
  "0%, 100%": { transform: "translate(0, 0)" },
  "25%": {
    transform: `translate(calc(${shakeIntensity} * -1px), calc(${shakeIntensity} * 1px))`,
  },
  "50%": {
    transform: `translate(calc(${shakeIntensity} * 1px), calc(${shakeIntensity} * -1px))`,
  },
  "75%": {
    transform: `translate(calc(${shakeIntensity} * -1px), calc(${shakeIntensity} * -1px))`,
  },
})

export const gameRecipe = recipe({
  base: {
    vars: {
      [shakeIntensity]: "7",
    },
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100dvh",
    width: "100dvw",
    animation: `${shakeAnimation} ${COMBO_ANIMATION_DURATION}ms cubic-bezier(.36,.07,.19,.97)`,
    transition: "all 0.2s ease-in-out",
    overflow: "hidden",
    ":before": {
      backgroundImage: "url(/halftone.png)",
      content: "",
      position: "fixed",
      height: "100dvh",
      width: "100dvw",
      mixBlendMode: "overlay",
      top: 0,
      left: 0,
      zIndex: 1,
      pointerEvents: "none",
    },
  },
  variants: {
    comboAnimation: {
      0: { vars: { [shakeIntensity]: "0" }, animation: "none" },
      1: { vars: { [shakeIntensity]: "1" } },
      2: { vars: { [shakeIntensity]: "2" } },
      3: { vars: { [shakeIntensity]: "3" } },
      4: { vars: { [shakeIntensity]: "4" } },
      5: { vars: { [shakeIntensity]: "5" } },
      6: { vars: { [shakeIntensity]: "6" } },
      7: { vars: { [shakeIntensity]: "7" } },
    },
  },
})

export const containerClass = recipe({
  base: {
    display: "flex",
    flexWrap: "wrap-reverse",
    position: "absolute",
    zIndex: 3,
    gap: 12,
    padding: 8,
    flexDirection: "row",
    "@media": {
      [mediaQuery({ p: "m", l: "s" })]: {
        padding: 12,
      },
      [mediaQuery({ p: "l", l: "m" })]: {
        gap: 16,
        padding: 16,
      },
      [mediaQuery({ p: "xl", l: "l" })]: {
        padding: 24,
        gap: 24,
      },
    },
  },
  variants: {
    orientation: {
      portrait: {
        flexDirection: "column",
      },
      landscape: {
        flexDirection: "row",
      },
    },
    sudo: {
      true: {
        zIndex: 9999,
      },
    },
    position: {
      topLeft: {
        left: 0,
        top: 0,
      },
      topRight: {
        right: 0,
        top: 0,
      },
      bottomLeft: {
        left: 0,
        bottom: 0,
      },
      bottomRight: {
        right: 0,
        bottom: 0,
      },
    },
  },
})

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
    position: "relative",
    overflow: "hidden",
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
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.8)}, ${alpha(kolor(40), 0.9)})`,
      boxShadow: `1px 1px 2px 0 inset ${alpha(kolor(60), 0.9)},
        -1px -1px 2px 0px inset ${alpha(kolor(30), 0.9)},
        0px 0px 0px 1px ${kolor(30)},
        0px 0px 0px 3px ${alpha(kolor(30), 0.1)},
        0px 0px 5px -3px ${kolor(10)},
        0px 0px 10px -5px ${kolor(10)}
      `,
    })),
  },
})

export const timerClass = style({
  background: "black",
  position: "absolute",
  inset: 0,
  zIndex: -1,
})

const pulsePaused = keyframes({
  "0%": {
    transform: "translate(-50%, -50%) scale(0.9) ",
    boxShadow: `0 0 0 0 ${alpha(color.black60, 0.2)}`,
  },
  "50%": {
    transform: "translate(-50%, -50%) scale(1)",
    boxShadow: `0 0 10px 100px ${alpha(color.black60, 0)}`,
  },
  "100%": {
    transform: "translate(-50%, -50%) scale(0.9)",
    boxShadow: `0 0 0 0 ${alpha(color.black60, 0)}`,
  },
})

const pulseMild = keyframes({
  "0%": {
    transform: "scale(0.9) translate(50%, 50%)",
    boxShadow: `0 0 0 0 ${alpha(color.bone60, 0.1)}`,
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
    boxShadow: `0 0 0 0 ${alpha(color.crack60, 0.3)}`,
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

export const coinsClass = style([
  statItem,
  {
    color: color.crack30,
  },
])

export const penaltyClass = recipe({
  base: [
    statItem,
    {
      color: color.black30,
      transition: "color 0.3s ease",
      position: "relative",
      "::before": {
        content: "",
        position: "absolute",
        zIndex: -1,
        left: "50%",
        top: "50%",
        width: 200,
        height: 200,
        pointerEvents: "none",
        borderRadius: "50%",
      },
    },
  ],
  variants: {
    paused: {
      true: {
        color: color.black30,
        "::before": {
          background: `radial-gradient(circle, ${alpha(color.black60, 0.3)}, ${alpha(color.black60, 0)})`,
          animation: `${pulsePaused} 1.5s infinite ease-in-out`,
        },
      },
    },
  },
})

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
        color: color.bone30,
        "::before": {
          background: `radial-gradient(circle, ${alpha(color.bone60, 0.1)}, ${alpha(color.bone60, 0)})`,
          animation: `${pulseMild} 1.5s infinite ease-in-out`,
        },
      },
      moderate: {
        color: color.bone30,
        "::before": {
          background: `radial-gradient(circle, ${alpha(color.bone60, 0.2)}, ${alpha(color.bone60, 0)})`,
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

const fadeIn = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
})

export const tutorialClass = style({
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6))",
  zIndex: 2000,
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  alignItems: "center",
  gap: 32,
  padding: 48,
  textAlign: "center",
  fontFamily: primary,
  ...fontSize.h2,
  lineHeight: 1.3,
  color: color.bone10,
  animation: `${fadeIn} 1s ease-in-out`,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h1,
      lineHeight: 1.3,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero4,
      lineHeight: 1.3,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.hero3,
      lineHeight: 1.3,
    },
  },
})

export const tiles1ArrowClass = style({
  position: "absolute",
  top: 32,
  left: 100,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      left: 120,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      top: 40,
      left: 140,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      top: 64,
      left: 220,
    },
  },
})

export const arrowBoard1Class = style({
  position: "absolute",
  bottom: 24,
  left: 120,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      left: 140,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      bottom: 32,
      left: 160,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      bottom: 64,
      left: 240,
    },
  },
})

export const arrowBoard2Class = style({
  position: "absolute",
  bottom: 24,
  right: 140,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      right: 160,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      bottom: 32,
      right: 180,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      bottom: 64,
      right: 260,
    },
  },
})

export const arrowBoard3Class = style({
  position: "absolute",
  bottom: 80,
  right: 24,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      right: 32,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      right: 40,
      bottom: 100,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      right: 64,
      bottom: 120,
    },
  },
})

export const crackClass = style({
  color: color.crack40,
})

export const dotClass = style({
  color: color.dot40,
})

export const bamClass = style({
  color: color.bam40,
})
