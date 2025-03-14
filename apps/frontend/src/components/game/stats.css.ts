import { style } from "@vanilla-extract/css"
import { color } from "@/styles/colors"

const statItem = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontSize: "32px",
  lineHeight: "1",
  gap: 8,
})

export const pointsContainerClass = style({
  display: "flex",
  gap: 32,
})

export const pointsClass = style([
  statItem,
  {
    color: color.circle30,
  },
])

export const movesClass = style([
  statItem,
  {
    color: color.character20,
  },
])

export const statLabel = style({
  letterSpacing: "0.05em",
})
