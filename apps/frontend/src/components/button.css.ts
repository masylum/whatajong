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
