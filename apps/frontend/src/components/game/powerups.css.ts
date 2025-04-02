import { createVar, fallbackVar, style } from "@vanilla-extract/css"
import { alpha, color, hueVariants } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { fontSize } from "@/styles/fontSize"
import { primary } from "@/styles/fontFamily.css"

const opacity = createVar()
const backgroundColor = createVar()

export const playerPowerupsClass = style({
  position: "absolute",
  inset: 0,
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
      width: "100vw",
      height: "100vh",
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

export const lastCardClass = style({
  ...fontSize.h2,
})

export const comboRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "14px",
    fontFamily: primary,
    fontWeight: "500",
    color: "white",
    paddingInline: 8,
    paddingBlock: 2,
    borderRadius: 8,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: alpha(kolor(40), 0.8),
      textShadow: `2px 2px 0px ${alpha(kolor(70), 0.5)}`,
      ":after": {
        background: alpha(kolor(70), 0.5),
      },
    })),
  },
})

export const phoenixComboClass = style({
  ...fontSize.hero1,
  position: "absolute",
  top: "50%",
  right: 100,
  transform: "translateY(-120%)",
  zIndex: -1,
  color: alpha(color.bronze40, 0.3),
})
