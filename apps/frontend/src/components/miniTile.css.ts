import { recipe } from "@vanilla-extract/recipes"
import { color, alpha } from "@/styles/colors"

export const miniTileClass = recipe({
  base: {
    border: `1px solid ${color.bone40}`,
    borderRadius: "4px",
    padding: 2,
    display: "inline-block",
    verticalAlign: "middle",
    boxShadow: `0 0 4px -1px ${alpha(color.bone40, 0.5)}`,
    margin: 4,
  },
  variants: {
    material: {
      glass: {
        background: `linear-gradient(45deg, ${color.glass90} 60%, ${color.glass80})`,
      },
      jade: {
        background: `linear-gradient(45deg, ${color.jade90} 60%, ${color.jade80})`,
      },
      bone: {
        background: `linear-gradient(45deg, ${color.bone90} 60%, ${color.bone80})`,
      },
      bronze: {
        background: `linear-gradient(45deg, ${color.bronze90} 60%, ${color.bronze80})`,
      },
      gold: {
        background: `linear-gradient(45deg, ${color.gold90} 60%, ${color.gold80})`,
      },
      bam: {},
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
