import path from 'node:path'

const TYPE_DROP_RE = /^(variants?|examples?|worked example|reproduction)\b/i

function splitSections(md) {
  const chunks = md.split(/^## /m)
  return { head: chunks.shift() || '', sections: chunks }
}

function sectionTitle(chunk) {
  return chunk.split('\n', 1)[0].replace(/^\d+\.\s*/, '').trim()
}

export function compactSkill(md) {
  const { head, sections } = splitSections(md)
  const keep = sections.filter((chunk) => /^(Philosophy|Universal Anti-patterns|Pre-Output Checklist)/i.test(sectionTitle(chunk)))
  let out = head.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '') + keep.map((chunk) => '## ' + chunk).join('\n')
  out = out.replace(/^- \[ \] From the installed skill directory, did .*$/m, '- [ ] Accessible SVG contract: role="img", aria-labelledby, `<title>` first, filled title/desc IDs; content inside the viewBox.')
  out = out.replace(/^- \[ \] All six §6 connector rules hold\? From the installed skill directory,.*$/m, '- [ ] All six §6 connector rules hold? Check them on the render-and-look PNG (§10) when possible.')
  return out
}

function compactTypography(chunk, content) {
  const parts = chunk.split(/^### /m)
  const head = parts.shift() || ''
  const keep = ['Font stack', 'Font source', 'Traditional Chinese labels']
  if (/[\uAC00-\uD7AF]/.test(content)) keep.push('Korean labels')
  if (/[\u0400-\u04FF]/.test(content)) keep.push('Cyrillic labels')
  const selected = parts.filter((part) => {
    const title = part.split('\n', 1)[0].trim()
    return keep.some((prefix) => title.startsWith(prefix))
  })
  return head + selected.map((part) => '### ' + part).join('\n')
}

export function compactStyleGuide(md, content) {
  const { head, sections } = splitSections(md)
  const out = []
  for (const chunk of sections) {
    const title = sectionTitle(chunk)
    if (/^(Tokens|Stroke, radius, spacing|Node type → treatment|Customizing the skin)/.test(title)) {
      out.push('## ' + chunk)
    } else if (/^Typography/.test(title)) {
      out.push('## ' + compactTypography(chunk, content))
    }
  }
  return head + out.join('\n')
}

export function compactType(md) {
  const { head, sections } = splitSections(md)
  const kept = sections.filter((chunk) => !TYPE_DROP_RE.test(sectionTitle(chunk)))
  return head + kept.map((chunk) => '## ' + chunk).join('\n')
}

export function compactTemplate(html) {
  const match = /<svg\b([^>]*)>[\s\S]*?<\/svg>/i.exec(html)
  if (!match) return html
  const viewBox = /viewBox="([^"]+)"/i.exec(match[1])
  const defs = /<defs>[\s\S]*?<\/defs>/i.exec(match[0])
  const open = [
    '<svg viewBox="' + (viewBox ? viewBox[1] : '0 0 1000 720') + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="diagram-title diagram-desc">',
    '        <title id="diagram-title">[图名]</title>',
    '        <desc id="diagram-desc">[一句话说明这张图]</desc>',
  ]
  if (defs) open.push('        ' + defs[0].replace(/\n/g, '\n        '))
  open.push('        <!-- 从这里开始按 primitives-core.md 的节点、连线与标签规则绘制；不要保留模板里的示例节点。 -->', '      </svg>')
  return html.slice(0, match.index) + open.join('\n') + html.slice(match.index + match[0].length)
}

export function lookupSection(slug, skillRoot, refsRoot) {
  return [
    '## 按需查阅（可选）',
    '',
    '本次只内联了核心规范、图型基础章节和模板。以下完整参考随插件安装；只有内联规范没有覆盖的边界情况，才按需读取对应文件的相关章节，不要整篇读入，也不要在最终回复里引用路径：',
    '',
    '- `' + path.join(skillRoot, 'SKILL.md') + '` — 完整流程、51 种图型索引、导入/导出',
    '- `' + path.join(refsRoot, 'type-' + slug + '.md') + '` — 本图型的完整变体与示例',
    '- `' + path.join(refsRoot, 'style-guide.md') + '` — 完整字体、系列色板、韩文/西里尔规则',
    '- `' + path.join(refsRoot, 'semantic-patterns.md') + '` — 语义模式（本次已选定图型，通常不需要）',
    '- `' + path.join(refsRoot, 'output-spec.md') + '` — draw.io 导入的尺寸/细节/受众规格（本任务不导入，通常不需要）',
    '',
    '如果运行环境无法读取这些路径，直接按内联核心规范完成，不要因此阻塞。',
  ].join('\n')
}
