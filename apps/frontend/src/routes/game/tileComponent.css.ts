import { keyframes, style } from "@vanilla-extract/css"
import { TILE_HEIGHT, TILE_WIDTH } from "./tileComponent"

export const SHAKE_DURATION = 150
export const SHAKE_REPEAT = 3
export const DELETED_DURATION = 300
export const FLOATING_NUMBER_DURATION = 800

const shakeKeyframes = keyframes({
  "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
  "25%": { transform: "translate(-2px, 0) rotate(-1deg)" },
  "75%": { transform: "translate(2px, 0) rotate(1deg)" },
})

const deletedKeyframes = keyframes({
  "0%": {
    transform: "scale(1, 1)",
    opacity: 1,
  },
  "20%": {
    transform: "scale(1.05, 0.9)",
    opacity: 0.9,
  },
  "50%": {
    transform: "scale(0.9, 1.05)",
    opacity: 0.5,
  },
  "100%": {
    transform: "scale(0.3, 1) translate(0, -10px)",
    opacity: 0,
  },
})

const floatingNumberKeyframes = keyframes({
  "0%": {
    transform: "translate(0, 0)",
    opacity: 1,
  },
  "100%": {
    transform: "translate(0, -60px)",
    opacity: 0,
  },
})

export const shakeAnimation = style({
  animation: `${shakeKeyframes} ${SHAKE_DURATION}ms ease-in-out ${SHAKE_REPEAT}`,
  transformOrigin: `${TILE_WIDTH / 2}px ${TILE_HEIGHT / 2}px`,
})

export const deletedAnimation = style({
  animation: `${deletedKeyframes} ${DELETED_DURATION}ms ease-out forwards`,
  transformOrigin: `${TILE_WIDTH / 2}px ${TILE_HEIGHT / 2}px`,
})

export const floatingNumberAnimation = style({
  animation: `${floatingNumberKeyframes} ${FLOATING_NUMBER_DURATION}ms ease-out forwards`,
  fontSize: "30px",
  fontWeight: "bold",
  userSelect: "none",
  fontFamily: "system-ui",
  transformOrigin: `${TILE_WIDTH / 2}px ${TILE_HEIGHT / 2}px`,
})

export const tileTransition = style({
  transition: "transform 800ms ease-in-out",
})
