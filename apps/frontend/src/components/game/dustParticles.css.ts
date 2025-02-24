import { createVar, keyframes, style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

const animation = createVar()
export const startX = createVar()
export const startY = createVar()
export const size = createVar()
export const duration = createVar()
export const drift = createVar()
export const blur = createVar()
export const opacity = createVar()
export const animationDelay = createVar()
export const scale = createVar()
export const zIndex = createVar()
export const animationRepeat = createVar()

const defaultDust = keyframes({
  "0%": {
    transform: `translate(${startX}, -10vh)`,
    opacity: 0,
  },
  "10%": {
    opacity: opacity,
  },
  "100%": {
    transform: `translate(${startX}, 110vh)`,
    opacity: 0,
  },
})

const northDust = keyframes({
  "0%": {
    transform: `translate(${startX}, 110vh)`,
    opacity: 0,
  },
  "10%": {
    opacity: opacity,
  },
  "100%": {
    transform: `translate(${startX}, -10vh)`,
    opacity: 0,
  },
})

const southDust = keyframes({
  "0%": {
    transform: `translate(${startX}, -10vh)`,
    opacity: 0,
  },
  "10%": {
    opacity: opacity,
  },
  "100%": {
    transform: `translate(${startX}, 110vh)`,
    opacity: 0,
  },
})

const eastDust = keyframes({
  "0%": {
    transform: `translate(-10vw, ${startY})`,
    opacity: 0,
  },
  "10%": {
    opacity: opacity,
  },
  "100%": {
    transform: `translate(110vw, ${startY})`,
    opacity: 0,
  },
})

const westDust = keyframes({
  "0%": {
    transform: `translate(110vw, ${startY})`,
    opacity: 0,
  },
  "10%": {
    opacity: opacity,
  },
  "100%": {
    transform: `translate(-10vw, ${startY})`,
    opacity: 0,
  },
})

export const lightRaysContainer = style({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  overflow: "hidden",
  zIndex: 9000,
})

export const dustParticle = recipe({
  base: {
    position: "absolute",
    top: 0,
    left: 0,
    width: size,
    height: size,
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "50%",
    animation: `${animation} ${duration} ${animationRepeat} linear`,
    mixBlendMode: "screen",
    pointerEvents: "none",
    filter: `blur(${blur})`,
    animationDelay: animationDelay,
    opacity: 0,
    transform: `scale(${scale})`,
    zIndex,
  },
  variants: {
    direction: {
      default: { vars: { [animation]: defaultDust } },
      n: { vars: { [animation]: northDust } },
      s: { vars: { [animation]: southDust } },
      e: { vars: { [animation]: eastDust } },
      w: { vars: { [animation]: westDust } },
    },
  },
})
