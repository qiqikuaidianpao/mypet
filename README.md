<div align="center">

# 🐾 mypet

### 你的 AI 编程搭档，住进浏览器的电子宠物

A tamagotchi-style desktop pet plugin for **DeepSeek Harness (DSH)**.

它在你的 Web GUI 里养一只小宠物 —— 随你和 agent 的编码活动变化心情、体力、饱腹、牵绊，
会升级、有性格、能攒金币抽 24 种皮肤、完成每日任务、转生强化……

灵感来自 [claude-code-tamagotchi](https://github.com/Ido-Levi/claude-code-tamagotchi) 与 Codex 桌面宠物。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-blueviolet)](https://github.com/topics/dsh-plugin)
[![Platform: Web](https://img.shields.io/badge/Platform-Web-orange)](https://deepseek.com)

</div>

---

## ✨ 功能一览

### 🧠 活体宠物
- **呼吸浮动** + 点击挤压回弹 + **鼠标悬停会对你笑** 😊
- 闲时随机 **打哈欠 / 四处看 / 伸懒腰 / 哼曲 / 💭 内心独白**
- **睡着了会做梦**（💭 梦到吃大餐 / 主人 / 金币…）
- agent 开始工作会说 **"主人开始工作啦！加油~"**
- 心情影响表情滤镜：高兴鲜艳 / 难过暗淡 / 睡觉灰暗
- 头像外圈 **心情光环**（绿/青/红/紫）+ **经验环**（金→青→紫→粉）
- 装备稀有/传说皮肤时有 **脉冲光环**

### 🎮 四标签页面板
| 标签 | 内容 |
|---|---|
| **状态** | 💖心情 / ⚡体力 / 🍚饱腹 / 💕牵绊 进度条 + **趋势走势线** + 抚摸·喂食·小憩 + **6 种表情** + **每日任务** |
| **衣橱** | 24 格皮肤收藏（6 普通 / 9 稀有 / 9 传说）+ **稀有度筛选** + 季节限定概率提升 |
| **成就** | 26 个里程碑 + **进度条** + **📜 事件日志** + **8 格统计面板** |
| **更多** | 🎰 抽奖（单抽 / 十连 / 免费抽）+ 改名 / 分享 / 换性格 / 转生 + 设置 |

### 💰 完整经济系统
- 💼 工作发薪（每 20s +2💰）+ 5% 幸运币（**周末翻倍**）
- 🔄 连击递增奖金（5~25💰/轮）+ **2 分钟宽限期**
- 📅 每日签到 +10💰 · 📦 每周津贴（等级×5）· 🎂 每周生日 +彩纸
- 🎁 随机宝箱（4% 普通 / 0.5% 传说 50-100💰 +彩纸）
- 📋 每日 3 任务（全部完成 +20💰）
- 🌟 **转生系统**（Lv.20+，重置等级换永久金币 ×1.5/次）

### 💕 牵绊系统（5 层深度）
- 互动 +签到 累积牵绊值，缓慢衰减
- 牵绊 ≥75 → **15% 暴击率**（互动效果 ×2 + 金光）
- 牵绊 ≥90 → **25% 暴击 + 😍 超级台词**（"好爱你哦~"）
- 牵绊 <25 → 宠物疏远（"哼…" + 💢）
- **偏好互动**（💛 ×1.3 倍率）+ **连续好主人**天奖励

### 🎨 个性化
- 6 种 **性格**（活泼/慵懒/贪吃/高冷/社交/学霸）影响互动和消耗，花 50💰 可重抽
- 24 种皮肤含 **季节限定**（🎃 万圣节 / ❄️ 冬季节日）
- 时段问候 + 面板背景渐变（晨暖/午亮/暮紫/夜深）
- 夜间能量恢复 ×1.67 + 低能量犯困状态

### 🔊 音效 & 庆祝
- 10 种 **Web Audio 合成音效**（抚摸/喂食/小憩/抽奖/稀有旋律/传说 fanfare/升级/成就/错误）
- 🎉 **满屏彩纸**（升级/稀有掉落/生日/传说宝箱/转生）
- **庆祝队列**（多个通知依次展示，不覆盖）
- 每 10 级 **里程碑**双倍彩纸 + 等级×3 奖励

### 🏠 其他
- **离线进度**：关掉页面宠物继续"活着"，回来弹欢迎气泡
- **键盘快捷键**：`1-4` 切标签 · `P` 抚摸 `F` 喂食 `N` 小憩 · `D` 抽奖 · `Esc` 关闭
- 面板开/关 + 悬浮位置 **跨刷新持久化**
- **分享状态卡片**（一键复制进度摘要到剪贴板）
- 导出/导入存档码（精简 base64，跨设备搬运）
- 全面 **错误边界** + 存储配额守卫
- 尊重 `prefers-reduced-motion`

---

## 🚀 安装

### 本地试用

```sh
dsh plugin --profile web add /path/to/mypet
# 重启 dsh web，屏幕上出现悬浮宠物
```

### 从 npm 安装（发布后）

```sh
dsh plugin --profile web add mypet
```

### 切换挂载模式

编辑 `src/client.js` 顶部：

```js
var MOUNT = "overlay";  // "sidebar" = 侧边栏固定 | "overlay" = 悬浮可拖拽（默认）
```

改完后 `npm run build` 重新生成 `lib/client.js`。

---

## 📸 面板预览

```
 ┌─────────────────────────────────┐
 │ 🦊  小白 ⚡ · Lv.5          ×  │
 │     小狐狸  💰42  🎴3/24  🕐7天    │
 ├─────────────────────────────────┤
 │ [状态]  衣橱   成就   更多       │
 ├─────────────────────────────────┤
 │ 💖心情  ████████░░  82          │
 │  ╱╲╱╲___ (走势线)               │
 │ ⚡体力  ██████░░░░  65          │
 │ 🍚饱腹  █████████░  90          │
 │ 💕牵绊  ███████░░░  72          │
 │ Lv.5 · 经验 37/175  🔥连击 3    │
 │                                 │
 │ [💞抚摸] [🍚喂食] [💤小憩]      │
 │ 😄 😢 😍 😴 🤔 🥳               │
 │ ┌─ 📋 每日任务 ──────────────┐  │
 │ │ ✅ 抚摸 5 次        已完成  │  │
 │ │ 🎰 抽奖 2 次    1/2  +15💰  │  │
 │ └─────────────────────────────┘  │
 └─────────────────────────────────┘
```

---

## 🏗️ 架构

```
你的 DSH 会话 ──► useSessions(slot prop) ──► running?
                         │
          ┌──────────────▼──────────────┐
          │  浏览器宠物大脑              │
          │  React + localStorage       │
          │  心情/体力/饱腹/牵绊/经验    │
          │  金币/皮肤/性格/成就/任务    │
          │  每 20s 衰减+发薪            │
          │  running→idle 结算经验+金币  │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │  Slot (浏览器侧)             │
          │  shell.overlay (悬浮/可拖拽)  │
          │  或 sidebar.footer.action    │
          └─────────────────────────────┘
```

**双面包架构**：node 半（`lib/index.js`，空 `apply`）+ 浏览器半（`lib/client.js`，
`window.__ModuleLoader__.load` 工厂形式）。宠物完全浏览器侧自包含，不依赖 host RPC。

---

## 📁 文件结构

| 文件 | 作用 |
|---|---|
| `src/client.js` | 浏览器半**源码**（工厂内部体）：大脑 + 全部 UI + 两变体 + `MOUNT` 开关 |
| `lib/client.js` | `npm run build` 生成的**工厂产物**（只外部化 `react`） |
| `lib/index.js` | node 半：空 `apply()`，让 Loader entry 激活 |
| `scripts/build.mjs` | 把 `src/client.js` 包成工厂形式 |
| `cordis.patch.yml` | bundle patch：激活本包为 Loader entry + 客户端模块 |
| `package.json` | 声明 `dsh.bundle.patch` + `dsh.client`（双面包） |
| `README.md` | 本文档 |
| `LICENSE` | MIT |

---

## 🔧 自定义

改 `src/client.js` 后 `npm run build`：

- **皮肤目录**：`SKINS`（名称 + emoji + 稀有度）
- **抽奖权重**：`RARITY`（普通/稀有/传说概率）
- **经济参数**：`DRAW_COST` / `SALARY_PER_TICK` / `TURN_BONUS` / `PITY_CAP` / `DAILY_BONUS`
- **性格**：`TRAITS`（6 种性格 + 图标）
- **台词**：`SAY`（互动台词）+ `IDLE`（闲时动作）
- **成就**：`ACH`（成就定义 + 进度函数）
- **每日任务**：`QUESTS`（任务定义）
- **衰减速度**：`tick()` 增减量 + `setInterval` 周期（默认 20s）
- **挂载模式**：顶部 `var MOUNT = "overlay"` ↔ `"sidebar"`

---

## 📦 发布

```sh
# 1. 改包名（package.json + cordis.patch.yml 的 name 保持一致）
# 2. npm publish
# 3. 用户安装：dsh plugin --profile web add <包名>
```

发布到 GitHub 后给仓库加 `dsh-plugin` topic 即可出现在
[github.com/topics/dsh-plugin](https://github.com/topics/dsh-plugin)。

---

## 🤝 贡献

欢迎提 Issue / PR！开发流程：

```sh
git clone <repo>
cd mypet
npm run build     # 从 src 生成 lib
# 改 src/client.js，然后 npm run build
```

---

## 📄 License

[MIT](LICENSE) — 随便用，随便改。

---

<div align="center">

made with 💕 for DSH coders

</div>
