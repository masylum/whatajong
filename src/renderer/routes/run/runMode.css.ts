import { mediaQuery } from "@/styles/breakpoints"
import { color, hueSelectors, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { createVar, style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"
import {
  ANIMATION_MEDIUM,
  easeBounce,
  fromBelowAnimation,
} from "@/styles/animations.css"

const FLIP_DURATION = 300
const CHOICE_MODE_WIDTH = 280

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100dvh",
  width: "100dvw",
  background: `linear-gradient(to bottom, ${color.dot10}, black)`,
  position: "relative",
  gap: 32,
  padding: 12,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 64,
      padding: 12,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 96,
      padding: 32,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      gap: 128,
      padding: 32,
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

export const titleContainerClass = style({
  display: "flex",
  flexDirection: "column",
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

export const subtitleClass = style({
  ...fontSize.h3,
  fontFamily: primary,
  color: color.dot60,
  textAlign: "center",
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h1,
    },
  },
})

export const buttonContainerClass = recipe({
  base: {
    display: "flex",
    justifyContent: "center",
    position: "relative",
    minHeight: 0,
  },
  variants: {
    size: {
      mode: {
        gap: 12,
        "@media": {
          [mediaQuery({ p: "l", l: "m" })]: {
            gap: 24,
          },
          [mediaQuery({ p: "xl", l: "l" })]: {
            gap: 32,
          },
        },
      },
      emperor: {
        gap: 24,
      },
    },
  },
})

export const buttonAnimationDelayVar = createVar()

export const buttonClass = recipe({
  base: {
    borderRadius: 16,
    padding: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: `transform ${FLIP_DURATION}ms, filter ${FLIP_DURATION}ms`,
    transformStyle: "preserve-3d",
    backfaceVisibility: "hidden",
    cursor: "pointer",
    width: (CHOICE_MODE_WIDTH * 2) / 3,
    animationName: fromBelowAnimation,
    animationTimingFunction: easeBounce,
    animationDuration: ANIMATION_MEDIUM,
    animationDelay: buttonAnimationDelayVar,
    animationFillMode: "backwards",
    ":hover": {
      transform: "rotateX(-20deg) rotateY(-10deg) scale(1.2)",
      filter: "brightness(1.1)",
    },
    "@media": {
      [mediaQuery({ p: "m", l: "xs" })]: {
        borderRadius: 24,
        width: (CHOICE_MODE_WIDTH * 2) / 3,
      },
      [mediaQuery({ p: "xl", l: "m" })]: {
        width: CHOICE_MODE_WIDTH,
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: kolor(20),
      border: `4px solid ${kolor(30)}`,
    })),
  },
})

export const buttonImageClass = style({
  width: "100%",
  minHeight: 0,
  objectFit: "cover",
  maxHeight: 120,
  "@media": {
    [mediaQuery({ p: "m", l: "xs" })]: {
      maxHeight: 150,
    },
    [mediaQuery({ p: "l", l: "s" })]: {
      maxHeight: "inherit",
    },
  },
  selectors: {
    [`${buttonClass.classNames.variants.hue.bam} &:hover`]: {
      filter: "hue-rotate(45deg)",
    },
    [`${buttonClass.classNames.variants.hue.dot} &:hover`]: {
      filter: "hue-rotate(200deg)",
    },
    [`${buttonClass.classNames.variants.hue.crack} &:hover`]: {
      filter: "hue-rotate(310deg)",
    },
  },
})

export const buttonTextClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  flex: 1,
  padding: 8,
  gap: 8,
  ...fontSize.m,
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
      (hue) => `${buttonClass.classNames.variants.hue[hue]} &`,
      (kolor) => ({
        color: kolor(70),
      }),
    ),
  },
})

export const buttonSmallTextClass = style({
  ...fontSize.m,
  fontFamily: primary,
  textAlign: "center",
  selectors: {
    ...hueSelectors(
      (hue) => `${buttonClass.classNames.variants.hue[hue]} &`,
      (kolor) => ({
        color: kolor(50),
      }),
    ),
  },
  "@media": {
    [mediaQuery({ p: "m", l: "xs" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h3,
    },
  },
})
