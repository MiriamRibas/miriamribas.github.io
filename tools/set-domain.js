/* Aplica o domínio oficial em todas as páginas e gera sitemap.xml, robots.txt e CNAME.
   Uso: node tools/set-domain.js
   Rode de novo sempre que criar uma página nova (ex.: nova notícia). */
const fs = require("fs");
const path = require("path");

const DOMAIN = "https://miriamribas.com.br";
// true = site conectado ao domínio mas ainda sem aprovação: injeta noindex em todas as páginas
// (buscadores não indexam). Depois do "aprovado", troque para false e rode de novo.
const PRE_LANCAMENTO = true;
const root = path.resolve(__dirname, "..");
const hoje = new Date().toISOString().slice(0, 10);

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (["node_modules", "partials", "tools", "assets", ".git"].includes(f)) continue;
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (f.endsWith(".html")) out.push(p);
  }
  return out;
}

const urls = [];
for (const file of walk(root)) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  const urlPath = rel === "index.html" ? "/" : "/" + rel;
  const url = DOMAIN + urlPath;
  let html = fs.readFileSync(file, "utf8");
  // remove versões anteriores
  html = html.replace(/\s*<link rel="canonical"[^>]*>/g, "").replace(/\s*<meta property="og:url"[^>]*>/g, "");
  html = html.replace(/\s*<meta name="robots" content="noindex, nofollow" data-prelancamento>/g, "");
  const noindex = /<meta name="robots" content="noindex/.test(html); // noindex permanente (ex.: privacidade)
  if (PRE_LANCAMENTO) html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n  <meta name="robots" content="noindex, nofollow" data-prelancamento>`);
  // insere depois da meta description
  html = html.replace(/(<meta name="description"[^>]*>)/, `$1\n  <link rel="canonical" href="${url}">\n  <meta property="og:url" content="${url}">`);
  // og:image absoluta
  html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${DOMAIN}/assets/img/og-image.jpg">`);
  fs.writeFileSync(file, html);
  if (!noindex) urls.push({ url, prioridade: urlPath === "/" ? "1.0" : rel.startsWith("noticias/") ? "0.6" : "0.8" });
  console.log("ok", rel, "→", url, noindex ? "(noindex, fora do sitemap)" : "");
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.url}</loc><lastmod>${hoje}</lastmod><priority>${u.prioridade}</priority></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /partials/\nDisallow: /tools/\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);
fs.writeFileSync(path.join(root, "CNAME"), DOMAIN.replace(/^https?:\/\//, "") + "\n");
console.log(`sitemap.xml (${urls.length} URLs), robots.txt e CNAME gerados para ${DOMAIN}`);
