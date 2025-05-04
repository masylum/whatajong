import {
  ANIMATION_MEDIUM,
  easeBounce,
  fromAboveAnimation,
} from "@/styles/animations.css"
import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueVariants } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const containerClass = style({
  background: 'url("./halftone.png")',
  height: "100dvh",
  width: "100dvw",
})

export const contentClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100%",
  width: "100%",
  background: `linear-gradient(to bottom, ${alpha(color.dot60, 0.1)}, ${alpha(color.dot60, 0.3)})`,
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
  color: color.dot40,
  fontVariantLigatures: "none",
  textAlign: "center",
  animationName: fromAboveAnimation,
  animationFillMode: "backwards",
  animationTimingFunction: easeBounce,
  animationDuration: ANIMATION_MEDIUM,
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
  flexDirection: "column",
  justifyContent: "center",
  gap: 24,
  minHeight: 0,
  maxWidth: 800,
  margin: "0 auto",
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 28,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 32,
    },
  },
})

export const whatajongClass = style({
  fontFamily: primary,
  color: color.crack50,
})

export const columnClass = style({
  display: "flex",
  flexDirection: "column",
  color: color.dot30,
  gap: 8,
  ...fontSize.m,
  fontFamily: secondary,
  flex: 1,
  animationName: fromAboveAnimation,
  animationFillMode: "backwards",
  animationTimingFunction: easeBounce,
  animationDuration: ANIMATION_MEDIUM,
  selectors: {
    "&:nth-child(1)": {
      animationDelay: "50ms",
    },
    "&:nth-child(2)": {
      animationDelay: "100ms",
    },
    "&:nth-child(3)": {
      animationDelay: "150ms",
    },
    "&:nth-child(4)": {
      animationDelay: "200ms",
    },
  },
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.l,
      gap: 16,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h2,
      textWrap: "pretty",
      gap: 24,
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
  margin: "0 auto",
  gap: 12,
})

export const cardTitleClass = recipe({
  base: {
    ...fontSize.h3,
    fontFamily: primary,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      color: kolor(40),
    })),
  },
})

export const rowsClass = style({
  display: "flex",
  flexDirection: "column",
  margin: "0 auto",
})

export const rowClass = style({
  display: "flex",
})

export const boardClass = style({
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 8,
  overflow: "hidden",
})

export const shopItemContainerClass = style({
  display: "flex",
  justifyContent: "center",
  margin: "0 auto",
  gap: 24,
  height: "100%",
  width: "100%",
  minHeight: 80,
})

export const materialClass = recipe({
  base: {
    padding: 12,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: alpha(kolor(60), 0.2),
      color: kolor(30),
    })),
  },
})

export const materialHeaderClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 12,
})
