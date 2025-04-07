import { alpha, color, hueSelectors, hueVariants } from "@/styles/colors"
import { style, createVar } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { recipe } from "@vanilla-extract/recipes"
import { fontSize } from "@/styles/fontSize"
import { keyframes } from "@vanilla-extract/css"
import { mediaQuery } from "@/styles/breakpoints"
import {
  ANIMATION_MEDIUM,
  ANIMATION_SLOW,
  fromBelowAnimation,
} from "@/styles/animations.css"

export const startX = createVar()
export const endX = createVar()
export const rotation = createVar()
export const duration = createVar()

const bounce = keyframes({
  "0%": {
    transform: `translate(${startX}, 0dvh) rotate(0deg)`,
    opacity: 0,
  },
  "50%": {
    opacity: 1,
  },
  "100%": {
    transform: `translate(${endX}, 110dvh) rotate(${rotation})`,
    opacity: 1,
  },
})

export const bouncingCardClass = style({
  position: "absolute",
  animation: `${bounce} ${duration} linear infinite`,
  animationFillMode: "backwards",
  top: 0,
  left: 0,
  willChange: "transform",
})

export const gameOverClass = style({
  fontFamily: primary,
})

export const screenClass = recipe({
  base: {
    width: "100dvw",
    height: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 12,
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        padding: 24,
        gap: 24,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        padding: 32,
        gap: 32,
      },
      [mediaQuery({ p: "l", l: "m" })]: {
        padding: 48,
        gap: 48,
      },
      [mediaQuery({ p: "xl", l: "l" })]: {
        padding: 64,
        gap: 64,
      },
    },
  },
  variants: {
    win: {
      true: {
        background: `linear-gradient(to bottom, ${color.bam20}, ${color.bam10})`,
        color: color.bam90,
      },
      false: {
        background: `linear-gradient(to bottom, ${color.crack20}, ${color.crack10})`,
        color: color.crack90,
      },
    },
  },
})

export const titleClass = style({
  ...fontSize.h2,
  textAlign: "center",
  animationName: fromBelowAnimation,
  animationDuration: ANIMATION_SLOW,
  animationFillMode: "backwards",
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
      color: color.bam70,
    },
    [`${screenClass.classNames.variants.win.false} &`]: {
      color: color.crack70,
    },
  },
})

export const detailListClass = recipe({
  base: {
    display: "grid",
    justifyContent: "space-between",
    gridTemplateColumns: "max-content",
    width: "100%",
    rowGap: 8,
    columnGap: 32,
    padding: 8,
    borderRadius: 8,
    animationName: fromBelowAnimation,
    animationDuration: ANIMATION_MEDIUM,
    animationFillMode: "backwards",
    selectors: {
      "&:first-child": {
        animationDelay: "100ms",
      },
      "&:nth-child(2)": {
        animationDelay: "200ms",
      },
      "&:nth-child(3)": {
        animationDelay: "300ms",
      },
      "&:nth-child(4)": {
        animationDelay: "400ms",
      },
    },
    "@media": {
      [mediaQuery({ p: "m", l: "s" })]: {
        rowGap: 12,
        columnGap: 48,
        padding: 12,
        borderRadius: 12,
      },
      [mediaQuery({ p: "l", l: "m" })]: {
        rowGap: 16,
        columnGap: 64,
        padding: 16,
        borderRadius: 16,
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.4)}, ${alpha(kolor(50), 0.2)})`,
    })),
  },
})
export const detailTermClass = style({
  ...fontSize.l,
  fontFamily: primary,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h1,
    },
  },
  selectors: {
    [`${detailListClass.classNames.variants.hue.bam} &`]: {
      color: color.bam60,
    },
    [`${detailListClass.classNames.variants.hue.crack} &`]: {
      color: color.crack60,
    },
    [`${detailListClass.classNames.variants.hue.dot} &`]: {
      color: color.dot60,
    },
    [`${detailListClass.classNames.variants.hue.gold} &`]: {
      color: color.gold60,
    },
  },
})

export const detailDescriptionClass = style({
  ...fontSize.l,
  fontFamily: primary,
  justifySelf: "start",
  gridColumnStart: 2,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h1,
    },
  },
  selectors: hueSelectors(
    (hue) => `${detailListClass.classNames.variants.hue[hue]} &`,
    (kolor) => ({
      color: kolor(80),
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
  animationDelay: "500ms",
})
