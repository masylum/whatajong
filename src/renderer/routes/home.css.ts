import { getTextureSrc } from "@/assets/assets"
import {
  ANIMATION_FAST,
  ANIMATION_MEDIUM,
  easeBounce,
  fromBelowAnimation,
} from "@/styles/animations.css"
import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { createVar, style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const homeClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  paddingTop: 0,
  gap: 32,
  height: "100dvh",
  fontFamily: primary,
  backgroundImage: `url(${getTextureSrc("2")})`,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      padding: 64,
      gap: 64,
      paddingTop: 0,
    },
  },
})

export const titleClass = style({
  ...fontSize.h1,
  color: color.crack50,
  textAlign: "center",
  textShadow: `0.15rem 0 2px ${alpha(color.crack50, 0.3)}`,
  animation: `${fromBelowAnimation} ${ANIMATION_MEDIUM} ${easeBounce} backwards 100ms`,
  "@media": {
    [mediaQuery({ p: "xs", l: "xxs" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.hero3,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.hero2,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero1,
    },
  },
})

export const navClass = style({
  ...fontSize.h1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  zIndex: 3,
  gap: 16,
})

export const buttonAnimationDelayVar = createVar()
export const buttonClass = recipe({
  base: {
    WebkitTapHighlightColor: "transparent",
    display: "flex",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    textDecoration: "none",
    textAlign: "center",
    paddingInline: 8,
    paddingBlock: 4,
    borderRadius: 8,
    ...fontSize.l,
    animationName: fromBelowAnimation,
    animationTimingFunction: easeBounce,
    animationDuration: ANIMATION_MEDIUM,
    animationDelay: buttonAnimationDelayVar,
    animationFillMode: "backwards",
    "@media": {
      [mediaQuery({ p: "s", l: "xxs" })]: {
        ...fontSize.h3,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        ...fontSize.h2,
        paddingInline: 16,
        paddingBlock: 12,
      },
      [mediaQuery({ p: "l", l: "m" })]: {
        ...fontSize.h1,
      },
    },
  },
  variants: {
    hue: hueVariants((hue) => ({
      borderRadius: "1.5em .5em 1.5em .5em",
      background: `linear-gradient(
        30deg,
        ${alpha(hue(50), 0)},
        ${alpha(hue(50), 0.1)},
        ${alpha(hue(50), 0)}
      )`,
      textShadow: `1px 1px 0px ${alpha(hue(60), 0.5)}`,
      color: hue(40),
      ":hover": {
        background: `linear-gradient(
        30deg,
        ${alpha(hue(50), 0)},
        ${alpha(hue(50), 0.2)},
        ${alpha(hue(50), 0)}
      )`,
        color: hue(30),
      },
    })),
  },
})

export const buttonIconClass = style({
  width: 27,
  height: 39,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      width: 36,
      height: 52,
    },
  },
})

export const frameTopClass = style({
  display: "flex",
  position: "absolute",
  top: 0,
  left: 0,
})

export const frameBottomClass = style({
  display: "flex",
  position: "absolute",
  bottom: 0,
  left: 0,
})

export const frameLeftClass = style({
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: 0,
  left: 0,
})

export const frameRightClass = style({
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: 0,
  right: 0,
})

export const cardAnimationDelayVar = createVar()
export const cardClass = style({
  position: "relative",
  display: "flex",
  animationName: fromBelowAnimation,
  animationTimingFunction: easeBounce,
  animationDuration: ANIMATION_FAST,
  animationDelay: `calc(300ms + ${cardAnimationDelayVar})`,
  animationFillMode: "backwards",
})
