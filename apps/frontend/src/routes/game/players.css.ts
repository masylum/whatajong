import { createVar, style } from "@vanilla-extract/css"
import { fontFamily } from "../game.css"
import { AVATAR_SIZE } from "@/components/avatar"
import { SIDE_SIZES } from "../state"
import { colors } from "@/components/colors"
import { recipe } from "@vanilla-extract/recipes"

const powerupSize = createVar()

export const playersClass = style({
  position: "relative",
  zIndex: 1,
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBlock: "24px",
  paddingInline: "24px",
  fontFamily,
})

export const playerClass = style({
  display: "flex",
  alignItems: "center",
  flexDirection: "row-reverse",
  flex: 1,
  gap: 32,
  position: "relative",
  ":first-child": {
    flexDirection: "row",
  },
})

export const barsClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 16,
  background: `
    linear-gradient(
      to bottom,
      rgba(from ${colors.tile90} r g b / 0.7),
      rgba(from ${colors.tile80} r g b / 0.7)
    )`,
  border: `1px solid rgba(from ${colors.tile40} r g b / 0.7)`,
  borderRadius: 12,
})

export const barClass = style({
  display: "flex",
  width: "300px",
  position: "relative",
  borderRadius: 4,
  background: colors.tile50,
  height: 1,
})

export const barPlayerClass = style({
  position: "absolute",
  top: 0,
  height: 3,
  transform: "translateY(-50%)",
})

export const playerIdClass = style({
  fontSize: "24px",
  fontWeight: "500",
})

export const playerPointsClass = style({
  fontSize: "18px",
  fontWeight: "500",
})

export const playerPowerupsClass = style({
  position: "absolute",
  top: AVATAR_SIZE,
  right: 2 * SIDE_SIZES.xSide,
  display: "flex",
  flexDirection: "column",
  selectors: {
    [`${playerClass}:first-child &`]: {
      left: 2 * SIDE_SIZES.xSide,
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
      c: { background: `rgba(from ${colors.character} r g b / 0.8)` },
      f: { background: `rgba(from ${colors.bamboo} r g b / 0.8)` },
      p: { background: `rgba(from ${colors.circle} r g b / 0.8)` },
    },
  },
})
