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
  gap: 100,
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
  gap: 32,
  position: "relative",
  ":first-child": {
    flexDirection: "row",
  },
})

export const barsClass = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  gap: 12,
})

export const barClass = recipe({
  base: {
    display: "flex",
    position: "relative",
    borderRadius: 24,
    height: 12,
  },
  variants: {
    color: {
      b: { background: `rgba(from ${colors.bamboo60} r g b / 0.3)` },
      c: { background: `rgba(from ${colors.character60} r g b / 0.3)` },
      o: { background: `rgba(from ${colors.circle60} r g b / 0.3)` },
    },
  },
})

export const barImageClass = recipe({
  base: {
    position: "absolute",
    top: "50%",
    left: "50%",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
  },
  variants: {
    suit: {
      b: {
        background: colors.bamboo90,
        border: `1px solid ${colors.bamboo50}`,
      },
      c: {
        background: colors.character90,
        border: `1px solid ${colors.character50}`,
      },
      o: {
        background: colors.circle90,
        border: `1px solid ${colors.circle50}`,
      },
    },
  },
})

export const barPlayerClass = recipe({
  base: {
    position: "absolute",
    top: "50%",
    height: "100%",
    transform: "translateY(-50%)",
    borderRadius: 24,
  },
  variants: {
    suit: {
      b: {
        background: `linear-gradient(to bottom, ${colors.bamboo80}, ${colors.bamboo70})`,
        border: `1px solid ${colors.bamboo50}`,
        boxShadow: `
          1px 1px 2px 0 inset ${colors.bamboo90},
          -1px -1px 2px 0 inset ${colors.bamboo60}
        `,
      },
      c: {
        background: `linear-gradient(to bottom, ${colors.character80}, ${colors.character70})`,
        border: `1px solid ${colors.character50}`,
        boxShadow: `
          1px 1px 2px 0 inset ${colors.character90},
          -1px -1px 2px 0 inset ${colors.character60}
        `,
      },
      o: {
        background: `linear-gradient(to bottom, ${colors.circle80}, ${colors.circle70})`,
        border: `1px solid ${colors.circle50}`,
        boxShadow: `
          1px 1px 2px 0 inset ${colors.circle90},
          -1px -1px 2px 0 inset ${colors.circle60}
        `,
      },
    },
  },
})

export const playerIdClass = style({
  fontSize: "32px",
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
      c: { background: `rgba(from ${colors.character40} r g b / 0.8)` },
      f: { background: `rgba(from ${colors.bamboo40} r g b / 0.8)` },
      p: { background: `rgba(from ${colors.circle40} r g b / 0.8)` },
    },
  },
})
