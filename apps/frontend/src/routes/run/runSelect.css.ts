import { alpha, color } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 128,
  height: "100vh",
  width: "100vw",
  background: color.circle10,
})

export const gamesClass = style({
  display: "flex",
  justifyContent: "space-between",
  gap: 64,
})

export const gameClass = recipe({
  base: {
    borderRadius: 8,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    gap: 32,
  },
  variants: {
    current: {
      true: {
        background: `linear-gradient(to bottom, ${alpha(color.character30, 0.6)}, ${alpha(color.character30, 0)})`,
        color: color.character80,
      },
      false: {
        background: `linear-gradient(to bottom, ${alpha(color.circle30, 0.6)}, ${alpha(color.circle30, 0)})`,
        color: color.circle80,
      },
    },
  },
})

export const gameTitleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
})

export const gameDescriptionClass = recipe({
  base: {
    ...fontSize.h1,
    textAlign: "center",
    fontFamily: primary,
  },
  variants: {
    current: {
      true: {
        color: color.character70,
      },
      false: {
        color: color.circle70,
      },
    },
  },
})

export const gameRewardsClass = recipe({
  base: {
    ...fontSize.h1,
    textAlign: "center",
    fontFamily: primary,
  },
  variants: {
    current: {
      true: {
        color: color.character60,
      },
      false: {
        color: color.circle60,
      },
    },
  },
})

export const titleContainerClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
})

export const titleClass = style({
  ...fontSize.hero3,
  fontFamily: primary,
  color: color.circle90,
})

export const subtitleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
  color: color.circle70,
})
