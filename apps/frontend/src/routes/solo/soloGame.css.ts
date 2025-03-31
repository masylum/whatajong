import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { color } from "@/styles/colors"

export const container = style({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontFamily: primary,
  gap: "1.5rem",
  zIndex: 3,
  padding: 12,
  userSelect: "none",
  color: color.base0,
})

export const menuContainer = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 32,
})
