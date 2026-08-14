// ─────────────────────────────────────────────────────────────────────────────
// dsh-plugin-pet · browser-half SOURCE (factory interior) — V4
// ─────────────────────────────────────────────────────────────────────────────
// scripts/build.mjs wraps this into window.__ModuleLoader__.load({ id, factory }).
// Edit HERE, then `npm run build`. Executes inside `factory(require)`; only `react` external.
// MOUNT: "sidebar" (sidebar.footer.action, default) | "overlay" (shell.overlay).
// V4 adds: gacha PITY system (+ visible counter), DAILY check-in bonus, RADIAL XP
// ring in the header, time-aware greetings.
// ─────────────────────────────────────────────────────────────────────────────
var react = require("react");
var createElement = react.createElement;
var useState = react.useState;
var useEffect = react.useEffect;
var useReducer = react.useReducer;
var useRef = react.useRef;
var useSyncExternalStore = react.useSyncExternalStore;

var MOUNT = "overlay";

// ── design tokens ────────────────────────────────────────────────────
var RING = { happy: "#5fe0a0", ok: "#7ce0ff", sad: "#ff9d9d", sleep: "#b39cff", work: "#ffd166" };
var RARITY_COLOR = { common: "#9aa0b5", rare: "#5fb8ff", legendary: "#ffd166" };
function ringColor(v) { if (v.sleeping) return RING.sleep; if (v.working) return RING.work; return RING[v.moodTier] || RING.ok; }

// ── injected CSS ─────────────────────────────────────────────────────
function ensureCss() {
	if (typeof document === "undefined") return;
	if (document.querySelector("style[data-dsh-pet]")) return;
	var tag = document.createElement("style");
	tag.setAttribute("data-dsh-pet", "1");
	tag.textContent = [
		"@keyframes dshpet-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}",
		"@keyframes dshpet-tap{0%{transform:scale(1)}30%{transform:scale(1.18,.82)}60%{transform:scale(.9,1.1)}100%{transform:scale(1)}}",
		"@keyframes dshpet-work{0%,100%{box-shadow:0 0 0 0 rgba(255,209,102,0)}50%{box-shadow:0 0 0 4px rgba(255,209,102,.35)}}",
		"@keyframes dshpet-pop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}",
		"@keyframes dshpet-badge{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}",
		"@keyframes dshpet-reveal{0%{transform:scale(.6) rotate(-8deg);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}",
		"@keyframes dshpet-toast{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}",
		"@keyframes dshpet-spin{to{transform:rotate(360deg)}}",
		".dshpet-bob{animation:dshpet-bob 2.6s ease-in-out infinite}",
		".dshpet-tap{animation:dshpet-tap .42s ease-out}",
		".dshpet-work{animation:dshpet-work 1.4s ease-in-out infinite}",
		".dshpet-panel{animation:dshpet-pop .16s ease-out}",
		".dshpet-badge{animation:dshpet-badge .3s ease-out}",
		".dshpet-reveal{animation:dshpet-reveal .5s cubic-bezier(.2,.9,.3,1.3)}",
		".dshpet-toast{animation:dshpet-toast .25s ease-out}",
		".dshpet-spin{animation:dshpet-spin .8s linear infinite}",
		"@keyframes dshpet-confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(720deg);opacity:0}}",
		".dshpet-btn{transition:filter .12s ease,transform .05s ease}.dshpet-btn:hover{filter:brightness(1.22)}.dshpet-btn:active{transform:translateY(1px)}",
		".dshpet-x{transition:filter .12s ease}.dshpet-x:hover{filter:brightness(1.4)}",
		".dshpet-tab{transition:color .12s ease,background .12s ease}",
		"@keyframes dshpet-tab-in{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}",
		".dshpet-tab-content{animation:dshpet-tab-in .15s ease-out}",
		".dshpet-stat{transition:filter .12s ease}.dshpet-stat:hover{filter:brightness(1.18)}",
		".dshpet-btn:active{box-shadow:0 0 8px rgba(255,255,255,.12)}",
		".dshpet-cell{transition:transform .1s ease,filter .12s ease}.dshpet-cell:hover{filter:brightness(1.1)}.dshpet-cell:active{transform:scale(.95)}",
		"@keyframes dshpet-aura-l{0%,100%{box-shadow:0 0 12px 2px rgba(255,209,102,.2)}50%{box-shadow:0 0 22px 5px rgba(255,209,102,.4)}}",
		".dshpet-aura-l{animation:dshpet-aura-l 3s ease-in-out infinite}",
		"@keyframes dshpet-aura-r{0%,100%{box-shadow:0 0 12px 2px rgba(95,184,255,.2)}50%{box-shadow:0 0 22px 5px rgba(95,184,255,.35)}}",
		".dshpet-aura-r{animation:dshpet-aura-r 3.5s ease-in-out infinite}",
		"@media (prefers-reduced-motion: reduce){.dshpet-bob,.dshpet-tap,.dshpet-work,.dshpet-panel,.dshpet-badge,.dshpet-reveal,.dshpet-toast,.dshpet-spin,.dshpet-tab-content,.dshpet-aura-l,.dshpet-aura-r{animation:none!important}}"
	].join("\n");
	document.head.appendChild(tag);
}

