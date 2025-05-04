import { keyframes } from "@vanilla-extract/css"

export const ANIMATION_SLOW = "400ms"
export const ANIMATION_MEDIUM = "200ms"
export const ANIMATION_FAST = "100ms"

export const easeBounce =
  "linear(0, 0.417 25.5%, 0.867 49.4%, 1 57.7%, 0.925 65.1%, 0.908 68.6%, 0.902 72.2%, 0.916 78.2%, 0.988 92.1%, 1)"
export const overshot = "cubic-bezier(0.199, -0.491, 0, 0.997)"

export const fromBelowAnimation = keyframes({
  from: {
    transform: "translateY(50%) scale(0.8)",
    opacity: 0,
  },
  to: {
    transform: "translateY(0) scale(1)",
    opacity: 1,
  },
})

export const fromAboveAnimation = keyframes({
  from: {
    transform: "translateY(-30px) scale(0.8)",
    opacity: 0,
  },
  to: {
    transform: "translateY(0) scale(1)",
    opacity: 1,
  },
})

export const fromLeftAnimation = keyframes({
  from: {
    transform: "translateX(-200%) scale(0.8)",
    opacity: 0,
  },
  to: {
    transform: "translateX(0) scale(1)",
    opacity: 1,
  },
})

export const tileFallingAnimation = keyframes({
  from: {
    transform: "translateY(-65%) translateX(-45%) scale(1.3)",
    opacity: 0,
  },
  to: {
    transform: "translateY(0) translateX(0) scale(1)",
    opacity: 1,
  },
})

export const floatAnimation = keyframes({
  "0%": { transform: "translateY(0px) rotate(0deg)" },
  "50%": { transform: "translateY(-15px) rotate(5deg)" },
  "100%": { transform: "translateY(0px) rotate(0deg)" },
})

export const mildFloatAnimation = keyframes({
  "0%": { transform: "translateY(0px) rotate(0deg)" },
  "50%": { transform: "translateY(-5px) rotate(3deg)" },
  "100%": { transform: "translateY(0px) rotate(0deg)" },
})
