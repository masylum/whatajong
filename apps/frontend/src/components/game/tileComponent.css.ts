import { keyframes, style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { recipe } from "@vanilla-extract/recipes"
import { color } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"

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
  transformOrigin: "50% 50%",
})

export const deletedAnimationClass = style({
  animation: `${deletedKeyframes} ${DELETED_DURATION}ms ease-out forwards`,
  transformOrigin: "50% 50%",
})

export const scoreClass = style({
  position: "absolute",
  zIndex: 9999,
  animation: `${floatingNumberKeyframes} ${FLOATING_NUMBER_DURATION}ms ease-out forwards`,
  ...fontSize.m,
  fontSize: "24px",
  lineHeight: 1,
  fontWeight: "bold",
  userSelect: "none",
  fontFamily: primary,
  transformOrigin: "50% 50%",
  pointerEvents: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  willChange: "transform",
  gap: 8,
})

export const scoreCoinsClass = style({
  borderRadius: 24,
  padding: "4px 8px",
  background: `linear-gradient(to bottom, ${color.gold90}, ${color.gold80})`,
  boxShadow: `1px -1px 0px 0 inset ${color.gold90},
    0px 0px 0px 1px ${color.gold60},
    0px 0px 3px -1px ${color.gold30},
    0px 0px 10px -5px ${color.gold30}`,
  color: color.bone10,
})

export const scorePointsClass = style({
  borderRadius: 8,
  padding: "4px 8px",
  background: `linear-gradient(to bottom, ${color.bam60}, ${color.bam50})`,
  boxShadow: `1px -1px 0px 0 inset ${color.bam60},
    0px 0px 0px 1px ${color.bam40},
    0px 0px 3px -1px ${color.bam10},
    0px 0px 10px -5px ${color.bam10}`,
  color: "white",
})

export const tileClass = style({
  pointerEvents: "none",
  transitionProperty: "top, left",
  transitionDuration: `${DELETED_DURATION}ms`,
  transitionTimingFunction: "ease-in",
  outline: "none",
  willChange: "transform",
})

export const clickableClass = recipe({
  base: { pointerEvents: "auto" },
  variants: {
    canBeSelected: {
      true: { cursor: "pointer" },
    },
  },
})
