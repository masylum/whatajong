import { alpha, hueVariants, mapHues } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { primary } from "@/styles/fontFamily.css"

export const buttonClass = recipe({
  base: {
    fontSize: 24,
    fontFamily: primary,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    paddingInline: 12,
    paddingBlock: 8,
    gap: 8,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
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
        ":hover": {
          backgroundColor: alpha(kolor(50), 0.3),
          color: kolor(30),
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
        ":hover": {
          backgroundColor: alpha(kolor(60), 0.3),
          color: kolor(90),
        },
      },
    },
  ]),
  defaultVariants: {
    kind: "light",
  },
})

export const shopButtonClass = recipe({
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingInline: 12,
    paddingBlock: 8,
    borderRadius: 8,
    fontFamily: primary,
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
