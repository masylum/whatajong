import { alpha, hueVariants } from "@/styles/colors"
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
    hue: hueVariants((kolor) => ({
      backgroundColor: alpha(kolor(60), 0.1),
      color: kolor(40),
      ":hover": {
        backgroundColor: alpha(kolor(60), 0.2),
        color: kolor(30),
      },
    })),
  },
})
