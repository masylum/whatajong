import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { alpha, color } from "@/styles/colors"
import { keyframes } from "@vanilla-extract/css"
import { fontSize } from "@/styles/fontSize"
import { recipe } from "@vanilla-extract/recipes"
import { materialColors } from "@/styles/materialColors"

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

export const containerClass = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  fontFamily: primary,
  gap: "1.5rem",
  padding: 12,
  position: "relative",
  zIndex: 3,
  userSelect: "none",
  color: color.tile10,
  height: 150,
})

export const topContainerClass = style({
  display: "flex",
  justifyContent: "space-between",
  flex: 1,
  gap: 32,
})

export const roundClass = style({
  display: "flex",
  gap: 32,
})

export const roundTitleClass = style({
  padding: 8,
  borderRadius: 8,
  color: color.circle10,
  ...fontSize.h1,
})

export const menuContainerClass = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 32,
})

export const emperorCardClass = recipe({
  base: {
    cursor: "pointer",
    perspective: 1000,
    width: 80,
    height: 128,
    ":hover": {
      filter: "brightness(1.1)",
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
    alignItems: "center",
    justifyContent: "center",
    transform: "rotateY(180deg)",
    background: color.tile20,
    borderRadius: 16,
    padding: 12,
    boxShadow: `
      0px 0px 0px 4px inset ${materialColors.bone[10]},
      0px 0px 0px 2px ${alpha(materialColors.bone[10], 0.5)}
    `,
  },
])

export const cardBackButtonClass = style({
  color: materialColors.bone[90],
  borderRadius: 8,
  background: `linear-gradient(
  to bottom,
    ${materialColors.bone[30]},
    ${materialColors.bone[20]}
  )`,
  boxShadow: `
    1px 1px 1px 0px inset ${materialColors.bone[40]},
    -1px -1px 1px 0px inset ${alpha(materialColors.bone[10], 0.7)},
    0px 0px 0px 2px ${alpha(materialColors.bone[10], 0.5)}
  `,
  padding: 8,
  border: "none",
  cursor: "pointer",
  ":hover": {
    filter: "brightness(1.1)",
  },
})
