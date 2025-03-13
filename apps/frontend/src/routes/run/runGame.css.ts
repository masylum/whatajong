import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { color } from "@/styles/colors"
import { keyframes } from "@vanilla-extract/css"

export const contentShow = keyframes({
  from: {
    opacity: 0,
    transform: "scale(0.96)",
  },
  to: {
    opacity: 1,
    transform: "scale(1)",
  },
})

export const contentHide = keyframes({
  from: {
    opacity: 1,
    transform: "scale(1)",
  },
  to: {
    opacity: 0,
    transform: "scale(0.96)",
  },
})

export const containerClass = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  fontFamily: primary,
  gap: "1.5rem",
  padding: 12,
  position: "relative",
  zIndex: 3,
  userSelect: "none",
  color: color.tile10,
  height: 150,
})

export const menuContainerClass = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 32,
})
