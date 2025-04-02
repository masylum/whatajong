import { style } from "@vanilla-extract/css"
import { alpha, color } from "@/styles/colors"
import { keyframes } from "@vanilla-extract/css"

const overlayShow = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

export const overlayClass = style({
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  background: `radial-gradient(
    circle,
    ${alpha("#000000", 0.7)},
    ${alpha("#000000", 1)}
  )`,
  selectors: {
    "&[data-expanded]": {
      animation: `${overlayShow} 250ms ease`,
    },
  },
})

export const positionerClass = style({
  position: "absolute",
  inset: 0,
  zIndex: 2001,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
})

export const contentClass = style({
  display: "flex",
  flexDirection: "column",
  position: "relative",
  padding: 12,
  maxWidth: 400,
  borderRadius: 12,
  background: color.bone90,
  border: `2px solid ${color.bone80}`,
})

export const closeButtonClass = style({
  position: "absolute",
  display: "flex",
  background: "none",
  border: "none",
  top: 0,
  right: 0,
  zIndex: 2002,
  cursor: "pointer",
  padding: 4,
  color: color.bone10,
  outline: "none",
  ":hover": {
    color: color.bone30,
  },
})