// ── skins catalog ────────────────────────────────────────────────────
var SKINS = {
	fox: { name: "小狐狸", rarity: "common", face: { happy: "🦊", ok: "🐺", sad: "🦊", work: "🦊", sleep: "😴" } },
	cat: { name: "小猫咪", rarity: "common", face: { happy: "😺", ok: "🐱", sad: "😿", work: "😼", sleep: "😴" } },
	bunny: { name: "小兔子", rarity: "common", face: { happy: "🐰", ok: "🐰", sad: "🐰", work: "🐰", sleep: "😴" } },
	duck: { name: "小鸭子", rarity: "common", face: { happy: "🐤", ok: "🦆", sad: "🐤", work: "🐤", sleep: "😴" } },
	panda: { name: "熊猫", rarity: "rare", face: { happy: "🐼", ok: "🐼", sad: "🐼", work: "🐼", sleep: "😴" } },
	frog: { name: "青蛙", rarity: "rare", face: { happy: "🐸", ok: "🐸", sad: "🐸", work: "🐸", sleep: "😴" } },
	penguin: { name: "企鹅", rarity: "rare", face: { happy: "🐧", ok: "🐧", sad: "🐧", work: "🐧", sleep: "😴" } },
	owl: { name: "猫头鹰", rarity: "rare", face: { happy: "🦉", ok: "🦉", sad: "🦉", work: "🦉", sleep: "😴" } },
	dragon: { name: "神龙", rarity: "legendary", face: { happy: "🐲", ok: "🐲", sad: "🐲", work: "🐲", sleep: "😴" } },
	unicorn: { name: "独角兽", rarity: "legendary", face: { happy: "🦄", ok: "🦄", sad: "🦄", work: "🦄", sleep: "😴" } },
	robot: { name: "机器人", rarity: "legendary", face: { happy: "🤖", ok: "🤖", sad: "🤖", work: "🤖", sleep: "😴" } },
	alien: { name: "外星人", rarity: "legendary", face: { happy: "👾", ok: "👾", sad: "👾", work: "👾", sleep: "😴" } },
	dog: { name: "小狗", rarity: "common", face: { happy: "🐶", ok: "🐶", sad: "🐶", work: "🐶", sleep: "😴" } },
	bear: { name: "小熊", rarity: "common", face: { happy: "🐻", ok: "🐻", sad: "🐻", work: "🐻", sleep: "😴" } },
	pig: { name: "小猪", rarity: "rare", face: { happy: "🐷", ok: "🐷", sad: "🐷", work: "🐷", sleep: "😴" } },
	bee: { name: "蜜蜂", rarity: "rare", face: { happy: "🐝", ok: "🐝", sad: "🐝", work: "🐝", sleep: "😴" } },
	trex: { name: "霸王龙", rarity: "legendary", face: { happy: "🦖", ok: "🦖", sad: "🦖", work: "🦖", sleep: "😴" } },
	butterfly: { name: "蝴蝶", rarity: "legendary", face: { happy: "🦋", ok: "🦋", sad: "🦋", work: "🦋", sleep: "😴" } },
	pumpkin: { name: "南瓜精", rarity: "rare", face: { happy: "🎃", ok: "🎃", sad: "🎃", work: "🎃", sleep: "😴" } },
	ghost: { name: "小幽灵", rarity: "rare", face: { happy: "👻", ok: "👻", sad: "👻", work: "👻", sleep: "😴" } },
	bat: { name: "蝙蝠", rarity: "rare", face: { happy: "🦇", ok: "🦇", sad: "🦇", work: "🦇", sleep: "😴" } },
	snowman: { name: "雪人", rarity: "legendary", face: { happy: "⛄", ok: "⛄", sad: "⛄", work: "⛄", sleep: "😴" } },
	tree: { name: "圣诞树", rarity: "legendary", face: { happy: "🎄", ok: "🎄", sad: "🎄", work: "🎄", sleep: "😴" } },
	star: { name: "星星", rarity: "legendary", face: { happy: "⭐", ok: "⭐", sad: "⭐", work: "⭐", sleep: "😴" } }
};
var SKIN_IDS = Object.keys(SKINS);
var RARITY = [{ id: "common", weight: 70 }, { id: "rare", weight: 22 }, { id: "legendary", weight: 8 }];
var RARITY_BADGE = { common: "", rare: "⭐", legendary: "🌟" };
var TRAITS = { lively: { name: "活泼", icon: "⚡" }, lazy: { name: "慵懒", icon: "💤" }, foodie: { name: "贪吃", icon: "🍴" }, cool: { name: "高冷", icon: "😎" }, social: { name: "社交", icon: "🤝" }, studious: { name: "学霸", icon: "📚" } };
var TRAIT_IDS = Object.keys(TRAITS);
var COMMON = SKIN_IDS.filter(function (k) { return SKINS[k].rarity === "common"; });
var DRAW_COST = 15, DUPE_REFUND = 5, SALARY_PER_TICK = 2, TURN_BONUS = 5, PITY_CAP = 10, DAILY_BONUS = 10;
function pickSpecies() { return COMMON[Math.floor(Math.random() * COMMON.length)]; }
function skinOf(id) { return SKINS[id] || SKINS.fox; }
function todayKey() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
var QUESTS = [
	{ id: "pet5", desc: "抚摸 5 次", target: 5, reward: 10, check: function (s) { return s.interacts || 0; } },
	{ id: "draw2", desc: "抽奖 2 次", target: 2, reward: 15, check: function (s) { return s.totalDraws || 0; } },
	{ id: "turn3", desc: "完成 3 轮工作", target: 3, reward: 15, check: function (s) { return s.turns || 0; } },
	{ id: "feed3", desc: "喂食 3 次", target: 3, reward: 10, check: function (s) { return s.interacts || 0; } },
	{ id: "work50", desc: "工作 50 tick", target: 50, reward: 20, check: function (s) { return s.workTicks || 0; } },
	{ id: "earn30", desc: "赚取 30💰", target: 30, reward: 10, check: function (s) { return s.earned || 0; } }
];
function getQuests() {
	var day = todayKey();
	if (state.questDate !== day) { state.questDate = day; state.questStart = { interacts: state.interacts || 0, totalDraws: state.totalDraws || 0, turns: state.turns || 0, workTicks: state.workTicks || 0, earned: state.earned || 0 }; state.questDone = []; persist(); }
	if (!state.questStart) { state.questStart = { interacts: 0, totalDraws: 0, turns: 0, workTicks: 0, earned: 0 }; }
	if (!state.questIndices || state.questIndices.length !== 3) {
		var seed = 0; for (var i = 0; i < day.length; i++) seed += day.charCodeAt(i);
		state.questIndices = [seed % QUESTS.length, (seed * 7 + 3) % QUESTS.length, (seed * 13 + 7) % QUESTS.length].filter(function (v, j, a) { return a.indexOf(v) === j; }).slice(0, 3);
		while (state.questIndices.length < 3) { var nx = (state.questIndices.length * 17 + 5) % QUESTS.length; if (state.questIndices.indexOf(nx) === -1) state.questIndices.push(nx); }
	}
	var result = [];
	for (var q = 0; q < state.questIndices.length; q++) {
		var def = QUESTS[state.questIndices[q]];
		var progress = def.check(state) - (def.check(state.questStart) || 0);
		result.push({ desc: def.desc, cur: Math.max(0, progress), target: def.target, reward: def.reward, done: (state.questDone || []).indexOf(def.id) !== -1, id: def.id });
	}
	return result;
}
function claimQuest(idx) {
	var qs = getQuests();
	if (!qs[idx] || qs[idx].done || qs[idx].cur < qs[idx].target) return;
	state.questDone = (state.questDone || []).concat([qs[idx].id]);
	state.coins = (state.coins || 0) + qs[idx].reward;
	state.earned = (state.earned || 0) + qs[idx].reward;
	var allDone = getQuests().every(function (q) { return q.done; });
	if (allDone && (state.questDone || []).indexOf("_all_bonus") === -1) {
		state.questDone = state.questDone.concat(["_all_bonus"]);
		state.coins = (state.coins || 0) + 20;
		state.earned = (state.earned || 0) + 20;
		persist();
		showCelebrate("✅ 任务完成！" + qs[idx].desc + " +" + qs[idx].reward + "💰");
		window.setTimeout(function () { showCelebrate("🏆 全部任务完成！额外奖励 +20💰！"); triggerConfetti(); addDiary("🏆 全部每日任务完成"); }, 200);
	} else {
		persist();
		showCelebrate("✅ 任务完成！" + qs[idx].desc + " +" + qs[idx].reward + "💰");
	}
	emit();
}
function yesterdayKey() { var d = new Date(); d.setDate(d.getDate() - 1); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
function greeting() { var h = new Date().getHours(); if (h < 6) return "夜深了"; if (h < 11) return "早安"; if (h < 14) return "中午好"; if (h < 18) return "下午好"; return "晚上好"; }
function panelGradient() { var h = new Date().getHours(); if (h < 6) return "linear-gradient(180deg, rgba(30,20,50,.97), rgba(20,15,35,.97))"; if (h < 11) return "linear-gradient(180deg, rgba(50,42,42,.97), rgba(35,30,32,.97))"; if (h < 14) return "linear-gradient(180deg, rgba(40,46,58,.97), rgba(26,30,42,.97))"; if (h < 18) return "linear-gradient(180deg, rgba(50,44,38,.97), rgba(35,30,28,.97))"; return "linear-gradient(180deg, rgba(42,36,56,.97), rgba(28,24,40,.97))"; }

var SAY = {
	pet: ["喵~", "嘿嘿", "舒服~", "再摸摸!"], feed: ["好吃!", "嗝~", "谢谢!"], nap: ["呼噜…", "zzz", "好眠~"],
	turn: ["又搞定一轮!", "合作愉快!", "加把劲!"], sad: ["呜…", "有点低落", "摸摸我?"],
	starve: ["好饿…", "饿扁了…"], exhaust: ["困死了…", "撑不住…"], poor: ["金币不够…", "攒够再来!"], dupe: ["重复了…", "已经有这只啦"],
	level: ["🎉 升级!", "升级啦!"]
};
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

var STORAGE_KEY = "dsh-pet:v1";
var STATE_VERSION = 1;
var HINT_KEY = "dsh-pet:hint-shown";
var storageWarned = false;
function persist() { state.lastSeen = Date.now(); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { if (!storageWarned) { storageWarned = true; try { showBubble("⚠️ 存储已满，进度暂时无法保存"); } catch (e2) {} } } }
function addDiary(text) { state.diary = [{ text: text, t: Date.now() }].concat(state.diary || []).slice(0, 12); }
var DEFAULT_STATE = { _v: STATE_VERSION, name: "豆豆", species: pickSpecies(), trait: "", favorite: "", mood: 80, energy: 80, hunger: 35, bond: 50, moodHistory: [], bondHistory: [], xp: 0, level: 1, prestige: 0, streak: 0, coins: 0, skins: [], pity: 0, lastCheckIn: "", totalDraws: 0, maxCoins: 0, maxStreak: 0, loginStreak: 0, achievements: [], muted: false, onboarded: false, earned: 0, spent: 0, turns: 0, workTicks: 0, daysPlayed: 0, interacts: 0, earlyBird: false, nightOwl: false, freePullDate: "", lastBirthday: 0, lastAllowance: 0, streakGrace: 0, lastSeen: 0, questDate: "", questStart: null, questDone: [], questIndices: null, diary: [], careStreak: 0, badCareDay: false, bornAt: Date.now() };
function clamp(n) { return Math.max(0, Math.min(100, n)); }
function fmtCoin(n) { n = Math.floor(n || 0); if (n >= 10000) return (n / 1000).toFixed(1) + "k"; return "" + n; }
function xpForLevel(l) { return 50 + l * 25; }
function moodTierOf(s) { return s.mood >= 75 ? "happy" : s.mood >= 45 ? "ok" : "sad"; }

// ── stores ───────────────────────────────────────────────────────────
function loadState() {
	var s;
	try { s = Object.assign({}, DEFAULT_STATE, JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")); }
	catch (e) { s = Object.assign({}, DEFAULT_STATE); }
	s.coins = Math.max(0, s.coins || 0);
	s.pity = Math.max(0, s.pity || 0);
	s.totalDraws = Math.max(0, s.totalDraws || 0);
	s.maxCoins = Math.max(0, s.maxCoins || 0);
	s.maxStreak = Math.max(0, s.maxStreak || 0);
	s.prestige = Math.max(0, s.prestige || 0);
	s.loginStreak = Math.max(0, s.loginStreak || 0);
	s.earned = Math.max(0, s.earned || 0);
	s.spent = Math.max(0, s.spent || 0);
	s.turns = Math.max(0, s.turns || 0);
	s.workTicks = Math.max(0, s.workTicks || 0);
	s.daysPlayed = Math.max(0, s.daysPlayed || 0);
	s.interacts = Math.max(0, s.interacts || 0);
	s.earlyBird = !!s.earlyBird;
	s.nightOwl = !!s.nightOwl;
	s.freePullDate = s.freePullDate || "";
	s.lastBirthday = Math.max(0, s.lastBirthday || 0);
	s.lastAllowance = Math.max(0, s.lastAllowance || 0);
	s.streakGrace = Math.max(0, s.streakGrace || 0);
	s.questDate = s.questDate || "";
	if (!Array.isArray(s.questDone)) s.questDone = [];
	if (!Array.isArray(s.diary)) s.diary = [];
	s.careStreak = Math.max(0, s.careStreak || 0);
	s.badCareDay = !!s.badCareDay;
	s.trait = s.trait || "";
	s.favorite = s.favorite || "";
	s.bond = clamp(s.bond == null ? 50 : s.bond);
	if (!s._v) s._v = STATE_VERSION;
	if (!Array.isArray(s.moodHistory)) s.moodHistory = [];
	if (!Array.isArray(s.bondHistory)) s.bondHistory = [];
	if (!Array.isArray(s.achievements)) s.achievements = [];
	s.muted = !!s.muted;
	s.onboarded = !!s.onboarded;
	if (!Array.isArray(s.skins) || s.skins.length === 0) s.skins = [s.species];
	if (s.skins.indexOf(s.species) === -1) s.skins = [s.species].concat(s.skins);
	return s;
}
var state = loadState();
var bubble = { text: "" };
var notify = { unread: false };
var celebrate = { text: "" };
var draw = { phase: "idle", result: null };
var idle = { emoji: "", until: 0 };
var confetti = { items: [] };
var flash = { active: false };
var lastDraw = { id: null, isNew: false };
var listeners = new Set();
var bubbleTimer = null, celebrateTimer = null;
function subscribe(fn) { listeners.add(fn); return function () { listeners.delete(fn); }; }
function getState() { return state; }
function getBubble() { return bubble; }
function getNotify() { return notify; }
function getCelebrate() { return celebrate; }
function getDraw() { return draw; }
function getIdle() { return idle; }
function getConfetti() { return confetti; }
function getFlash() { return flash; }
function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }
function showBubble(text, ms) { if (state.muted) return; bubble = { text: text }; if (bubbleTimer) window.clearTimeout(bubbleTimer); bubbleTimer = window.setTimeout(function () { bubble = { text: "" }; emit(); }, ms || 4000); emit(); }
var celebrateQueue = [];
function showCelebrate(text, ms) {
	if (celebrate.text) { celebrateQueue.push({ text: text, ms: ms || 4200 }); return; }
	celebrate = { text: text };
	if (celebrateTimer) window.clearTimeout(celebrateTimer);
	celebrateTimer = window.setTimeout(function () {
		if (celebrateQueue.length) { var next = celebrateQueue.shift(); celebrate = { text: next.text }; emit(); celebrateTimer = window.setTimeout(arguments.callee, next.ms); }
		else { celebrate = { text: "" }; emit(); }
	}, ms || 4200);
	emit();
}
function setNotify(v) { notify = { unread: !!v }; emit(); }

// ── sound (Web Audio API, synthesized — no files, respects muted) ────
var audioCtx = null;
function playTone(freq, dur, type, vol) {
	if (state.muted) return;
	var ctx = audioCtx || (function () { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; } catch (e) { return null; } })();
	if (!ctx) return;
	var osc = ctx.createOscillator(), gain = ctx.createGain();
	osc.type = type || "sine";
	osc.frequency.value = freq;
	gain.gain.setValueAtTime(0, ctx.currentTime);
	gain.gain.linearRampToValueAtTime(vol || 0.12, ctx.currentTime + 0.01);
	gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
	osc.connect(gain); gain.connect(ctx.destination);
	osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
}
function playSound(t) {
	if (state.muted) return;
	var s = {
		pet: [[880, 0.15, "sine", 0.12]],
		feed: [[659, 0.2, "triangle", 0.12]],
		nap: [[440, 0.3, "sine", 0.1]],
		common: [[523, 0.1, "triangle", 0.08]],
		draw: [[523, 0.06, "square", 0.06], [659, 0.06, "square", 0.06]],
		rare: [[523, 0.1, "sine", 0.14], [659, 0.1, "sine", 0.14], [784, 0.2, "sine", 0.14]],
		legendary: [[523, 0.1, "sine", 0.15], [659, 0.1, "sine", 0.15], [784, 0.1, "sine", 0.15], [1047, 0.3, "sine", 0.18]],
		level: [[659, 0.1, "triangle", 0.14], [880, 0.1, "triangle", 0.14], [1047, 0.2, "triangle", 0.14]],
		achievement: [[784, 0.12, "sine", 0.12], [1047, 0.2, "sine", 0.12]],
		error: [[200, 0.15, "sawtooth", 0.08]]
	}[t];
	if (!s) return;
	s.forEach(function (n, i) { setTimeout(function () { playTone(n[0], n[1], n[2], n[3]); }, i * 90); });
}
function triggerConfetti() {
	var emojis = ["✨", "⭐", "🌟", "💫", "🎉", "🎊", "💰"];
	var items = [];
	for (var i = 0; i < 22; i++) {
		items.push({ id: i, emoji: emojis[Math.floor(Math.random() * emojis.length)], x: Math.random() * 100, delay: Math.random() * 0.5, duration: 1.4 + Math.random() * 1.4, size: 14 + Math.floor(Math.random() * 18) });
	}
	confetti = { items: items };
	flash = { active: true };
	emit();
	window.setTimeout(function () { confetti = { items: [] }; flash = { active: false }; emit(); }, 3200);
}

// daily check-in (runs once per page load; grants once per calendar day)
(function dailyCheckIn() {
	if (state.lastCheckIn !== todayKey()) {
		var streak = state.lastCheckIn === yesterdayKey() ? (state.loginStreak || 0) + 1 : 1;
		state.lastCheckIn = todayKey();
		state.loginStreak = streak;
		state.coins = (state.coins || 0) + DAILY_BONUS;
		state.earned = (state.earned || 0) + DAILY_BONUS;
		state.daysPlayed = (state.daysPlayed || 0) + 1;
		var hr = new Date().getHours();
		if (hr < 8) state.earlyBird = true;
		if (hr < 6 || hr >= 23) state.nightOwl = true;
		state.bond = clamp((state.bond || 50) + 5);
		if (!state.badCareDay) {
			state.careStreak = (state.careStreak || 0) + 1;
			var careBond = Math.min(state.careStreak, 10);
			state.bond = clamp(state.bond + careBond);
			if (state.careStreak >= 3) addDiary("💚 连续" + state.careStreak + "天好主人");
		} else { state.careStreak = 0; }
		state.badCareDay = false;
		persist();
		showCelebrate("📅 每日签到 +" + DAILY_BONUS + "💰" + (streak > 1 ? " · 连签 " + streak + " 天" : ""));
	}
})();

// birthday check (every 7 pet-days = 1 pet-week)
(function checkBirthday() {
	var ageDays = Math.floor((Date.now() - (state.bornAt || Date.now())) / 86400000);
	var ageWeeks = Math.floor(ageDays / 7);
	if (ageWeeks > (state.lastBirthday || 0)) {
		state.lastBirthday = ageWeeks;
		state.coins = (state.coins || 0) + ageWeeks * 10;
		state.earned = (state.earned || 0) + ageWeeks * 10;
		persist();
		showCelebrate("🎂 " + state.name + " 已经 " + ageWeeks + + " 周大啦！生日快乐！+" + (ageWeeks * 10) + "💰");
		addDiary("🎂 " + ageWeeks + " 周生日");
		triggerConfetti();
	}
})();

// weekly level allowance (passive income, scales with level)
(function checkAllowance() {
	var week = Math.floor((Date.now() - (state.bornAt || Date.now())) / 604800000);
	if (week > (state.lastAllowance || 0) && state.onboarded) {
		var amount = (state.level || 1) * 5;
		state.lastAllowance = week;
		state.coins = (state.coins || 0) + amount;
		state.earned = (state.earned || 0) + amount;
		persist();
		showCelebrate("📦 每周津贴 +" + amount + "💰（Lv." + state.level + "）");
	}
})();

// offline progress: apply decay for time away (capped at 24h)
(function checkOffline() {
	if (!state.onboarded) return;
	var elapsed = Date.now() - (state.lastSeen || Date.now());
	var ticks = Math.min(Math.floor(elapsed / 20000), 4320);
	if (ticks < 3) return;
	state.hunger = clamp(state.hunger + ticks * 0.7);
	state.energy = clamp(state.energy + ticks * 1.2);
	state.mood = clamp(state.mood + (state.mood < 70 ? 0.3 : -0.15) * ticks);
	state.bond = clamp(state.bond - ticks * 0.5);
	if (state.hunger >= 95) state.mood = clamp(state.mood - ticks * 0.3);
	if (state.energy <= 8) state.mood = clamp(state.mood - ticks * 0.3);
	persist();
	var mins = Math.floor(elapsed / 60000);
	if (mins >= 1) {
		var msg = mins < 60 ? "回来啦！离开了 " + mins + " 分钟~" : mins < 1440 ? "好久不见！离开了 " + Math.floor(mins / 60) + " 小时~" : "想死你了！离开了 " + Math.floor(mins / 1440) + " 天~";
		window.setTimeout(function () { showBubble(msg); setNotify(true); }, 800);
	}
})();

var prevTier = null, prevStarve = false, prevExhaust = false, prevTired = false, prevHungry = false;
function detect() {
	var tier = moodTierOf(state), starve = state.hunger >= 90, exhaust = state.energy < 12, tired = state.energy < 20 && state.energy >= 12, hungry = state.hunger >= 75 && state.hunger < 90;
	if (prevTier !== null) { var rank = { happy: 0, ok: 1, sad: 2 }; if (rank[tier] > rank[prevTier]) { showBubble(pick(SAY.sad)); setNotify(true); } }
	if (hungry && !prevHungry) { showBubble("🍚 肚子有点饿了…点「喂食」补充一下吧！"); setNotify(true); }
	if (starve && !prevStarve) { showBubble(pick(SAY.starve)); setNotify(true); state.badCareDay = true; }
	if (exhaust && !prevExhaust) { showBubble(pick(SAY.exhaust)); setNotify(true); state.badCareDay = true; }
	if (tired && !prevTired) { showBubble("😥 快没体力了…点「小憩」恢复一下吧！"); setNotify(true); }
	try { var qs = getQuests(); for (var qi = 0; qi < qs.length; qi++) { if (!qs[qi].done && qs[qi].cur >= qs[qi].target) { setNotify(true); break; } } } catch (e) {}
	prevTier = tier; prevStarve = starve; prevExhaust = exhaust; prevTired = tired; prevHungry = hungry;
}
function setState(patch) {
	var oldCoins = state.coins || 0;
	state = Object.assign({}, state, patch);
	if ((state.coins || 0) > oldCoins) state.earned = (state.earned || 0) + (state.coins - oldCoins);
	if ((state.coins || 0) > (state.maxCoins || 0)) state.maxCoins = state.coins || 0;
	persist();
	detect();
	emit();
	if (!checking) { checking = true; try { checkAchievements(); } finally { checking = false; } }
}

// ── achievements ─────────────────────────────────────────────────────
var checking = false;
var ACH = [
	{ id: "first_draw", icon: "🎰", name: "初次抽奖", desc: "第一次抽取皮肤", reward: 5, test: function (s) { return (s.totalDraws || 0) >= 1; }, progress: function (s) { return { cur: s.totalDraws || 0, need: 1 }; } },
	{ id: "first_rare", icon: "⭐", name: "首个稀有", desc: "拥有一只稀有皮肤", reward: 15, test: function (s) { return (s.skins || []).some(function (k) { return SKINS[k] && SKINS[k].rarity === "rare"; }); }, progress: function (s) { return { cur: (s.skins || []).filter(function (k) { return SKINS[k] && SKINS[k].rarity === "rare"; }).length, need: 1 }; } },
	{ id: "first_legend", icon: "🌟", name: "首个传说", desc: "拥有一只传说皮肤", reward: 30, test: function (s) { return (s.skins || []).some(function (k) { return SKINS[k] && SKINS[k].rarity === "legendary"; }); }, progress: function (s) { return { cur: (s.skins || []).filter(function (k) { return SKINS[k] && SKINS[k].rarity === "legendary"; }).length, need: 1 }; } },
	{ id: "collector_6", icon: "📚", name: "收集家", desc: "收集 6 种皮肤", reward: 20, test: function (s) { return (s.skins || []).length >= 6; }, progress: function (s) { return { cur: (s.skins || []).length, need: 6 }; } },
	{ id: "collector_all", icon: "🏆", name: "图鉴全开", desc: "集齐全部皮肤", reward: 100, test: function (s) { return (s.skins || []).length >= SKIN_IDS.length; }, progress: function (s) { return { cur: (s.skins || []).length, need: SKIN_IDS.length }; } },
	{ id: "level5", icon: "🆙", name: "小有成就", desc: "升到 5 级", reward: 25, test: function (s) { return (s.level || 1) >= 5; }, progress: function (s) { return { cur: s.level || 1, need: 5 }; } },
	{ id: "level10", icon: "👑", name: "大师", desc: "升到 10 级", reward: 60, test: function (s) { return (s.level || 1) >= 10; }, progress: function (s) { return { cur: s.level || 1, need: 10 }; } },
	{ id: "streak5", icon: "🔥", name: "手感火热", desc: "最高连击 5 轮", reward: 15, test: function (s) { return (s.maxStreak || 0) >= 5; }, progress: function (s) { return { cur: s.maxStreak || 0, need: 5 }; } },
	{ id: "rich_100", icon: "💰", name: "小富翁", desc: "持有过 100 💰", reward: 20, test: function (s) { return (s.maxCoins || 0) >= 100; }, progress: function (s) { return { cur: s.maxCoins || 0, need: 100 }; } },
	{ id: "daily_7", icon: "📅", name: "坚持一周", desc: "连续签到 7 天", reward: 30, test: function (s) { return (s.loginStreak || 0) >= 7; }, progress: function (s) { return { cur: s.loginStreak || 0, need: 7 }; } },
	{ id: "first_interact", icon: "🐾", name: "初次互动", desc: "第一次抚摸/喂食/小憩", reward: 5, test: function (s) { return (s.interacts || 0) >= 1; }, progress: function (s) { return { cur: s.interacts || 0, need: 1 }; } },
	{ id: "social_20", icon: "🤝", name: "社交达人", desc: "累计互动 20 次", reward: 20, test: function (s) { return (s.interacts || 0) >= 20; }, progress: function (s) { return { cur: s.interacts || 0, need: 20 }; } },
	{ id: "draw_addict", icon: "🎰", name: "抽卡上瘾", desc: "累计抽奖 10 次", reward: 25, test: function (s) { return (s.totalDraws || 0) >= 10; }, progress: function (s) { return { cur: s.totalDraws || 0, need: 10 }; } },
	{ id: "workaholic", icon: "💼", name: "工作狂", desc: "累计工作 50 个 tick", reward: 25, test: function (s) { return (s.workTicks || 0) >= 50; }, progress: function (s) { return { cur: s.workTicks || 0, need: 50 }; } },
	{ id: "early_bird", icon: "🌅", name: "早起鸟", desc: "早上 8 点前签到", reward: 15, test: function (s) { return !!s.earlyBird; } },
	{ id: "night_owl", icon: "🌙", name: "夜猫子", desc: "深夜签到", reward: 15, test: function (s) { return !!s.nightOwl; } },
	{ id: "bond_25", icon: "🤗", name: "牵手", desc: "牵绊达到 25", reward: 10, test: function (s) { return (s.bond || 0) >= 25; }, progress: function (s) { return { cur: Math.round(s.bond || 0), need: 25 }; } },
	{ id: "bond_50", icon: "💕", name: "好伙伴", desc: "牵绊达到 50", reward: 20, test: function (s) { return (s.bond || 0) >= 50; }, progress: function (s) { return { cur: Math.round(s.bond || 0), need: 50 }; } },
	{ id: "bond_75", icon: "💖", name: "挚友", desc: "牵绊达到 75", reward: 30, test: function (s) { return (s.bond || 0) >= 75; }, progress: function (s) { return { cur: Math.round(s.bond || 0), need: 75 }; } },
	{ id: "bond_100", icon: "💞", name: "灵魂伴侣", desc: "牵绊满值 100", reward: 50, test: function (s) { return (s.bond || 0) >= 100; }, progress: function (s) { return { cur: Math.round(s.bond || 0), need: 100 }; } },
	{ id: "prestige_1", icon: "🌟", name: "涅槃重生", desc: "第一次转生", reward: 50, test: function (s) { return (s.prestige || 0) >= 1; } },
	{ id: "prestige_3", icon: "✨", name: "轮回大师", desc: "转生 3 次", reward: 100, test: function (s) { return (s.prestige || 0) >= 3; }, progress: function (s) { return { cur: s.prestige || 0, need: 3 }; } },
	{ id: "earn_1k", icon: "💎", name: "小金库", desc: "累计赚取 1000💰", reward: 30, test: function (s) { return (s.earned || 0) >= 1000; }, progress: function (s) { return { cur: Math.min(s.earned || 0, 1000), need: 1000 }; } },
	{ id: "earn_5k", icon: "💰", name: "财大气粗", desc: "累计赚取 5000💰", reward: 60, test: function (s) { return (s.earned || 0) >= 5000; }, progress: function (s) { return { cur: Math.min(s.earned || 0, 5000), need: 5000 }; } },
	{ id: "earn_10k", icon: "🏦", name: "金币大亨", desc: "累计赚取 10000💰", reward: 100, test: function (s) { return (s.earned || 0) >= 10000; }, progress: function (s) { return { cur: Math.min(s.earned || 0, 10000), need: 10000 }; } },
	{ id: "care_7", icon: "💚", name: "好主人", desc: "连续 7 天不让宠物饿坏/累坏", reward: 40, test: function (s) { return (s.careStreak || 0) >= 7; }, progress: function (s) { return { cur: Math.min(s.careStreak || 0, 7), need: 7 }; } }
];
function checkAchievements() {
	var unlocked = state.achievements || [];
	var newly = [], reward = 0;
	for (var i = 0; i < ACH.length; i++) {
		var a = ACH[i];
		if (unlocked.indexOf(a.id) === -1 && a.test(state)) {
			newly.push(a.id); reward += a.reward;
			showCelebrate("🏆 " + a.icon + " 成就：" + a.name + " +" + a.reward + "💰"); playSound("achievement"); addDiary("🏆 " + a.name);
			setNotify(true);
		}
	}
	if (newly.length) setState({ achievements: unlocked.concat(newly), coins: (state.coins || 0) + reward });
}
checkAchievements();

// ── brain ────────────────────────────────────────────────────────────
function viewOf(s, working) {
	var skin = skinOf(s.species);
	return {
		name: s.name, species: s.species, trait: s.trait || "", favorite: s.favorite || "", traitName: (TRAITS[s.trait] || {}).name || "", traitIcon: (TRAITS[s.trait] || {}).icon || "", skinName: skin.name, rarity: skin.rarity, badge: RARITY_BADGE[skin.rarity],
		mood: Math.round(s.mood), energy: Math.round(s.energy), hunger: Math.round(s.hunger), bond: Math.round(s.bond || 0), moodHistory: (s.moodHistory || []).slice(), bondHistory: (s.bondHistory || []).slice(),
		xp: Math.round(s.xp), level: s.level, prestige: s.prestige || 0, xpNeed: xpForLevel(s.level),
		coins: s.coins || 0, owned: (s.skins || []).length, total: SKIN_IDS.length, skins: (s.skins || []).slice(),
		pity: s.pity || 0, pityLeft: Math.max(0, PITY_CAP - (s.pity || 0)),
		totalDraws: s.totalDraws || 0, maxStreak: s.maxStreak || 0, loginStreak: s.loginStreak || 0, careStreak: s.careStreak || 0,
		achievements: (s.achievements || []).slice(), achCount: (s.achievements || []).length, achTotal: ACH.length,
		earned: s.earned || 0, spent: s.spent || 0, turns: s.turns || 0, workTicks: s.workTicks || 0, daysPlayed: s.daysPlayed || 0, interacts: s.interacts || 0,
		muted: !!s.muted,
		onboarded: !!s.onboarded,
		moodTier: moodTierOf(s), sleeping: s.energy < 12, streak: s.streak, turnBonus: TURN_BONUS + Math.min((s.streak || 0), 10) * 2, working: !!working,
		freePull: s.freePullDate !== todayKey(),
		ageDays: Math.max(0, Math.floor((Date.now() - (s.bornAt || Date.now())) / 86400000)),
	};
}
function face(v) {
	var f = skinOf(v.species).face;
	if (v.sleeping) return f.sleep;
	if (v.working) return f.work;
	if (v.moodTier === "sad") return f.sad;
	if (v.moodTier === "ok") return f.ok;
	return f.happy;
}
function statusText(v) {
	if (v.sleeping) return v.name + " 累坏了，正在打盹…";
	var hr = new Date().getHours();
	if (!v.working && (hr >= 23 || hr < 6) && v.energy < 50) return v.name + " 困了，眼皮在打架…";
	if (v.working) return v.name + " 正在陪你写代码 ✍️";
	if (v.energy < 20) return v.name + " 快没体力了，该小憩一下…";
	if (v.hunger >= 90) return v.name + " 饿坏了，快喂喂它！";
	if (v.moodTier === "sad") return v.name + " 有点低落，摸摸它吧";
	if (v.moodTier === "happy") return v.name + " 状态很棒！";
	return greeting() + "，" + v.name + " 在旁边待着";
}
function interact(action) {
	var t = state.trait, fav = state.favorite, isFav = fav === action, patch = { interacts: (state.interacts || 0) + 1 };
	var b = state.bond || 0, critChance = b >= 90 ? 0.25 : b >= 75 ? 0.15 : 0, crit = critChance > 0 && Math.random() < critChance, mult = crit ? 2 : 1, favBonus = isFav ? 1.3 : 1;
	if (action === "pet") { patch.mood = clamp(state.mood + Math.round((t === "social" ? 8 : t === "lively" ? 7 : 6) * mult * favBonus)); patch.energy = clamp(state.energy + 1); patch.bond = clamp(state.bond + Math.round(3 * mult * favBonus)); setState(patch); showBubble(isFav ? "💛 " + pick(SAY.pet) : (crit ? "✨ 暴击！" + pick(SAY.pet) : pick(SAY.pet))); playSound(crit ? "rare" : "pet"); if (crit) { flash = { active: true }; emit(); window.setTimeout(function () { flash = { active: false }; emit(); }, 800); } }
	else if (action === "feed") { patch.hunger = clamp(state.hunger - Math.round((t === "foodie" ? 35 : 30) * favBonus)); patch.mood = clamp(state.mood + Math.round(3 * mult * favBonus)); patch.bond = clamp(state.bond + Math.round(2 * mult * favBonus)); setState(patch); showBubble(isFav ? "💛 " + pick(SAY.feed) : (crit ? "✨ 暴击！" + pick(SAY.feed) : pick(SAY.feed))); playSound(crit ? "rare" : "feed"); if (crit) { flash = { active: true }; emit(); window.setTimeout(function () { flash = { active: false }; emit(); }, 800); } }
	else if (action === "nap") { patch.energy = clamp(state.energy + Math.round((t === "lazy" ? 48 : 40) * mult * favBonus)); patch.mood = clamp(state.mood + 2); patch.bond = clamp(state.bond + Math.round(1 * mult * favBonus)); setState(patch); showBubble(isFav ? "💛 " + pick(SAY.nap) : (crit ? "✨ 暴击！" + pick(SAY.nap) : pick(SAY.nap))); playSound(crit ? "rare" : "nap"); if (crit) { flash = { active: true }; emit(); window.setTimeout(function () { flash = { active: false }; emit(); }, 800); } }
}
function equip(id) { if ((state.skins || []).indexOf(id) !== -1) { setState({ species: id }); showBubble(skinOf(id).name + " " + RARITY_BADGE[skinOf(id).rarity]); } }
function rollSkinId(guaranteedRare) {
	var rarity;
	if (guaranteedRare) { rarity = Math.random() < 22 / 30 ? "rare" : "legendary"; }
	else {
		var total = 0; for (var i = 0; i < RARITY.length; i++) total += RARITY[i].weight;
		var roll = Math.random() * total, acc = 0; rarity = RARITY[0].id;
		for (var j = 0; j < RARITY.length; j++) { acc += RARITY[j].weight; if (roll < acc) { rarity = RARITY[j].id; break; } }
	}
	var pool = SKIN_IDS.filter(function (k) { return SKINS[k].rarity === rarity; });
	var m = new Date().getMonth() + 1;
	var seasonal = m === 10 ? ["pumpkin", "ghost", "bat"] : (m === 12 || m === 1 || m === 2) ? ["snowman", "tree", "star"] : null;
	var inSeason = seasonal && pool.some(function (k) { return seasonal.indexOf(k) !== -1; });
	if (inSeason && Math.random() < 0.35) { var sp = pool.filter(function (k) { return seasonal.indexOf(k) !== -1; }); return sp[Math.floor(Math.random() * sp.length)]; }
	return pool[Math.floor(Math.random() * pool.length)];
}
function drawSkin(free) {
	if (!free && (state.coins || 0) < DRAW_COST) { showBubble(pick(SAY.poor)); lastDraw = { id: null, isNew: false }; return; }
	var coins = free ? state.coins : state.coins - DRAW_COST;
	var spentDelta = free ? 0 : DRAW_COST;
	var guaranteed = (state.pity || 0) + 1 >= PITY_CAP;
	var id = rollSkinId(guaranteed);
	var isNew = (state.skins || []).indexOf(id) === -1;
	var r = skinOf(id).rarity;
	var newPity = (r === "rare" || r === "legendary") ? 0 : (state.pity || 0) + 1;
	lastDraw = { id: id, isNew: isNew };
	if (!isNew) { setState({ coins: coins + DUPE_REFUND, pity: newPity, totalDraws: (state.totalDraws || 0) + 1, spent: (state.spent || 0) + spentDelta }); showBubble(pick(SAY.dupe) + " 退 " + DUPE_REFUND + " 💰"); playSound("common"); }
	else {
		setState({ coins: coins, skins: (state.skins || []).concat([id]), species: id, pity: newPity, totalDraws: (state.totalDraws || 0) + 1, spent: (state.spent || 0) + spentDelta });
		showBubble("✨ " + RARITY_BADGE[r] + "新皮肤：" + skinOf(id).name + "!", 5000);
		if (r === "legendary" || r === "rare") { showCelebrate(RARITY_BADGE[r] + " " + (r === "legendary" ? "传说" : "稀有") + "皮肤：" + skinOf(id).name + "!"); setNotify(true); triggerConfetti(); playSound(r === "legendary" ? "legendary" : "rare"); addDiary((r === "legendary" ? "🌟 " : "⭐ ") + "抽到" + skinOf(id).name); }
		else playSound("common");
	}
}
function doDraw() {
	if (draw.phase !== "idle") return;
	if ((state.coins || 0) < DRAW_COST) { showBubble(pick(SAY.poor)); return; }
	draw = { phase: "rolling", result: null, rollingFace: 0 }; emit(); playSound("draw");
	var rollInt = window.setInterval(function () { draw.rollingFace = (draw.rollingFace + 1) % SKIN_IDS.length; emit(); }, 80);
	window.setTimeout(function () {
		window.clearInterval(rollInt);
		drawSkin();
		draw = { phase: "reveal", result: lastDraw }; emit();
		window.setTimeout(function () { draw = { phase: "idle", result: null }; emit(); }, 2600);
	}, 760);
}
function doFreePull() {
	if (draw.phase !== "idle") return;
	if (state.freePullDate === todayKey()) { showBubble("🎁 今天的免费抽奖已用完~"); return; }
	draw = { phase: "rolling", result: null, rollingFace: 0 }; emit(); playSound("draw");
	var rollInt = window.setInterval(function () { draw.rollingFace = (draw.rollingFace + 1) % SKIN_IDS.length; emit(); }, 80);
	window.setTimeout(function () {
		window.clearInterval(rollInt);
		drawSkin(true);
		setState({ freePullDate: todayKey() });
		draw = { phase: "reveal", result: lastDraw }; emit();
		window.setTimeout(function () { draw = { phase: "idle", result: null }; emit(); }, 2600);
	}, 760);
}
function doDraw10() {
	if (draw.phase !== "idle") return;
	var cost = 130;
	if ((state.coins || 0) < cost) { showBubble("需要 " + cost + "💰 才能十连！"); return; }
	var results = [], newCount = 0, coins = (state.coins || 0) - cost, pity = state.pity || 0;
	var totalDraws = (state.totalDraws || 0), skins = (state.skins || []).slice(), species = state.species, refundTotal = 0;
	for (var i = 0; i < 10; i++) {
		var guaranteed = i === 9 && !results.some(function (r) { return r.rarity === "rare" || r.rarity === "legendary"; });
		pity++;
		var id = rollSkinId(guaranteed || pity >= PITY_CAP);
		if (pity >= PITY_CAP) pity = 0;
		var skin = skinOf(id), isNew = skins.indexOf(id) === -1;
		if (!isNew) { coins += DUPE_REFUND; refundTotal += DUPE_REFUND; }
		else { skins.push(id); species = id; }
		if (skin.rarity !== "common") pity = 0;
		results.push({ id: id, rarity: skin.rarity, isNew: isNew });
		if (isNew) newCount++;
	}
	totalDraws += 10;
	setState({ coins: coins, skins: skins, species: species, pity: pity, totalDraws: totalDraws, spent: (state.spent || 0) + cost, earned: (state.earned || 0) + refundTotal });
	var hasLegendary = results.some(function (r) { return r.rarity === "legendary"; });
	var hasRare = results.some(function (r) { return r.rarity === "rare"; });
	var msg = hasLegendary ? "🌟 十连传说！" : hasRare ? "⭐ 十连出稀有！" : "🎰 十连完成！";
	showCelebrate(msg + " 🆕" + newCount + " · 重复退 " + refundTotal + "💰");
	if (hasRare) { triggerConfetti(); playSound(hasLegendary ? "legendary" : "rare"); }
	if (newCount > 0) addDiary("🎰 十连抽：🆕" + newCount + "只");
}
function rename(name) { if (typeof name === "string" && name.trim()) setState({ name: name.trim().slice(0, 24) }); }
function rerollTrait() { if ((state.coins || 0) < 50) { showBubble("需要 50💰 才能换性格…"); return; } var cur = state.trait, next = cur; while (next === cur && TRAIT_IDS.length > 1) next = TRAIT_IDS[Math.floor(Math.random() * TRAIT_IDS.length)]; setState({ coins: state.coins - 50, trait: next, spent: (state.spent || 0) + 50 }); showCelebrate(TRAITS[next].icon + " 性格变为「" + TRAITS[next].name + "」！"); }
function finishOnboard(name, id) { setState({ name: ((name || "").trim().slice(0, 24)) || "豆豆", species: id, skins: [id], onboarded: true, trait: TRAIT_IDS[Math.floor(Math.random() * TRAIT_IDS.length)], favorite: ["pet", "feed", "nap"][Math.floor(Math.random() * 3)] }); showCelebrate("👋 欢迎你的小伙伴！"); }
function reset() { if (!window.confirm("重置心情/体力/经验等状态？金币和收藏不受影响。")) return; setState({ mood: 80, energy: 80, hunger: 35, xp: 0, level: 1, streak: 0 }); }
function prestige() {
	if ((state.level || 1) < 20) { showBubble("需要 Lv.20 才能转生！"); return; }
	if (!window.confirm("转生将重置等级/经验/连击，但保留皮肤/成就/性格，并获得永久金币加成 ×" + ((state.prestige || 0) + 2) + "。确定？")) return;
	var newPrestige = (state.prestige || 0) + 1;
	setState({ level: 1, xp: 0, streak: 0, mood: 80, energy: 80, hunger: 35, prestige: newPrestige });
	showCelebrate("🌟 转生成功！现在 Lv.1 · 金币加成 ×" + (newPrestige + 1));
	addDiary("🌟 第" + newPrestige + "次转生");
	triggerConfetti(); playSound("legendary");
}
// UTF-8-safe base64 (no deprecated escape/unescape)
function encodeB64(str) { return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_, p) { return String.fromCharCode(parseInt(p, 16)); })); }
function decodeB64(code) { var bin = atob(code); return decodeURIComponent(bin.split("").map(function (c) { return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2); }).join("")); }
function toggleMute() { setState({ muted: !state.muted }); showCelebrate(state.muted ? "🔇 已静音气泡" : "🔔 气泡已开启"); }
function shareCard() {
	var v = viewOf(state, false);
	var lines = [
		face(v) + " " + v.name + (v.traitIcon ? " " + v.traitIcon : "") + " · Lv." + v.level,
		v.skinName + " " + v.badge + " | 💰" + v.coins + " 🎴" + v.owned + "/" + v.total + " 🏆" + v.achCount + "/" + v.achTotal + " 💕" + v.bond,
		"💖" + v.mood + " ⚡" + v.energy + " 🍚" + (100 - v.hunger) + " | 🔥" + v.streak + " 📅" + v.daysPlayed + "天",
		"#DSHPet"
	];
	var text = lines.join("\n");
	if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(text).then(function () { showCelebrate("📋 状态卡片已复制！"); }).catch(function () { window.prompt("复制状态卡片（可粘贴到聊天/社交平台）：", text); });
	} else { window.prompt("复制状态卡片（可粘贴到聊天/社交平台）：", text); }
}
function exportSave() {
	var code;
	try {
		var slim = {};
		for (var k in state) {
			var val = state[k];
			if (val === null || val === undefined || val === "" || val === false) continue;
			if (Array.isArray(val) && val.length === 0) continue;
			if (k === "moodHistory" || k === "bondHistory" || k === "diary") continue;
			slim[k] = val;
		}
		code = encodeB64(JSON.stringify(slim));
	} catch (e) { showCelebrate("导出失败"); return; }
	try { if (navigator && navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(code); showCelebrate("💾 存档码已复制（" + code.length + " 字符）"); return; } } catch (e) {}
	window.prompt("复制这串存档码（导出）：", code);
}
function importSave() {
	var code = window.prompt("粘贴存档码（导入）：");
	if (!code) return;
	try {
		var obj = JSON.parse(decodeB64(code.trim()));
		if (!obj || typeof obj !== "object" || !obj.species || !SKINS[obj.species]) { showCelebrate("存档无效"); return; }
		var merged = Object.assign({}, DEFAULT_STATE, obj);
		merged.muted = !!merged.muted;
		merged.coins = Math.max(0, merged.coins || 0);
		if (!Array.isArray(merged.skins) || !merged.skins.length) merged.skins = [merged.species];
		if (merged.skins.indexOf(merged.species) === -1) merged.skins = [merged.species].concat(merged.skins);
		if (!Array.isArray(merged.achievements)) merged.achievements = [];
		state = merged;
		if ((state.coins || 0) > (state.maxCoins || 0)) state.maxCoins = state.coins;
		persist();
		emit();
		if (!checking) { checking = true; try { checkAchievements(); } finally { checking = false; } }
		showCelebrate("💾 存档已导入");
	} catch (e) { showCelebrate("存档无效"); }
}
function wipeAll() {
	if (!window.confirm("清空全部进度（金币 / 皮肤 / 成就）？此操作不可恢复！")) return;
	try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
	var fresh = loadState();
	fresh.lastCheckIn = state.lastCheckIn;   // keep daily consistency (no re-grant today)
	fresh.loginStreak = state.loginStreak;
	state = fresh;
	persist();
	bubble = { text: "" }; notify = { unread: false }; celebrate = { text: "" }; draw = { phase: "idle", result: null }; lastDraw = { id: null, isNew: false };
	emit();
	showCelebrate("🗑 已重置全部进度");
}
function tick(working) {
	var t = state.trait;
	var hr = new Date().getHours();
	var isNight = hr >= 23 || hr < 6;
	var mm = state.mood >= 75 ? 0.85 : state.mood >= 45 ? 1.0 : 1.25;
	mm *= (t === "lazy" ? 0.9 : t === "foodie" ? 1.1 : 1.0);
	var hunger = clamp(state.hunger + (working ? 1.4 : 0.7) * mm);
	var energyRegen = isNight ? 2.0 : 1.2;
	var energy = clamp(state.energy + (working ? -1.6 * mm * (t === "lazy" ? 0.9 : 1.0) : energyRegen));
	var moodDrift = state.mood < 70 ? 0.3 : -0.15;
	if (t === "cool") moodDrift *= 0.8;
	if (state.hunger <= 30) moodDrift += 0.2;
	var mood = clamp(state.mood + moodDrift);
	if (hunger >= 95) mood = clamp(mood - 2);
	if (energy <= 8) mood = clamp(mood - 2);
	var newBond = clamp(state.bond - 0.5);
	var mh = (state.moodHistory || []).slice(-19); mh.push(Math.round(mood));
	var bh = (state.bondHistory || []).slice(-19); bh.push(Math.round(newBond));
	var patch = { mood: mood, energy: energy, hunger: hunger, bond: newBond, moodHistory: mh, bondHistory: bh };
	if (state.streak > 0 && !working) { patch.streakGrace = (state.streakGrace || 0) + 1; if ((state.streakGrace || 0) + 1 >= 6) { patch.streak = Math.floor(state.streak / 2); patch.streakGrace = 0; window.setTimeout(function () { showBubble("💔 连击中断了…"); }, 0); } }
	if (working) {
		var salary = SALARY_PER_TICK;
		var luckyChance = new Date().getDay() === 0 || new Date().getDay() === 6 ? 0.10 : 0.05;
		if (Math.random() < luckyChance) { var lucky = 3 + Math.floor(Math.random() * 6); salary += lucky; window.setTimeout(function () { showBubble((luckyChance > 0.05 ? "🎉 周末双倍！ " : "") + "💰 捡到了 " + lucky + " 金币！"); playSound("common"); }, 0); }
		var pMult = 1 + (state.prestige || 0) * 0.5;
		patch.coins = (state.coins || 0) + Math.round(salary * pMult);
	}
	if (state.streak > 0 && working) patch.streakGrace = 0;
	if (working) patch.workTicks = (state.workTicks || 0) + 1;
	setState(patch);
}
function onTurnComplete() {
	var streak = state.streak + 1, xp = state.xp + 6 + Math.min(streak, 10) + (state.trait === "studious" ? 2 : 0), level = state.level, mood = clamp(state.mood + 4), leveled = false;
	while (xp >= xpForLevel(level)) { xp -= xpForLevel(level); level += 1; mood = clamp(mood + 10); leveled = true; }
	var streakBonus = TURN_BONUS + Math.min(streak - 1, 10) * 2;
	var pMult2 = 1 + (state.prestige || 0) * 0.5;
	setState({ streak: streak, xp: xp, level: level, mood: mood, energy: clamp(state.energy - 6), coins: (state.coins || 0) + Math.round(streakBonus * pMult2), maxStreak: Math.max(state.maxStreak || 0, streak), turns: (state.turns || 0) + 1 });
	if (leveled) {
		var isMilestone = level % 10 === 0;
		addDiary((isMilestone ? "🏆 " : "🆙 ") + "升到 Lv." + level);
		showCelebrate(pick(SAY.level) + " 现在 Lv." + level + "!" + (isMilestone ? " 🏆 里程碑！" : ""));
		setNotify(true); triggerConfetti(); playSound(isMilestone ? "legendary" : "level");
		if (isMilestone) { var bonus = level * 3; setState({ coins: (state.coins || 0) + bonus, earned: (state.earned || 0) + bonus }); window.setTimeout(triggerConfetti, 600); }
	}
	else { showBubble(pick(SAY.turn) + " +" + streakBonus + "💰" + (streak >= 3 ? " 🔥" : "")); setNotify(true); }
}

