# 🐾 mypet — DSH 电子宠物插件

> 你的 AI 编程搭档，住进浏览器的电子宠物。

给 **DeepSeek Harness (DSH)** 的桌面宠物插件 —— 随你和 agent 的编码活动变化心情、体力、饱腹、牵绊，会升级、有性格、能攒金币抽 24 种皮肤、完成每日任务、转生强化……

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-blueviolet)](https://github.com/topics/dsh-plugin)

---

## 截图

| 状态 | 衣橱 |
|:---:|:---:|
| ![状态](https://raw.githubusercontent.com/qiqikuaidianpao/mypet/main/screenshots/stats.png) | ![衣橱](https://raw.githubusercontent.com/qiqikuaidianpao/mypet/main/screenshots/closet.png) |

| 成就 | 更多 |
|:---:|:---:|
| ![成就](https://raw.githubusercontent.com/qiqikuaidianpao/mypet/main/screenshots/achievements.png) | ![更多](https://raw.githubusercontent.com/qiqikuaidianpao/mypet/main/screenshots/more.png) |

---

## 安装

```sh
dsh plugin --profile web add mypet
# 重启 dsh web，屏幕上出现悬浮宠物，可拖拽
```

## 更新

```sh
dsh plugin --profile web update mypet
# 重启 dsh web 生效
```

## 卸载

```sh
dsh plugin --profile web remove mypet
```

## 备份与迁移

宠物状态存在浏览器 `localStorage`（key `mypet`，旧版 `dsh-pet:v1`）。面板内「更多」标签提供：

- **⬆ 导出存档码** — 生成精简 base64 码，复制保存
- **⬇ 导入存档码** — 粘贴存档码，恢复到新设备/新浏览器
- **📋 分享状态卡片** — 一键复制进度摘要，可粘贴到聊天/社交平台

> 导出码只含游戏数据（金币/皮肤/成就/性格等），不含历史走势和事件日志，体积更小。

## 功能

**活的宠物** — 呼吸浮动、点击回弹、悬停会笑；点击/抚摸会弹出 Canvas 粒子（💛✨🐾）；闲时打哈欠/伸懒腰/💭内心独白、还会沿屏幕边缘**闲逛踱步**；睡着了会做梦、头顶飘 💤；心情很好时周围浮现 ✨ 微光；agent 开始工作会说"加油~"；心情影响表情滤镜（高兴鲜艳 + 呼吸辉光 / 难过暗淡）；装备传说皮肤有旋转彩虹光环、稀有皮肤有脉冲光环；面板为玻璃拟态毛玻璃。

**四标签页面板** —

| 标签 | 内容 |
|---|---|
| 状态 | 💖⚡🍚💕 四维进度条 + 趋势走势线 + 抚摸/喂食/小憩/玩耍 + 6 种表情 + 每日任务 + 成长阶段徽章 |
| 衣橱 | 24 种皮肤（6 普通 / 9 稀有 / 9 传说）+ 稀有度筛选 + 季节限定 |
| 成就 | 26 个里程碑 + 进度条 + 事件日志 + 8 格统计面板 |
| 更多 | 单抽/十连/免费抽 + 改名/分享/换性格/转生 + 导入导出 |

**经济系统** — 工作发薪 + 连击递增奖金（5~25/轮）+ 每日签到 + 每周津贴 + 随机宝箱 + 每日任务 + 转生永久加成。

**牵绊系统** — 互动累积好感度；≥75 解锁暴击（×2 效果）并会主动去冒险带回金币；≥90 超级台词 + 25% 暴击；有偏好互动加成。

**音效 & 庆祝** — 12 种 Web Audio 合成音效；升级/稀有掉落触发 Canvas 粒子彩带雨 + 环形冲击波；每次互动在点击处迸发 emoji 粒子；里程碑成就解锁金色仪式横幅；庆祝队列依次展示。

**更多** — 接球小游戏 🎾（点击屏幕扔球、宠物冲刺接住、连击奖励）、离线归来结算报告、离线进度、键盘快捷键（1-4/P/F/N/L/D/Esc）、面板位置持久化、分享状态卡片、6 种性格、昼夜节律、错误边界、玻璃拟态面板。

## 自定义

改 `src/client.js` 后 `npm run build`：

- `SKINS` — 皮肤目录（名称 + emoji + 稀有度）
- `TRAITS` — 性格（6 种）
- `DRAW_COST` / `SALARY_PER_TICK` / `PITY_CAP` — 经济参数
- `ACH` — 成就定义 + 进度函数
- `QUESTS` — 每日任务
- `tick()` — 衰减速度（默认 20s 周期）
- 顶部 `var MOUNT = "overlay"` ↔ `"sidebar"` — 悬浮 vs 侧边栏

## 开发

```sh
npm run build   # 将 src/client.js 打包为 lib/client.js
npm run check   # 语法检查 + 产物新鲜度 + 源码不变量
```

- 只改 `src/client.js`，`lib/client.js` 是自动生成的构建产物，不要手改。
- 每日任务池共 8 个（抚摸 / 抽奖 / 工作轮 / 喂食 / 工作 tick / 赚钱 / 小憩 / 玩耍），每天按日期随机抽取 3 个；每种互动有独立计数。
- 改动说明见 [CHANGELOG.md](CHANGELOG.md)。

## 文件

| 文件 | 作用 |
|---|---|
| `src/client.js` | 源码（大脑 + UI + 两变体） |
| `lib/client.js` | 构建产物（工厂形式） |
| `lib/index.js` | node 半（空 apply） |
| `scripts/build.mjs` | 构建脚本 |
| `scripts/check.mjs` | 质量门禁（语法/新鲜度/不变量） |
| `cordis.patch.yml` | bundle patch |
| `screenshots/` | 截图 |
| `CHANGELOG.md` | 变更日志 |

## License

MIT

---

## 🤝 社区认可

本项目积极参与并认可 [LINUX DO](https://linux.do/) 社区 —— 一个友善的技术人聚集地。
