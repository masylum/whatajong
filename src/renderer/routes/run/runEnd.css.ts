import {
  ANIMATION_SLOW,
  easeBounce,
  fromAboveAnimation,
  fromBelowAnimation,
} from "@/styles/animations.css"
import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueSelectors, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const containerClass = style({
  fontFamily: primary,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 32,
  backgroundImage: "url(/halftone.png)",
  width: "100dvw",
  height: "100dvh",
  position: "relative",
  overflow: "hidden",
  "@media": {
    [mediaQuery({ p: "xl", l: "l" })]: {
      flexDirection: "row",
      gap: 64,
    },
  },
})

export const contentClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 12,
  gap: 32,
  width: "100%",
  height: "100%",
  animation: `${fromAboveAnimation} ${ANIMATION_SLOW} ${easeBounce}`,
  background: `linear-gradient(to bottom, ${alpha(color.bam60, 0.2)}, ${alpha(color.bam60, 0.4)})`,
  color: color.bam90,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      padding: 24,
      gap: 64,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      padding: 64,
    },
  },
})

export const titleContainerClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 12,
})

export const titleClass = style({
  ...fontSize.h1,
  textAlign: "center",
  animationName: fromAboveAnimation,
  animationDuration: ANIMATION_SLOW,
  animationFillMode: "backwards",
  animationTimingFunction: easeBounce,
  color: color.bam40,
  "@media": {
    [mediaQuery({ p: "m", l: "m" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "l", l: "l" })]: {
      ...fontSize.hero3,
    },
    [mediaQuery({ p: "xl", l: "xl" })]: {
      ...fontSize.hero2,
    },
  },
})

export const subtitleClass = style({
  ...fontSize.h3,
  textAlign: "center",
  animationName: fromBelowAnimation,
  animationDuration: ANIMATION_SLOW,
  animationFillMode: "backwards",
  color: color.bam30,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h1,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero4,
    },
  },
})

export const detailsClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  color: color.bam40,
})

export const detailListClass = recipe({
  base: {
    display: "grid",
    justifyContent: "space-between",
    gridTemplateColumns: "max-content",
    width: "100%",
    rowGap: 8,
    columnGap: 32,
    padding: 12,
    borderRadius: 8,
    animationName: fromAboveAnimation,
    animationDuration: ANIMATION_SLOW,
    animationTimingFunction: easeBounce,
    animationFillMode: "backwards",
    selectors: {
      "&:first-child": {
        animationDelay: "200ms",
      },
      "&:nth-child(2)": {
        animationDelay: "400ms",
      },
      "&:nth-child(3)": {
        animationDelay: "600ms",
      },
      "&:nth-child(4)": {
        animationDelay: "800ms",
      },
    },
    "@media": {
      [mediaQuery({ p: "m", l: "s" })]: {
        rowGap: 12,
        columnGap: 48,
      },
      [mediaQuery({ p: "l", l: "m" })]: {
        rowGap: 16,
        columnGap: 64,
        padding: 16,
        borderRadius: 12,
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: alpha(kolor(50), 0.1),
    })),
  },
})
export const itemKeyClass = style({
  ...fontSize.m,
  fontFamily: primary,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h2,
    },
  },
  selectors: hueSelectors(
    (hue) => `${detailListClass.classNames.variants.hue[hue]} &`,
    (kolor) => ({
      color: kolor(40),
    }),
  ),
})

export const itemValueClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "start",
  gridColumnStart: 2,
  "@media": {
    [mediaQuery({ p: "m", l: "m" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "l", l: "l" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "xl", l: "xl" })]: {
      ...fontSize.h2,
    },
  },
  selectors: hueSelectors(
    (hue) => `${detailListClass.classNames.variants.hue[hue]} &`,
    (kolor) => ({
      color: kolor(30),
    }),
  ),
})
