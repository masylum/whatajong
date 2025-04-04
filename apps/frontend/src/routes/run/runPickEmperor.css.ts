import {
  ANIMATION_SLOW,
  easeBounce,
  fromBelowAnimation,
} from "@/styles/animations.css"
import { mediaQuery } from "@/styles/breakpoints"
import { color, hueSelectors, hueVariants } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { createVar, style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

const ANIMATION_DURATION = 300
const CHOICE_EMPEROR_WIDTH = 200

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100vh",
  width: "100vw",
  background: `linear-gradient(to bottom, ${color.dot10}, black)`,
  position: "relative",
  gap: 32,
  padding: 12,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 64,
      padding: 12,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 96,
      padding: 32,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
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
  animationName: fromBelowAnimation,
  animationTimingFunction: easeBounce,
  animationDuration: ANIMATION_SLOW,
  animationDelay: "100ms",
  animationFillMode: "backwards",
  "@media": {
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.hero3,
    },
  },
})

export const buttonContainerClass = style({
  display: "flex",
  justifyContent: "center",
  position: "relative",
  gap: 12,
  "@media": {
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 24,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      gap: 32,
    },
  },
})

export const buttonAnimationDelayVar = createVar()

export const buttonClass = recipe({
  base: {
    borderRadius: 12,
    padding: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: `transform ${ANIMATION_DURATION}ms, filter ${ANIMATION_DURATION}ms`,
    transformStyle: "preserve-3d",
    cursor: "pointer",
    width: CHOICE_EMPEROR_WIDTH,
    animationName: fromBelowAnimation,
    animationTimingFunction: easeBounce,
    animationDuration: ANIMATION_SLOW,
    animationDelay: buttonAnimationDelayVar,
    animationFillMode: "backwards",

    ":hover": {
      transform: "rotateX(-20deg) rotateY(-10deg) scale(1.2)",
      filter: "brightness(1.1)",
    },
    "@media": {
      [mediaQuery({ p: "m", l: "xs" })]: {
        width: CHOICE_EMPEROR_WIDTH * 1.2,
        borderRadius: 16,
      },
      [mediaQuery({ p: "l", l: "s" })]: {
        width: CHOICE_EMPEROR_WIDTH * 1.3,
      },
      [mediaQuery({ p: "xl", l: "m" })]: {
        width: CHOICE_EMPEROR_WIDTH * 1.4,
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
  objectFit: "cover",
  objectPosition: "top center",
  maxHeight: 120,
  "@media": {
    [mediaQuery({ p: "m", l: "xs" })]: {
      maxHeight: 160,
    },
    [mediaQuery({ p: "l", l: "s" })]: {
      maxHeight: 200,
    },
    [mediaQuery({ p: "xl", l: "m" })]: {
      maxHeight: 300,
    },
  },
})

export const buttonTextClass = style({
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
      (hue) => `${buttonClass.classNames.variants.hue[hue]} &`,
      (kolor) => ({
        color: kolor(70),
      }),
    ),
  },
})

export const buttonDescriptionTextClass = style({
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
      (hue) => `${buttonClass.classNames.variants.hue[hue]} &`,
      (kolor) => ({
        color: kolor(60),
      }),
    ),
  },
})
