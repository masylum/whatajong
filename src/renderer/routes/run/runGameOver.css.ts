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

export const gameOverClass = style({
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

export const deckClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
})

export const deckRowsClass = style({
  display: "flex",
  alignItems: "flex-start",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  position: "relative",
  zIndex: 0,
})

export const deckItemClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
})

export const pairClass = style({
  position: "absolute",
  zIndex: -1,
})

export const gameOverInfoClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  maxWidth: 600,
  margin: "0 auto",
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 16,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 24,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 32,
    },
  },
})

export const moneyClass = style({
  alignSelf: "flex-start",
  fontFamily: primary,
  ...fontSize.m,
  background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.9)}, ${alpha(color.crack40, 0.9)})`,
  boxShadow: `
    1px -1px 1px 0 inset ${color.crack60},
    0px 0px 0px 1px ${color.crack30},
    0px 0px 3px -1px ${color.crack10},
    0px 0px 10px -5px ${color.crack10}
  `,
  color: color.crack90,
  display: "inline-block",
  borderRadius: 999,
  paddingInline: 8,
  paddingBlock: 2,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h3,
      paddingInline: 12,
      paddingBlock: 4,
    },
    [mediaQuery({ p: "s", l: "m" })]: {
      ...fontSize.h2,
      paddingInline: 16,
      paddingBlock: 4,
    },
  },
})

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
    opacity: 0.7,
  },
  "100%": {
    transform: `translate(${endX}, 110dvh) rotate(${rotation})`,
    opacity: 0.7,
  },
})

export const bouncingCardClass = style({
  position: "absolute",
  animation: `${bounce} ${duration} linear infinite`,
  animationFillMode: "backwards",
  top: 0,
  left: 0,
})

export const screenClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 32,
    width: "100%",
    height: "100%",
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
        background: `linear-gradient(to bottom, ${alpha(color.bam60, 0.1)}, ${alpha(color.bam60, 0.3)})`,
        color: color.bam90,
      },
      false: {
        background: `linear-gradient(to bottom, ${alpha(color.crack60, 0.1)}, ${alpha(color.crack60, 0.3)})`,
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
  animationName: fromBelowAnimation,
  animationDuration: ANIMATION_SLOW,
  animationFillMode: "backwards",
  color: color.crack40,
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
  animationDelay: "500ms",
})
