import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { alpha, color } from "@/styles/colors"
import { keyframes } from "@vanilla-extract/css"
import { fontSize } from "@/styles/fontSize"
import { recipe } from "@vanilla-extract/recipes"
import { EMPEROR_HEIGHT, EMPEROR_WIDTH } from "@/components/emperor.css"
import { heightQueries, mediaQuery, widthQueries } from "@/styles/breakpoints"

export const FLIP_DURATION = 1000
export const DELETED_DURATION = 300

const deletedKeyframes = keyframes({
  "0%": {
    transform: "scale(1, 1)",
    opacity: 1,
  },
  "20%": {
    transform: "scale(1.05, 0.9)",
    opacity: 0.9,
  },
  "50%": {
    transform: "scale(0.9, 1.05)",
    opacity: 0.5,
  },
  "100%": {
    transform: "scale(0.3, 1) translate(0, 10px)",
    opacity: 0,
  },
})

export const contentShow = keyframes({
  from: {
    opacity: 0,
    transform: "scale(0.96)",
  },
  to: {
    opacity: 1,
    transform: "scale(1)",
  },
})

export const contentHide = keyframes({
  from: {
    opacity: 1,
    transform: "scale(1)",
  },
  to: {
    opacity: 0,
    transform: "scale(0.96)",
  },
})

const containerClass = style({
  padding: 12,
  display: "flex",
  fontFamily: primary,
  userSelect: "none",
  justifyContent: "space-between",
  position: "absolute",
  left: 0,
  right: 0,
  gap: 32,
  zIndex: 3,
})

export const topContainerClass = style([containerClass, { top: 0 }])
export const bottomContainerClass = style([containerClass, { bottom: 0 }])

export const roundClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  "@media": {
    [`(orientation: portrait) and ${widthQueries.l}`]: {
      gap: 12,
    },
    [`(orientation: landscape) and ${heightQueries.s}`]: {
      gap: 12,
    },
  },
})

export const roundTitleClass = style({
  color: color.dot10,
  ...fontSize.h3,
  "@media": {
    [`(orientation: portrait) and ${widthQueries.l}`]: {
      ...fontSize.h1,
    },
    [`(orientation: landscape) and ${heightQueries.s}`]: {
      ...fontSize.h1,
    },
  },
})

export const roundObjectiveClass = style({
  color: color.dot30,
  ...fontSize.l,
  "@media": {
    [`(orientation: portrait) and ${widthQueries.l}`]: {
      ...fontSize.h3,
    },
    [`(orientation: landscape) and ${heightQueries.s}`]: {
      ...fontSize.h3,
    },
  },
})

export const roundObjectiveIconClass = style({
  width: 18,
  height: 18,
  "@media": {
    [`(orientation: portrait) and ${widthQueries.l}`]: {
      width: 24,
      height: 24,
    },
    [`(orientation: landscape) and ${heightQueries.s}`]: {
      width: 24,
      height: 24,
    },
  },
})

export const emperorsClass = style({
  display: "flex",
  gap: 12,
  "@media": {
    [mediaQuery({ p: "l", l: "s" })]: {
      gap: 24,
    },
  },
})

export const menuContainerClass = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  "@media": {
    [mediaQuery({ p: "l", l: "s" })]: {
      gap: 24,
    },
  },
})

export const emperorCardClass = recipe({
  base: {
    cursor: "pointer",
    perspective: 1000,
    width: 40,
    height: 60,
    ":hover": {
      filter: "brightness(1.1)",
    },
    "@media": {
      [mediaQuery({ p: "m", l: "s" })]: {
        width: 60,
        height: 90,
      },
      [mediaQuery({ p: "l", l: "m" })]: {
        width: EMPEROR_WIDTH,
        height: EMPEROR_HEIGHT,
      },
    },
  },
  variants: {
    deleted: {
      true: {
        animation: `${deletedKeyframes} ${DELETED_DURATION}ms ease-out forwards`,
        transformOrigin: "center",
      },
    },
  },
})

export const cardClass = recipe({
  base: {
    position: "relative",
    width: "100%",
    height: "100%",
    transition: `transform ${FLIP_DURATION}ms`,
    transformStyle: "preserve-3d",
  },
  variants: {
    open: {
      true: {
        transform: "rotateY(180deg)",
      },
      false: {
        transform: "rotateY(0deg)",
      },
    },
  },
})

const bothCardsClass = style({
  position: "absolute",
  width: "100%",
  height: "100%",
  backfaceVisibility: "hidden",
})

export const cardFrontClass = style([bothCardsClass, {}])

export const cardBackClass = style([
  bothCardsClass,
  {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    color: color.bone80,
    alignItems: "center",
    justifyContent: "center",
    transform: "rotateY(180deg)",
    background: color.bone20,
    borderRadius: 16,
    padding: 12,
    boxShadow: `
      0px 0px 0px 4px inset ${color.bone10},
      0px 0px 0px 2px ${alpha(color.bone10, 0.5)}
    `,
  },
])

export const cardBackButtonClass = style({
  color: color.bone90,
  borderRadius: 8,
  background: `linear-gradient(
  to bottom,
    ${color.bone30},
    ${color.bone20}
  )`,
  boxShadow: `
    1px 1px 1px 0px inset ${color.bone40},
    -1px -1px 1px 0px inset ${alpha(color.bone10, 0.7)},
    0px 0px 0px 2px ${alpha(color.bone10, 0.5)}
  `,
  padding: 8,
  border: "none",
  cursor: "pointer",
  ":hover": {
    filter: "brightness(1.1)",
  },
})
