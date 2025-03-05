import { describe, it, expect } from "vitest"
import { mapGet, mapGetHeight, mapGetLevels, mapGetWidth } from "./map"
import { DEFAULT_MAP } from "./maps/default"

describe("map", () => {
  describe("mapGet", () => {
    it("should return null for negative coordinates", () => {
      expect(mapGet(DEFAULT_MAP, -1, 0, 0)).toBeNull()
      expect(mapGet(DEFAULT_MAP, 0, -1, 0)).toBeNull()
      expect(mapGet(DEFAULT_MAP, 0, 0, -1)).toBeNull()
    })

    it("should return null for out of bounds coordinates", () => {
      expect(mapGet(DEFAULT_MAP, mapGetWidth(DEFAULT_MAP), 0, 0)).toBeNull()
      expect(mapGet(DEFAULT_MAP, 0, mapGetHeight(DEFAULT_MAP), 0)).toBeNull()
      expect(mapGet(DEFAULT_MAP, 0, 0, mapGetLevels(DEFAULT_MAP))).toBeNull()
    })

    it("should return null for empty spaces", () => {
      expect(mapGet(DEFAULT_MAP, 0, 0, 0)).toBeNull()
    })

    it("should return tile id as string for valid positions", () => {
      expect(mapGet(DEFAULT_MAP, 2, 0, 0)).toBe("12")
      expect(mapGet(DEFAULT_MAP, 3, 0, 0)).toBe("12")
    })
  })
})
