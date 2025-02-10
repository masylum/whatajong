import { describe, it, expect } from "vitest"
import { isFree, PositionMap, hasSupport } from "./map"

function createPositionMap() {
  const positionMap = new PositionMap()
  /** Create a small pseudo-pyramid structure:
  /* [
  /*   // level(1)
  /*   [n, n, n, n, n, n],
  /*   [n, 1, 1, n, n, n],
  /*   [n, 1, 1, n, n, n],
  /*   [n, n, n, n, n, n],
  /*   [n, n, n, n, n, n]
  /*   [n, n, n, n, n, n],
  /* ],
  /* [
  /*   // level(0)
  /*   [2, 2, 3, 3, n, n],
  /*   [2, 2, 3, 3, n, n],
  /*   [4, 4, 5, 5, 6, 6],
  /*   [4, 4, 5, 5, 6, 6],
  /*   [7, 7, 8, 8, 9, 9]
  /*   [7, 7, 8, 8, 9, 9],
  /* ]
  */
  const tiles = [
    { x: 0, y: 0, z: 0 },
    { x: 2, y: 0, z: 0 },
    { x: 0, y: 2, z: 0 },
    { x: 2, y: 2, z: 0 },
    { x: 4, y: 2, z: 0 },
    { x: 0, y: 4, z: 0 },
    { x: 2, y: 4, z: 0 },
    { x: 4, y: 4, z: 0 },
    { x: 1, y: 1, z: 1 },
  ] as const

  for (const pos of tiles) {
    positionMap.add(pos)
  }

  return positionMap
}

describe("map", () => {
  const map = createPositionMap()

  describe("PositionMap", () => {
    it("should store and retrieve positions", () => {
      expect(map.has({ x: 0, y: 0, z: 0 })).toBe(true)
      expect(map.has({ x: 1, y: 0, z: 0 })).toBe(false)
    })
  })

  describe("isFree", () => {
    it("should identify free positions", () => {
      expect(isFree({ x: 1, y: 1, z: 1 }, map)).toBe(true)
      expect(isFree({ x: 4, y: 2, z: 0 }, map)).toBe(true)
      expect(isFree({ x: 0, y: 4, z: 0 }, map)).toBe(true)
    })

    it("should identify covered positions", () => {
      expect(isFree({ x: 0, y: 0, z: 0 }, map)).toBe(false)
      expect(isFree({ x: 2, y: 0, z: 0 }, map)).toBe(false)
      expect(isFree({ x: 0, y: 2, z: 0 }, map)).toBe(false)
      expect(isFree({ x: 2, y: 2, z: 0 }, map)).toBe(false)
    })

    it("should identify blocked positions", () => {
      expect(isFree({ x: 2, y: 2, z: 0 }, map)).toBe(false)
      expect(isFree({ x: 2, y: 4, z: 0 }, map)).toBe(false)
    })
  })

  describe("hasSupport", () => {
    it("should allow directly above pieces", () => {
      expect(hasSupport({ x: 0, y: 4, z: 1 }, map)).toBe(true)
      expect(hasSupport({ x: 1, y: 1, z: 2 }, map)).toBe(true)
    })

    it("should accept two-tile support", () => {
      expect(hasSupport({ x: 1, y: 4, z: 1 }, map)).toBe(true)
    })

    it("should accept four-tile support", () => {
      expect(hasSupport({ x: 1, y: 3, z: 1 }, map)).toBe(true)
    })

    it("should reject insufficient support", () => {
      expect(hasSupport({ x: 3, y: 1, z: 1 }, map)).toBe(false)
      expect(hasSupport({ x: 4, y: 1, z: 1 }, map)).toBe(false)
      expect(hasSupport({ x: 4, y: 0, z: 1 }, map)).toBe(false)
    })
  })
})
