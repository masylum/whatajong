import { mediaQuery } from "@/styles/breakpoints"
import { color } from "@/styles/colors"
import { style } from "@vanilla-extract/css"

export const emperorClass = style({
  borderRadius: 8,
  border: `1px solid ${color.bone40}`,
  "@media": {},
  [mediaQuery({ p: "xl", l: "m" })]: {
    borderRadius: 16,
  },
})

// TODO: deprecate
export const EMPEROR_WIDTH = 100
export const EMPEROR_HEIGHT = 150
