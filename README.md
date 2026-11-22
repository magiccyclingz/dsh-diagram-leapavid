# LeapAvid图表工坊

> DSH 侧栏里的 50 种编辑级图表工作台。选一种图型、填一张表，直接在新会话里生成一张可发布的单文件 HTML 图表。

![LeapAvid图表工坊列表页](docs/screenshot-list.png)

## 简介

LeapAvid图表工坊是一个 **DeepSeek Harness 客户端插件**。它把
[`diagram-design`](https://github.com/cathrynlavery/diagram-design) 技能变成可浏览、
可检索、可填表的工作台，让“画一张架构图”从写提示词变成选图型、填内容、点生成。

它不是一个图片生成器：生成结果是由模型产出的**单文件 HTML + 内联 SVG**，
文字可选中、结构可编辑，可以直接在浏览器里打开，也可以用技能自带的工具导出
SVG / PNG。视觉上沿用 `diagram-design` 的编辑风：灰纸底、发丝线、单一强调色、
克制的字体层级。

## 功能

- **50 种图型**：架构图、流程图、数据流、ER、甘特图、四象限、鱼骨图、桑基图、
  用户旅程、服务蓝图、Wardley 地图等，覆盖系统、产品、数据与组织场景。
- **列表页**：每张卡片带一张官方示例预览图，下面是中文名、英文名与技能原文的
  “适合用来画什么”；支持按中文名、英文名或用途即时搜索。
- **详情页**：正文列顶部是该图型的官方示例大图（点击全屏放大），下面依次是
  「简介」与技能里的布局规则、反模式与构图预算；右栏是生成表单。
- **三种风格**：Full editorial（完整编辑风，默认）、Minimal light（浅色极简）、
  Minimal dark（深色极简）；可叠加手绘 `sketchy`、终端 `terminal` 或动效
  `motion`。
- **一键生成**：提交后新建一个会话、打开它，并把图型、风格与内容写入提示词；
  模型调用 `diagram-design` 技能产出 HTML，再通过 `diagram_save` 存档。
- **复制提示词**：不想现在生成时，可以把整段提示词复制到任意会话里自己用。
- **响应式**：列表用 `auto-fill / minmax(248px, 1fr)` 铺满面板；详情页用容器查询
  跟随面板宽度切换两栏 / 单栏，而不是跟随窗口。

![LeapAvid图表工坊详情页](docs/screenshot-detail.png)

## 环境要求

| 依赖 | 说明 |
| --- | --- |
| DeepSeek Harness | 桌面版，已在 **0.2.x** 验证；需要支持客户端插件与侧栏槽位 |
| `dsh-ai-diagrams` | **0.2.0+**，提供 `diagram-design` 技能与 `diagram_save` 等工具 |
| Node.js | 仅在开发 / 重新生成数据时需要；运行插件本身不需要额外 Node 进程 |

> 插件只负责浏览与提交。真正的图表由当前会话里的模型 + `dsh-ai-diagrams`
> 技能生成，因此需要模型能够调用该技能与 `diagram_save`。

## 安装

### 1. 安装技能依赖

在 DSH 的插件市场安装 `dsh-ai-diagrams`（0.2.0 或更高），或者把它加入当前
profile 的依赖。装好后确认技能目录里有 `diagram-design`，并且
`diagram_save` 工具可用。

### 2. 安装本插件

开发模式下直接把仓库软链到 desktop profile：

```bash
ln -s "$PWD" ~/.dsh/profiles/desktop/node_modules/dsh-diagram-leapavid
```

然后在 `~/.dsh/profiles/desktop/package.json` 里做两件事：

1. 把包加进 `dependencies`（用绝对路径的 `file:` 依赖，或让包管理器安装）：

```json
{
  "dependencies": {
    "dsh-diagram-leapavid": "file:/absolute/path/to/dsh-diagram-leapavid"
  }
}
```

2. 把包名加进 `dsh.profile.bundles`：

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

> 如果侧栏没有出现，先检查包名是否写进了 `bundles`、软链是否指向正确的目录，
> 再看 DSH 日志里有没有 client bundle 404。

## 使用

1. 打开侧栏的 **LeapAvid图表工坊**。
2. 在列表页搜索或滚动，选一种图型。
3. 在详情页右栏填写：
   - **图名**：会作为图表的标题。
   - **内容 / 数据**：每行一个节点、一条连线或一组数字；也可以直接写一段业务描述。
   - **风格**：Full editorial / Minimal light / Minimal dark。
   - **可选叠加**：手绘 sketchy、终端 terminal、动效 motion。
4. 点 **生成图表**。插件会新建会话、打开它，并发送带图型、风格与内容的提示词。
5. 模型用 `diagram-design` 技能生成单文件 HTML，再用 `diagram_save` 存档；
   生成结果通常落在工作区的 `diagrams/` 目录下。

想自己控制对话时，点 **复制提示词**，把提示词粘到任意会话即可。

## 工作方式

```text
references/type-*.md ──build-types──▶ src/types.final.json ──embed-data──▶ client.js  DATA
assets/example-*.html ──Chrome 2x──▶ PNG ──裁剪/缩放/WebP──▶ src/previews ──embed-previews──▶ client.js  PREVIEWS
```

- `client.js` 是 DSH 的客户端 bundle：注册侧栏入口与面板，包含 React UI、样式，
  以及内联的图型文案 `DATA`、列表预览图 `PREVIEWS`、详情大图 `PREVIEWS_DETAIL`。
- 图型文案和预览图全部内联，打开面板不需要联网，也不依赖本地图片文件。
- 提交动作走 DSH 宿主 API：新建会话、打开会话、发送提示词；插件本身不调用
  图像生成 API，也不直接写图表文件。

## 响应式布局

两个页面都不设固定最大宽度：`.ds-page` 只保留左右 `clamp(20px, 3vw, 56px)`
的内边距，内容占满宿主给的宽度。

详情页的栅格跟着**面板宽度**（不是窗口宽度）走，所以用的是 CSS 容器查询而不是
媒体查询——`.ds-page { container-type: inline-size }`，断点按内容盒宽度：

| 面板内容宽 | 布局 |
| --- | --- |
| > 1120px | `main side` 两栏（正文 1fr，上限 920px / 表单 320–400） |
| 800–1120px | 两栏，表单收窄到 290–360，正文仍占 1fr |
| < 800px | 单栏，正文（含预览图）在上、表单在下 |

预览图在正文列顶部，宽度 100% 跟随该列；点击任意预览会弹出 `.ds-zoom` 全屏遮罩
（再点关闭），遮罩里用的是 1760×1100 的大图。

列表页用 `auto-fill / minmax(248px, 1fr)` 铺满面板宽度：面板越宽列数越多
（1200px 窗口约 3 列，1680px 窗口约 4 列）。

## 插件身份

插件 id（包名 / cordis id）固定为 `dsh-diagram-leapavid`，必须是 ASCII：DSH 的
`/plugins` 路由用**未编码**的原始路径做索引键，而浏览器请求会把非 ASCII 路径
百分号编码，两者对不上就返回 404，插件永远不会加载（client bundle 取不到）。

中文名走两层显示：

| 位置 | 来源 |
| --- | --- |
| 侧栏入口、面板大标题 | `client.js` 里的 `label` 与 `h1.ds-title` |
| 插件管理 / 设置列表里的标题与描述 | `locale/en.json`（英文兜底）与 `locale/zh-CN.json`（`{"meta":{"title","description"}}`），由 DSH 的 `readPluginMeta` 读取 |

改显示名时这两处都要改；`package.json` 的 `exports` 已声明 `"./locale/*"`，
`files` 已包含 `locale`。

## 开发与再生成

### 预览图

预览图取自 `diagram-design` 仓库里每种图型的官方示例页
（`skills/diagram-design/assets/example-<slug>.html`）。本地用 headless Chrome
以 2× 设备像素（900 CSS px 宽 → 1800px PNG）渲染，裁到内容边界后从同一张图出两个尺寸：

| 文件 | 尺寸 | 用途 | 体积 |
| --- | --- | --- | --- |
| `src/previews/<slug>.webp` | 480×300 | 列表卡片 | ~5 KB × 50 |
| `src/previews/<slug>@detail.webp` | 1760×1100 | 详情页正文列 / 放大遮罩 | ~34 KB × 50 |

两个尺寸合计约 2.1 MB，以 data URI 内联进 `client.js`（约 2.85 MB）。列表只用小图、
详情只用大图，避免一次解码 50 张大图。

重新生成（某一种或全部）：

```bash
scripts/build-previews.sh                    # 全部 50 种
scripts/build-previews.sh --only quadrant    # 只重做一种
```

脚本依赖 `curl`、Chrome、`python3` + Pillow（会自动找 DSH 自带运行时里的
python3）与 `node`。渲染结果缓存在 `/tmp/diagram-leapavid-previews`；删掉对应的
raw PNG 即可强制重渲染（整批重做用 `rm -rf /tmp/diagram-leapavid-previews/raw`）。
跑完会调用 `scripts/embed-previews.mjs`，把两套 `src/previews/*.webp` 重新内联进
`client.js`（`PREVIEWS:BEGIN/END` 之间会生成 `PREVIEWS` 与 `PREVIEWS_DETAIL`
两张表，是生成物，不要手改）。

`src/preview-map.json` 记录每个图型用哪个示例页。

### 图型文案

列表与详情页的文案不手写，由技能自带的 50 份 `references/type-<slug>.md` 抽取：

```bash
node scripts/build-types.mjs      # 重新抽取 → src/types.final.json
node scripts/embed-data.mjs       # 内联进 client.js 的 DATA 表
```

抽取规则：`**Best for:**` 作副标题、文件开头的说明段落作「简介」`lead`；每个
`##` 小节收成一段（`###` 变体小节是别的图型的详情页，跳过）；跳过 fenced code
（含 YAML 参数表）与 `Examples`；表格行压成 `A · B` 一行；去掉加粗/行内码/链接
语法，**不做任何长度截断**。`client.js` 里的 `DATA` 是生成物，改文案请改 md 后
重跑上面两步。

## 目录结构

```text
.
├── client.js                 # DSH 客户端 bundle：UI + DATA + PREVIEWS（生成物）
├── index.js                  # 插件入口
├── cordis.patch.yml          # 插件声明
├── icon.svg                  # 侧栏图标
├── locale/                   # en.json / zh-CN.json 显示名与描述
├── src/
│   ├── previews/             # 50 × 2 张 WebP 预览（生成物）
│   ├── preview-map.json      # 图型 → 官方示例页
│   └── types.final.json      # 抽取后的图型文案（生成物）
├── scripts/
│   ├── build-previews.sh     # 渲染、裁剪、转 WebP
│   ├── build-types.mjs       # 抽取 type-*.md
│   ├── embed-previews.mjs    # 内联预览图到 client.js
│   └── embed-data.mjs        # 内联图型文案到 client.js
├── docs/                     # README 截图（仅插件面板，不含 DSH 左栏）
├── LICENSE                   # MIT 许可全文
└── THIRD-PARTY-NOTICES.md    # 第三方版权与 MIT 许可全文
```

## 常见问题

**侧栏没有入口？**
检查 `~/.dsh/profiles/desktop/package.json` 的 `dsh.profile.bundles` 是否包含
`dsh-diagram-leapavid`，软链是否指向本项目，然后重启 DSH。

**点“生成图表”没有反应？**
确认 `dsh-ai-diagrams` 已安装、`diagram_save` 工具可用；提交会新建一个会话，
如果宿主没有创建成功，面板会给出提示。也可以先用「复制提示词」手动发到会话里。

**预览图不显示？**
`client.js` 里的 `PREVIEWS` 是生成物；重跑 `scripts/build-previews.sh` 或至少
`node scripts/embed-previews.mjs`。

**插件管理里显示英文名？**
检查 `locale/zh-CN.json` 的 `meta.title` 是否存在，以及 `package.json` 是否导出了
`./locale/*`。

**生成的图在哪里？**
通常在当前会话工作区的 `diagrams/` 下，文件名由 `diagram_save` 生成；也可以在
生成结果的工具卡片里直接打开或导出。

## 版权与许可

### 插件自身

Copyright © 2026 **LeapAvid**.

本插件中由 LeapAvid 创作的部分（插件代码、界面设计、原创中文文案与图标）以
**MIT License** 发布。你可以自由使用、复制、修改、合并、发布、分发、再许可
和/或销售本软件的副本，但需在所有副本或主要部分中保留上述版权声明与本许可
声明。完整文本见 [`LICENSE`](LICENSE)。

### 第三方内容

本插件内置的 50 种图型说明文本与示例预览图，派生自 Cathryn Lavery 的
[`diagram-design`](https://github.com/cathrynlavery/diagram-design) 项目：

- **版权**：Copyright (c) 2025 Cathryn Lavery
- **许可**：MIT License
- **范围**：`client.js` 中内联的 `DATA` / `PREVIEWS` / `PREVIEWS_DETAIL`
  （源文件在 `src/types.final.json` 与 `src/previews/`）

MIT 许可要求保留版权与许可声明；完整文本、修改说明与再分发要求见
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md)。

`diagram-design` 技能本体与 `diagram_save` 等工具由 `dsh-ai-diagrams` 提供，
不属于本仓库；使用时请遵守该包及其上游项目的许可。

### 名称与免责声明

LeapAvid、LeapAvid图表工坊是本项目的名称。DeepSeek Harness 与 DeepSeek 的名称、
商标归其各自权利人所有。本插件是独立第三方项目，**不是 DeepSeek 官方插件**，
与 DeepSeek 官方没有隶属、赞助或背书关系。

## 致谢

- [Cathryn Lavery](https://github.com/cathrynlavery) 与
  [diagram-design](https://github.com/cathrynlavery/diagram-design)：50 种图型的
  设计系统、布局规则与官方示例。
- [dsh-ai-diagrams](https://www.npmjs.com/package/dsh-ai-diagrams)：把技能与
  `diagram_save` 带进 DSH。
- DeepSeek Harness 的客户端插件与侧栏 API。
