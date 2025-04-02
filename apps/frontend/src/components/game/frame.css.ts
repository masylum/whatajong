import { mediaQuery } from "@/styles/breakpoints"
import { createVar, keyframes } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

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
    height: "100vh",
    width: "100vw",
    animation: `${shakeAnimation} ${COMBO_ANIMATION_DURATION}ms cubic-bezier(.36,.07,.19,.97)`,
    transition: "all 0.2s ease-in-out",
    overflow: "hidden",
    ":before": {
      backgroundImage: "url(/halftone.png)",
      content: "",
      position: "fixed",
      height: "100vh",
      width: "100vw",
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
    position: "absolute",
    zIndex: 3,
    gap: 8,
    padding: 8,
    "@media": {
      [mediaQuery({ p: "m", l: "s" })]: {
        padding: 12,
        gap: 12,
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
    orientation: {
      portrait: {
        flexDirection: "column",
      },
      landscape: {
        flexDirection: "row",
      },
    },
  },
})
