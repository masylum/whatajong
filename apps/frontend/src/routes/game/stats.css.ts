import { style } from "@vanilla-extract/css"
import { fontFamily } from "../game.css"

export const statsContainer = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontFamily,
  gap: "1.5rem",
  paddingInline: "5rem",
  paddingBlock: "2rem",
  borderRadius: "8px",
  position: "relative",
  zIndex: 1,
  userSelect: "none",
  color: "#405763",
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
