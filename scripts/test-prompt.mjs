// Smoke-test the bundled prompt composer for every type and option.
// Usage: node scripts/test-prompt.mjs
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { composePrompt } from '../index.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
// The reference set has one extra schedule-network type with no picker
// preview; the UI and its screenshot list expose the other 50.
const types = readdirSync(join(root, 'skill/references'))
  .filter((file) => /^type-[a-z0-9-]+\.md$/.test(file) && file !== 'type-schedule-network.md')
  .map((file) => {
    const slug = file.slice('type-'.length, -'.md'.length)
    return { slug, zh: slug, title: slug }
  })
  .sort((a, b) => a.slug.localeCompare(b.slug))
const base = {
  name: '测试图',
  content: 'A -> B -> C\n强调：B 是焦点',
  variant: 'full editorial',
}

let min = Infinity
let max = 0
for (const t of types) {
  const out = await composePrompt({ ...base, slug: t.slug, typeName: t.zh, typeTitle: t.title })
  assert.ok(out.prompt.length > 50000, t.slug + ': prompt too short')
  assert.ok(out.prompt.includes('type-' + t.slug + '.md'), t.slug + ': type reference missing')
  assert.ok(out.prompt.includes('diagrams/' + t.slug + '-'), t.slug + ': output path missing')
  assert.ok(out.prompt.includes('不要调用 skill'), t.slug + ': skill override missing')
  assert.ok(out.prompt.includes('template-full.html'), t.slug + ': full template missing')
  assert.ok(out.prompt.includes('执行契约'), t.slug + ': contract missing')
  assert.equal(out.template, 'template-full.html')
  min = Math.min(min, out.prompt.length)
  max = Math.max(max, out.prompt.length)
}

const variants = [
  { variant: 'minimal light', template: 'template.html', marker: 'template.html' },
  { variant: 'minimal dark', template: 'template-dark.html', marker: 'template-dark.html' },
  { variant: 'full editorial', terminal: true, template: 'template-terminal.html', marker: 'primitive-terminal.md' },
  { variant: 'full editorial', motion: true, template: 'template-motion.html', marker: 'animation.md' },
  { variant: 'full editorial', sketchy: true, template: 'template-full.html', marker: 'primitive-sketchy.md' },
]
for (const v of variants) {
  const out = await composePrompt({ ...base, slug: 'flowchart', typeName: '流程图', typeTitle: 'Flowchart', ...v })
  assert.equal(out.template, v.template)
  assert.ok(out.prompt.includes(v.marker), v.marker + ' missing')
}

const fallback = await composePrompt({ ...base, slug: 'quadrant', variant: 'unknown' })
assert.equal(fallback.template, 'template-full.html')

const palettes = JSON.parse(readFileSync(join(root, 'palettes.json'), 'utf8')).palettes
for (const palette of palettes) {
  const out = await composePrompt({ ...base, slug: 'flowchart', typeName: '流程图', typeTitle: 'Flowchart', palette: palette.id })
  assert.equal(out.palette.id, palette.id)
  assert.ok(out.prompt.includes('本次品牌配色'), palette.id + ': palette section missing')
  assert.ok(out.prompt.includes(palette.name), palette.id + ': palette name missing')
  assert.ok(out.prompt.includes(palette.tokens.accent), palette.id + ': accent value missing')
  assert.ok(out.prompt.includes('accent fill text'), palette.id + ': accent text rule missing')
}
const terminalPalette = await composePrompt({ ...base, slug: 'flowchart', terminal: true, palette: 'airbnb' })
assert.equal(terminalPalette.palette, null)
assert.ok(!terminalPalette.prompt.includes('本次品牌配色'), 'terminal must ignore palette')

await assert.rejects(() => composePrompt({ ...base, slug: '../etc/passwd' }), /不合法/)
await assert.rejects(() => composePrompt({ ...base, slug: 'not-a-type' }), /没有这个图型/)
await assert.rejects(() => composePrompt({ ...base, slug: 'flowchart', content: '  ' }), /不能为空/)
await assert.rejects(() => composePrompt({ ...base, slug: 'flowchart', palette: 'not-a-palette' }), /没有这个配色/)

console.log('ok: ' + types.length + ' types; prompt ' + min + '–' + max + ' chars; option variants 5; palettes ' + palettes.length + '; invalid input rejected')
