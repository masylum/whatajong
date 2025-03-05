import { color } from "@/styles/colors"
import { style } from "@vanilla-extract/css"

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 64,
  height: "100vh",
  width: "100vw",
})

export const gamesClass = style({
  display: "flex",
  alignItems: "center",
  gap: 64,
})

export const gameClass = style({
  border: `1px solid ${color.tile30}`,
  borderRadius: 8,
  padding: 16,
})
