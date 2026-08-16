// ─────────────────────────────────────────────────────────────────────────────
// scripts/check.mjs — lightweight quality gate for the mypet plugin
// ─────────────────────────────────────────────────────────────────────────────
// Runs entirely in-process (no child_process), so it works in any sandbox:
//   1. syntax-parses lib/client.js (classic script) and imports lib/index.js (ESM)
//   2. verifies lib/client.js is byte-for-byte a fresh wrap of src/client.js
//   3. checks bundled/source invariants
//   4. hygiene checks (no deprecated/dangerous leftovers)
// Exits non-zero on any failure, so it can be a pre-publish / CI gate.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { readPkg, readSource, wrapBody } from "./build.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = readPkg();
let failed = false;

function ok(msg) { console.log(`  ✓ ${msg}`); }
function fail(msg) { failed = true; console.error(`  ✗ ${msg}`); }

// 1. syntax check
console.log("1. syntax check");
const clientCode = readFileSync(join(root, "lib/client.js"), "utf8");
try {
	new vm.Script(clientCode, { filename: "lib/client.js" }); // parse only, no execution
	ok(`lib/client.js parses (${clientCode.length} bytes)`);
} catch (e) {
	fail(`lib/client.js syntax error: ${e.message}`);
}
try {
	await import(pathToFileURL(join(root, "lib/index.js")).href); // real ESM load (side-effect free)
	ok("lib/index.js imports (ESM)");
} catch (e) {
	fail(`lib/index.js import error: ${e.message}`);
}

// 2. freshness: lib/client.js must equal a fresh wrap of src/client.js
console.log("2. build freshness");
const expected = wrapBody(readSource(), pkg.name);
if (expected === clientCode) ok("lib/client.js is up to date with src/client.js");
else fail("lib/client.js is stale — run `npm run build`");

// 3. invariants
console.log("3. invariants");
const builtHas = (needle, label) => {
	if (clientCode.includes(needle)) ok(label);
	else fail(`missing ${label} in lib/client.js`);
};
builtHas(`id: ${JSON.stringify(pkg.name)}`, "bundled plugin id");
builtHas('id: "dsh-pet"', "slot registration id");

const src = readSource();
for (const [needle, label] of [
	["exports.apply = apply", "apply export"],
	["exports.inject = inject", "inject export"],
	["var MOUNT = ", "MOUNT constant"],
	["function apply(ctx)", "apply(ctx) entry"],
]) {
	if (src.includes(needle)) ok(label);
	else fail(`missing ${label} in src/client.js`);
}

// 4. hygiene
console.log("4. hygiene");
for (const [bad, label] of [["arguments.callee", "arguments.callee"], ['+ + "', "NaN birthday greeting"]]) {
	if (src.includes(bad)) fail(`found ${label} — remove it`);
	else ok(`no ${label}`);
}

console.log("");
if (failed) {
	console.error(`✗ check FAILED (mypet v${pkg.version})`);
	process.exit(1);
}
console.log(`✓ all checks passed (mypet v${pkg.version})`);
