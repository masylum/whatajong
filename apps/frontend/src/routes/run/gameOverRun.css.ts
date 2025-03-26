import { style } from "@vanilla-extract/css"
import { alpha, color } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"
import { primary } from "@/styles/fontFamily.css"
import { recipe } from "@vanilla-extract/recipes"
import { getSideSize } from "@/state/constants"
import { TILE_HEIGHT } from "@/state/constants"

const sideSize = getSideSize(TILE_HEIGHT)

export const gameOverClass = style({
  display: "flex",
  justifyContent: "space-between",
  gap: 64,
})

export const pointsContainerClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  paddingInline: 32,
  paddingBlock: 24,
  borderRadius: 32,
  gap: 16,
})

export const detailListClass = recipe({
  base: {
    display: "grid",
    rowGap: 16,
    columnGap: 64,
    justifyContent: "space-between",
    gridTemplateColumns: "max-content",
    padding: 16,
    borderRadius: 16,
    width: "100%",
  },
  variants: {
    hue: {
      bamb: {
        background: `linear-gradient(to bottom, ${alpha(color.bam50, 0.4)}, ${alpha(color.bam50, 0.2)})`,
      },
      crack: {
        background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.4)}, ${alpha(color.crack50, 0.2)})`,
      },
      dot: {
        background: `linear-gradient(to bottom, ${alpha(color.dot50, 0.4)}, ${alpha(color.dot50, 0.2)})`,
      },
      gold: {
        background: `linear-gradient(to bottom, ${alpha(color.gold50, 0.4)}, ${alpha(color.gold50, 0.2)})`,
      },
    },
  },
})
export const detailTermClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  selectors: {
    [`${detailListClass.classNames.variants.hue.bamb} &`]: {
      color: color.bam60,
    },
    [`${detailListClass.classNames.variants.hue.crack} &`]: {
      color: color.crack60,
    },
    [`${detailListClass.classNames.variants.hue.dot} &`]: {
      color: color.dot60,
      ...fontSize.hero4,
    },
    [`${detailListClass.classNames.variants.hue.gold} &`]: {
      color: color.gold60,
    },
  },
})

export const detailDescriptionClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  justifySelf: "start",
  gridColumnStart: 2,
  selectors: {
    [`${detailListClass.classNames.variants.hue.bamb} &`]: {
      color: color.bam80,
    },
    [`${detailListClass.classNames.variants.hue.crack} &`]: {
      color: color.crack80,
    },
    [`${detailListClass.classNames.variants.hue.dot} &`]: {
      color: color.dot80,
      ...fontSize.hero4,
    },
    [`${detailListClass.classNames.variants.hue.gold} &`]: {
      color: color.gold80,
    },
  },
})

export const gameOverButtonsClass = style({
  display: "flex",
  gap: 16,
})

export const deckClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
})

export const titleClass = style({
  ...fontSize.h1,
  fontFamily: primary,
})

export const deckRowsClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingRight: sideSize * 2,
  paddingBottom: sideSize * 2,
  position: "relative",
  zIndex: 0,
})

export const deckRowClass = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
})

export const deckItemClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  left: 0,
  top: 0,
})

export const pairClass = style({
  position: "absolute",
  zIndex: -1,
  top: sideSize,
  left: sideSize,
})

export const ownedEmperorsClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
})

export const ownedEmperorsTitleClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  display: "flex",
  alignItems: "center",
  gap: 12,
})

export const ownedEmperorsListClass = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
})

export const emperorClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  justifyContent: "center",
  border: "none",
  background: "none",
  padding: 0,
  color: color.crack10,
  position: "relative",
  left: 0,
  top: 0,
})

export const gameOverInfoClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 32,
})

// TODO: DRY
export const moneyClass = style({
  fontFamily: primary,
  ...fontSize.h2,
  paddingInline: 16,
  paddingBlock: 4,
  background: `linear-gradient(to bottom, ${color.gold80}, ${color.gold70})`,
  boxShadow: `1px -1px 0px 0 inset ${color.gold90},
      0px 0px 0px 1px ${color.gold50},
      0px 0px 3px -1px ${color.gold30},
      0px 0px 10px -5px ${color.gold30}
    `,
  color: color.gold10,
  fontVariantLigatures: "none",
  display: "inline-block",
  borderRadius: 999,
})