var IDLE = [
	{ emoji: "😪", text: "哈～欠～" },
	{ emoji: "👀", text: "四处看看…" },
	{ emoji: "🤤", text: "伸个懒腰~" },
	{ emoji: "🎵", text: "哼着小曲~" },
	{ emoji: "💭", text: "发呆中…" }
];
var EMOTES = [["😄", "开心"], ["😢", "难过"], ["😍", "爱意"], ["😴", "犯困"], ["🤔", "思考"], ["🥳", "庆祝"]];
function showEmote(idx) { var e = EMOTES[idx]; if (!e) return; idle = { emoji: e[0], until: Date.now() + 5000 }; emit(); showBubble(e[0] + " " + e[1] + "~"); window.setTimeout(function () { idle = { emoji: "", until: 0 }; emit(); }, 5000); }
function showIdle(emoji, text) {
	idle = { emoji: emoji, until: Date.now() + 2200 };
	emit();
	window.setTimeout(function () { idle = { emoji: "", until: 0 }; emit(); }, 2200);
}
function maybeIdle(running) {
	if (state.muted || running) return;
	if (state.energy < 12) {
		if (Math.random() < 0.4) {
			var dream = pick(["💭 梦到吃大餐…", "💭 梦到在飞…", "💭 梦到主人了…", "💭 梦到好多金币…", "💭 梦到新皮肤…", "💭 zzZ…", "💭 梦到在草地上跑…", "💭 梦到学会了新技能…"]);
			showBubble(dream);
			showIdle("😴", dream);
		}
		return;
	}
	if (Math.random() < 0.005) {
		var mega = 50 + Math.floor(Math.random() * 51);
		setState({ coins: (state.coins || 0) + mega });
		showCelebrate("💎 传说宝箱！+" + mega + "💰！！");
		addDiary("💎 传说宝箱 +" + mega + "💰");
		playSound("legendary");
		triggerConfetti();
		return;
	}
	if (Math.random() < 0.04) {
		var treasure = 5 + Math.floor(Math.random() * 11);
		setState({ coins: (state.coins || 0) + treasure });
		showCelebrate("🎁 发现宝箱！+" + treasure + "💰");
		addDiary("🎁 宝箱 +" + treasure + "💰");
		playSound("achievement");
		flash = { active: true }; emit(); window.setTimeout(function () { flash = { active: false }; emit(); }, 1200);
		return;
	}
	var choice;
	if ((state.bond || 0) >= 90 && Math.random() < 0.20) choice = { emoji: "😍", text: pick(["好爱你哦~", "你是我的全世界！", "永远在一起好不好？", "想一直一直陪着你~"]) };
	else if ((state.bond || 0) >= 75 && Math.random() < 0.35) choice = { emoji: "💕", text: pick(["最喜欢你了~", "想一直陪着你", "你是最好的主人！", "和你在一起好开心~"]) };
	else if ((state.bond || 0) < 25 && Math.random() < 0.35) choice = { emoji: "💢", text: pick(["哼…", "别管我…", "一个人待会儿…", "你都不理我…"]) };
	else if (state.hunger >= 80) choice = { emoji: "🍚", text: "肚子咕咕叫…" };
	else if (state.mood < 40) choice = { emoji: "🥺", text: "有点无聊…摸摸我?" };
	else if (state.mood >= 80 && Math.random() < 0.4) choice = { emoji: "✨", text: "今天状态真好~" };
	else if (Math.random() < 0.25) choice = { emoji: "💭", text: "💭" + pick(["今天写了好多代码…", "主人的项目好厉害", "又是充实的一天", "想学新技能…", "代码的味道~", "悄悄看看主人在干嘛"]) };
	else choice = IDLE[Math.floor(Math.random() * IDLE.length)];
	showBubble(choice.text);
	showIdle(choice.emoji, choice.text);
}
function selectRunning(props) {
	try {
		var useSessions = props && props.useSessions;
		if (typeof useSessions === "function") {
			return !!useSessions(function (list) {
				var id = list && list.current, sess = id && list.byId ? list.byId[id] : null;
				return !!(sess && (sess.running === true || sess.activity === "running"));
			});
		}
	} catch (e) {}
	return false;
}
function useBrain(running) {
	var runningRef = useRef(running); runningRef.current = running;
	var prevRunning = useRef(running);
	var workStartShown = useRef(false);
	useEffect(function () { var t = window.setInterval(function () { tick(runningRef.current); }, 20000); return function () { window.clearInterval(t); }; }, []);
	useEffect(function () {
		if (!prevRunning.current && running && !state.muted) { showBubble(pick(["主人开始工作啦！加油~", "一起加油！", "我会乖乖等着~", "看着你写代码好开心~"])); workStartShown.current = true; }
		if (prevRunning.current && !running) onTurnComplete();
		prevRunning.current = running;
	}, [running]);
	useEffect(function () {
		var timer;
		(function schedule() { var m = state.mood || 50, b = state.bond || 50; var base = m >= 75 ? 12000 : m >= 45 ? 18000 : 30000; var range = m >= 75 ? 12000 : m >= 45 ? 18000 : 20000; var interval = base + Math.floor(Math.random() * range); if (b >= 75) interval = Math.floor(interval * 0.8); if (b < 25) interval = Math.floor(interval * 1.3); timer = window.setTimeout(function () { maybeIdle(runningRef.current); schedule(); }, interval); })();
		return function () { window.clearTimeout(timer); };
	}, []);
}

