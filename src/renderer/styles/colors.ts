const huesAndShades = {
  base: {
    "0": "oklch(99.85% 0.002 85)",
    "1000": "oklch(12% 0.003 85)",
  },

  bam: {
    90: "#e7f7e7",
    80: "#c7f4c7",
    70: "#a4e5a3",
    60: "#7ac077",
    50: "#3b9a36",
    40: "#005700",
    30: "#043a03",
    20: "#082107",
    10: "#001300",
  },

  crack: {
    90: "#fcf0ee",
    80: "#fdddd8",
    70: "#fdc1b9",
    60: "#f08d83",
    50: "#d94b44",
    40: "#84090b",
    30: "#58110f",
    20: "#3b0306",
    10: "#240105",
  },

  dot: {
    90: "#ecf3fd",
    80: "#d9e7fc",
    70: "#b7d4fc",
    60: "#7faeed",
    50: "#2c80ef",
    40: "#004192",
    30: "#052c63",
    20: "#011a41",
    10: "#010d26",
  },

  glass: {
    90: "#e9f3f9",
    80: "#d1e8f5",
    70: "#aecde0",
    60: "#95bbd4",
    50: "#74aacf",
    40: "#5384a3",
    30: "#385669",
    20: "#20333e",
    10: "#061015",
  },

  jade: {
    90: "#e5f9ed",
    80: "#c5f0d8",
    70: "#96ddb6",
    60: "#73ca9d",
    50: "#5eb489",
    40: "#4e8f6f",
    30: "#305a4b",
    20: "#1a342d",
    10: "#051110",
  },

  bone: {
    90: "#fef1d4",
    80: "#fee1b7",
    70: "#f8bb73",
    60: "#f3a04e",
    50: "#e4843f",
    40: "#b86544",
    30: "#7a3b2e",
    20: "#49211b",
    10: "#1a0805",
  },

  bronze: {
    90: "#fdebe3",
    80: "#ffd4c2",
    70: "#feb195",
    60: "#fe956f",
    50: "#f96e3c",
    40: "#d5491c",
    30: "#90250f",
    20: "#580e0a",
    10: "#1d0606",
  },

  gold: {
    90: "#fff1c8",
    80: "#ffe086",
    70: "#efc41f",
    60: "#d8b01c",
    50: "#ba9e2f",
    40: "#947d12",
    30: "#5f5008",
    20: "#392d05",
    10: "#130e01",
  },

  wood: {
    90: "#f5d7a8",
    80: "#e6bb7e",
    70: "#daa55e",
    60: "#cf9045",
    50: "#b47732",
    40: "#8d5c2a",
    30: "#5f3b1e",
    20: "#371c10",
    10: "#100604",
  },

  ivory: {
    90: "#fbf8f1",
    80: "#f1eee3",
    70: "#dad6c7",
    60: "#cec8b6",
    50: "#b0aa99",
    40: "#8a8370",
    30: "#595240",
    20: "#342e1d",
    10: "#120e05",
  },

  diamond: {
    90: "#faeef1",
    80: "#f6dce3",
    70: "#e1bdc7",
    60: "#d4a7b4",
    50: "#cc8ea1",
    40: "#a16c7c",
    30: "#684751",
    20: "#3e2a30",
    10: "#150b0e",
  },
} as const

const accentHues = [
  "bam",
  "crack",
  "dot",
  "glass",
  "jade",
  "bone",
  "bronze",
  "gold",
  "wood",
  "ivory",
  "diamond",
] as const

type Hue = keyof typeof huesAndShades
export type AccentHue = (typeof accentHues)[number]
type BaseHue = Exclude<Hue, AccentHue>
type ShadeTypes<H extends Hue> = keyof (typeof huesAndShades)[H]

type BaseColor = `${BaseHue}${ShadeTypes<BaseHue>}`
type AccentColor = `${AccentHue}${ShadeTypes<AccentHue>}`
type Color = BaseColor | AccentColor

const flatten: { [key: string]: string } = {}

for (const hue in huesAndShades) {
  for (const shade in huesAndShades[hue as Hue]) {
    const shades = huesAndShades[hue as Hue] as any
    flatten[`${hue}${shade}`] = shades[shade] as string
  }
}
export const color = flatten as Record<Color, string>

function colorize(hue: AccentHue, shade: ShadeTypes<AccentHue>) {
  return `${hue}${shade}` as AccentColor
}

export function hueVariants<T>(map: (fn: HueShadeGetter, hue: AccentHue) => T) {
  return accentHues.reduce(
    (acc, hue) => {
      acc[hue] = map(getHueColor(hue), hue)
      return acc
    },
    {} as { [K in AccentHue]: T },
  )
}

export function hueSelectors<T>(
  keyMap: (hue: AccentHue) => string,
  valueMap: (fn: HueShadeGetter, hue: AccentHue) => T,
) {
  return accentHues.reduce(
    (acc, hue) => {
      acc[keyMap(hue)] = valueMap(getHueColor(hue), hue)
      return acc
    },
    {} as Record<string, T>,
  )
}

export function mapHues<T>(map: (fn: HueShadeGetter, hue: AccentHue) => T[]) {
  return accentHues.flatMap((hue) => map(getHueColor(hue), hue))
}

export function alpha(colorName: string, alpha: number) {
  const r = Number.parseInt(colorName.slice(1, 3), 16)
  const g = Number.parseInt(colorName.slice(3, 5), 16)
  const b = Number.parseInt(colorName.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

type HueShadeGetter = (shade: ShadeTypes<AccentHue>) => string

export function getHueColor(hue: AccentHue): HueShadeGetter {
  return (shade: ShadeTypes<AccentHue>) => color[colorize(hue, shade)]
}
