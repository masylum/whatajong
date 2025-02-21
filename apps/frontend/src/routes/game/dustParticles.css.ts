import { keyframes, style } from "@vanilla-extract/css"

const floatingDust = keyframes({
  "0%": { transform: "translate(calc(var(--x) - 100px), 0vh)", opacity: 0.4 },
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

export const dustParticle = style({
  width: "8px",
  height: "8px",
  top: "100%",
  transform: "translate(var(--x), 100vh)",
  background: "rgba(255, 255, 255, 0.9)",
  borderRadius: "50%",
  animation: `${floatingDust} 6s infinite ease-out`,
  mixBlendMode: "screen",
  pointerEvents: "none",
  filter: "blur(1px)",
})
