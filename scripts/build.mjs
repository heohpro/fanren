import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "site");
const dist = path.join(root, "dist");
const client = path.join(dist, "client");
const server = path.join(dist, "server");

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(client, { recursive: true });
await fs.mkdir(server, { recursive: true });
await fs.mkdir(path.join(dist, ".openai"), { recursive: true });
await fs.cp(source, client, { recursive: true });
await fs.copyFile(path.join(root, ".openai", "hosting.json"), path.join(dist, ".openai", "hosting.json"));

const html = await fs.readFile(path.join(source, "index.html"), "utf8");
const css = await fs.readFile(path.join(source, "styles.css"), "utf8");
const js = await fs.readFile(path.join(source, "app.js"), "utf8");
const assetEntries = [];

const worker = `const html=${JSON.stringify(html)};\nconst css=${JSON.stringify(css)};\nconst js=${JSON.stringify(js)};\nconst assets=new Map(${JSON.stringify(assetEntries)});\nexport default {async fetch(request,env){const url=new URL(request.url);if(url.pathname==="/"||url.pathname==="/index.html")return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"public, max-age=60"}});if(url.pathname==="/styles.css")return new Response(css,{headers:{"content-type":"text/css; charset=utf-8","cache-control":"public, max-age=3600"}});if(url.pathname==="/app.js")return new Response(js,{headers:{"content-type":"text/javascript; charset=utf-8","cache-control":"public, max-age=3600"}});if(assets.has(url.pathname)){const [mime,base64]=assets.get(url.pathname);return new Response(Uint8Array.from(atob(base64),c=>c.charCodeAt(0)),{headers:{"content-type":mime,"cache-control":"public, max-age=31536000, immutable"}});}if(env?.ASSETS)return env.ASSETS.fetch(request);return new Response("Not found",{status:404});}};\n`;
await fs.writeFile(path.join(server, "index.js"), worker);

const preview = html
  .replace('<link rel="stylesheet" href="/styles.css" />', `<style>\n${css}\n</style>`)
  .replace('<script src="/app.js" defer></script>', `<script>\n${js.replaceAll("</script>", "<\\/script>")}\n</script>`);
const outputs = path.join(root, "outputs");
await fs.mkdir(outputs, { recursive: true });
await fs.writeFile(path.join(outputs, "fanren-cantu-preview.html"), preview);
console.log(`Built 凡人残图 (${assetEntries.length} image assets)`);
