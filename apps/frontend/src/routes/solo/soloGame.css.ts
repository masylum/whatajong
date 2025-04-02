import { style } from "@vanilla-extract/css"
import { mediaQuery } from "@/styles/breakpoints"

export const menuContainer = style({
  display: "flex",
  justifyContent: "flex-end",
  flex: 1,
  alignItems: "center",
  gap: 12,
  "@media": {
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 16,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      gap: 24,
    },
  },
})
