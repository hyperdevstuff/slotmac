/**
 * Vendors the icon data the machine draws from into src/lib/icons/*.generated.ts.
 *
 *   node scripts/build-icons.mjs
 *
 * Two sources, both stroke icons drawn on a 24 x 24 grid:
 *   - Rune Icons  https://runeicons.com  (Apache-2.0) — every "normal" glyph
 *   - Lucide      https://lucide.dev     (ISC)        — a curated subset
 *
 * The generated files are committed; this script exists so they can be refreshed or
 * the Lucide selection widened without hand-copying path data. See
 * THIRD-PARTY-NOTICES.md for attribution.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'lib', 'icons')

const RUNE_SPRITE_URL =
  process.env.RUNE_SPRITE_URL ??
  'https://raw.githubusercontent.com/Nexvyn/runeicons/main/public/sprites/normal.svg'

/**
 * Lucide icons to vendor, grouped. Names are the package's own slugs; anything that has
 * been renamed or removed upstream is skipped with a warning rather than failing.
 */
const LUCIDE_GROUPS = {
  arrows: [
    'arrow-up-right', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down',
    'move', 'refresh-cw', 'rotate-cw', 'shuffle', 'repeat', 'corner-down-right',
    'chevron-right', 'maximize-2', 'minimize-2', 'expand', 'grip', 'grip-vertical',
    'split', 'merge', 'unfold-horizontal', 'external-link', 'link', 'unlink',
  ],
  shapes: [
    'circle', 'square', 'triangle', 'hexagon', 'diamond', 'star', 'sparkle', 'sparkles',
    'asterisk', 'plus', 'minus', 'x', 'check', 'circle-dot', 'badge-check', 'shield',
    'shield-check', 'fingerprint', 'target', 'crosshair', 'infinity', 'squircle',
  ],
  objects: [
    'box', 'package', 'package-open', 'layers', 'blocks', 'puzzle', 'component',
    'grid-2x2', 'grid-3x3', 'layout-grid', 'layout-dashboard', 'layout-template',
    'columns-3', 'frame', 'crop', 'spline', 'pen-tool', 'brush',
    'palette', 'swatch-book', 'pipette', 'paint-bucket', 'type', 'bold', 'italic',
    'underline', 'baseline', 'align-left', 'align-center', 'align-right', 'heading-1',
    'hash', 'at-sign', 'percent', 'quote', 'list', 'list-ordered', 'bookmark', 'tag',
    'key', 'lock', 'unlock', 'glasses', 'gem', 'crown', 'trophy', 'medal', 'gift',
    'dices', 'gamepad-2', 'wand-sparkles',
  ],
  dev: [
    'code', 'code-xml', 'braces', 'terminal', 'square-terminal', 'git-branch',
    'git-commit-horizontal', 'git-merge', 'git-pull-request', 'git-fork', 'database',
    'database-zap', 'server', 'server-cog', 'cloud', 'globe', 'cpu', 'hard-drive',
    'memory-stick', 'bug', 'binary', 'variable', 'square-function', 'workflow',
    'webhook', 'route', 'network', 'wifi', 'bluetooth', 'battery-charging', 'plug',
    'zap', 'radio', 'satellite',
  ],
  docs: [
    'file-text', 'notebook', 'notebook-pen', 'book-open', 'scroll', 'clipboard-list',
    'folder', 'folder-open', 'archive', 'save', 'download', 'upload', 'send', 'mail',
    'message-square', 'message-circle', 'bell', 'phone', 'inbox', 'paperclip',
  ],
  metrics: [
    'activity', 'gauge', 'trending-up', 'chart-line', 'chart-bar', 'chart-pie',
    'chart-area', 'sliders-horizontal', 'sliders-vertical', 'scale', 'weight',
    'divide', 'equal', 'sigma', 'pi', 'radical', 'brackets', 'tally-5',
  ],
  people: [
    'user', 'users', 'user-round', 'user-plus', 'user-cog', 'contact', 'id-card',
    'users-round', 'circle-user', 'person-standing',
  ],
  time: ['clock', 'timer', 'calendar', 'calendar-check', 'history', 'hourglass', 'watch'],
  money: [
    'coins', 'banknote', 'credit-card', 'wallet', 'shopping-cart', 'shopping-bag',
    'receipt', 'dollar-sign', 'piggy-bank', 'percent-circle',
  ],
  life: [
    'coffee', 'cup-soda', 'pizza', 'apple', 'leaf', 'tree-pine', 'flower', 'flower-2',
    'sprout', 'mountain', 'waves', 'wind', 'snowflake', 'droplet', 'sun', 'moon',
    'cloud-rain', 'cloud-snow', 'anchor', 'compass', 'map', 'map-pin', 'navigation',
    'flag', 'scissors', 'wrench', 'hammer', 'toolbox', 'ruler', 'magnet',
    'camera', 'aperture', 'image', 'film', 'music', 'headphones', 'mic', 'eye',
    'eye-off', 'ear', 'hand', 'heart', 'smile', 'brain', 'lightbulb', 'rocket',
    'flame', 'feather', 'shell', 'fish', 'bird', 'cat', 'dog', 'rabbit', 'turtle',
    'paw-print', 'umbrella', 'globe-2', 'tent-tree',
  ],
}

