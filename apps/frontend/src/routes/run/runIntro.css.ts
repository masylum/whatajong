import { heightQueries, mediaQuery, widthQueries } from "@/styles/breakpoints"
import { color, hueSelectors, hueVariants } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const FLIP_DURATION = 300
export const CHOICE_MODE_WIDTH = 280
export const CHOICE_EMPEROR_WIDTH = 200

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minHeight: "100vh",
  width: "100vw",
  background: `linear-gradient(to bottom, ${color.dot10}, black)`,
  position: "relative",
  "@media": {
    "(orientation: portrait)": {
      gap: 64,
      padding: 12,
    },
    [`(orientation: portrait) and ${widthQueries.l}`]: {
      gap: 96,
      padding: 32,
    },
    [`(orientation: portrait) and ${widthQueries.xl}`]: {
      gap: 128,
    },
    "(orientation: landscape)": {
      gap: 32,
      padding: 12,
    },
    [`(orientation: landscape) and ${heightQueries.s}`]: {
      gap: 64,
      padding: 32,
    },
    [`(orientation: portrait) and ${widthQueries.l}`]: {
      gap: 96,
    },
    [`(orientation: portrait) and ${widthQueries.xl}`]: {
      gap: 128,
    },
  },
})

export const backButtonClass = style({
  position: "absolute",
  top: 12,
  left: 12,
  "@media": {
    [mediaQuery({ p: "l", l: "s" })]: {
      top: 32,
      left: 32,
    },
  },
})

export const titleContainerClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 12,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 16,
    },
  },
})

export const titleClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  color: color.dot90,
  fontVariantLigatures: "none",
  textAlign: "center",
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero3,
    },
  },
})

export const subtitleClass = style({
  ...fontSize.h3,
  fontFamily: primary,
  color: color.dot60,
  textAlign: "center",
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h1,
    },
  },
})

export const buttonContainerClass = recipe({
  base: {
    display: "flex",
    justifyContent: "center",
    position: "relative",
  },
  variants: {
    size: {
      mode: {
        gap: 12,
        "@media": {
          [mediaQuery({ p: "l", l: "m" })]: {
            gap: 24,
          },
          [mediaQuery({ p: "xl", l: "l" })]: {
            gap: 32,
          },
        },
      },
      emperor: {
        gap: 24,
      },
    },
  },
})

export const buttonClass = recipe({
  base: {
    borderRadius: 16,
    padding: 0,
    width: CHOICE_MODE_WIDTH,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: `transform ${FLIP_DURATION}ms, filter ${FLIP_DURATION}ms`,
    transformStyle: "preserve-3d",
    backfaceVisibility: "hidden",
    cursor: "pointer",
    ":hover": {
      transform: "rotateX(-20deg) rotateY(-10deg) scale(1.2)",
      filter: "brightness(1.1)",
    },
    selectors: {
      [`${buttonContainerClass.classNames.variants.size.mode} &`]: {
        width: (CHOICE_MODE_WIDTH * 2) / 3,
      },
      [`${buttonContainerClass.classNames.variants.size.emperor} &`]: {
        width: (CHOICE_EMPEROR_WIDTH * 2) / 3,
      },
    },
    "@media": {
      [mediaQuery({ p: "m", l: "xs" })]: {
        borderRadius: 24,
        selectors: {
          [`${buttonContainerClass.classNames.variants.size.mode} &`]: {
            width: (CHOICE_MODE_WIDTH * 2) / 3,
          },
          [`${buttonContainerClass.classNames.variants.size.emperor} &`]: {
            width: (CHOICE_EMPEROR_WIDTH * 2) / 3,
          },
        },
      },
      [mediaQuery({ p: "xl", l: "m" })]: {
        selectors: {
          [`${buttonContainerClass.classNames.variants.size.mode} &`]: {
            width: CHOICE_MODE_WIDTH,
          },
          [`${buttonContainerClass.classNames.variants.size.emperor} &`]: {
            width: CHOICE_EMPEROR_WIDTH,
          },
        },
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: kolor(20),
      border: `4px solid ${kolor(30)}`,
    })),
  },
})

export const buttonImageClass = style({
  width: "100%",
  objectFit: "cover",
  maxHeight: 120,
  "@media": {
    [mediaQuery({ p: "m", l: "xs" })]: {
      maxHeight: 150,
    },
    [mediaQuery({ p: "l", l: "s" })]: {
      maxHeight: "inherit",
    },
  },
  selectors: {
    [`${buttonClass.classNames.variants.hue.bam} &:hover`]: {
      filter: "hue-rotate(45deg)",
    },
    [`${buttonClass.classNames.variants.hue.dot} &:hover`]: {
      filter: "hue-rotate(200deg)",
    },
    [`${buttonClass.classNames.variants.hue.crack} &:hover`]: {
      filter: "hue-rotate(310deg)",
    },
  },
})

export const buttonTextClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  flex: 1,
  padding: 8,
  gap: 8,
  "@media": {
    [mediaQuery({ p: "m", l: "xs" })]: {
      padding: 12,
      gap: 12,
      selectors: {
        [`${buttonContainerClass.classNames.variants.size.mode} &`]: {
          ...fontSize.h3,
        },
      },
    },
    [mediaQuery({ p: "l", l: "s" })]: {
      selectors: {
        [`${buttonContainerClass.classNames.variants.size.mode} &`]: {
          ...fontSize.h2,
        },
      },
    },
    [mediaQuery({ p: "xl", l: "m" })]: {
      selectors: {
        [`${buttonContainerClass.classNames.variants.size.mode} &`]: {
          ...fontSize.h1,
        },
      },
    },
  },
  selectors: {
    [`${buttonContainerClass.classNames.variants.size.mode} &`]: {
      ...fontSize.m,
    },
    [`${buttonContainerClass.classNames.variants.size.emperor} &`]: {
      ...fontSize.h2,
    },
    ...hueSelectors(
      (hue) => `${buttonClass.classNames.variants.hue[hue]} &`,
      (kolor) => ({
        color: kolor(70),
      }),
    ),
  },
})

export const buttonSmallTextClass = style({
  ...fontSize.m,
  fontFamily: primary,
  textAlign: "center",
  selectors: {
    ...hueSelectors(
      (hue) => `${buttonClass.classNames.variants.hue[hue]} &`,
      (kolor) => ({
        color: kolor(50),
      }),
    ),
  },
  "@media": {
    [mediaQuery({ p: "m", l: "xs" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h3,
    },
  },
})

export const buttonDescriptionTextClass = style({
  ...fontSize.l,
  fontFamily: secondary,
  selectors: {
    [`${buttonContainerClass.classNames.variants.size.mode} &`]: {
      ...fontSize.l,
    },
    [`${buttonContainerClass.classNames.variants.size.emperor} &`]: {
      ...fontSize.m,
    },
    ...hueSelectors(
      (hue) => `${buttonClass.classNames.variants.hue[hue]} &`,
      (kolor) => ({
        color: kolor(60),
      }),
    ),
  },
})

export const floatingExplanationClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 24,
  color: color.dot70,
  padding: 16,
  ...fontSize.l,
  fontFamily: secondary,
  width: 200,
})

export const suitExplanationClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 20,
})

export const suitExplanationItemClass = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
})

export const suitExplanationTitleClass = recipe({
  base: {
    ...fontSize.h3,
    fontFamily: primary,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      color: kolor(60),
    })),
  },
})

export const suitExplanationTilesClass = style({
  display: "flex",
  gap: 12,
})
