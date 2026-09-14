import { LUCIDE_ICONS } from './lucide.generated'
import { RUNE_ICONS } from './rune.generated'
import type { IconDef } from './types'

export type { IconDef, IconPath, IconSource } from './types'

/** every mark the machine knows how to draw, from every vendored library */
export const ICONS: IconDef[] = [...RUNE_ICONS, ...LUCIDE_ICONS]

const BY_ID = new Map(ICONS.map((icon) => [icon.id, icon]))

export function getIcon(id: string | undefined | null): IconDef | undefined {
  return id ? BY_ID.get(id) : undefined
}

export function hasIcon(id: string): boolean {
  return BY_ID.has(id)
}

/** FNV-1a — small and stable, so a given item always lands on the same mark */
function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * An item with no icon of its own still needs *something* on the drum — an item is
 * arbitrary text, and the machine has to keep drawing. Derived from the item's id
 * rather than drawn at random, so reloading never reshuffles anybody's drums.
 */
export function defaultIconId(seed: string): string {
  return ICONS[hash(seed) % ICONS.length].id
}

export function iconIdFor(item: { id: string; icon?: string }): string {
  return item.icon && BY_ID.has(item.icon) ? item.icon : defaultIconId(item.id)
}

export function iconFor(item: { id: string; icon?: string }): IconDef {
  return BY_ID.get(iconIdFor(item)) ?? ICONS[0]
}

/** sources present in the registry, for filtering the picker */
export const ICON_SOURCES = [...new Set(ICONS.map((icon) => icon.source))]
