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
  height: "100dvh",
  width: "100dvw",
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
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  "@media": {
    [mediaQuery({ p: "l", l: "m" })]: {
      flexDirection: "row",
      flex: "inherit",
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
    alignItems: "center",
    transition: `transform ${ANIMATION_DURATION}ms, filter ${ANIMATION_DURATION}ms`,
    transformStyle: "preserve-3d",
    cursor: "pointer",
    animationName: fromBelowAnimation,
    animationTimingFunction: easeBounce,
    animationDuration: ANIMATION_SLOW,
    animationDelay: buttonAnimationDelayVar,
    animationFillMode: "backwards",

    ":hover": {
      transform: "rotateX(20deg) rotateY(-5deg) scaleY(1.1)",
      filter: "brightness(1.1)",
    },

    "@media": {
      [mediaQuery({ p: "m", l: "xs" })]: {
        borderRadius: 16,
      },
      [mediaQuery({ p: "l", l: "s" })]: {
        flexDirection: "column",
        width: CHOICE_EMPEROR_WIDTH * 1.3,
        ":hover": {
          transform: "rotateX(-20deg) rotateY(-10deg) scale(1.2)",
          filter: "brightness(1.1)",
        },
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
  objectFit: "cover",
  objectPosition: "top center",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  flex: 1,
  "@media": {
    [mediaQuery({ p: "m", l: "m" })]: {
      width: "100%",
    },
    [mediaQuery({ p: "l", l: "l" })]: {},
  },
})

export const buttonTextClass = style({
  ...fontSize.l,
  fontFamily: primary,
  display: "flex",
  flexDirection: "column",
  flex: 1,
  padding: 8,
  gap: 8,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      padding: 12,
      gap: 12,
      ...fontSize.h2,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
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
