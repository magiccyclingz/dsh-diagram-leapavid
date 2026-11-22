// Validate the curated palette data shipped with the plugin.
// Usage: node scripts/test-palettes.mjs
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(readFileSync(join(here, '..', 'palettes.json'), 'utf8'))

const REQUIRED = [
  'paper', 'paper2', 'ink', 'muted', 'soft',
  'rule', 'ruleSolid', 'accent', 'accentBrand', 'accentTint', 'link', 'onAccent',
]
const HEX = /^#[0-9a-f]{6}$/i
const RGBA = /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/

function rgb(hex) {
  assert.ok(HEX.test(hex), 'not a six-digit hex color: ' + hex)
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
}

function luminance(rgbValue) {
  const [r, g, b] = rgbValue.map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const l1 = luminance(rgb(a))
  const l2 = luminance(rgb(b))
  const light = Math.max(l1, l2)
  const dark = Math.min(l1, l2)
  return (light + 0.05) / (dark + 0.05)
}

assert.equal(data.version, 1)
assert.equal(data.source.name, 'LeapAvid Design MD')
assert.equal(data.source.license, 'MIT')
assert.ok(Array.isArray(data.palettes), 'palettes must be an array')
assert.equal(data.palettes.length, 10, 'expected exactly 10 curated palettes')

const ids = new Set()
let minTextContrast = Infinity
for (const p of data.palettes) {
  assert.match(p.id, /^[a-z0-9][a-z0-9-]*$/, 'bad palette id: ' + p.id)
  assert.ok(!ids.has(p.id), 'duplicate palette id: ' + p.id)
  ids.add(p.id)
  assert.ok(p.name && p.name.length >= 2, p.id + ': missing name')
  assert.ok(p.en && p.en.length >= 2, p.id + ': missing English name')
  assert.ok(p.description && p.description.length >= 12, p.id + ': description too short')
  assert.ok(p.guidance && p.guidance.length >= 8, p.id + ': guidance too short')
  assert.match(p.source, /^design-md\/[a-z0-9-]+\/DESIGN\.md$/, p.id + ': bad source path')
  assert.ok(p.mode === 'light' || p.mode === 'dark', p.id + ': bad mode')

  for (const token of REQUIRED) {
    assert.ok(typeof p.tokens[token] === 'string' && p.tokens[token].trim(), p.id + ': missing token ' + token)
  }
  for (const token of ['paper', 'paper2', 'ink', 'muted', 'soft', 'ruleSolid', 'accent', 'accentBrand', 'link', 'onAccent']) {
    assert.ok(HEX.test(p.tokens[token]), p.id + ': ' + token + ' must be a six-digit hex color')
  }
  assert.match(p.tokens.rule, RGBA, p.id + ': rule must be rgba()')
  assert.match(p.tokens.accentTint, RGBA, p.id + ': accentTint must be rgba()')

  assert.ok(Array.isArray(p.swatches) && p.swatches.length === 6, p.id + ': needs 6 swatches')
  for (const swatch of p.swatches) assert.ok(HEX.test(swatch), p.id + ': bad swatch ' + swatch)
  assert.equal(new Set(p.swatches).size, 6, p.id + ': swatches must be distinct')
  assert.ok(
    p.swatches.includes(p.tokens.accent) || p.swatches.includes(p.tokens.accentBrand),
    p.id + ': swatches should show the brand accent'
  )

  for (const role of ['ink', 'muted', 'soft', 'accent', 'link']) {
    for (const background of ['paper', 'paper2']) {
      const ratio = contrast(p.tokens[role], p.tokens[background])
      minTextContrast = Math.min(minTextContrast, ratio)
      assert.ok(ratio >= 4.5, p.id + ': ' + role + ' on ' + background + ' is ' + ratio.toFixed(2) + ':1 (need 4.5)')
    }
  }
  const onAccent = contrast(p.tokens.onAccent, p.tokens.accent)
  assert.ok(onAccent >= 4.5, p.id + ': onAccent on accent is ' + onAccent.toFixed(2) + ':1 (need 4.5)')
}

console.log('ok: ' + data.palettes.length + ' palettes; text contrast >= ' + minTextContrast.toFixed(2) + ':1; ids unique')
