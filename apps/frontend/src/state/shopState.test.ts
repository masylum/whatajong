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
    subject(["bone"], ["bone", "bone"])
    subject(["bone", "bone"], ["glass"])
    subject(["glass"], ["glass", "bone"])
    subject(["glass", "bone"], ["glass", "bone", "bone"])
    subject(["glass", "bone", "bone"], ["glass", "glass"])
    subject(["glass", "glass"], ["glass", "glass", "bone"])
    subject(["glass", "glass", "bone"], ["glass", "glass", "bone", "bone"])
    subject(["glass", "glass", "bone", "bone"], ["jade"])
    subject(["jade"], ["jade", "bone"])
    subject(["jade", "bone"], ["jade", "bone", "bone"])
    subject(["jade", "bone", "bone"], ["jade", "glass"])
    subject(["jade", "glass"], ["jade", "glass", "bone"])
    subject(["jade", "glass", "bone"], ["jade", "glass", "bone", "bone"])
    subject(["jade", "glass", "bone", "bone"], ["jade", "glass", "glass"])
    subject(["jade", "glass", "glass"], ["jade", "glass", "glass", "bone"])
    subject(
      ["jade", "glass", "glass", "bone"],
      ["jade", "glass", "glass", "bone", "bone"],
    )
    subject(["jade", "glass", "glass", "bone", "bone"], ["jade", "jade"])
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
    {
      adds,
      updates,
      removes,
    }: {
      adds: boolean
      updates: Record<string, Material>
      removes: string[]
    },
  ) {
    expect(getTransformation(createDeckTiles(inputs), "mineral")).toStrictEqual(
      { adds, updates, removes },
    )
  }

  it("returns the appropiate material", () => {
    subject({}, { adds: true, updates: {}, removes: [] })
    subject({ 1: "bone" }, { adds: true, updates: {}, removes: [] })
    subject(
      { 1: "bone", 2: "bone" },
      { adds: false, updates: { 1: "glass" }, removes: ["2"] },
    )
    subject({ 1: "glass" }, { adds: true, updates: {}, removes: [] })
    subject({ 1: "glass", 2: "bone" }, { adds: true, updates: {}, removes: [] })
    subject(
      { 1: "glass", 2: "bone", 3: "bone" },
      { adds: false, updates: { 2: "glass" }, removes: ["3"] },
    )
    subject(
      { 1: "glass", 2: "glass" },
      { adds: true, updates: {}, removes: [] },
    )
    subject(
      { 1: "glass", 2: "glass", 3: "bone" },
      { adds: true, updates: {}, removes: [] },
    )
    subject(
      { 1: "glass", 2: "glass", 3: "bone", 4: "bone" },
      { adds: false, updates: { 1: "jade" }, removes: ["2", "3", "4"] },
    )
  })
})
