import { style } from "@vanilla-extract/css"

export const statsContainer = style({
  display: "flex",
  flexDirection: "column",
  fontFamily: "monospace",
  gap: "1.5rem",
  padding: "1rem",
  borderRadius: "8px",
  backdropFilter: "blur(8px)",
  position: "absolute",
  top: "1rem",
  right: "1rem",
})

export const statItem = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5rem",
})

export const statLabel = style({
  fontSize: "0.875rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
})

export const statValue = style({
  fontSize: "1.5rem",
  fontWeight: "bold",
})
