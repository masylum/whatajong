import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { color } from "@/styles/colors"

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
  zIndex: 1,
  userSelect: "none",
  color: color.tile10,
})

const statItem = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontSize: "32px",
  lineHeight: "1",
})

export const timerClass = style([statItem, {}])
export const movesClass = style([statItem, {}])

export const statLabel = style({
  letterSpacing: "0.05em",
})

export const statValue = style({})
