import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueSelectors, hueVariants } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const detailListClass = recipe({
  base: {
    display: "grid",
    gridGap: 12,
    width: "100%",
    gridTemplateColumns: "max-content",
    padding: 8,
    borderRadius: 4,
    fontVariantLigatures: "none",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.1)}, ${alpha(kolor(50), 0.2)})`,
    })),
  },
})

export const detailTermClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "start",
  selectors: hueSelectors(
    (hue) => `${detailListClass.classNames.variants.hue[hue]} &`,
    (kolor) => ({
      color: kolor(30),
    }),
  ),
})

export const detailDescriptionClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "end",
  gridColumnStart: 2,
  selectors: hueSelectors(
    (hue) => `${detailListClass.classNames.variants.hue[hue]} &`,
    (kolor) => ({
      color: kolor(20),
    }),
  ),
})

export const detailInfoTitleClass = recipe({
  base: {
    fontFamily: primary,
    ...fontSize.s,
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        ...fontSize.m,
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      color: kolor(40),
    })),
  },
})

export const detailInfoClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    padding: 8,
    gap: 8,
    borderRadius: 4,
    background: `linear-gradient(to bottom, ${alpha(color.bone50, 0.2)}, ${alpha(color.bone50, 0.4)})`,
    fontFamily: secondary,
    ...fontSize.s,
    lineHeight: 1,
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        ...fontSize.m,
        lineHeight: 1,
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.2)}, ${alpha(kolor(50), 0.4)})`,
      color: kolor(30),
    })),
  },
})
