import {
  ANIMATION_MEDIUM,
  ANIMATION_SLOW,
  easeBounce,
  fromAboveAnimation,
  fromBelowAnimation,
} from "@/styles/animations.css"
import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueSelectors, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { createVar, keyframes, style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const startX = createVar()
export const endX = createVar()
export const rotation = createVar()
export const duration = createVar()

const fallAnimation = keyframes({
  "0%": {
    transform: `translate(${startX}, 0dvh) rotate(0deg)`,
    opacity: 0,
  },
  "50%": {
    opacity: 0.7,
  },
  "100%": {
    transform: `translate(${endX}, 110dvh) rotate(${rotation})`,
    opacity: 0.7,
  },
})

const fadeIn = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
})

export const fallingTileClass = style({
  position: "absolute",
  animation: `${fallAnimation} ${duration} linear infinite`,
  animationFillMode: "backwards",
  top: 0,
  left: 0,
})

export const screenClass = recipe({
  base: {
    position: "absolute",
    inset: 0,
    fontFamily: primary,
    zIndex: 3,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 32,
    animation: `${fadeIn} 1000ms ${easeBounce}`,
    "@media": {
      [mediaQuery({ p: "m", l: "s" })]: {
        padding: 24,
        gap: 64,
      },
      [mediaQuery({ p: "xl", l: "l" })]: {
        padding: 64,
      },
    },
  },
  variants: {
    win: {
      true: {
        background: `
          linear-gradient(to bottom, ${alpha(color.bam70, 0.7)}, ${alpha(color.bam90, 0.95)}),
          radial-gradient(ellipse at center, ${alpha(color.bam70, 1)}, ${alpha(color.bam90, 0)} 90%)
        `,
        color: color.bam90,
      },
      false: {
        background: `
          linear-gradient(to bottom, ${alpha(color.crack60, 0.7)}, ${alpha(color.crack90, 0.95)}),
          radial-gradient(ellipse at center, ${alpha(color.crack60, 1)}, ${alpha(color.crack90, 0)} 90%)
        `,
        color: color.crack90,
      },
    },
  },
})

export const titleClass = style({
  ...fontSize.h2,
  textAlign: "center",
  animationName: fromAboveAnimation,
  animationDuration: ANIMATION_SLOW,
  animationFillMode: "backwards",
  animationTimingFunction: easeBounce,
  animationDelay: "100ms",
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.h1,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero3,
    },
  },
  selectors: {
    [`${screenClass.classNames.variants.win.true} &`]: {
      color: color.bam40,
    },
    [`${screenClass.classNames.variants.win.false} &`]: {
      color: color.crack40,
    },
  },
})

export const subtitleClass = style({
  ...fontSize.h3,
  textAlign: "center",
  animationName: fromAboveAnimation,
  animationDuration: ANIMATION_SLOW,
  animationFillMode: "backwards",
  animationTimingFunction: easeBounce,
  color: color.crack30,
  animationDelay: ANIMATION_SLOW,
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

// TODO: Dry
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
        animationDelay: "400ms",
      },
      "&:nth-child(2)": {
        animationDelay: "600ms",
      },
      "&:nth-child(3)": {
        animationDelay: "800ms",
      },
      "&:nth-child(4)": {
        animationDelay: "1000ms",
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
      background: `linear-gradient(to right, ${alpha(kolor(50), 0.4)}, ${alpha(kolor(50), 0.2)})`,
      border: `1px solid ${alpha(kolor(40), 0.2)}`,
      boxShadow: `
        0 0 3px ${alpha(kolor(20), 0.1)},
        0 0 8px -3px ${alpha(kolor(30), 0.1)}
      `,
    })),
  },
})

// TODO: Dry
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

// TODO: Dry
export const itemValueClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "start",
  gridColumnStart: 2,
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
      color: kolor(30),
    }),
  ),
})

export const scoreClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  gap: 8,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 12,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 16,
    },
  },
})

export const buttonsClass = style({
  display: "flex",
  gap: 16,
  animationName: fromBelowAnimation,
  animationDuration: ANIMATION_MEDIUM,
  animationFillMode: "backwards",
  animationDelay: "1000ms",
})
