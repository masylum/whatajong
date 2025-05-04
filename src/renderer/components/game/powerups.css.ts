import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { createVar, fallbackVar, style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

const opacity = createVar()
const backgroundColor = createVar()

export const playerPowerupsClass = style({
  position: "absolute",
  inset: 0,
  zIndex: 2,
  pointerEvents: "none",
})

export const powerupRecipe = recipe({
  base: {
    display: "flex",
    padding: 12,
    alignItems: "center",
    gap: 8,
    height: "100%",
    width: "100%",
    position: "absolute",
    ":before": {
      content: '""',
      mixBlendMode: "color",
      position: "absolute",
      width: "100dvw",
      height: "100dvh",
      pointerEvents: "none",
      zIndex: -1,
    },
  },
  variants: {
    size: {
      0: { vars: { [opacity]: "0.3" } },
      1: { vars: { [opacity]: "0.4" } },
      2: { vars: { [opacity]: "0.5" } },
      3: { vars: { [opacity]: "0.6" } },
      4: { vars: { [opacity]: "0.7" } },
      5: { vars: { [opacity]: "0.8" } },
      6: { vars: { [opacity]: "0.9" } },
    },
    hue: hueVariants((kolor) => ({
      vars: { [backgroundColor]: kolor(50) },
    })),
    side: {
      left: {
        justifyContent: "flex-start",
        ":before": {
          top: 0,
          left: 0,
          background: `linear-gradient(
            90deg,
            rgb(from ${backgroundColor} r g b / ${fallbackVar(opacity, "1")}),
            rgba(from ${backgroundColor} r g b / 0%) 50%
          )`,
        },
      },
      right: {
        justifyContent: "flex-end",
        ":before": {
          top: 0,
          right: 0,
          background: `linear-gradient(
            -90deg,
            rgb(from ${backgroundColor} r g b / ${fallbackVar(opacity, "1")}),
            rgba(from ${backgroundColor} r g b / 0%) 50%
          )`,
        },
      },
      top: {
        flexDirection: "column",
        ":before": {
          top: 0,
          background: `linear-gradient(
            rgb(from ${backgroundColor} r g b / ${fallbackVar(opacity, "1")}),
            rgba(from ${backgroundColor} r g b / 0%) 50%
          )`,
        },
      },
    },
  },
})

export const comboRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    ...fontSize.xs,
    fontFamily: primary,
    fontWeight: "500",
    color: "white",
    paddingInline: 8,
    paddingBlock: 2,
    borderRadius: 8,
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        ...fontSize.s,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        ...fontSize.m,
      },
      [mediaQuery({ p: "l", l: "m" })]: {
        ...fontSize.l,
      },
      [mediaQuery({ p: "xl", l: "l" })]: {
        ...fontSize.h3,
      },
    },
    selectors: {
      [`${powerupRecipe.classNames.variants.side.left} &`]: {
        transform: "rotate(-90deg) translate(-50%, 50%)",
        transformOrigin: "center left",
      },
      [`${powerupRecipe.classNames.variants.side.right} &`]: {
        transform: "rotate(-90deg) translate(50%, -50%)",
        transformOrigin: "center right",
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: alpha(kolor(40), 0.8),
      textShadow: `1px 1px 0px ${alpha(kolor(60), 0.5)}`,
      ":after": {
        background: alpha(kolor(70), 0.5),
      },
    })),
  },
})

export const comboMultiplierClass = style({
  ...fontSize.m,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.h1,
    },
  },
})

export const phoenixComboClass = style({
  ...fontSize.hero3,
  position: "absolute",
  transform: "translateY(-120%)",
  zIndex: -1,
  color: alpha(color.bone40, 0.5),
  fontFamily: primary,
  top: "40%",
  right: 20,
  "@media": {
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero2,
    },
  },
})
