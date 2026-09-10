/* Injeta partials/header.html e partials/footer.html em todas as páginas.
   Uso: node tools/sync-partials.js
   Cada página precisa ter os marcadores <!-- header:start --> ... <!-- header:end -->
   e <!-- footer:start --> ... <!-- footer:end -->. O token {{root}} vira "" (raiz) ou "../" (subpasta). */
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const header = fs.readFileSync(path.join(root, "partials/header.html"), "utf8").trim();
const footer = fs.readFileSync(path.join(root, "partials/footer.html"), "utf8").trim();

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (["node_modules", "partials", "tools", "assets", ".git"].includes(f)) continue;
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (f.endsWith(".html")) out.push(p);
  }
  return out;
}

let n = 0;
for (const file of walk(root)) {
  const depth = path.relative(root, path.dirname(file)).split(path.sep).filter(Boolean).length;
  const prefix = "../".repeat(depth);
  let html = fs.readFileSync(file, "utf8");
  const h = header.replace(/\{\{root\}\}/g, prefix);
  const f = footer.replace(/\{\{root\}\}/g, prefix);
  const before = html;
  html = html.replace(/<!-- header:start[\s\S]*?<!-- header:end -->/, h);
  html = html.replace(/<!-- footer:start[\s\S]*?<!-- footer:end -->/, f);
  if (html !== before) { fs.writeFileSync(file, html); n++; console.log("ok", path.relative(root, file)); }
  else console.log("sem marcadores", path.relative(root, file));
}
console.log(n + " página(s) atualizada(s)");
