import { recipe } from "@vanilla-extract/recipes"
import { color, alpha } from "@/styles/colors"
import { materialColors } from "@/styles/materialColors"

export const miniTileClass = recipe({
  base: {
    border: `1px solid ${color.tile40}`,
    borderRadius: "4px",
    padding: 2,
    background: `linear-gradient(45deg, ${color.tile80} 60%, ${color.tile70})`,
    display: "inline-block",
    verticalAlign: "middle",
    boxShadow: `0 0 4px -1px ${alpha(color.tile40, 0.5)}`,
    margin: 4,
  },
  variants: {
    material: {
      glass: {
        background: `linear-gradient(45deg, ${materialColors.glass[60]} 60%, ${materialColors.glass[50]})`,
      },
      amber: {
        background: `linear-gradient(45deg, ${materialColors.gold[60]} 60%, ${materialColors.gold[50]})`,
      },
      jade: {
        background: `linear-gradient(45deg, ${materialColors.jade[60]} 60%, ${materialColors.jade[50]})`,
      },
      bone: {
        background: `linear-gradient(45deg, ${materialColors.bone[60]} 60%, ${materialColors.bone[50]})`,
      },
      bronze: {
        background: `linear-gradient(45deg, ${materialColors.bronze[60]} 60%, ${materialColors.bronze[50]})`,
      },
      silver: {
        background: `linear-gradient(45deg, ${materialColors.silver[60]} 60%, ${materialColors.silver[50]})`,
      },
      gold: {
        background: `linear-gradient(45deg, ${materialColors.gold[60]} 60%, ${materialColors.gold[50]})`,
      },
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