// ── UI atoms ─────────────────────────────────────────────────────────
function Bar(props) {
	return createElement("div", { style: { flex: 1, height: 7, borderRadius: 4, background: "rgba(255,255,255,.12)", overflow: "hidden" } },
		createElement("div", { style: { width: clamp(props.value) + "%", height: "100%", background: props.color, borderRadius: 4, transition: "width .4s ease" } }));
}
function RadialXP(props) {
	var v = props.v, r = 24, circ = 2 * Math.PI * r, pct = clamp(v.xp / v.xpNeed) || 0, off = circ * (1 - pct);
	var rc = v.level >= 20 ? "#ff6bcc" : v.level >= 10 ? "#b48cff" : v.level >= 5 ? "#5fb8ff" : "#ffd166";
	return createElement("div", { style: { position: "relative", width: 58, height: 58, flex: "none" } },
		createElement("svg", { width: 58, height: 58, viewBox: "0 0 58 58", style: { position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" } },
			createElement("circle", { cx: 29, cy: 29, r: r, fill: "none", stroke: "rgba(255,255,255,.12)", strokeWidth: 4 }),
			createElement("circle", { cx: 29, cy: 29, r: r, fill: "none", stroke: rc, strokeWidth: 4, strokeLinecap: "round", strokeDasharray: circ, strokeDashoffset: off, style: { transition: "stroke-dashoffset .5s ease" } })),
		createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 } }, face(v)));
}
function Bubble(props) {
	if (!props.text) return null;
	var isThought = props.text.charAt(0) === "💭";
	return createElement("div", { className: "dshpet-toast", style: { position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 8, padding: "5px 12px", borderRadius: isThought ? 16 : 11, fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", color: "#fff", background: isThought ? "rgba(80,60,100,.96)" : "rgba(60,60,80,.96)", border: "1px solid " + (isThought ? "rgba(200,180,220,.3)" : "rgba(255,255,255,.2)"), boxShadow: "0 6px 16px rgba(0,0,0,.45)", pointerEvents: "none", fontStyle: isThought ? "italic" : "normal", zIndex: 10001 } }, props.text);
}
function Toast(props) {
	if (!props.text) return null;
	return createElement("div", { className: "dshpet-toast", style: { position: "absolute", bottom: "100%", left: "50%", marginBottom: 30, padding: "6px 14px", borderRadius: 12, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", color: "#3a2a00", background: "linear-gradient(180deg,#ffe89a,#ffd166)", border: "1px solid rgba(255,255,255,.5)", boxShadow: "0 8px 22px rgba(255,209,102,.45)", pointerEvents: "none" } }, props.text);
}
function Confetti() {
	var c = useSyncExternalStore(subscribe, getConfetti);
	if (!c.items.length) return null;
	return createElement("div", { style: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10000, overflow: "hidden" } },
		c.items.map(function (item) { return createElement("span", { key: item.id, style: { position: "absolute", left: item.x + "%", top: "-30px", fontSize: item.size + "px", animation: "dshpet-confetti " + item.duration + "s linear " + item.delay + "s forwards", pointerEvents: "none" } }, item.emoji); }));
}
	function CritterTile(props) {
	var v = props.v, size = props.size || 56, rc = ringColor(v), tapKey = props.tapKey || 0;
	var hoverState = useState(false), hovering = hoverState[0], setHovering = hoverState[1];
	var baseFace = props.idleEmoji || face(v);
	var shown = hovering ? skinOf(v.species).face.happy : baseFace;
	var moodFilter = v.sleeping ? "saturate(0.5) brightness(0.7)" : v.moodTier === "happy" ? "saturate(1.18) brightness(1.08)" : v.moodTier === "sad" ? "saturate(0.55) brightness(0.88)" : "none";
	if (hovering && !v.sleeping) moodFilter = "saturate(1.25) brightness(1.12)";
	return createElement("div", { style: { position: "relative", width: size, height: size } },
		(v.rarity === "legendary" || v.rarity === "rare") && !v.working ? createElement("div", { className: v.rarity === "legendary" ? "dshpet-aura-l" : "dshpet-aura-r", style: { position: "absolute", inset: -3, borderRadius: size * 0.38, pointerEvents: "none" } }) : null,
		createElement("div", { onPointerDown: props.onPointerDown, onClick: props.onClick, onMouseEnter: function () { setHovering(true); }, onMouseLeave: function () { setHovering(false); }, title: props.title, className: v.working ? "dshpet-work" : "dshpet-bob",
			style: { width: size, height: size, borderRadius: size * 0.32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.6, background: "rgba(136,136,170,.20)", border: "2px solid " + rc, boxShadow: "0 8px 22px rgba(0,0,0,.34), 0 0 14px " + rc + "55" + (props.flashing ? ", 0 0 24px 6px rgba(255,209,102,.55)" : ""), backdropFilter: "blur(6px)", cursor: props.onPointerDown ? "grab" : "pointer", transition: "box-shadow .3s ease, filter .4s ease", filter: moodFilter } },
			createElement("span", { key: tapKey + (hovering ? "h" : ""), className: tapKey ? "dshpet-tap" : null, style: { display: "inline-block", transform: hovering ? "scale(1.15)" : "scale(1)", transition: "transform .15s ease" } }, shown)),
		props.unread && createElement("span", { className: "dshpet-badge", style: { position: "absolute", top: -2, right: -2, width: 12, height: 12, borderRadius: "50%", background: "#ff5a5a", border: "2px solid rgba(20,20,30,.9)" } }));
}

// ── tabs ─────────────────────────────────────────────────────────────
function TabBar(props) {
	var tabs = [["状态", 0], ["衣橱", 1], ["成就", 2], ["更多", 3]];
	return createElement("div", { style: { display: "flex", gap: 4, background: "rgba(0,0,0,.22)", padding: 3, borderRadius: 10, marginBottom: 12 } },
		tabs.map(function (t) { var active = props.active === t[1]; return createElement("button", { key: t[1], onClick: function () { props.onChange(t[1]); }, className: "dshpet-tab", style: { flex: 1, padding: "6px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: active ? "#fff" : "#aeb0c8", background: active ? "linear-gradient(180deg,#5a5a7a,#3e3e58)" : "transparent" } }, t[0]); }));
}
function Sparkline(props) {
	var d = props.data || [];
	if (d.length < 2) return null;
	var w = 100, h = 14, max = 100;
	var pts = d.map(function (v, i) { return (i / (d.length - 1) * w).toFixed(1) + "," + (h - (v / max) * h).toFixed(1); }).join(" ");
	var areaPts = "0," + h + " " + pts + " " + w + "," + h;
	var last = d[d.length - 1] || 0;
	var trendColor = last >= 75 ? "#5fe0a0" : last >= 45 ? props.color : "#ff9d9d";
	return createElement("svg", { width: w, height: h, viewBox: "0 0 " + w + " " + h, style: { flex: 1, display: "block", marginLeft: 54, marginBottom: 6 } },
		createElement("polygon", { points: areaPts, fill: trendColor, opacity: 0.1 }),
		createElement("polyline", { points: pts, fill: "none", stroke: trendColor, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", opacity: 0.8 }),
		createElement("circle", { cx: ((d.length - 1) / (d.length - 1) * w).toFixed(1), cy: (h - (last / max) * h).toFixed(1), r: 1.5, fill: trendColor }));
}
function StatRow(props) {
	return createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } },
		createElement("span", { style: { width: 48, fontSize: 11, color: "#c9cbe0" } }, props.icon, " ", props.label),
		createElement(Bar, { value: props.value, color: props.color }),
		createElement("span", { style: { width: 26, fontSize: 11, textAlign: "right", color: "#aeb0c8" } }, Math.round(props.value)));
}
function ActionBtn(props) {
	return createElement("button", { onClick: props.onClick, className: "dshpet-btn", disabled: !!props.disabled,
		style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "9px 0", borderRadius: 10, cursor: props.disabled ? "default" : "pointer", fontSize: 11, color: "#eef", border: "1px solid " + props.color + "55", background: props.color + "26", opacity: props.disabled ? 0.45 : 1 } },
		createElement("span", { style: { fontSize: 17, lineHeight: 1 } }, props.icon),
		createElement("span", null, props.label));
}
function StatsTab(props) {
	var v = props.v;
	return createElement("div", null,
		createElement(StatRow, { icon: "💖", label: "心情", value: v.mood, color: "#7ce0ff" }),
		createElement(Sparkline, { data: v.moodHistory, color: "#7ce0ff" }),
		createElement(StatRow, { icon: "⚡", label: "体力", value: v.energy, color: "#9cd97a" }),
		createElement(StatRow, { icon: "🍚", label: "饱腹", value: 100 - v.hunger, color: "#ffcf6b" }),
		createElement(StatRow, { icon: "💕", label: "牵绊", value: v.bond, color: "#ff9db8" }),
		createElement(Sparkline, { data: v.bondHistory, color: "#ff9db8" }),
		v.bond >= 75 ? createElement("div", { style: { fontSize: 9, color: "#ff9db8", marginLeft: 54, marginBottom: 8 } }, "✨ 暴击率 " + (v.bond >= 90 ? 25 : 15) + "%") : null,
		createElement("div", { style: { fontSize: 10.5, color: v.streak >= 10 ? "#ff6b6b" : v.streak >= 5 ? "#ff9d6b" : v.streak >= 3 ? "#ffb36b" : "#aeb0c8", margin: "10px 0 4px", fontWeight: v.streak >= 5 ? 700 : v.streak >= 3 ? 600 : 400 } }, "Lv." + v.level + " · 经验 " + v.xp + "/" + v.xpNeed + (v.streak ? "   " + (v.streak >= 10 ? "🔥🔥" : "🔥") + " 连击 " + v.streak + " · 下轮 +" + v.turnBonus + "💰" : "")),
		createElement("div", { style: { fontSize: 9.5, color: v.moodTier === "happy" ? "#5fe0a0" : v.moodTier === "sad" ? "#ff9d9d" : "#6a6c80", marginBottom: 4 } }, v.moodTier === "happy" ? "💚 高兴时消耗 -15%" : v.moodTier === "sad" ? "💔 低落时消耗 +25%" : "消耗正常"),
		v.hunger <= 30 ? createElement("div", { style: { fontSize: 9, color: "#9cd97a", marginBottom: 4 } }, "🍚 吃饱了，心情恢复加速~") : null,
		v.careStreak > 0 ? createElement("div", { style: { fontSize: 9, color: v.careStreak >= 7 ? "#5fe0a0" : "#9cd97a", marginBottom: 12 } }, "💚 连续 " + v.careStreak + " 天好主人 · 每日牵绊 +" + Math.min(v.careStreak, 10)) : createElement("div", { style: { height: 0, marginBottom: 8 } }),
		createElement("div", { style: { display: "flex", gap: 6 } },
			createElement(ActionBtn, { icon: "💞", label: v.favorite === "pet" ? "抚摸💛" : "抚摸", color: "#ff9db8", onClick: function () { interact("pet"); } }),
			createElement(ActionBtn, { icon: "🍚", label: v.favorite === "feed" ? "喂食💛" : "喂食", color: "#ffcf6b", onClick: function () { interact("feed"); } }),
			createElement(ActionBtn, { icon: "💤", label: v.favorite === "nap" ? "小憩💛" : "小憩", color: "#9cd97a", onClick: function () { interact("nap"); } })),
		createElement("div", { style: { display: "flex", gap: 3, marginTop: 6, justifyContent: "center", flexWrap: "wrap" } },
			EMOTES.map(function (e, i) { return createElement("button", { key: i, onClick: function () { showEmote(i); }, style: { fontSize: 16, border: "1px solid rgba(255,255,255,.1)", borderRadius: 7, background: "rgba(255,255,255,.04)", cursor: "pointer", padding: "3px 6px", transition: "transform .1s ease" }, title: e[1] }, e[0]); })),
		createElement("div", { style: { marginTop: 10, padding: "8px 8px 6px", borderRadius: 10, background: "rgba(124,224,255,.06)", border: "1px solid rgba(124,224,255,.15)" } },
			createElement("div", { style: { fontSize: 10, fontWeight: 600, color: "#7ce0ff", marginBottom: 6 } }, "📋 每日任务" + ((function () { var dd = new Date().getDay(); return dd === 0 || dd === 6; })() ? "   🎉 周末双倍掉落" : "")),
			(function () { var qs = getQuests(); return qs.map(function (q, i) {
				var pct = Math.min(100, Math.round(q.cur / q.target * 100));
				return createElement("div", { key: i, onClick: function () { claimQuest(i); }, style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4, cursor: q.done || q.cur < q.target ? "default" : "pointer", opacity: q.done ? 0.5 : 1 } },
					createElement("span", { style: { fontSize: 10, color: q.done ? "#5fe0a0" : "#c9cbe0", flex: 1 } }, (q.done ? "✅ " : "") + q.desc),
					createElement("div", { style: { width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,.1)", overflow: "hidden" } }, createElement("div", { style: { width: pct + "%", height: "100%", background: q.done ? "#5fe0a0" : "#7ce0ff", borderRadius: 2 } })),
					createElement("span", { style: { fontSize: 9, color: q.done ? "#5fe0a0" : "#9aa0b5", minWidth: 32, textAlign: "right" } }, q.done ? "已完成" : q.cur + "/" + q.target + " +" + q.reward + "💰"));
			}); })()));
}
function ClosetTab(props) {
	var v = props.v;
	var filterState = useState("all"), filter = filterState[0], setFilter = filterState[1];
	var filters = [["全部", "all", "#9aa0b5"], ["普通", "common", "#9aa0b5"], ["稀有", "rare", "#5fb8ff"], ["传说", "legendary", "#ffd166"]];
	var visible = filter === "all" ? SKIN_IDS : SKIN_IDS.filter(function (k) { return SKINS[k].rarity === filter; });
	var ownedInFilter = visible.filter(function (k) { return v.skins.indexOf(k) !== -1; }).length;
	return createElement("div", null,
		createElement("div", { style: { fontSize: 11, color: "#aeb0c8", marginBottom: 6 } }, "收藏 " + v.owned + "/" + v.total + "   点已拥有的换装，点未解锁的去抽奖"),
		createElement("div", { style: { display: "flex", gap: 4, marginBottom: 6 } },
			filters.map(function (f) {
				var active = filter === f[1], fc = f[2];
				return createElement("button", { key: f[1], onClick: function () { setFilter(f[1]); }, className: "dshpet-tab",
					style: { flex: 1, padding: "4px 0", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, color: active ? "#fff" : "#9aa0b5", background: active ? fc + "44" : "rgba(255,255,255,.04)" } }, f[0]);
			})),
		createElement("div", { style: { fontSize: 10, color: "#6a6c80", marginBottom: 8 } }, ownedInFilter + "/" + visible.length + " 已收集"),
		createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 } },
			visible.map(function (id) {
				var skin = SKINS[id], owned = v.skins.indexOf(id) !== -1, equipped = v.species === id, color = RARITY_COLOR[skin.rarity];
				return createElement("button", { key: id, onClick: function () { if (owned) equip(id); else props.gotoMore(); }, className: "dshpet-cell",
					style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 0 5px", borderRadius: 9, cursor: "pointer", fontSize: 10, color: owned ? "#eef" : "#6a6c80", border: "1px solid " + (equipped ? color : "rgba(255,255,255,.12)"), background: owned ? color + "22" : "rgba(255,255,255,.04)", boxShadow: equipped ? "0 0 0 1px " + color + "66 inset" : "none" } },
					createElement("span", { style: { fontSize: 20, filter: owned ? "none" : "grayscale(1) opacity(.5)" } }, owned ? skin.face.happy : "❔"),
					createElement("span", null, owned ? skin.name : "???"));
			})));
}
function AchievementsTab(props) {
	var v = props.v, unlocked = v.achievements || [];
	function StatCell(p) { return createElement("div", { className: "dshpet-stat", style: { display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0", borderRadius: 9, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" } }, createElement("span", { style: { fontSize: 15, fontWeight: 700, color: "#ffe89a" } }, p.value), createElement("span", { style: { fontSize: 9.5, color: "#9aa0b5", marginTop: 2 } }, p.label)); }
	return createElement("div", null,
		createElement("div", { style: { fontSize: 11, color: "#c9cbe0", marginBottom: 8, fontWeight: 600 } }, "成就 " + v.achCount + "/" + v.achTotal + "   ·   玩了 " + v.daysPlayed + " 天"),
		createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, marginBottom: 12 } },
			createElement(StatCell, { value: fmtCoin(v.earned), label: "💰赚取" }),
			createElement(StatCell, { value: fmtCoin(v.spent), label: "💸花费" }),
			createElement(StatCell, { value: v.turns, label: "🔄轮数" }),
			createElement(StatCell, { value: v.totalDraws, label: "🎰抽奖" }),
			createElement(StatCell, { value: v.interacts, label: "🐾互动" }),
			createElement(StatCell, { value: v.workTicks, label: "⏱tick" }),
			createElement(StatCell, { value: v.maxStreak, label: "🔥连击" }),
			createElement(StatCell, { value: v.loginStreak, label: "📅连签" })),
		createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5 } },
			ACH.map(function (a) {
				var done = unlocked.indexOf(a.id) !== -1;
				var prog = (!done && a.progress) ? a.progress(v) : null;
				var progPct = prog ? Math.min(100, Math.round((prog.cur / prog.need) * 100)) : 0;
				return createElement("div", { key: a.id, style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 9, border: "1px solid " + (done ? "rgba(255,209,102,.4)" : "rgba(255,255,255,.1)"), background: done ? "rgba(255,209,102,.12)" : "rgba(255,255,255,.03)", opacity: done ? 1 : 0.7 } },
					createElement("span", { style: { fontSize: 18, filter: done ? "none" : "grayscale(1)" } }, a.icon),
					createElement("div", { style: { flex: 1, minWidth: 0 } },
						createElement("div", { style: { fontSize: 12, fontWeight: 600, color: done ? "#ffe89a" : "#c9cbe0" } }, a.name),
						createElement("div", { style: { fontSize: 10, color: "#9aa0b5" } }, a.desc),
						prog ? createElement("div", { style: { marginTop: 3, height: 4, borderRadius: 2, background: "rgba(255,255,255,.1)", overflow: "hidden" } },
							createElement("div", { style: { width: progPct + "%", height: "100%", background: progPct >= 75 ? "#5fe0a0" : progPct >= 40 ? "#7ce0ff" : "#9aa0b5", borderRadius: 2, transition: "width .3s ease" } })) : null,
						prog ? createElement("div", { style: { fontSize: 9, color: "#7a7c90", marginTop: 2 } }, prog.cur + "/" + prog.need) : null),
					createElement("span", { style: { fontSize: 11, color: done ? "#ffd166" : "#6a6c80", fontWeight: 700 } }, done ? "✓" : "+" + a.reward + "💰"));
			})),
		createElement("div", { style: { marginTop: 10, padding: "8px 8px 6px", borderRadius: 10, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)" } },
			createElement("div", { style: { fontSize: 10, fontWeight: 600, color: "#c9cbe0", marginBottom: 6 } }, "📜 最近事件"),
			(v.diary || []).length ? (v.diary || []).slice(0, 6).map(function (d, i) {
				var ago = Math.floor((Date.now() - d.t) / 60000), timeStr = ago < 1 ? "刚刚" : ago < 60 ? ago + "分钟前" : ago < 1440 ? Math.floor(ago / 60) + "小时前" : Math.floor(ago / 1440) + "天前";
				return createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9aa0b5", marginBottom: 3 } },
					createElement("span", null, d.text),
					createElement("span", { style: { color: "#6a6c80", fontSize: 9 } }, timeStr));
			}) : createElement("div", { style: { fontSize: 10, color: "#6a6c80" } }, "还没有事件记录~")));
}
function MoreTab(props) {
	var v = props.v, d = props.draw;
	var canDraw = v.coins >= DRAW_COST && d.phase === "idle";
	var reveal = d.phase === "reveal" && d.result && d.result.id ? createElement("div", { className: "dshpet-reveal", style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0 12px", marginBottom: 10, borderRadius: 12, background: RARITY_COLOR[skinOf(d.result.id).rarity] + "22", border: "1px solid " + RARITY_COLOR[skinOf(d.result.id).rarity] + "88", boxShadow: "0 0 18px " + RARITY_COLOR[skinOf(d.result.id).rarity] + "55" } },
		createElement("span", { style: { fontSize: 30 } }, skinOf(d.result.id).face.happy),
		createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#fff" } }, (d.result.isNew ? "✨ 新：" : "已拥有：") + skinOf(d.result.id).name)) : d.phase === "rolling" ? createElement("div", { className: "dshpet-reveal", style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0 12px", marginBottom: 10, borderRadius: 12, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)" } },
		createElement("span", { style: { fontSize: 30, filter: "blur(1px)" } }, skinOf(SKIN_IDS[d.rollingFace || 0]).face.happy),
		createElement("span", { className: "dshpet-spin", style: { fontSize: 11, color: "#aeb0c8", display: "inline-block" } }, "🎰")) : null;
	return createElement("div", null,
		reveal,
		createElement("div", { style: { display: "flex", gap: 6, marginBottom: 6 } },
			createElement(ActionBtn, { icon: d.phase === "rolling" ? "🎯" : "🎰", label: d.phase === "rolling" ? "抽取中…" : "抽奖 💰" + DRAW_COST, color: "#ffd166", disabled: !canDraw && d.phase !== "rolling", onClick: doDraw }),
			createElement(ActionBtn, { icon: "🎰", label: "十连 130💰", color: "#ff9d6b", disabled: v.coins < 130 || d.phase !== "idle", onClick: doDraw10 }),
			v.freePull && d.phase === "idle" ? createElement(ActionBtn, { icon: "🎁", label: "免费抽", color: "#5fe0a0", onClick: props.doFreePull }) : createElement(ActionBtn, { icon: "✓", label: "今日已用", color: "#6a6c80", disabled: true })),
		createElement("div", { style: { fontSize: 10.5, color: "#aeb0c8", marginBottom: 6 } }, "概率：普通 70% · 稀有 22% · 传说 8%（重复退 " + DUPE_REFUND + "💰）"),
		createElement("div", { style: { fontSize: 10.5, color: "#ffd166", marginBottom: 4 } }, "🛡 保底：再抽 " + v.pityLeft + " 次必出稀有+"),
		(function () { var m = new Date().getMonth() + 1; var s = m === 10 ? "🎃 万圣节限定皮肤概率提升！" : (m === 12 || m === 1 || m === 2) ? "❄️ 冬季节日限定皮肤概率提升！" : null; return s ? createElement("div", { style: { fontSize: 10, color: "#5fe0a0", marginBottom: 10 } }, s) : null; })(),
		createElement("div", { style: { height: 1, background: "rgba(255,255,255,.08)", margin: "0 0 10px" } }),
		createElement("div", { style: { fontSize: 9.5, color: "#7a7c90", marginBottom: 4 } }, "宠物管理"),
		createElement("div", { style: { display: "flex", gap: 6, marginBottom: 8 } },
			createElement(ActionBtn, { icon: "✏️", label: "改名", color: "#9aa0b5", onClick: function () { var n = window.prompt("给宠物起个名字：", v.name); if (n != null) rename(n); } }),
			createElement(ActionBtn, { icon: "📋", label: "分享", color: "#b48cff", onClick: shareCard }),
			createElement(ActionBtn, { icon: "🎲", label: "换性格 50💰", color: "#ff9db8", disabled: v.coins < 50, onClick: rerollTrait })),
		createElement("div", { style: { fontSize: 9.5, color: "#7a7c90", marginBottom: 4 } }, "进阶"),
		createElement("div", { style: { display: "flex", gap: 6 } },
			v.prestige > 0 ? createElement(ActionBtn, { icon: "🌟", label: "转生×" + (v.prestige + 1), color: "#ffd166", disabled: v.level < 20, onClick: prestige }) : v.level >= 20 ? createElement(ActionBtn, { icon: "🌟", label: "转生!", color: "#ffd166", onClick: prestige }) : createElement(ActionBtn, { icon: "🌟", label: "转生 (Lv.20)", color: "#6a6c80", disabled: true }),
			createElement(ActionBtn, { icon: "↻", label: "重置", color: "#ff7a7a", onClick: reset })),
		createElement("div", { style: { height: 1, background: "rgba(255,255,255,.1)", margin: "10px -2px 8px" } }),
		createElement("div", { style: { fontSize: 10.5, color: "#aeb0c8", marginBottom: 6 } }, "设置"),
		createElement("div", { style: { display: "flex", gap: 6 } },
			createElement(ActionBtn, { icon: v.muted ? "🔔" : "🔇", label: v.muted ? "已静音" : "气泡", color: "#9aa0b5", onClick: toggleMute }),
			createElement(ActionBtn, { icon: "⬆️", label: "导出", color: "#7ce0ff", onClick: exportSave }),
			createElement(ActionBtn, { icon: "⬇️", label: "导入", color: "#9cd97a", onClick: importSave }),
			createElement(ActionBtn, { icon: "🗑️", label: "清空", color: "#ff7a7a", onClick: wipeAll })));
}

function Onboarding(props) {
	var v = props.v;
	var nameState = useState("豆豆"), name = nameState[0], setName = nameState[1];
	var stepState = useState(0), step = stepState[0], setStep = stepState[1];
	var panelStyle = { width: 264, padding: 13, borderRadius: 18, color: "#eef", background: panelGradient(), border: "1px solid rgba(255,255,255,.13)", boxShadow: "0 18px 44px rgba(0,0,0,.55)" };
	var head = createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 } },
		createElement("span", { style: { fontSize: 26 } }, "🐣"),
		createElement("div", { style: { flex: 1 } },
			createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#f3f4fb" } }, step === 0 ? "欢迎领养电子宠物" : "选一只起始伙伴"),
			createElement("div", { style: { fontSize: 10.5, color: "#c9cbe0" } }, step === 0 ? "先给它起个名字吧" : "之后还能抽到更多皮肤")),
		createElement("button", { onClick: props.onClose, className: "dshpet-x", "aria-label": "关闭", style: { flex: "none", width: 26, height: 26, borderRadius: 8, border: "none", background: "rgba(255,255,255,.08)", color: "#c9cbe0", cursor: "pointer", fontSize: 17, lineHeight: "17px" } }, "×"));
	if (step === 0) {
		return createElement("div", { className: "dshpet-panel", style: panelStyle }, head,
			createElement("input", { value: name, onChange: function (e) { setName(e.target.value); }, maxLength: 24, placeholder: "宠物的名字", style: { width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 9, border: "1px solid rgba(255,255,255,.18)", background: "rgba(0,0,0,.25)", color: "#eef", fontSize: 13, marginBottom: 10, outline: "none" } }),
			createElement("button", { onClick: function () { setStep(1); }, className: "dshpet-btn", style: { width: "100%", padding: "9px 0", borderRadius: 10, border: "1px solid #7ce0ff55", background: "#7ce0ff26", color: "#eef", cursor: "pointer", fontSize: 12, fontWeight: 600 } }, "下一步 →"));
	}
	return createElement("div", { className: "dshpet-panel", style: panelStyle }, head,
		createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 } },
			COMMON.map(function (id) {
				var skin = SKINS[id];
				return createElement("button", { key: id, onClick: function () { finishOnboard(name, id); }, className: "dshpet-cell", style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 0", borderRadius: 12, cursor: "pointer", fontSize: 12, color: "#eef", border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.05)" } },
					createElement("span", { style: { fontSize: 30 } }, skin.face.happy),
					createElement("span", null, skin.name));
			})),
		createElement("button", { onClick: function () { setStep(0); }, className: "dshpet-btn", style: { width: "100%", padding: "8px 0", marginTop: 10, borderRadius: 9, border: "none", background: "transparent", color: "#9aa0b5", cursor: "pointer", fontSize: 11 } }, "← 返回改名"));
}
function PetPanel(props) {
	var v = props.v, onClose = props.onClose;
	var tabState = useState(0), tab = tabState[0], setTab = tabState[1];
	var d = useSyncExternalStore(subscribe, getDraw);
	useEffect(function () {
		var onKey = function (e) {
			if (e.key === "Escape") { onClose(); return; }
			var tag = (e.target && e.target.tagName) || "";
			if (tag === "INPUT" || tag === "TEXTAREA") return;
			var k = e.key.toLowerCase();
			if (k === "1") { setTab(0); e.preventDefault(); }
			else if (k === "2") { setTab(1); e.preventDefault(); }
			else if (k === "3") { setTab(2); e.preventDefault(); }
			else if (k === "4") { setTab(3); e.preventDefault(); }
			else if (k === "p" && tab === 0) { interact("pet"); e.preventDefault(); }
			else if (k === "f" && tab === 0) { interact("feed"); e.preventDefault(); }
			else if (k === "n" && tab === 0) { interact("nap"); e.preventDefault(); }
			else if (k === "d" && tab === 3) { doDraw(); e.preventDefault(); }
		};
		window.addEventListener("keydown", onKey);
		return function () { window.removeEventListener("keydown", onKey); };
	}, [tab]);
	if (!v.onboarded) return createElement(Onboarding, { v: v, onClose: onClose });
	var showHint = false;
	try { showHint = !localStorage.getItem(HINT_KEY); } catch (e) {}
	function dismissHint() { try { localStorage.setItem(HINT_KEY, "1"); } catch (e) {} showHint = false; emit(); }
	return createElement("div", { className: "dshpet-panel",
		style: { width: 264, maxHeight: "calc(100vh - 120px)", padding: 13, borderRadius: 18, color: "#eef", background: panelGradient(), border: "1px solid rgba(255,255,255,.13)", boxShadow: "0 18px 44px rgba(0,0,0,.55)", display: "flex", flexDirection: "column" } },
		createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 } },
			createElement(RadialXP, { v: v }),
			createElement("div", { style: { flex: 1, minWidth: 0 } },
				createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#f3f4fb" } }, v.name + (v.traitIcon ? " " + v.traitIcon : "") + " · Lv." + v.level + (v.prestige > 0 ? " 🌟" + v.prestige : "")),
				createElement("div", { style: { fontSize: 10.5, color: "#c9cbe0", marginTop: 1 } }, v.skinName + " " + v.badge + "   💰 " + fmtCoin(v.coins) + "   🎴 " + v.owned + "/" + v.total + "   🕐 " + v.ageDays + "天")),
			createElement("button", { onClick: onClose, className: "dshpet-x", "aria-label": "关闭", style: { flex: "none", width: 26, height: 26, borderRadius: 8, border: "none", background: "rgba(255,255,255,.08)", color: "#c9cbe0", cursor: "pointer", fontSize: 17, lineHeight: "17px" } }, "×")),
		createElement(TabBar, { active: tab, onChange: setTab }),
		showHint ? createElement("div", { style: { fontSize: 10, color: "#9aa0b5", padding: "6px 8px", marginBottom: 8, borderRadius: 8, background: "rgba(124,224,255,.08)", border: "1px solid rgba(124,224,255,.2)", display: "flex", alignItems: "center", gap: 6 } },
			createElement("span", null, "⌨️ 快捷键: 1-4 切换 · P抚摸 F喂食 N小憩 · D抽奖 · Esc关闭"),
			createElement("button", { onClick: dismissHint, style: { marginLeft: "auto", border: "none", background: "none", color: "#9aa0b5", cursor: "pointer", fontSize: 13, padding: 0 } }, "×")) : null,
		createElement("div", { key: tab, className: "dshpet-tab-content", style: { overflowY: "auto", height: "min(440px, calc(100vh - 200px))" } },
			tab === 0 ? createElement(StatsTab, { v: v }) : tab === 1 ? createElement(ClosetTab, { v: v, gotoMore: function () { setTab(3); } }) : tab === 2 ? createElement(AchievementsTab, { v: v }) : createElement(MoreTab, { v: v, draw: d, doFreePull: doFreePull })));
}

