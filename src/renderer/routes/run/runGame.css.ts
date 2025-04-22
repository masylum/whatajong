import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"

export const roundClass = style({
  display: "flex",
  flexDirection: "column",
  fontFamily: primary,
  borderRadius: 8,
  overflow: "hidden",
  border: `2px solid ${color.dot30}`,
  backgroundColor: color.dot30,
  boxShadow: `
    0px 0px 0px 1px ${color.dot30},
    0px 0px 0px 3px ${alpha(color.dot30, 0.1)},
    0px 0px 5px -3px ${color.dot10},
    0px 0px 10px -5px ${color.dot10}
  `,
  ...fontSize.s,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.m,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.h2,
    },
  },
})

export const roundTitleClass = style({
  color: color.dot90,
  textAlign: "center",
  paddingInline: 4,
  padding: 2,
  flex: 1,
})

export const roundObjectiveClass = style({
  color: color.dot30,
  background: color.dot90,
  textAlign: "center",
  paddingInline: 4,
  padding: 2,
  flex: 1,
})
