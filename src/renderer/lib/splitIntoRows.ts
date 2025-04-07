type Opts = {
  minCols: number
  maxCols: number
  minRows: number
}

export function splitIntoRows<T>(tiles: T[], opts: Opts) {
  const totalTiles = tiles.length

  let cols = opts.minCols
  let rows = Math.ceil(totalTiles / cols)

  while (rows > opts.minRows && cols < opts.maxCols) {
    cols++
    rows = Math.ceil(totalTiles / cols)
  }

  if (rows > opts.minRows) {
    rows = opts.minRows
    cols = Math.ceil(totalTiles / rows)
  }

  const result: T[][] = []

  for (let i = 0; i < rows; i++) {
    result.push(tiles.slice(i * cols, (i + 1) * cols))
  }

  return result
}
