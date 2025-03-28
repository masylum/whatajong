import { alpha, color } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 64,
  padding: 64,
  minHeight: "100vh",
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
    width: 300,
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
  alignItems: "center",
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
  maxWidth: 1000,
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

export const tipsClass = style({
  padding: 24,
  borderRadius: 8,
  maxWidth: 600,
  display: "flex",
  alignItems: "flex-start",
  alignSelf: "flex-end",
  gap: 16,
})

export const tipClass = style({
  color: color.dot70,
  ...fontSize.m,
  fontFamily: secondary,
  display: "flex",
  flexDirection: "column",
  gap: 16,
})

export const tipTitleClass = style({
  ...fontSize.h3,
  fontFamily: primary,
  color: color.dot60,
})
