import { createVar, globalFontFace, keyframes } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const fontFamily = "Trade Winds"

globalFontFace(fontFamily, {
  src: "url(/TradeWinds-Regular.ttf)",
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

const leftGradient = createVar()
const rightGradient = createVar()
const leftOpacity = createVar()
const rightOpacity = createVar()

function cGradient(direction: string, opacity: string) {
  return `linear-gradient(${direction}, rgb(135 60 50 / ${opacity}), rgba(135 60 50 / 0%) 50%)`
}
function fGradient(direction: string, opacity: string) {
  return `linear-gradient(${direction}, rgb(90 100 90 / ${opacity}), rgba(90 100 90 / 0%) 50%)`
}
function pGradient(direction: string, opacity: string) {
  return `linear-gradient(${direction}, rgb(85 85 120 / ${opacity}), rgba(85 85 120 / 0%) 50%)`
}

export const gameRecipe = recipe({
  base: {
    vars: {
      [leftGradient]:
        "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0))",
      [rightGradient]:
        "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0))",
      [leftOpacity]: "0.9",
      [rightOpacity]: "0.9",
      [shakeIntensity]: "7",
    },
    position: "relative",
    overflow: "hidden",
    height: "100vh",
    width: "100vw",
    background: `
        ${leftGradient},
        ${rightGradient},
        linear-gradient(to bottom, #818dbd, #8fc7bf)
    `,
    animation: `${shakeAnimation} ${COMBO_ANIMATION_DURATION}ms cubic-bezier(.36,.07,.19,.97)`,
    transition: "all 0.2s ease-in-out",
    ":after": {
      backgroundImage: "url(/halftone.png)",
      content: "",
      position: "fixed",
      height: "100vh",
      width: "100vw",
      mixBlendMode: "overlay",
      top: 0,
      left: 0,
    },
  },
  variants: {
    leftCombo: {
      0: { vars: { [leftOpacity]: "0.5" } },
      1: { vars: { [leftOpacity]: "0.6" } },
      2: { vars: { [leftOpacity]: "0.7" } },
      3: { vars: { [leftOpacity]: "0.8" } },
      4: { vars: { [leftOpacity]: "0.85" } },
      5: { vars: { [leftOpacity]: "0.9" } },
      6: { vars: { [leftOpacity]: "0.95" } },
      7: { vars: { [leftOpacity]: "0.99" } },
    },
    rightCombo: {
      0: { vars: { [rightOpacity]: "0.5" } },
      1: { vars: { [rightOpacity]: "0.6" } },
      2: { vars: { [rightOpacity]: "0.7" } },
      3: { vars: { [rightOpacity]: "0.8" } },
      4: { vars: { [rightOpacity]: "0.85" } },
      5: { vars: { [rightOpacity]: "0.9" } },
      6: { vars: { [rightOpacity]: "0.95" } },
      7: { vars: { [rightOpacity]: "0.99" } },
    },
    left: {
      c: { vars: { [leftGradient]: cGradient("135deg", leftOpacity) } },
      f: { vars: { [leftGradient]: fGradient("135deg", leftOpacity) } },
      p: { vars: { [leftGradient]: pGradient("135deg", leftOpacity) } },
    },
    right: {
      c: { vars: { [rightGradient]: cGradient("-135deg", rightOpacity) } },
      f: { vars: { [rightGradient]: fGradient("-135deg", rightOpacity) } },
      p: { vars: { [rightGradient]: pGradient("-135deg", rightOpacity) } },
    },
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
