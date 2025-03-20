import { materials } from "@/lib/game"
import { alpha } from "@/styles/colors"
import { materialColors } from "@/styles/materialColors"
import { recipe } from "@vanilla-extract/recipes"

export const EMPEROR_WIDTH = 80
export const EMPEROR_HEIGHT = 128

export const emperorClass = recipe({
  base: {
    flexShrink: 0,
    width: EMPEROR_WIDTH,
    height: EMPEROR_HEIGHT,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: 4,
    paddingBlock: 12,
  },
  variants: {
    material: Object.fromEntries(
      materials.map((material) => [
        material,
        {
          border: `1px solid ${materialColors[material][20]}`,
          boxShadow: `
            0px 0px 0px 4px inset ${materialColors[material][70]},
            0px 0px 0px 2px ${alpha(materialColors[material][30], 0.5)}
          `,
          background: `linear-gradient(
            60deg,
            ${materialColors[material][80]} 0%,
            ${materialColors[material][90]} 50%
          )`,
        },
      ]),
    ),
  },
})
