import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { alpha, color } from "@/styles/colors"
import { keyframes } from "@vanilla-extract/css"
import { fontSize } from "@/styles/fontSize"
import { recipe } from "@vanilla-extract/recipes"
import { materialColors } from "@/styles/materialColors"

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
  flexDirection: "column",
  gap: 32,
})

export const roundClass = style({
  display: "flex",
  gap: 32,
})

export const roundBoxClass = recipe({
  base: {
    padding: 8,
    borderRadius: 8,
    color: color.character10,
    ...fontSize.m,
  },
  variants: {
    hue: {
      gold: {
        background: `linear-gradient(to bottom, ${alpha(materialColors.gold[70], 0.2)}, ${alpha(materialColors.gold[70], 0.5)})`,
        color: materialColors.gold[20],
      },
      bamboo: {
        background: `linear-gradient(to bottom, ${alpha(color.bamboo70, 0.2)}, ${alpha(color.bamboo70, 0.2)})`,
        color: color.bamboo20,
      },
    },
  },
})

export const menuContainerClass = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 32,
})
