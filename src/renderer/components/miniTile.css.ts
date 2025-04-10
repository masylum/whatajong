import { alpha, color, hueVariants } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"

export const miniTileClass = recipe({
  base: {
    border: `1px solid ${color.bone40}`,
    borderRadius: 3,
    display: "inline-block",
    verticalAlign: "middle",
    boxShadow: `0 0 2px -1px ${alpha(color.bone40, 0.5)}`,
    marginInline: 2,
  },
  variants: {
    material: hueVariants((kolor) => ({
      background: `linear-gradient(45deg, ${kolor(90)} 60%, ${kolor(80)})`,
    })),

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
