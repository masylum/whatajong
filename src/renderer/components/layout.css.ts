import { widthQueries } from "@/styles/breakpoints"

import { color } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"

export const landscapeClass = style({
  display: "flex",
  background: `linear-gradient(to bottom, ${color.crack20}, black)`,
  height: "100dvh",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 16,
})

export const titleClass = style({
  color: color.crack50,
  ...fontSize.hero4,
  fontFamily: primary,
  textAlign: "center",
  "@media": {
    [widthQueries.xs]: {
      ...fontSize.hero3,
    },
    [widthQueries.s]: {
      ...fontSize.hero2,
    },
  },
})

export const subtitleClass = style({
  color: color.dot60,
  textAlign: "center",
  ...fontSize.h2,
  fontFamily: primary,
  "@media": {
    [widthQueries.s]: {
      ...fontSize.h1,
    },
  },
})
