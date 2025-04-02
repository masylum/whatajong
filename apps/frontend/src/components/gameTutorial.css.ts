import { heightQueries, mediaQuery, widthQueries } from "@/styles/breakpoints"
import { alpha, color, hueVariants } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const FLIP_DURATION = 300

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  width: "100vw",
  background: `linear-gradient(to bottom, ${color.dot10}, black)`,
  position: "relative",
  "@media": {
    "(orientation: portrait)": {
      gap: 64,
      padding: 12,
    },
    [`(orientation: portrait) and ${widthQueries.l}`]: {
      gap: 96,
      padding: 32,
    },
    [`(orientation: portrait) and ${widthQueries.xl}`]: {
      gap: 128,
    },
    "(orientation: landscape)": {
      gap: 32,
      padding: 12,
    },
    [`(orientation: landscape) and ${heightQueries.s}`]: {
      gap: 64,
      padding: 32,
    },
    [`(orientation: portrait) and ${widthQueries.l}`]: {
      gap: 96,
    },
    [`(orientation: portrait) and ${widthQueries.xl}`]: {
      gap: 128,
    },
  },
})

export const backButtonClass = style({
  position: "absolute",
  top: 12,
  left: 12,
  "@media": {
    [mediaQuery({ p: "l", l: "s" })]: {
      top: 32,
      left: 32,
    },
  },
})

export const buttonsClass = style({
  position: "absolute",
  bottom: 12,
  right: 12,
  display: "flex",
  gap: 12,
  "@media": {
    [mediaQuery({ p: "l", l: "s" })]: {
      bottom: 32,
      right: 32,
      gap: 32,
    },
  },
})

export const titleClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  color: color.dot90,
  fontVariantLigatures: "none",
  textAlign: "center",
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero3,
    },
  },
})

export const descriptionsClass = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  flex: 1,
  gap: 12,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 16,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 24,
    },
  },
})

export const whatajongClass = style({
  fontFamily: primary,
  color: color.crack60,
})

export const descriptionClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 24,
  color: color.dot70,
  padding: 16,
  ...fontSize.m,
  fontFamily: secondary,
  flex: 1,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h2,
      textWrap: "pretty",
    },
  },
})

export const cardRowsClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 12,
})

export const cardRowClass = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
})

export const cardTitleClass = recipe({
  base: {
    ...fontSize.h3,
    fontFamily: primary,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      color: kolor(60),
    })),
  },
})

export const rowsClass = style({
  display: "flex",
  flexDirection: "column",
})

export const rowClass = style({
  display: "flex",
})

export const dragonRunClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  background: `radial-gradient(ellipse at center, ${alpha(color.bam60, 0.5)} 0%, ${alpha(color.bam60, 0.0)} 80%)`,
})
