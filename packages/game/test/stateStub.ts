import type { AssetById, TileById } from "../types"

export function stateStub() {
  const n = null
  const map = [
    [
      // level(0)
      [2, 2, 3, 3, n, n],
      [2, 2, 3, 3, n, n],
      [4, 4, 5, 5, 6, 6],
      [4, 4, 5, 5, 6, 6],
      [7, 7, 8, 8, 9, 9],
      [7, 7, 8, 8, 9, 9],
    ],
    [
      // level(1)
      [n, n, n, n, n, n],
      [n, 1, 1, n, n, n],
      [n, 1, 1, n, n, n],
      [n, n, n, n, n, n],
      [n, n, n, n, n, n],
      [n, n, n, n, n, n],
    ],
  ]

  const tiles = {
    "1": {
      position: { x: 1, y: 1, z: 1 },
      card: "b1",
      deleted: false,
      id: "1",
    },
    "2": {
      position: { x: 0, y: 0, z: 0 },
      card: "b3",
      deleted: false,
      id: "2",
    },
    "3": {
      position: { x: 2, y: 0, z: 0 },
      card: "b2",
      deleted: false,
      id: "3",
    },
    "4": {
      position: { x: 0, y: 2, z: 0 },
      card: "b2",
      deleted: false,
      id: "4",
    },
    "5": {
      position: { x: 2, y: 2, z: 0 },
      card: "b3",
      deleted: false,
      id: "5",
    },
    "6": {
      position: { x: 4, y: 2, z: 0 },
      card: "b1",
      deleted: false,
      id: "6",
    },
    "7": {
      position: { x: 0, y: 4, z: 0 },
      card: "b4",
      deleted: false,
      id: "7",
    },
    "8": {
      position: { x: 2, y: 4, z: 0 },
      card: "b4",
      deleted: false,
      id: "8",
    },
    "9": {
      position: { x: 4, y: 4, z: 0 },
      card: "b5",
      deleted: false,
      id: "9",
    },
  } as TileById

  const assets = {
    "1": {
      id: "1",
      card: "b1",
      timestamp: 1,
      playerId: "1",
    },
  } as AssetById

  return { map, tiles, assets }
}
