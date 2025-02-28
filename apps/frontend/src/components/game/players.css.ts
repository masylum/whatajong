import { createVar, style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { AVATAR_SIZE } from "@/components/avatar"
import { SIDE_SIZES } from "@/state/constants"
import { alpha, color } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { fontSize } from "@/styles/fontSize"

const powerupSize = createVar()

export const playersClass = style({
  position: "relative",
  zIndex: 1,
  display: "flex",
  width: "100%",
  gap: 50,
  justifyContent: "space-between",
  alignItems: "center",
  paddingBlock: "24px",
  paddingInline: "24px",
  fontFamily: primary,
})

export const playerClass = style({
  display: "flex",
  alignItems: "center",
  flexDirection: "row-reverse",
  gap: 32,
  position: "relative",
  ":first-child": {
    flexDirection: "row",
  },
})

export const playerIdClass = style({
  ...fontSize.h3,
  lineHeight: "1",
})

export const playerPowerupsClass = style({
  position: "absolute",
  top: AVATAR_SIZE + 2 * SIDE_SIZES.ySide,
  right: 2 * SIDE_SIZES.xSide,
  display: "flex",
  flexDirection: "column",
  selectors: {
    [`${playerClass}:first-child &`]: {
      left: SIDE_SIZES.xSide,
      right: "inherit",
    },
  },
})

export const powerupRecipe = recipe({
  base: {
    vars: { [powerupSize]: "1.25" },
    display: "flex",
    alignItems: "center",
    gap: 8,
    position: "relative",
    transform: `scale(${powerupSize})`,
    transformOrigin: "top right",
    selectors: {
      [`${playerClass}:first-child &`]: {
        transformOrigin: "top left",
      },
    },
  },
  variants: {
    size: {
      0: { vars: { [powerupSize]: "0.85" } },
      1: { vars: { [powerupSize]: "0.90" } },
      2: { vars: { [powerupSize]: "0.95" } },
      3: { vars: { [powerupSize]: "1.00" } },
      4: { vars: { [powerupSize]: "1.05" } },
      5: { vars: { [powerupSize]: "1.10" } },
      6: { vars: { [powerupSize]: "1.15" } },
      7: { vars: { [powerupSize]: "1.20" } },
    },
  },
})
export const powerupTileRecipe = recipe({
  base: {},
  variants: {
    dragon: {
      c: { filter: "hue-rotate(-16deg) brightness(0.95) saturate(1.2) " },
      f: {
        filter: "brightness(0.9) sepia(0.5) hue-rotate(99deg)",
      },
      p: {
        filter: "sepia(0.4) brightness(0.9) hue-rotate(180deg) saturate(1.2)",
      },
    },
  },
})

export const comboRecipe = recipe({
  base: {
    fontSize: "14px",
    fontWeight: "500",
    color: "white",
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    left: 0,
    paddingInline: 8,
    paddingBlock: 2,
    borderRadius: 8,
    selectors: {
      [`${playerClass}:first-child &`]: {
        right: 0,
        left: "inherit",
        transform: "translate(50%, -50%)",
      },
    },
  },
  variants: {
    dragon: {
      c: { background: alpha(color.character40, 0.8) },
      f: { background: alpha(color.bamboo40, 0.8) },
      p: { background: alpha(color.circle40, 0.8) },
    },
  },
})
