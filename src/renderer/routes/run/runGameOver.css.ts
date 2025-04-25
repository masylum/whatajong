import { ANIMATION_SLOW } from "@/styles/animations.css"
import { ANIMATION_MEDIUM } from "@/styles/animations.css"
import { fromBelowAnimation } from "@/styles/animations.css"
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
  flex: 1,
  gap: 12,
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
  background: `linear-gradient(to bottom, ${color.gold80}, ${color.gold70})`,
  boxShadow: `1px -1px 0px 0 inset ${color.gold90},
      0px 0px 0px 1px ${color.gold50},
      0px 0px 3px -1px ${color.gold30},
      0px 0px 10px -5px ${color.gold30}
    `,
  color: color.gold10,
  fontVariantLigatures: "none",
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
      color: color.bam80,
    },
    [`${screenClass.classNames.variants.win.false} &`]: {
      color: color.crack80,
    },
  },
})

export const subtitleClass = style({
  ...fontSize.h3,
  textAlign: "center",
  animationName: fromBelowAnimation,
  animationDuration: ANIMATION_SLOW,
  animationFillMode: "backwards",
  color: color.crack60,
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
