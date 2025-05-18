import { keyframes, style } from "@vanilla-extract/css"

const pulseAnimation = keyframes({
  "0%, 100%": { opacity: 0.2 },
  "50%": { opacity: 0.0, transform: "scale(1.2)" },
})

export const tileClass = style({
  overflow: "visible",
})

export const pulseClass = style({
  opacity: 0.4,
  stroke: "none",
  animation: `${pulseAnimation} 2s ease-in-out infinite`,
})
