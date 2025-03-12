import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { color } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"

import { keyframes } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

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

export const menuContainerClass = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 32,
})

export const pointsContainerClass = style({
  display: "flex",
  alignItems: "center",
  flex: 1,
  gap: 8,
})

export const pointsClass = recipe({
  base: {
    paddingInline: 12,
    paddingBlock: 4,
    ...fontSize.h2,
    borderRadius: 4,
    height: 40,
    width: 64,
    color: "white",
  },
  variants: {
    kind: {
      points: {
        background: color.circle50,
        textShadow: `2px 2px 0px ${color.circle70}`,
        textAlign: "right",
      },
      multiplier: {
        background: color.character50,
        textShadow: `2px 2px 0px ${color.character70}`,
        textAlign: "left",
      },
    },
  },
})

export const xClass = style({
  ...fontSize.h2,
  color: color.character10,
})

export const pointsContentClass = recipe({
  base: {
    paddingInline: 16,
    paddingBlock: 8,
    borderRadius: 8,
    fontFamily: primary,
    ...fontSize.l,
    zIndex: 10,
    transformOrigin: "var(--kb-hovercard-content-transform-origin)",
    animation: `${contentHide} 250ms ease-in forwards`,
    selectors: {
      "&[data-expanded]": {
        animation: `${contentShow} 150ms ease-out`,
      },
    },
  },
  variants: {
    kind: {
      points: {
        background: color.circle50,
        color: color.circle90,
      },
      multiplier: {
        background: color.character50,
        color: color.character90,
      },
    },
  },
})

export const pointsListClass = style({
  listStyle: "none",
  padding: 0,
  margin: 0,
})

export const pointsListItemClass = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
})

export const pointsListItemTitleClass = style({
  ...fontSize.l,
})

export const pointsListItemPointsClass = style({
  ...fontSize.l,
  color: "white",
})
