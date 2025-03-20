import { recipe } from "@vanilla-extract/recipes"
import { color, alpha } from "@/styles/colors"
import { materialColors } from "@/styles/materialColors"

export const miniTileClass = recipe({
  base: {
    border: `1px solid ${color.tile40}`,
    borderRadius: "4px",
    padding: 2,
    display: "inline-block",
    verticalAlign: "middle",
    boxShadow: `0 0 4px -1px ${alpha(color.tile40, 0.5)}`,
    margin: 4,
  },
  variants: {
    material: {
      glass: {
        background: `linear-gradient(45deg, ${materialColors.glass[90]} 60%, ${materialColors.glass[80]})`,
      },
      jade: {
        background: `linear-gradient(45deg, ${materialColors.jade[90]} 60%, ${materialColors.jade[80]})`,
      },
      bone: {
        background: `linear-gradient(45deg, ${materialColors.bone[90]} 60%, ${materialColors.bone[80]})`,
      },
      bronze: {
        background: `linear-gradient(45deg, ${materialColors.bronze[90]} 60%, ${materialColors.bronze[80]})`,
      },
      gold: {
        background: `linear-gradient(45deg, ${materialColors.gold[90]} 60%, ${materialColors.gold[80]})`,
      },
      bamboo: {},
    },
    highlighted: {
      true: {
        ":before": {
          content: "",
          background: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  },
})
