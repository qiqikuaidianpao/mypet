// ─────────────────────────────────────────────────────────────────────────────
// dsh-plugin-pet · node half (host loader entry)
// ─────────────────────────────────────────────────────────────────────────────
// A client-module package's node half only needs to ACTIVATE so the entry has a
// fiber (the client-modules scanner requires one). The pet is fully browser-side
// (see lib/client.js), so there is no host behavior to provide — this mirrors
// @deepseek-ai/dsh-client-ui-sidebar, whose node half is exactly this shape.
function apply() {}

export { apply };
