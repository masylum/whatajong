import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { color } from "@/styles/colors"

export const playersClass = style({
  position: "relative",
  zIndex: 1,
  display: "flex",
  width: "100%",
  gap: 50,
  justifyContent: "space-between",
  alignItems: "center",
  paddingBlock: "24px",
  paddingInline: "24px",
  fontFamily: primary,
})

export const playerClass = style({
  display: "flex",
  alignItems: "center",
  flexDirection: "row-reverse",
  gap: 32,
  position: "relative",
  ":first-child": {
    flexDirection: "row",
  },
})

export const playerIdClass = style({
  ...fontSize.h3,
  lineHeight: "1",
})

export const statsContainer = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontFamily: primary,
  gap: "1.5rem",
  paddingInline: "5rem",
  paddingBlock: "2rem",
  borderRadius: "8px",
  position: "relative",
  zIndex: 3,
  userSelect: "none",
  color: color.tile10,
})

export const menuContainer = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 32,
})
