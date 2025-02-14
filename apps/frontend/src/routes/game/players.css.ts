import { style } from "@vanilla-extract/css"

export const playersClass = style({
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
})

export const playerClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
})

export const barsClass = style({
  display: "flex",
  flexDirection: "column",
})

export const barClass = style({
  display: "flex",
  width: "300px",
  height: "10px",
})

export const barPlayerClass = style({
  opacity: 0.5,
})

export const playerIdClass = style({
  fontSize: "18px",
  fontFamily: "system-ui",
  fontWeight: "500",
})

export const playerPointsClass = style({
  fontSize: "18px",
  fontFamily: "system-ui",
  fontWeight: "500",
})
