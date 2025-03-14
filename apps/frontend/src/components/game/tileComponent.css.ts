import { keyframes, style } from "@vanilla-extract/css"
import { TILE_HEIGHT, TILE_WIDTH } from "@/state/constants"
import { primary } from "@/styles/fontFamily.css"
import { recipe } from "@vanilla-extract/recipes"

export const SHAKE_DURATION = 150
export const SHAKE_REPEAT = 3
export const DELETED_DURATION = 300
export const FLOATING_NUMBER_DURATION = 1000

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
  "80%": {
    opacity: 0.8,
  },
  "100%": {
    transform: "translate(0, -80px)",
    opacity: 0,
  },
})

export const shakeAnimation = style({
  animation: `${shakeKeyframes} ${SHAKE_DURATION}ms ease-in-out ${SHAKE_REPEAT}`,
  transformOrigin: `${TILE_WIDTH / 2}px ${TILE_HEIGHT / 2}px`,
})

export const deletedAnimationClass = style({
  animation: `${deletedKeyframes} ${DELETED_DURATION}ms ease-out forwards`,
  transformOrigin: `${TILE_WIDTH / 2}px ${TILE_HEIGHT / 2}px`,
})

export const floatingNumberAnimation = style({
  position: "absolute",
  zIndex: 9999,
  animation: `${floatingNumberKeyframes} ${FLOATING_NUMBER_DURATION}ms ease-out forwards`,
  fontSize: "24px",
  lineHeight: 1,
  fontWeight: "bold",
  userSelect: "none",
  fontFamily: primary,
  transformOrigin: `${TILE_WIDTH / 2}px ${TILE_HEIGHT / 2}px`,
  pointerEvents: "none",
  color: "white",
  padding: "4px 8px",
  borderRadius: 4,
})

export const tileRecipe = recipe({
  base: {
    pointerEvents: "none",
    transitionProperty: "top, left",
    transitionDuration: `${DELETED_DURATION}ms`,
    transitionTimingFunction: "ease-in",
  },
  variants: {
    highlight: {
      flower: {
        filter: "brightness(0.95) hue-rotate(5deg) saturate(1.5) sepia(0.1)",
      },
      season: {
        filter: "brightness(0.95) hue-rotate(-16deg) saturate(1.2) sepia(0.1)",
      },
      null: {},
    },
  },
})

export const clickableClass = recipe({
  base: { pointerEvents: "auto" },
  variants: {
    canBeSelected: {
      true: { cursor: "pointer" },
    },
  },
})
