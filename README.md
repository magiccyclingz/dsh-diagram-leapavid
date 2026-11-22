# LeapAvid图表工坊

> DSH 侧栏里的 50 种编辑级图表工作台。选一种图型、填一张表，直接在新会话里生成一张可发布的单文件 HTML 图表。

![LeapAvid图表工坊列表页](docs/screenshot-list.png)

## 简介

LeapAvid图表工坊是一个 **DeepSeek Harness 客户端插件**。它把
[`diagram-design`](https://github.com/cathrynlavery/diagram-design) 的完整规范
**直接打包进插件**，变成可浏览、可检索、可填表的工作台，让“画一张架构图”从写
提示词变成选图型、填内容、点生成。

它不依赖 `dsh-ai-diagrams`，也不需要预先安装 `diagram-design` 技能或任何
`diagram_save` 工具。插件的宿主侧会按你选的图型、风格和内容，从内置的
`skill/` 目录拼出一份自包含的生成提示词，再交给当前会话的模型直接产出图表。

生成结果是由模型产出的**单文件 HTML + 内联 SVG**，文字可选中、结构可编辑，
可以直接在浏览器里打开，也可以自行导出 SVG / PNG。视觉上沿用
`diagram-design` 的编辑风：灰纸底、发丝线、单一强调色、克制的字体层级。

## 功能

- **50 种图型**：架构图、架构变更对比、流程图、数据流、ER、甘特图、四象限、
  鱼骨图、桑基图、用户旅程、服务蓝图、Wardley 地图等，覆盖系统、产品、数据与
  组织场景。
- **内置完整规范**：插件自带 `diagram-design` 的 SKILL.md、70 份 references
  与 5 个 HTML 起始模板；生成时按需注入，不联网、不读外部技能目录。
- **列表页**：每张卡片带一张官方示例预览图，下面是中文名、英文名与技能原文的
  “适合用来画什么”；支持按中文名、英文名或用途即时搜索。
- **详情页**：正文列顶部是该图型的官方示例大图（点击全屏放大），下面依次是
  「简介」与技能里的布局规则、反模式与构图预算；右栏是生成表单。
- **三种风格**：Full editorial（完整编辑风，默认）、Minimal light（浅色极简）、
  Minimal dark（深色极简）；可叠加手绘 `sketchy`、终端 `terminal` 或动效
  `motion`。
- **一键生成**：提交后先向宿主请求内置规范提示词，再新建会话、打开它，并把
  图型、风格与内容写进提示词；模型直接产出单文件 HTML，保存到工作区
  `diagrams/`。
- **复制提示词**：不想现在生成时，可以把整段（约 115–180 KB）提示词复制到任意
  会话里自己用。
- **响应式**：列表用 `auto-fill / minmax(248px, 1fr)` 铺满面板；详情页用容器查询
  跟随面板宽度切换两栏 / 单栏，而不是跟随窗口。

![LeapAvid图表工坊详情页](docs/screenshot-detail.png)

## 环境要求

| 依赖 | 说明 |
| --- | --- |
| DeepSeek Harness | 桌面版，已在 **0.2.x** 验证；需要支持客户端插件与侧栏槽位 |
| 会话模型 | 需要能接收长提示词并写文件；插件默认要求模型使用 `write` 落盘 |
| Node.js | 仅在开发 / 重新生成数据时需要；运行插件本身不需要额外 Node 进程 |

> 不再需要 `dsh-ai-diagrams`、`diagram-design` 技能或 `diagram_save`。
> 插件的 `index.js` 提供 `/api/diagram-leapavid/prompt` 宿主路由，生成规范
> 由插件自身携带。

## 安装

### 从 npm 安装

本插件已发布到 npm：[dsh-diagram-leapavid](https://www.npmjs.com/package/dsh-diagram-leapavid)。
当前仓库版本为 **0.2.0**。

> **注意：0.2.0 尚未发布到 npm。** npm 上目前的 `0.1.1` 是内置规范之前的旧版，不包含本页描述的 `skill/` 规范与 `/api/diagram-leapavid/prompt` 路由。要用内置生成，请按下面的「从本地仓库安装 / 开发」；等 0.2.0 发布后再用这条命令。

```bash
dsh plugin --profile desktop add dsh-diagram-leapavid
```

装好后确认 `~/.dsh/profiles/desktop/package.json` 的 `dsh.profile.bundles` 里包含
`"dsh-diagram-leapavid"`。如果插件命令只装了依赖、没有写入 bundles，手动补上：

```json
{
  "dsh": {
    "profile": {
      "bundles": [
        "...",
        "dsh-diagram-leapavid"
      ]
    }
  }
}
```

改完后重启 DSH。侧栏应该出现 **LeapAvid图表工坊** 入口，点开能看到 50 张图型卡片。

> 如果侧栏没有出现，先检查包名是否写进了 `bundles`，再看 DSH 日志里有没有
> client bundle 404。

### 从本地仓库安装 / 开发

想改代码后立即看到效果时，把仓库软链到 desktop profile，并在 `dependencies`
里用绝对路径的 `file:` 依赖：

```bash
ln -s "$PWD" ~/.dsh/profiles/desktop/node_modules/dsh-diagram-leapavid
```

```json
{
  "dependencies": {
    "dsh-diagram-leapavid": "file:/absolute/path/to/dsh-diagram-leapavid"
  }
}
```

同样确认 `dsh.profile.bundles` 里包含包名，然后重启 DSH。改 `client.js` 后刷新
页面即可；改 `index.js` 需要重新加载插件（或在插件管理里禁用再启用）。

## 使用

1. 打开侧栏的 **LeapAvid图表工坊**。
2. 在列表页搜索或滚动，选一种图型。
3. 在详情页右栏填写：
   - **图名**：会作为图表的标题。
   - **内容 / 数据**：每行一个节点、一条连线或一组数字；也可以直接写一段业务描述。
   - **风格**：Full editorial / Minimal light / Minimal dark。
   - **可选叠加**：手绘 sketchy、终端 terminal、动效 motion。
4. 点 **生成图表**。插件会请求内置规范提示词，新建会话并发送。
5. 模型按规范产出单文件 HTML + 内联 SVG，保存到工作区 `diagrams/` 下，例如
   `diagrams/architecture-20261122-214535.html`。

想自己控制对话时，点 **复制提示词**，把提示词粘到任意会话即可。

## 工作方式

```text
skill/SKILL.md + references + templates ──composePrompt──▶ POST /api/diagram-leapavid/prompt
                                                              │
                                                     client.js promptFor()
                                                              │
                                          新建会话 + 发送自包含提示词 ──▶ 模型产出
                                                              │
                                              diagrams/<slug>-<timestamp>.html
```

- `index.js` 是宿主侧：注册 `/api/diagram-leapavid/health` 与
  `/api/diagram-leapavid/prompt`，校验图型、风格和内容，按需拼出
  SKILL.md、style-guide、primitives、type-*.md 与起始模板。
- `client.js` 是 DSH 的客户端 bundle：注册侧栏入口与面板，包含 React UI、样式，
  以及内联的图型文案 `DATA`、列表预览图 `PREVIEWS`、详情大图
  `PREVIEWS_DETAIL`。
- 图型文案和预览图全部内联，打开面板不需要联网，也不依赖本地图片文件。
- 提示词头部有明确的执行契约：不要安装或调用任何技能、不要读 references 路径、
  跳过上游 SKILL 的首次提问门禁、不要使用 `diagram_save`，直接用 `write`
  把单文件 HTML 写到工作区 `diagrams/`。

## 目录结构

```text
.
├── client.js                 # DSH 客户端 bundle：UI + DATA + PREVIEWS（生成物）
├── index.js                  # 宿主入口：内置规范路由
├── cordis.patch.yml          # 插件声明
├── icon.svg                  # 侧栏图标
├── locale/                   # en.json / zh-CN.json 显示名与描述
├── skill/                    # 内置 diagram-design 规范
│   ├── SKILL.md
│   ├── UPSTREAM.json         # 上游仓库、commit、版本
│   ├── LICENSE
│   ├── references/           # 70 份图型 / 设计系统参考
│   └── templates/            # 5 个 HTML 起始模板
├── src/
│   ├── previews/             # 50 × 2 张 WebP 预览（生成物）
│   ├── preview-map.json      # 图型 → 官方示例页
│   └── types.final.json      # 抽取后的图型文案（生成物）
├── scripts/
│   ├── build-previews.sh     # 渲染、裁剪、转 WebP
│   ├── build-types.mjs       # 从 skill/references 抽取 type-*.md
│   ├── embed-previews.mjs    # 内联预览图到 client.js
│   ├── embed-data.mjs        # 内联图型文案到 client.js
│   ├── sync-skill.mjs        # 从上游 checkout 同步 skill/
│   └── test-prompt.mjs       # 50 图型 + 5 变体的提示词测试
├── docs/                     # README 截图（仅插件面板，不含 DSH 左栏）
├── LICENSE                   # MIT 许可全文
└── THIRD-PARTY-NOTICES.md    # 第三方版权与 MIT 许可全文
```

## 更新内置规范

`skill/` 是上游 `diagram-design` 的快照。需要跟进上游时：

```bash
git clone https://github.com/cathrynlavery/diagram-design /tmp/diagram-design-upstream
npm run sync-skill -- /tmp/diagram-design-upstream
npm test
```

同步脚本会复制 SKILL.md、references、5 个模板和 LICENSE，并把上游 commit
写入 `skill/UPSTREAM.json`。类型卡片文案若也要跟着更新，再运行：

```bash
node scripts/build-types.mjs
node scripts/embed-data.mjs
```

## 常见问题

**还需要安装 `dsh-ai-diagrams` 吗？**
不需要。规范、图型参考和模板都在本插件的 `skill/` 目录里；生成提示词由
`index.js` 现场拼装。

**点“生成图表”没有反应？**
确认 DSH 已加载本插件并提供 `/api/diagram-leapavid/prompt`。可以在浏览器里
访问 `/api/diagram-leapavid/health` 检查；如果宿主没有创建会话，面板会给出提示。
也可以先用「复制提示词」手动发到会话里。

**提示词为什么这么大？**
为了保证图表严格符合 `diagram-design` 的布局与连线规则，提示词会把本次图型
需要的 SKILL.md、设计系统、图元、布局预算、输出规范和起始模板一起注入，通常
在 115–180 KB。内容越复杂，模型越需要这些约束。

**预览图不显示？**
`client.js` 里的 `PREVIEWS` 是生成物；重跑 `scripts/build-previews.sh` 或至少
`node scripts/embed-previews.mjs`。

**插件管理里显示英文名？**
检查 `locale/zh-CN.json` 的 `meta.title` 是否存在，以及 `package.json` 是否导出了
`./locale/*`。

**生成的图在哪里？**
在当前会话工作区的 `diagrams/` 下，文件名格式为
`<slug>-<YYYYMMDD-HHmmss>.html`。

## 版权与许可

### 插件自身

Copyright © 2026 **LeapAvid**.

本插件中由 LeapAvid 创作的部分（插件代码、界面设计、原创中文文案与图标）以
**MIT License** 发布。你可以自由使用、复制、修改、合并、发布、分发、再许可
和/或销售本软件的副本，但需在所有副本或主要部分中保留上述版权声明与本许可
声明。完整文本见 [`LICENSE`](LICENSE)。

### 第三方内容

本插件内置的 `diagram-design` 规范（`skill/SKILL.md`、`skill/references/`、
`skill/templates/`、`skill/LICENSE`），以及 50 种图型说明文本与示例预览图，
派生自 Cathryn Lavery 的
[`diagram-design`](https://github.com/cathrynlavery/diagram-design) 项目：

- **版权**：Copyright (c) 2025 Cathryn Lavery
- **许可**：MIT License
- **上游版本**：见 `skill/UPSTREAM.json`
- **范围**：`skill/` 目录、`client.js` 中内联的 `DATA` / `PREVIEWS` /
  `PREVIEWS_DETAIL`（源文件在 `src/types.final.json` 与 `src/previews/`）

规范正文未做改写；只选取生成所需的 SKILL.md、references、5 个模板与 LICENSE
一起打包。MIT 许可要求保留版权与许可声明；完整文本、修改说明与再分发要求见
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md)。

### 名称与免责声明

LeapAvid、LeapAvid图表工坊是本项目的名称。DeepSeek Harness 与 DeepSeek 的名称、
商标归其各自权利人所有。本插件是独立第三方项目，**不是 DeepSeek 官方插件**，
与 DeepSeek 官方没有隶属、赞助或背书关系。

## 致谢

- [Cathryn Lavery](https://github.com/cathrynlavery) 与
  [diagram-design](https://github.com/cathrynlavery/diagram-design)：50 种图型的
  设计系统、布局规则、图型参考与官方示例。
- DeepSeek Harness 的客户端插件与侧栏 API。
