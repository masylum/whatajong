import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueSelectors, hueVariants } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100vh",
  width: "100vw",
  background: `linear-gradient(to bottom, ${color.dot10}, black)`,
  position: "relative",
  gap: 12,
  padding: 12,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 16,
      padding: 16,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 24,
      padding: 24,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 32,
      padding: 32,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      gap: 48,
      padding: 48,
    },
  },
})

export const backButtonClass = style({
  position: "absolute",
  top: 12,
  left: 12,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      top: 16,
      left: 16,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      top: 24,
      left: 24,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      top: 32,
      left: 32,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      top: 48,
      left: 48,
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
    [mediaQuery({ p: "s", l: "xs" })]: {
      bottom: 16,
      right: 16,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      bottom: 24,
      right: 24,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      bottom: 32,
      right: 32,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      bottom: 48,
      right: 48,
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

export const columnsClass = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  flex: 1,
  gap: 12,
  minHeight: 0,
  maxHeight: 500,
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

export const columnClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 24,
  color: color.dot70,
  padding: 16,
  ...fontSize.m,
  fontFamily: secondary,
  flex: 1,
  height: "100%",
  minHeight: 0,
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

export const boardClass = style({
  background: color.bone90,
  padding: 12,
  borderRadius: 8,
  position: "relative",
})

export const emperorContainerClass = style({
  position: "relative",
  height: "100%",
  width: "100%",
  maxWidth: 300,
})

export const emperorClass = recipe({
  base: {
    position: "absolute",
    borderRadius: 12,
    padding: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: kolor(20),
      border: `4px solid ${kolor(30)}`,
    })),
  },
})

export const emperorImageClass = style({
  width: "100%",
  minHeight: 0,
  objectFit: "cover",
  objectPosition: "top center",
})

export const emperorTextClass = style({
  ...fontSize.m,
  fontFamily: primary,
  display: "flex",
  flexDirection: "column",
  flex: 1,
  padding: 8,
  gap: 8,
  "@media": {
    [mediaQuery({ p: "m", l: "xs" })]: {
      padding: 12,
      gap: 12,
      ...fontSize.h3,
    },
    [mediaQuery({ p: "l", l: "s" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "xl", l: "m" })]: {
      ...fontSize.h1,
    },
  },
  selectors: {
    ...hueSelectors(
      (hue) => `${emperorClass.classNames.variants.hue[hue]} &`,
      (kolor) => ({
        color: kolor(70),
      }),
    ),
  },
})

export const shopItemContainerClass = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: 4,
  height: "100%",
  width: "100%",
  maxWidth: 300,
})

export const emperorDescriptionTextClass = style({
  ...fontSize.s,
  fontFamily: secondary,
  "@media": {
    [mediaQuery({ p: "m", l: "xs" })]: {
      ...fontSize.m,
    },
    [mediaQuery({ p: "xl", l: "m" })]: {
      ...fontSize.l,
    },
  },
  selectors: {
    ...hueSelectors(
      (hue) => `${emperorClass.classNames.variants.hue[hue]} &`,
      (kolor) => ({
        color: kolor(60),
      }),
    ),
  },
})

export const materialListClass = style({
  padding: 0,
  margin: 0,
})

export const materialListItemClass = style({
  margin: 0,
  padding: 0,
})

export const materialNameClass = recipe({
  base: {
    fontFamily: primary,
    ...fontSize.s,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      color: kolor(60),
    })),
  },
})
