import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { color } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { materials } from "@repo/game/tile"
import { fromEntries } from "remeda"
import { materialColors } from "@/styles/materialColors"
import { SIDE_SIZES, TILE_HEIGHT, TILE_WIDTH } from "@/state/constants"

export const shopClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  fontFamily: "system-ui",
})

export const titleClass = style({
  ...fontSize.hero4,
  fontFamily: primary,
  color: color.character40,
})
export const explanationClass = style({
  ...fontSize.l,
  color: color.tile20,
  background: color.tile90,
  paddingInline: 32,
  paddingBlock: 16,
  margin: 32,
  borderRadius: 8,
})

export const subtitleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
  color: color.circle40,
})

export const deckClass = style({
  display: "flex",
  flexDirection: "column",
})

export const deckRowsClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: 32,
})

export const deckRowClass = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
})

export const deckItemClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  variants: {
    hoverable: {
      true: {
        cursor: "pointer",
      },
    },
  },
})

export const deckItemCountClass = style({
  ...fontSize.m,
  fontFamily: primary,
  background: color.circle90,
  color: color.circle10,
  paddingInline: 4,
  paddingBlock: 2,
  borderRadius: 4,
  position: "absolute",
  top: 0,
  right: 0,
})

export const itemsContainerClass = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 32,
})

export const itemsClass = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
})

export const itemClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "none",
    padding: 0,
    cursor: "pointer",
    ":hover": {
      filter: "brightness(1.1)",
    },
  },
  variants: {
    material: fromEntries(
      materials.map((material) => [
        material,
        {
          color: materialColors[material][10],
        },
      ]),
    ),
  },
})

export const itemTitleClass = style({
  ...fontSize.m,
  fontFamily: primary,
})

export const itemCostClass = style({
  ...fontSize.m,
  fontFamily: primary,
})

export const rerollClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
})

export const rerollButtonClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: color.circle90,
  paddingInline: 16,
  paddingBlock: 8,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  color: color.circle40,
  height: TILE_HEIGHT + SIDE_SIZES.ySide,
  width: TILE_WIDTH - SIDE_SIZES.xSide,
  ":hover": {
    filter: "brightness(1.1)",
  },
})

export const continueClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
})
