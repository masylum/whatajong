import { mediaQuery } from "@/styles/breakpoints"
import { color } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { keyframes, style } from "@vanilla-extract/css"

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  gap: 12,
  height: "100dvh",
  boxSizing: "border-box",
  background: color.dot10,
  color: color.dot90,
  textAlign: "center",
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      padding: 32,
      gap: 16,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      padding: 48,
      gap: 24,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      padding: 64,
      gap: 32,
    },
  },
})

export const titleClass = style({
  ...fontSize.h2,
  color: color.dot50,
  fontFamily: primary,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h1,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.hero3,
    },
    [mediaQuery({ p: "xxl", l: "xl" })]: {
      ...fontSize.hero2,
    },
  },
})

export const subtitleClass = style({
  ...fontSize.h3,
  color: color.dot80,
  fontFamily: primary,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h1,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "xxl", l: "xl" })]: {
      ...fontSize.hero3,
    },
  },
})

export const columnsClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 20,
  fontFamily: secondary,
  minHeight: 0,
})

export const explanationClass = style({
  ...fontSize.l,
  lineHeight: 1.5,
  textAlign: "left",
})

export const tilesContainerClass = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  justifyContent: "center",
  alignItems: "center",
  paddingTop: 24,
})

const float = keyframes({
  "0%": { transform: "translateY(0px) rotate(0deg)" },
  "50%": { transform: "translateY(-15px) rotate(5deg)" },
  "100%": { transform: "translateY(0px) rotate(0deg)" },
})

export const floatingTileClass = style({
  animationName: float,
  animationDuration: "4s",
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",
  selectors: {
    // Add staggered delay for a nicer effect
    "&:nth-child(2n)": {
      animationDelay: "-2s",
    },
    "&:nth-child(3n)": {
      animationDelay: "-1s",
    },
    "&:nth-child(4n)": {
      animationDelay: "-3s",
    },
  },
})

export const videoClass = style([
  {
    flex: 1,
    minHeight: 0,
    maxHeight: 360,
  },
])

export const buttonContainerClass = style({
  marginTop: 8,
})
