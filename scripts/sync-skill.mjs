// Refresh ./skill from a local cathrynlavery/diagram-design checkout.
// Usage: node scripts/sync-skill.mjs [path-to-repo-or-skill-dir]
// Default: DIAGRAM_DESIGN_SKILL, then /tmp/diagram-design-upstream.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const dest = join(root, 'skill')
const input = process.argv[2] || process.env.DIAGRAM_DESIGN_SKILL || '/tmp/diagram-design-upstream'
const repo = resolve(input)
const candidates = [join(repo, 'skills/diagram-design'), repo]
const src = candidates.find((p) => existsSync(join(p, 'SKILL.md')) && existsSync(join(p, 'references')))
if (!src) {
  console.error('找不到 diagram-design skill：' + repo)
  process.exit(1)
}

mkdirSync(dest, { recursive: true })
for (const dir of ['references', 'templates']) {
  rmSync(join(dest, dir), { recursive: true, force: true })
  mkdirSync(join(dest, dir), { recursive: true })
}
cpSync(join(src, 'SKILL.md'), join(dest, 'SKILL.md'))
cpSync(join(src, 'references'), join(dest, 'references'), { recursive: true })
for (const name of ['template.html', 'template-dark.html', 'template-full.html', 'template-terminal.html', 'template-motion.html']) {
  cpSync(join(src, 'assets', name), join(dest, 'templates', name))
}

let license = join(repo, 'LICENSE')
if (!existsSync(license)) license = join(src, 'LICENSE')
if (existsSync(license)) cpSync(license, join(dest, 'LICENSE'))

let commit = ''
try { commit = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() } catch {}
const version = readFileSync(join(src, 'SKILL.md'), 'utf8').match(/version:\s*"([^"]+)"/)?.[1] || ''
writeFileSync(join(dest, 'UPSTREAM.json'), JSON.stringify({
  repository: 'https://github.com/cathrynlavery/diagram-design',
  license: 'MIT',
  version,
  commit,
  syncedFrom: src,
  note: 'Bundled so the panel never needs an installed skill. See ../THIRD-PARTY-NOTICES.md.',
}, null, 2) + '\n')
console.log('synced ' + src + ' -> ' + dest + (commit ? ' @ ' + commit.slice(0, 12) : ''))