const ACCENTS = new Set(['tv', 'wifi', 'api', 'ui', 'ux', 'cpu', '3d', '2d', 'ai', 'svg'])

function titleCase(slug) {
  return slug
    .split('-')
    .map((word) => (ACCENTS.has(word) ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)))
    .join(' ')
}

/* ------------------------------------------------------------------ svg -> paths */

const attr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`))
  return match ? match[1] : undefined
}
const num = (tag, name, fallback = 0) => {
  const value = attr(tag, name)
  return value === undefined ? fallback : Number(value)
}

/** turns the shape primitives a library might use into one path `d` string */
function primitivesToPath(tag) {
  const name = tag.match(/^<([a-z]+)/)?.[1]
  if (name === 'path') return attr(tag, 'd')
  if (name === 'line') {
    return `M${num(tag, 'x1')} ${num(tag, 'y1')}L${num(tag, 'x2')} ${num(tag, 'y2')}`
  }
  if (name === 'polyline' || name === 'polygon') {
    const points = (attr(tag, 'points') ?? '').trim().split(/[\s,]+/).filter(Boolean)
    const pairs = []
    for (let i = 0; i < points.length - 1; i += 2) pairs.push(`${points[i]} ${points[i + 1]}`)
    if (pairs.length === 0) return undefined
    return `M${pairs.join('L')}${name === 'polygon' ? 'Z' : ''}`
  }
  if (name === 'circle') {
    const cx = num(tag, 'cx')
    const cy = num(tag, 'cy')
    const r = num(tag, 'r')
    return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`
  }
  if (name === 'ellipse') {
    const cx = num(tag, 'cx')
    const cy = num(tag, 'cy')
    const rx = num(tag, 'rx')
    const ry = num(tag, 'ry')
    return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0`
  }
  if (name === 'rect') {
    const x = num(tag, 'x')
    const y = num(tag, 'y')
    const w = num(tag, 'width')
    const h = num(tag, 'height')
    const rx = Math.min(num(tag, 'rx', num(tag, 'ry')), w / 2, h / 2)
    if (rx <= 0) return `M${x} ${y}H${x + w}V${y + h}H${x}Z`
    return (
      `M${x + rx} ${y}H${x + w - rx}A${rx} ${rx} 0 0 1 ${x + w} ${y + rx}` +
      `V${y + h - rx}A${rx} ${rx} 0 0 1 ${x + w - rx} ${y + h}` +
      `H${x + rx}A${rx} ${rx} 0 0 1 ${x} ${y + h - rx}` +
      `V${y + rx}A${rx} ${rx} 0 0 1 ${x + rx} ${y}Z`
    )
  }
  return undefined
}

/* ------------------------------------------------------------------ generators */

const lines = []
const emit = (...args) => lines.push(...args)

function emitIcon(def) {
  const paths = def.paths
    .map((path) => (path.fill ? `{ d: ${JSON.stringify(path.d)}, fill: true }` : `{ d: ${JSON.stringify(path.d)} }`))
    .join(', ')
  emit(
    `  {`,
    `    id: ${JSON.stringify(def.id)},`,
    `    name: ${JSON.stringify(def.name)},`,
    `    source: ${JSON.stringify(def.source)},`,
    `    group: ${JSON.stringify(def.group)},`,
    `    paths: [${paths}],`,
    `  },`,
  )
}

async function buildRune() {
  const response = await fetch(RUNE_SPRITE_URL)
  if (!response.ok) throw new Error(`Rune sprite: ${response.status}`)
  const sprite = await response.text()

  const icons = []
  for (const [, id, body] of sprite.matchAll(/<symbol id="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g)) {
    const paths = []
    for (const [tag] of body.matchAll(/<(?:path|line|polyline|polygon|circle|ellipse|rect)\b[^>]*>/g)) {
      const d = primitivesToPath(tag)
      if (!d) continue
      // the only filled strokes in the set are the dot on money-tag; note them per path
      paths.push({ d, fill: /fill="(?!none)[^"]*"/.test(tag) })
    }
    if (paths.length === 0) continue
    const dash = id.indexOf('-')
    icons.push({
      id: `rune/${id}`,
      name: titleCase(id.slice(dash + 1)),
      source: 'rune',
      group: id.slice(0, dash),
      paths,
    })
  }

  lines.length = 0
  emit(
    '/**',
    ' * Rune Icons — every glyph from the "normal" (outline) set.',
    ' *',
    ' * Source:  https://github.com/Nexvyn/runeicons  ·  https://runeicons.com',
    ' * License: Apache-2.0 (see THIRD-PARTY-NOTICES.md)',
    ' *',
    ' * Generated by scripts/build-icons.mjs — do not edit by hand.',
    ' */',
    "import type { IconDef } from './types'",
    '',
    'export const RUNE_ICONS: IconDef[] = [',
  )
  icons.sort((a, b) => a.id.localeCompare(b.id)).forEach(emitIcon)
  emit(']', '')
  await writeFile(join(OUT_DIR, 'rune.generated.ts'), lines.join('\n'))
  return icons.length
}

async function buildLucide() {
  const icons = []
  const missing = []
  for (const [group, names] of Object.entries(LUCIDE_GROUPS)) {
    for (const name of names) {
      const url = `https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/${name}.svg`
      const response = await fetch(url)
      if (!response.ok) {
        missing.push(name)
        continue
      }
      const svg = await response.text()
      const paths = []
      for (const [tag] of svg.matchAll(/<(?:path|line|polyline|polygon|circle|ellipse|rect)\b[^>]*>/g)) {
        const d = primitivesToPath(tag)
        if (d) paths.push({ d })
      }
      if (paths.length === 0) {
        missing.push(name)
        continue
      }
      icons.push({ id: `lucide/${name}`, name: titleCase(name), source: 'lucide', group, paths })
    }
  }

  lines.length = 0
  emit(
    '/**',
    ' * Lucide — a curated subset of https://lucide.dev.',
    ' *',
    ' * Source:  https://github.com/lucide-icons/lucide',
    ' * License: ISC (see THIRD-PARTY-NOTICES.md)',
    ' *',
    ' * Generated by scripts/build-icons.mjs — do not edit by hand.',
    ' */',
    "import type { IconDef } from './types'",
    '',
    'export const LUCIDE_ICONS: IconDef[] = [',
  )
  icons.forEach(emitIcon)
  emit(']', '')
  await writeFile(join(OUT_DIR, 'lucide.generated.ts'), lines.join('\n'))
  return { count: icons.length, missing }
}

await mkdir(OUT_DIR, { recursive: true })
const rune = await buildRune()
const lucide = await buildLucide()
console.log(`rune:   ${rune} icons`)
console.log(`lucide: ${lucide.count} icons`)
if (lucide.missing.length) console.log(`lucide skipped (not found upstream): ${lucide.missing.join(', ')}`)
