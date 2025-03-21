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
  background: `linear-gradient(to bottom, ${color.dot10}, black)`,
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
        background: `linear-gradient(to bottom, ${alpha(color.bam40, 0.6)}, ${alpha(color.bam40, 0.2)})`,
        boxShadow: `
          1px 1px 1px 0px inset ${color.bam40},
          -1px -1px 1px 0px inset ${color.bam10}
        `,
        color: color.bam80,
      },
      false: {
        background: `linear-gradient(to bottom, ${alpha(color.dot20, 0.6)}, ${alpha(color.dot20, 0)})`,
        color: color.dot80,
      },
    },
  },
})

export const gameTitleClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  selectors: {
    [`${gameClass.classNames.variants.current.true} &`]: {
      color: color.bam60,
    },
    [`${gameClass.classNames.variants.current.false} &`]: {
      color: color.dot40,
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
  color: color.dot90,
  fontVariantLigatures: "none",
  textAlign: "center",
})

export const subtitleClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  color: color.dot60,
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
      color: color.bam60,
    },
    [`${gameClass.classNames.variants.current.false} &`]: {
      color: color.dot40,
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
      color: color.bam80,
    },
    [`${gameClass.classNames.variants.current.false} &`]: {
      color: color.dot50,
    },
  },
})
