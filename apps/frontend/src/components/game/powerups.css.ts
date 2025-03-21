import { createVar, fallbackVar, style } from "@vanilla-extract/css"
import { alpha, color } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { fontSize } from "@/styles/fontSize"

const opacity = createVar()
const backgroundColor = createVar()

export const playerPowerupsClass = style({
  position: "absolute",
  top: 0,
  right: 0,
  display: "flex",
  flexDirection: "column",
})

export const powerupRecipe = recipe({
  base: {
    display: "flex",
    padding: 12,
    alignItems: "center",
    gap: 8,
    position: "relative",
    ":before": {
      content: '""',
      background: `linear-gradient(
        -135deg,
        rgb(from ${backgroundColor} r g b / ${fallbackVar(opacity, "1")}),
        rgba(from ${backgroundColor} r g b / 0%) 50%
      )`,
      mixBlendMode: "color",
      position: "absolute",
      top: 0,
      right: 0,
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
    },
  },
  variants: {
    size: {
      0: { vars: { [opacity]: "0.1" } },
      1: { vars: { [opacity]: "0.2" } },
      2: { vars: { [opacity]: "0.4" } },
      3: { vars: { [opacity]: "0.6" } },
      4: { vars: { [opacity]: "0.7" } },
      5: { vars: { [opacity]: "0.8" } },
      6: { vars: { [opacity]: "0.9" } },
    },
    dragon: {
      c: { vars: { [backgroundColor]: color.crack50 } },
      f: { vars: { [backgroundColor]: color.bam50 } },
      p: { vars: { [backgroundColor]: color.dot60 } },
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
    fontWeight: "500",
    color: "white",
    paddingInline: 8,
    paddingBlock: 2,
    borderRadius: 8,
  },
  variants: {
    dragon: {
      c: {
        background: alpha(color.crack40, 0.8),
        textShadow: `2px 2px 0px ${alpha(color.crack70, 0.5)}`,
      },
      f: {
        background: alpha(color.bam40, 0.8),
        textShadow: `2px 2px 0px ${alpha(color.bam70, 0.5)}`,
        ":after": {
          background: alpha(color.bam70, 0.5),
        },
      },
      p: {
        background: alpha(color.dot40, 0.8),
        textShadow: `2px 2px 0px ${alpha(color.dot70, 0.5)}`,
      },
    },
  },
})