// localStorage-backed useState (persists panel open state across reloads)
function usePersistentState(key, initial) {
	var s = useState(function () { try { var v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : initial; } catch (e) { return initial; } });
	var val = s[0], origSet = s[1];
	var setPersist = function (v) { var next = typeof v === "function" ? v(val) : v; origSet(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch (e) {} };
	return [val, setPersist];
}

// render error boundary — silently catches render errors, never breaks host UI
function safeRender(Comp) {
	return function (props) {
		try { return Comp(props); }
		catch (e) { try { console.error("[dsh-pet] render error:", e); } catch (e2) {} return null; }
	};
}

// ── variants ─────────────────────────────────────────────────────────
function PetAction(props) {
	var s = useSyncExternalStore(subscribe, getState);
	var bb = useSyncExternalStore(subscribe, getBubble);
	var n = useSyncExternalStore(subscribe, getNotify);
	var ce = useSyncExternalStore(subscribe, getCelebrate);
	var fl = useSyncExternalStore(subscribe, getFlash);
	var idStore = useSyncExternalStore(subscribe, getIdle);
	var running = selectRunning(props);
	var v = viewOf(s, running);
	var idleEmoji = idStore.until > Date.now() ? idStore.emoji : "";
	useBrain(running);
	var openState = usePersistentState("dsh-pet:open", !v.onboarded), open = openState[0], setOpen = openState[1];
	var tapState = useReducer(function (x) { return x + 1; }, 0), tapKey = tapState[0], bump = tapState[1];
	useEffect(function () { if (open) setNotify(false); }, [open]);
	var wide = props.wide !== false;
	return createElement("div", { style: { position: "relative" } },
		createElement(Confetti),
		createElement(Toast, { text: ce.text }),
		createElement(Bubble, { text: bb.text }),
		createElement("button", { type: "button", onClick: function () { setOpen(!open); bump(); }, title: statusText(v), style: { border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" } },
			createElement(CritterTile, { v: v, size: wide ? 40 : 36, unread: n.unread, tapKey: tapKey, idleEmoji: idleEmoji, flashing: fl.active }),
			wide && createElement("span", { style: { marginLeft: 7, fontSize: 13, color: "#cdd6e4" } }, v.name)),
		open && createElement("div", { style: { position: "absolute", bottom: "100%", left: 0, marginBottom: 8, zIndex: 50 } }, createElement(PetPanel, { v: v, onClose: function () { setOpen(false); } })));
}

function PetOverlay(props) {
	var s = useSyncExternalStore(subscribe, getState);
	var bb = useSyncExternalStore(subscribe, getBubble);
	var n = useSyncExternalStore(subscribe, getNotify);
	var ce = useSyncExternalStore(subscribe, getCelebrate);
	var fl = useSyncExternalStore(subscribe, getFlash);
	var idStore = useSyncExternalStore(subscribe, getIdle);
	var running = selectRunning(props);
	var v = viewOf(s, running);
	var idleEmoji = idStore.until > Date.now() ? idStore.emoji : "";
	useBrain(running);
	var openState = usePersistentState("dsh-pet:open", !v.onboarded), open = openState[0], setOpen = openState[1];
	var pos = useRef((function () { try { var v = JSON.parse(localStorage.getItem("dsh-pet:pos") || "null"); return v || { x: 24, y: 104 }; } catch (e) { return { x: 24, y: 104 }; } })());
	var downAt = useRef(null);
	var openRef = useRef(open); openRef.current = open;
	var tapState = useReducer(function (x) { return x + 1; }, 0), tapKey = tapState[0], bump = tapState[1];
	useEffect(function () {
		var move = function (e) { if (!downAt.current) return; var dx = e.clientX - downAt.current.sx, dy = e.clientY - downAt.current.sy; if (!downAt.current.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) downAt.current.moved = true; if (downAt.current.moved) { pos.current = { x: downAt.current.px - dx, y: downAt.current.py - dy }; bump(); } };
		var up = function () { if (downAt.current && downAt.current.moved) { try { localStorage.setItem("dsh-pet:pos", JSON.stringify(pos.current)); } catch (e) {} } else if (downAt.current) { setOpen(!openRef.current); bump(); } downAt.current = null; };
		window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
		return function () { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
	}, []);
	useEffect(function () { if (open) setNotify(false); }, [open]);
	var onPointerDown = function (e) { downAt.current = { sx: e.clientX, sy: e.clientY, px: pos.current.x, py: pos.current.y, moved: false }; };
	return createElement("div", { style: { position: "fixed", right: pos.current.x + "px", bottom: pos.current.y + "px", zIndex: 9999, userSelect: "none", fontFamily: "system-ui, -apple-system, sans-serif" } },
		createElement("div", { style: { position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" } },
			createElement(Confetti),
		createElement(Toast, { text: ce.text }),
			createElement(Bubble, { text: bb.text }),
			createElement(CritterTile, { v: v, size: 60, unread: n.unread, tapKey: tapKey, idleEmoji: idleEmoji, flashing: fl.active, onPointerDown: onPointerDown, title: "点击开/关 · 拖动移动" }),
			createElement("div", { style: { marginTop: 7, padding: "3px 10px", borderRadius: 9, background: "rgba(28,28,40,.88)", color: "#e8eaf2", fontSize: 11, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,.35)", textAlign: "center", maxWidth: 220 } }, statusText(v) + (v.bond >= 90 ? " 😍" : v.bond >= 75 ? " 💕" : v.bond < 25 ? " 💢" : ""))),
		open && createElement("div", { style: { position: "absolute", bottom: "100%", right: 0, marginBottom: 10 } }, createElement(Toast, { text: ce.text }), createElement(Bubble, { text: bb.text }), createElement(PetPanel, { v: v, onClose: function () { setOpen(false); } })));
}

// ── plugin ───────────────────────────────────────────────────────────
function apply(ctx) {
	try {
		ensureCss();
		var slot = MOUNT === "overlay" ? "shell.overlay" : "sidebar.footer.action";
		var Comp = safeRender(MOUNT === "overlay" ? PetOverlay : PetAction);
		ctx.effect(function () {
			return ctx.slots.inject(slot, function () { return ctx.slots.register({ name: slot, id: "dsh-pet", order: 100, label: "电子宠物" }, Comp); });
		}, "dsh-pet: " + MOUNT + " mount");
	} catch (e) { try { console.error("[dsh-pet] init error:", e); } catch (e2) {} }
}
var inject = ["slots"];
exports.apply = apply;
exports.inject = inject;
