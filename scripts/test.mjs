import assert from "node:assert/strict";
import fs from "node:fs/promises";

const html = await fs.readFile(new URL("../site/index.html", import.meta.url), "utf8");
const css = await fs.readFile(new URL("../site/styles.css", import.meta.url), "utf8");
const js = await fs.readFile(new URL("../site/app.js", import.meta.url), "utf8");

assert.match(html, /凡人残图/);
assert.match(html, /id="map"/);
assert.match(html, /id="prediction-form"/);
assert.match(html, /id="procedural-map"/);
assert.match(css, /@media \(max-width: 650px\)/);
assert.match(js, /nextSaturdayAtEleven/);
assert.match(js, /fanren-prediction/);
assert.match(js, /drawAncientMap/);
console.log("凡人残图结构与核心交互检查通过");
