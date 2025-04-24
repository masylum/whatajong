import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color } from "@/styles/colors"
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
