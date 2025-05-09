import {
  ANIMATION_MEDIUM,
  easeBounce,
  fromBelowAnimation,
} from "@/styles/animations.css"
import { alpha, color } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { keyframes } from "@vanilla-extract/css"

const overlayShow = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

export const overlayClass = style({
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  background: alpha(color.bone20, 0.2),
  selectors: {
    "&[data-expanded]": {
      animation: `${overlayShow} ${ANIMATION_MEDIUM} ${easeBounce}`,
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
  padding: 16,
  margin: 16,
  maxWidth: 400,
  borderRadius: 12,
  background: color.bone90,
  boxShadow: `
      0px 1px 1px 0px ${alpha(color.bone30, 0.3)},
      0px 1px 5px -2px ${alpha(color.bone30, 0.3)},
      0px 1px 10px -5px ${alpha(color.bone30, 0.3)},
      0px 1px 20px -10px ${alpha(color.bone30, 0.3)}
    `,
  selectors: {
    "&[data-expanded]": {
      animationName: fromBelowAnimation,
      animationDuration: ANIMATION_MEDIUM,
      animationTimingFunction: easeBounce,
    },
  },
})

export const closeButtonClass = style({
  position: "absolute",
  display: "flex",
  background: "none",
  border: "none",
  top: 8,
  right: 8,
  zIndex: 2002,
  cursor: "pointer",
  padding: 4,
  color: color.bone10,
  outline: "none",
  ":hover": {
    color: color.bone30,
  },
})

export const dialogContentClass = style({
  minWidth: 300,
  display: "flex",
  flexDirection: "column",
  gap: 32,
})

export const dialogTitleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
  color: color.bone10,
})

export const dialogItemsClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "stretch",
  gap: 16,
})

export const dialogItemClass = style({
  display: "flex",
  alignItems: "center",
  gap: 16,
})
