import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const json = JSON.stringify(JSON.parse(readFileSync("drills.json", "utf8")));

const open = '<script type="application/json" id="drill-data">';
const close = "</scr" + "ipt>";
const a = html.indexOf(open);
if (a < 0) throw new Error("drill-data block not found in index.html");
const b = html.indexOf(close, a);

writeFileSync("index.html", html.slice(0, a + open.length) + json + html.slice(b));
console.log("inlined " + JSON.parse(json).drills.length + " drills");
