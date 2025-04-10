import type { Material } from "@/lib/game"
import { describe, expect, it } from "vitest"
import { getNextMaterials, getTransformation } from "./shopState"

describe("getNextMaterials", () => {
  function createDeckTiles(materials: Material[]) {
    return materials.map(
      (material) => ({ id: material, material, card: "b1" }) as const,
    )
  }

  function subject(inputs: Material[], outputs: Material[]) {
    expect(getNextMaterials(createDeckTiles(inputs), "freedom")).toStrictEqual(
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
    subject(["glass", "glass", "bone", "bone"], ["diamond"])
    subject(["diamond"], ["diamond", "bone"])
    subject(["diamond", "bone"], ["diamond", "bone", "bone"])
    subject(["diamond", "bone", "bone"], ["diamond", "glass"])
    subject(["diamond", "glass"], ["diamond", "glass", "bone"])
    subject(["diamond", "glass", "bone"], ["diamond", "glass", "bone", "bone"])
    subject(["diamond", "glass", "bone", "bone"], ["diamond", "glass", "glass"])
    subject(
      ["diamond", "glass", "glass"],
      ["diamond", "glass", "glass", "bone"],
    )
    subject(
      ["diamond", "glass", "glass", "bone"],
      ["diamond", "glass", "glass", "bone", "bone"],
    )
    subject(
      ["diamond", "glass", "glass", "bone", "bone"],
      ["diamond", "diamond"],
    )
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
    expect(getTransformation(createDeckTiles(inputs), "freedom")).toStrictEqual(
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
      { adds: false, updates: { 1: "diamond" }, removes: ["2", "3", "4"] },
    )
  })
})
