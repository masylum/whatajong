import { alpha, color } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 128,
  padding: 32,
  height: "100vh",
  width: "100vw",
  background: color.circle10,
})

export const gamesClass = style({
  display: "flex",
  justifyContent: "space-between",
  gap: 32,
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
        background: `linear-gradient(to bottom, ${alpha(color.bamboo40, 0.6)}, ${alpha(color.bamboo40, 0.2)})`,
        boxShadow: `
          1px 1px 0px 0px inset ${alpha(color.bamboo60, 0.5)},
          -1px -1px 0px 0px inset ${alpha(color.bamboo40, 1)}
        `,
        color: color.bamboo80,
      },
      false: {
        background: `linear-gradient(to bottom, ${alpha(color.circle30, 0.6)}, ${alpha(color.circle30, 0)})`,
        color: color.circle80,
      },
    },
  },
})

export const gameTitleClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  selectors: {
    [`${gameClass.classNames.variants.current.true} &`]: {
      color: color.bamboo60,
    },
    [`${gameClass.classNames.variants.current.false} &`]: {
      color: color.circle50,
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
  textAlign: "center",
})

export const subtitleClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  color: color.circle70,
  textAlign: "center",
})

export const detailListClass = style({
  display: "grid",
  gridGap: 12,
  width: "100%",
  gridTemplateColumns: "max-content",
})

export const detailTermClass = style({
  ...fontSize.l,
  fontFamily: primary,
  justifySelf: "end",
  selectors: {
    [`${gameClass.classNames.variants.current.true} &`]: {
      color: color.bamboo60,
    },
    [`${gameClass.classNames.variants.current.false} &`]: {
      color: color.circle50,
    },
  },
})

export const detailDescriptionClass = style({
  ...fontSize.l,
  fontFamily: primary,
  justifySelf: "start",
  gridColumnStart: 2,
  selectors: {
    [`${gameClass.classNames.variants.current.true} &`]: {
      color: color.bamboo80,
    },
    [`${gameClass.classNames.variants.current.false} &`]: {
      color: color.circle70,
    },
  },
})
