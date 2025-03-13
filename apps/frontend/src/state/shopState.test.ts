import { describe, expect, it } from "vitest"
import { getNextMaterials, getTransformation } from "./shopState"
import type { Material } from "@/lib/game"

describe("getNextMaterials", () => {
  function createDeckTiles(materials: Material[]) {
    return materials.map(
      (material) => ({ id: material, material, card: "b1" }) as const,
    )
  }

  function subject(inputs: Material[], outputs: Material[]) {
    expect(getNextMaterials(createDeckTiles(inputs), "mineral")).toStrictEqual(
      outputs,
    )
  }

  it("returns the appropiate material", () => {
    subject([], ["bone"])
    subject(["bone"], ["glass"])
    subject(["glass"], ["glass", "bone"])
    subject(["glass", "bone"], ["amber"])
    subject(["amber"], ["amber", "bone"])
    subject(["amber", "bone"], ["amber", "glass"])
    subject(["amber", "glass", "bone"], ["jade"])
    subject(["jade"], ["jade", "bone"])
    subject(["jade", "bone"], ["jade", "glass"])
    subject(["jade", "glass"], ["jade", "glass", "bone"])
    subject(["jade", "glass", "bone"], ["jade", "amber"])
    subject(["jade", "amber"], ["jade", "amber", "bone"])
    subject(["jade", "amber", "bone"], ["jade", "amber", "glass"])
    subject(["jade", "amber", "glass"], ["jade", "amber", "glass", "bone"])
    subject(["jade", "amber", "glass", "bone"], ["jade", "jade"])
    subject(["jade", "jade"], ["jade", "jade", "bone"])
  })
})

describe("getTransformation", () => {
  function createDeckTiles(materials: Record<string, Material>) {
    return Object.entries(materials).map(
      ([id, material]) => ({ id, material, card: "b1" }) as const,
    )
  }

  function subject(
    inputs: Record<string, Material>,
    updates: Record<string, Material>,
    removes: string[],
  ) {
    expect(getTransformation(createDeckTiles(inputs), "mineral")).toStrictEqual(
      {
        updates: updates,
        removes: removes,
      },
    )
  }

  it("returns the appropiate material", () => {
    subject({}, {}, [])
    subject({ 1: "bone" }, { 1: "glass" }, [])
    subject({ 1: "glass", 2: "bone" }, { 1: "amber" }, ["2"])
    subject({ 1: "amber", 2: "bone" }, { 1: "amber", 2: "glass" }, [])
    subject({ 1: "amber", 2: "glass", 3: "bone" }, { 1: "jade" }, ["2", "3"])
    subject({ 1: "jade", 2: "bone" }, { 1: "jade", 2: "glass" }, [])
    subject({ 1: "jade", 2: "glass", 3: "bone" }, { 1: "jade", 2: "amber" }, [
      "3",
    ])
    subject(
      { 1: "jade", 2: "amber", 3: "bone" },
      { 1: "jade", 2: "amber", 3: "glass" },
      [],
    )
    subject(
      { 1: "jade", 2: "amber", 3: "glass", 4: "bone" },
      { 1: "jade", 2: "jade" },
      ["3", "4"],
    )
  })
})
