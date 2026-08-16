# Changelog

本文件遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [1.2.0] - 未发布

### 新增
- 全新 Canvas 粒子引擎：升级/稀有掉落触发彩带雨 + 环形冲击波，每次互动（抚摸/喂食/小憩/玩耍）在点击处迸发 emoji 粒子，点击宠物也有粒子迸发（替代原先 DOM 彩纸，CPU 占用更低）。
- 新增第 4 种互动「玩耍」🎾：提升心情与牵绊、消耗少量体力；配套每日任务「玩耍 3 次」（任务池增至 8 个）、`playCount` 计数、合成音效与 `L` 快捷键。
- 新增成长阶段徽章：🐣 幼崽 → 🌱 成长 → 🌟 成年 → 👑 大师，随等级在面板头部展示并带弹出动画。
- 传说皮肤新增旋转彩虹光环（`@property` conic-gradient + mask 渐变描边），稀有皮肤保留脉冲光环。

### 改进
- 面板改为玻璃拟态：`backdrop-filter` 毛玻璃 + 半透明渐变 + 更细边框。
- 心情「高兴」时宠物周围浮现呼吸辉光。
- 互动按钮、宠物点击、宠物拖动增加粒子反馈微交互。
- 提升文案与音效细节（玩耍台词、玩法音色）。

## [1.1.0] - 未发布

### 修复
- 修复宠物周岁庆祝文案出现 `NaN` 的问题（`ageWeeks + + " 周大啦"` 被解析为 `+ " 周大啦"` → `NaN`）。
- 修复「抚摸 5 次」与「喂食 3 次」两个每日任务共用同一个 `interacts` 计数、导致进度完全同步的问题；现在分别使用独立的 `petCount` / `feedCount` 计数。
- 用具名函数替换 `showCelebrate` 中的 `arguments.callee`（已废弃，严格模式下不可用）。

### 新增
- 新增每日任务「小憩 2 次」（使用独立的 `napCount` 计数），每日任务池从 6 个增至 7 个。
- 新增 `scripts/check.mjs` 质量门禁：语法解析 + 构建产物新鲜度 + 源码不变量 + 卫生检查。
- `scripts/build.mjs` 重构为可导入的 `wrapBody` / `build` 纯函数，附带直接运行守卫。
- 新增 `npm run check` 与 `npm run prepublishOnly` 脚本。

### 改进
- 为表情按钮补充 `aria-label` 与 `type="button"`，提升可访问性。
- 修正 `cordis.patch.yml` 中过时的挂载槽位说明（默认 `shell.overlay`，而非 `sidebar.footer.action`）。
- `package.json` 补充 `engines`、`repository`、`bugs` 元数据。

## [1.0.7] - 及更早

- 电子宠物核心玩法、24 种皮肤、26 项成就、每日任务、转生、签到、离线进度等（见 README）。
