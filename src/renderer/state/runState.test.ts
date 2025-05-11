import type { Material } from "@/lib/game"
import { describe, expect, it } from "vitest"
import { getNextMaterials, getTransformation } from "./runState"

describe("getNextMaterials", () => {
  function createDeckTiles(materials: Material[]) {
    return materials.map(
      (material) => ({ id: material, material, cardId: "windw" }) as const,
    )
  }

  function subject(inputs: Material[], outputs: Material[]) {
    expect(getNextMaterials(createDeckTiles(inputs), "k")).toStrictEqual(
      outputs,
    )
  }

  it("returns the appropiate material", () => {
    subject([], ["bone"])
    subject(["bone"], ["bone", "bone"])
    subject(["bone", "bone"], ["quartz"])
    subject(["quartz"], ["quartz", "bone"])
    subject(["quartz", "bone"], ["quartz", "bone", "bone"])
    subject(["quartz", "bone", "bone"], ["quartz", "quartz"])
    subject(["quartz", "quartz"], ["quartz", "quartz", "bone"])
    subject(["quartz", "quartz", "bone"], ["quartz", "quartz", "bone", "bone"])
    subject(["quartz", "quartz", "bone", "bone"], ["obsidian"])
    subject(["obsidian"], ["obsidian", "bone"])
    subject(["obsidian", "bone"], ["obsidian", "bone", "bone"])
    subject(["obsidian", "bone", "bone"], ["obsidian", "quartz"])
    subject(["obsidian", "quartz"], ["obsidian", "quartz", "bone"])
    subject(
      ["obsidian", "quartz", "bone"],
      ["obsidian", "quartz", "bone", "bone"],
    )
    subject(
      ["obsidian", "quartz", "bone", "bone"],
      ["obsidian", "quartz", "quartz"],
    )
    subject(
      ["obsidian", "quartz", "quartz"],
      ["obsidian", "quartz", "quartz", "bone"],
    )
    subject(
      ["obsidian", "quartz", "quartz", "bone"],
      ["obsidian", "quartz", "quartz", "bone", "bone"],
    )
    subject(
      ["obsidian", "quartz", "quartz", "bone", "bone"],
      ["obsidian", "obsidian"],
    )
  })
})

describe("getTransformation", () => {
  function createDeckTiles(materials: Record<string, Material>) {
    return Object.entries(materials).map(
      ([id, material]) => ({ id, material, cardId: "windw" }) as const,
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
    expect(getTransformation(createDeckTiles(inputs), "k")).toStrictEqual({
      adds,
      updates,
      removes,
    })
  }

  it("returns the appropiate material", () => {
    subject({}, { adds: true, updates: {}, removes: [] })
    subject({ 1: "bone" }, { adds: true, updates: {}, removes: [] })
    subject(
      { 1: "bone", 2: "bone" },
      { adds: false, updates: { 1: "quartz" }, removes: ["2"] },
    )
    subject({ 1: "quartz" }, { adds: true, updates: {}, removes: [] })
    subject(
      { 1: "quartz", 2: "bone" },
      { adds: true, updates: {}, removes: [] },
    )
    subject(
      { 1: "quartz", 2: "bone", 3: "bone" },
      { adds: false, updates: { 2: "quartz" }, removes: ["3"] },
    )
    subject(
      { 1: "quartz", 2: "quartz" },
      { adds: true, updates: {}, removes: [] },
    )
    subject(
      { 1: "quartz", 2: "quartz", 3: "bone" },
      { adds: true, updates: {}, removes: [] },
    )
    subject(
      { 1: "quartz", 2: "quartz", 3: "bone", 4: "bone" },
      { adds: false, updates: { 1: "obsidian" }, removes: ["2", "3", "4"] },
    )
  })
})
