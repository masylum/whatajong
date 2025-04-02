import { alpha, hueVariants, mapHues } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { primary } from "@/styles/fontFamily.css"
import { mediaQuery } from "@/styles/breakpoints"
import { fontSize } from "@/styles/fontSize"
import { globalStyle } from "@vanilla-extract/css"

export const buttonClass = recipe({
  base: {
    ...fontSize.m,
    fontFamily: primary,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    paddingInline: 8,
    paddingBlock: 4,
    gap: 4,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    outline: "none",
    ":focus": {
      outlineOffset: 2,
    },
    ":disabled": {
      opacity: 0.5,
      cursor: "inherit",
    },
    "@media": {
      [mediaQuery({ p: "l", l: "m" })]: {
        paddingInline: 12,
        paddingBlock: 8,
        ...fontSize.h3,
        gap: 8,
      },
    },
  },
  variants: {
    kind: {
      dark: {},
      light: {},
    },
    hue: hueVariants(() => ({})),
  },
  compoundVariants: mapHues((kolor, hue) => [
    {
      variants: {
        kind: "light",
        hue,
      },
      style: {
        backgroundColor: alpha(kolor(50), 0.2),
        color: kolor(40),
        ":focus": {
          outline: `2px solid ${kolor(50)}`,
        },
        selectors: {
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(kolor(50), 0.3),
            color: kolor(30),
          },
        },
      },
    },
    {
      variants: {
        kind: "dark",
        hue,
      },
      style: {
        backgroundColor: alpha(kolor(60), 0.2),
        color: kolor(80),
        ":focus": {
          outline: `2px solid ${kolor(50)}`,
        },
        selectors: {
          "&:hover:not(:disabled)": {
            backgroundColor: alpha(kolor(60), 0.3),
            color: kolor(90),
          },
        },
      },
    },
  ]),
  defaultVariants: {
    kind: "light",
  },
})

globalStyle(`${buttonClass.classNames.base} > svg`, {
  width: 16,
  height: 16,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      width: 20,
      height: 20,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      width: 24,
      height: 24,
    },
  },
})

export const shopButtonClass = recipe({
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingInline: 8,
    paddingBlock: 4,
    borderRadius: 8,
    fontFamily: primary,
    ...fontSize.l,
    whiteSpace: "nowrap",
    fontVariantLigatures: "none",
    outline: "none",
    outlineOffset: 2,
    selectors: {
      "&:not(:disabled):hover": {
        cursor: "pointer",
        filter: "brightness(1.1)",
      },
    },
    "@media": {
      [mediaQuery({ p: "l", l: "m" })]: {
        gap: 8,
        paddingInline: 12,
        paddingBlock: 8,
        ...fontSize.h3,
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${kolor(50)}, ${kolor(40)})`,
      border: `1px solid ${kolor(30)}`,
      color: kolor(90),
      ":focus": {
        outline: `2px solid ${kolor(50)}`,
      },
      boxShadow: `
          -1px -1px 1px 0 inset ${kolor(20)},
          1px 1px 1px 0 inset ${kolor(60)},
          0px 0px 5px -3px ${kolor(10)},
          0px 0px 10px -5px ${kolor(10)}
        `,
    })),
  },
})
