import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { color, hueVariants } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"

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

export const menuContainer = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 32,
})

export const menuItem = recipe({
  base: {
    fontSize: 24,
    fontFamily: primary,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    paddingInline: 12,
    paddingBlock: 8,
    gap: 8,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      backgroundColor: `rgba(from ${kolor(60)} r g b / 0.1)`,
      color: kolor(40),
      ":hover": {
        backgroundColor: `rgba(from ${kolor(60)} r g b / 0.2)`,
        color: kolor(30),
      },
    })),
  },
})
