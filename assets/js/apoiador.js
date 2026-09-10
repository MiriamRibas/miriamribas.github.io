/* =====================================================================
   Gerador de arte "Eu apoio a Míriam Ribas 55188"
   - Roda 100% no navegador: a foto nunca sai do aparelho da pessoa.
   - Feed e story usam a mesma foto em círculo (ajuste A).
   - A foto de perfil (1080×1080) tem ajuste próprio (ajuste B), com a
     moldura desenhada na prévia para a pessoa ver exatamente o resultado.
   - Cada formato usa uma moldura PNG (assets/img/molduras/*.png) com
     um buraco transparente onde entra a foto. Enquanto a moldura final
     não existe (MOLDURAS_PRONTAS = false), o script desenha uma moldura
     provisória com a identidade da campanha.
   ===================================================================== */
(function () {
  "use strict";
  var mount = document.getElementById("apoiador-app");
  if (!mount) return;
  var ROOT = mount.getAttribute("data-root") || "";

  var CAMPANHA = { nome: "Míriam Ribas", numero: "55188", cargo: "Deputada Estadual" };

  // Troque para true quando os PNGs finais estiverem em assets/img/molduras/ (feed.png, story.png, perfil.png).
  var MOLDURAS_PRONTAS = false;

  var FORMATOS = [
    { key: "feed", slot: "A", label: "Feed do Instagram e Facebook", dim: "1080 × 1350", w: 1080, h: 1350,
      foto: { cx: 540, cy: 540, r: 285 },
      nome: { x0: 90, y0: 865, x1: 990, y1: 935, pill: true },
      moldura: ROOT + "assets/img/molduras/feed.png",
      prov: { tituloY: 105, taglineY: 195, logoW: 520, logoY: 965, numSize: 150, numY: 1240, rodapeY: 0 } },
    { key: "story", slot: "A", label: "Story do Instagram, Facebook e WhatsApp", dim: "1080 × 1920", w: 1080, h: 1920,
      foto: { cx: 540, cy: 800, r: 360 },
      nome: { x0: 90, y0: 1210, x1: 990, y1: 1290, pill: true },
      moldura: ROOT + "assets/img/molduras/story.png",
      prov: { tituloY: 300, taglineY: 395, logoW: 560, logoY: 1330, numSize: 180, numY: 1640, rodapeY: 1800 } },
    { key: "perfil", slot: "B", label: "Foto de perfil do WhatsApp, Instagram e Facebook", dim: "1080 × 1080", w: 1080, h: 1080,
      foto: { cx: 540, cy: 540, r: 540 },
      nome: null,
      moldura: ROOT + "assets/img/molduras/perfil.png" }
  ];
  var PERFIL = FORMATOS[2];

  var CORES = { roxo: "#46176E", roxoEscuro: "#26024D", rosa: "#FF3DBA", branco: "#FFFFFF" };

  /* ---------- UI ---------- */
  mount.innerHTML =
    '<div class="ap">' +
    '  <div class="ap__col">' +
    '    <div class="ap__step"><span class="ap__num">1</span><div><strong>Envie sua foto</strong><p>Escolha uma foto sua, de preferência de frente e bem iluminada.</p></div></div>' +
    '    <label class="ap__drop" id="ap-drop" for="ap-file">' +
    '      <input id="ap-file" type="file" accept="image/*" class="sr-only">' +
    '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3M12 3v13M7 8l5-5 5 5"/></svg>' +
    '      <span class="ap__drop-txt"><b>Enviar foto</b><br>ou arraste a imagem até aqui</span>' +
    '    </label>' +
    '    <div class="ap__step ap__hidden" id="ap-step2"><span class="ap__num">2</span><div><strong>Ajuste para feed e story</strong><p>Arraste a foto para posicionar e use o zoom.</p></div></div>' +
    '    <div class="ap__ajuste ap__hidden" id="ap-ajuste">' +
    '      <div class="ap__frame" id="ap-frame"><canvas id="ap-prev" width="600" height="600"></canvas></div>' +
    '      <div class="ap__zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="ap-zoom" type="range" min="1" max="3" step="0.01" value="1" aria-label="Zoom da foto do feed e story"><button type="button" class="ap__link" id="ap-trocar">Trocar foto</button></div>' +
    '    </div>' +
    '    <div class="ap__step ap__hidden" id="ap-step3"><span class="ap__num">3</span><div><strong>Ajuste a foto de perfil</strong><p>Deixe o rosto dentro do anel. A faixa com o número fica embaixo.</p></div></div>' +
    '    <div class="ap__ajuste ap__hidden" id="ap-ajuste-b">' +
    '      <div class="ap__frame ap__frame--perfil" id="ap-frame-b"><canvas id="ap-prev-b" width="600" height="600"></canvas></div>' +
    '      <div class="ap__zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="ap-zoom-b" type="range" min="1" max="3" step="0.01" value="1" aria-label="Zoom da foto de perfil"></div>' +
    '    </div>' +
    '    <div class="ap__step ap__hidden" id="ap-step4"><span class="ap__num">4</span><div><strong>Seu nome (opcional)</strong><p>Aparece na arte do feed e do story.</p></div></div>' +
    '    <input id="ap-nome" class="ap__input ap__hidden" type="text" maxlength="28" placeholder="Ex.: Maria, de Diadema" autocomplete="name">' +
    '    <button id="ap-gerar" class="btn btn--rosa btn--lg ap__gerar ap__hidden" type="button">Gerar minhas artes ♥</button>' +
    '    <p class="ap__nota">Sua foto é processada só no seu aparelho. Nada é enviado ou guardado pela campanha.</p>' +
    '  </div>' +
    '  <div class="ap__col ap__col--res">' +
    '    <div class="ap__vazio" id="ap-vazio">' +
    '      <div class="ap__vazio-card"><div class="ap__vazio-foto"></div><div class="ap__vazio-txt">EU APOIO</div><div class="ap__vazio-num">55188</div></div>' +
    '      <p>Suas artes vão aparecer aqui, prontas para baixar e compartilhar.</p>' +
    '    </div>' +
    '    <div class="ap__results" id="ap-results"></div>' +
    '  </div>' +
    '</div>';

  var $ = function (id) { return document.getElementById(id); };
  var fileEl = $("ap-file"), drop = $("ap-drop");
  var prevA = $("ap-prev"), ctxA = prevA.getContext("2d"), frameA = $("ap-frame"), zoomA = $("ap-zoom");
  var prevB = $("ap-prev-b"), ctxB = prevB.getContext("2d"), frameB = $("ap-frame-b"), zoomB = $("ap-zoom-b");
  var nomeEl = $("ap-nome"), gerarEl = $("ap-gerar"), results = $("ap-results"), vazio = $("ap-vazio");
  var show = function (id) { $(id).classList.remove("ap__hidden"); };

  var foto = null;
  var stA = { z: 1, ox: 0, oy: 0 }, stB = { z: 1, ox: 0, oy: 0 };

  /* ---------- molduras e logos ---------- */
  var molduras = {}, logos = {};
  FORMATOS.forEach(function (f) {
    if (!MOLDURAS_PRONTAS) { molduras[f.key] = null; return; }
    var im = new Image(); im.crossOrigin = "anonymous"; im.src = f.moldura;
    im.onload = function () { molduras[f.key] = im; if (f.key === "perfil") desenharB(); };
    im.onerror = function () { molduras[f.key] = null; };
  });
  ["logo-branco-topo", "logo-branco"].forEach(function (k) {
    var im = new Image(); im.src = ROOT + "assets/img/" + k + ".png"; im.onload = function () { logos[k] = im; };
  });

  /* ---------- carregar foto ---------- */
  function carregar(file) {
    if (!file || !/^image\//.test(file.type)) return;
    var done = function (img) {
      foto = img; stA = { z: 1, ox: 0, oy: 0 }; stB = { z: 1, ox: 0, oy: 0 }; zoomA.value = 1; zoomB.value = 1;
      ["ap-step2", "ap-ajuste", "ap-step3", "ap-ajuste-b", "ap-step4", "ap-nome", "ap-gerar"].forEach(show);
      drop.classList.add("ap__drop--ok");
      drop.querySelector(".ap__drop-txt").innerHTML = "<b>Foto enviada!</b><br>Clique para escolher outra";
      desenharA(); desenharB();
      $("ap-step2").scrollIntoView({ behavior: "smooth", block: "center" });
    };
    if (window.createImageBitmap) {
      createImageBitmap(file, { imageOrientation: "from-image" }).then(done).catch(function () { viaImage(file, done); });
    } else viaImage(file, done);
  }
  function viaImage(file, cb) {
    var fr = new FileReader();
    fr.onload = function () { var im = new Image(); im.onload = function () { cb(im); }; im.src = fr.result; };
    fr.readAsDataURL(file);
  }
  fileEl.addEventListener("change", function (e) { carregar(e.target.files && e.target.files[0]); });
  $("ap-trocar").addEventListener("click", function () { fileEl.value = ""; fileEl.click(); });
  ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("ap__drop--over"); }); });
  ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("ap__drop--over"); }); });
  drop.addEventListener("drop", function (e) { carregar(e.dataTransfer.files && e.dataTransfer.files[0]); });

  /* ---------- desenho da foto em círculo ---------- */
  function fotoCirculo(ctx, cx, cy, r, img, s) {
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    var d = r * 2, scale = Math.max(d / img.width, d / img.height) * s.z, dw = img.width * scale, dh = img.height * scale;
    ctx.drawImage(img, cx - dw / 2 + s.ox * r, cy - dh / 2 + s.oy * r, dw, dh); ctx.restore();
  }
  function desenharA() {
    ctxA.clearRect(0, 0, 600, 600); ctxA.fillStyle = "#EFE6FA"; ctxA.fillRect(0, 0, 600, 600);
    if (foto) fotoCirculo(ctxA, 300, 300, 300, foto, stA);
  }
  // prévia do perfil: foto + moldura (real ou provisória), igual ao resultado final
  var PERFIL_PREVIEW = { key: "perfil", w: 600, h: 600, foto: { cx: 300, cy: 300, r: 300 } };
  function desenharB() {
    ctxB.clearRect(0, 0, 600, 600);
    if (!molduras.perfil) fundoProvisorio(ctxB, PERFIL_PREVIEW);
    else { ctxB.fillStyle = "#EFE6FA"; ctxB.fillRect(0, 0, 600, 600); }
    if (foto) fotoCirculo(ctxB, 300, 300, 300, foto, stB);
    if (molduras.perfil) ctxB.drawImage(molduras.perfil, 0, 0, 600, 600); else frenteProvisoria(ctxB, PERFIL_PREVIEW);
  }
  zoomA.addEventListener("input", function () { stA.z = parseFloat(zoomA.value); desenharA(); });
  zoomB.addEventListener("input", function () { stB.z = parseFloat(zoomB.value); desenharB(); });

  function arrastar(el, getSt, zoomInput, redraw) {
    var on = false, lx = 0, ly = 0;
    el.addEventListener("pointerdown", function (e) { if (!foto) return; on = true; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; e.preventDefault(); });
    el.addEventListener("pointermove", function (e) {
      if (!on) return;
      var st = getSt(), span = el.clientWidth / 2;
      st.ox = Math.max(-1, Math.min(1, st.ox + (e.clientX - lx) / span)); st.oy = Math.max(-1, Math.min(1, st.oy + (e.clientY - ly) / span));
      lx = e.clientX; ly = e.clientY; redraw();
    });
    var end = function () { on = false; el.style.cursor = "grab"; };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    el.addEventListener("wheel", function (e) { if (!foto) return; e.preventDefault(); var st = getSt(); st.z = Math.max(1, Math.min(3, st.z - e.deltaY * 0.002)); zoomInput.value = st.z; redraw(); }, { passive: false });
  }
  arrastar(frameA, function () { return stA; }, zoomA, desenharA);
  arrastar(frameB, function () { return stB; }, zoomB, desenharB);

  /* ---------- moldura provisória (enquanto a arte final não chega) ---------- */
  function fundoProvisorio(ctx, f) {
    var g = ctx.createLinearGradient(0, 0, 0, f.h);
    g.addColorStop(0, "#4A1478"); g.addColorStop(1, CORES.roxoEscuro);
    ctx.fillStyle = g; ctx.fillRect(0, 0, f.w, f.h);
    var rg = ctx.createRadialGradient(f.w * .8, f.h * .3, 10, f.w * .8, f.h * .3, f.w * .8);
    rg.addColorStop(0, "rgba(255,61,186,.28)"); rg.addColorStop(1, "rgba(255,61,186,0)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, f.w, f.h);
    if (f.key === "perfil") return;
    ctx.save(); ctx.globalAlpha = .18; ctx.strokeStyle = CORES.rosa; ctx.lineWidth = f.w * .035; ctx.lineCap = "round";
    var cx = f.w * .5, cy = f.foto.cy, r = f.foto.r * 1.55;
    ctx.beginPath(); ctx.moveTo(cx, cy + r * .95);
    ctx.bezierCurveTo(cx - r * 1.1, cy + r * .25, cx - r * .95, cy - r * .55, cx - r * .5, cy - r * .55);
    ctx.bezierCurveTo(cx - r * .2, cy - r * .55, cx, cy - r * .3, cx, cy - r * .15);
    ctx.bezierCurveTo(cx, cy - r * .3, cx + r * .2, cy - r * .55, cx + r * .5, cy - r * .55);
    ctx.bezierCurveTo(cx + r * .95, cy - r * .55, cx + r * 1.1, cy + r * .25, cx + r * .35, cy + r * .75);
    ctx.stroke(); ctx.restore();
  }
  function frenteProvisoria(ctx, f) {
    var s = f.w / 1080;
    if (f.key === "perfil") {
      // anel externo fino (não cobre o rosto) + faixa inferior com o número
      ctx.save();
      ctx.strokeStyle = CORES.roxo; ctx.lineWidth = 36 * s; ctx.beginPath(); ctx.arc(f.foto.cx, f.foto.cy, f.foto.r - 18 * s, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = CORES.rosa; ctx.lineWidth = 12 * s; ctx.beginPath(); ctx.arc(f.foto.cx, f.foto.cy, f.foto.r - 42 * s, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      var bw = 640 * s, bh = 150 * s, bx = (f.w - bw) / 2, by = f.h - bh - 56 * s;
      roundRect(ctx, bx, by, bw, bh, bh / 2); ctx.fillStyle = CORES.roxo; ctx.fill();
      ctx.lineWidth = 6 * s; ctx.strokeStyle = CORES.rosa; ctx.stroke();
      ctx.fillStyle = CORES.branco; ctx.font = "900 " + 26 * s + "px Montserrat, Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "4px";
      ctx.fillText("EU APOIO MÍRIAM RIBAS", f.w / 2, by + 42 * s);
      ctx.fillStyle = CORES.rosa; ctx.font = "" + 82 * s + "px 'Titan One', Montserrat, Arial, sans-serif"; ctx.letterSpacing = "2px";
      ctx.fillText(CAMPANHA.numero, f.w / 2, by + 102 * s);
      return;
    }
    // anel da foto
    ctx.save(); ctx.strokeStyle = CORES.rosa; ctx.lineWidth = 16 * s; ctx.beginPath(); ctx.arc(f.foto.cx, f.foto.cy, f.foto.r + 8 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = CORES.branco; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.arc(f.foto.cx, f.foto.cy, f.foto.r + 22 * s, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    // "EU APOIO" + tagline
    var p = f.prov;
    ctx.fillStyle = CORES.branco; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "900 " + 112 * s + "px Montserrat, Arial, sans-serif"; ctx.letterSpacing = "6px";
    ctx.fillText("EU APOIO", f.w / 2, p.tituloY * s);
    ctx.font = "700 " + 30 * s + "px Montserrat, Arial, sans-serif"; ctx.letterSpacing = "10px"; ctx.fillStyle = CORES.rosa;
    ctx.fillText("MOSTRE SEU APOIO NAS REDES", f.w / 2, p.taglineY * s);
    // logo + número
    var logo = logos["logo-branco-topo"];
    var lw = p.logoW * s, lh = lw * 330 / 926;
    if (logo) ctx.drawImage(logo, (f.w - lw) / 2, p.logoY * s, lw, lh);
    ctx.fillStyle = CORES.rosa; ctx.font = "" + p.numSize * s + "px 'Titan One', Montserrat, Arial, sans-serif"; ctx.letterSpacing = "4px";
    ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 30 * s; ctx.shadowOffsetY = 12 * s;
    ctx.fillText(CAMPANHA.numero, f.w / 2, p.numY * s);
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    if (p.rodapeY) {
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = "700 " + 28 * s + "px Montserrat, Arial, sans-serif"; ctx.letterSpacing = "6px";
      ctx.fillText("@MIRIAMRIBAS55188", f.w / 2, p.rodapeY * s);
    }
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* ---------- nome ---------- */
  function desenharNome(ctx, box, texto, s) {
    texto = (texto || "").trim(); if (!texto) return;
    var maxW = (box.x1 - box.x0) - 80 * s, maxH = box.y1 - box.y0, size = Math.floor(maxH * .72);
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.letterSpacing = "1px";
    do { ctx.font = "800 " + size + "px Montserrat, Arial, sans-serif"; size -= 2; } while (ctx.measureText(texto).width > maxW && size > 18);
    var cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
    if (box.pill) {
      var tw = ctx.measureText(texto).width + 70 * s, th = maxH;
      roundRect(ctx, cx - tw / 2, cy - th / 2, tw, th, th / 2); ctx.fillStyle = CORES.rosa; ctx.fill();
      ctx.fillStyle = CORES.branco;
    } else {
      ctx.fillStyle = CORES.branco; ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 12 * s;
    }
    ctx.fillText(texto, cx, cy + 2 * s); ctx.shadowColor = "transparent";
  }

  /* ---------- render final ---------- */
  function render(f) {
    var c = document.createElement("canvas"); c.width = f.w; c.height = f.h; var ctx = c.getContext("2d");
    var moldura = molduras[f.key], st = f.slot === "B" ? stB : stA;
    if (!moldura) fundoProvisorio(ctx, f);
    fotoCirculo(ctx, f.foto.cx, f.foto.cy, f.foto.r + (moldura ? 4 : 0), foto, st);
    if (moldura) ctx.drawImage(moldura, 0, 0, f.w, f.h); else frenteProvisoria(ctx, f);
    if (f.nome) desenharNome(ctx, f.nome, nomeEl.value, f.w / 1080);
    return c;
  }

  gerarEl.addEventListener("click", function () {
    if (!foto) { alert("Envie uma foto primeiro."); return; }
    gerarEl.disabled = true; gerarEl.textContent = "Gerando…";
    var fontes = document.fonts && document.fonts.load
      ? Promise.all([document.fonts.load("900 100px Montserrat"), document.fonts.load("800 60px Montserrat"), document.fonts.load("100px 'Titan One'")]).then(function () { return document.fonts.ready; })
      : Promise.resolve();
    var pendentes = FORMATOS.filter(function (f) { return !(f.key in molduras); }).map(function (f) {
      return new Promise(function (res) { var t = setInterval(function () { if (f.key in molduras) { clearInterval(t); res(); } }, 60); setTimeout(function () { clearInterval(t); res(); }, 4000); });
    });
    Promise.all([fontes].concat(pendentes)).then(function () {
      desenharB();
      results.innerHTML = ""; vazio.classList.add("ap__hidden");
      FORMATOS.forEach(function (f) {
        // o card é criado na ordem dos formatos; o conteúdo entra quando o JPEG fica pronto
        var card = document.createElement("div"); card.className = "ap__card";
        card.innerHTML = '<div class="ap__card-lbl">' + f.label + ' <small>' + f.dim + '</small></div>';
        results.appendChild(card);
        var canvas = render(f);
        canvas.toBlob(function (blob) {
          var url = URL.createObjectURL(blob), nomeArq = "eu-apoio-miriam-ribas-55188-" + f.key + ".jpg";
          var img = document.createElement("img"); img.src = url; img.alt = "Arte de apoio · " + f.label; card.appendChild(img);
          var acts = document.createElement("div"); acts.className = "ap__card-acts";
          var a = document.createElement("a"); a.href = url; a.download = nomeArq; a.className = "btn btn--rosa btn--sm"; a.textContent = "Baixar"; acts.appendChild(a);
          var file = new File([blob], nomeArq, { type: "image/jpeg" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            var b = document.createElement("button"); b.type = "button"; b.className = "btn btn--outline btn--sm"; b.textContent = "Compartilhar";
            b.addEventListener("click", function () { navigator.share({ files: [file], title: "Eu apoio a Míriam Ribas 55188", text: "Eu apoio a Míriam Ribas 55188 · Deputada Estadual" }).catch(function () {}); });
            acts.appendChild(b);
          }
          card.appendChild(acts);
          if (window.gtag) window.gtag("event", "gerar_arte", { formato: f.key });
        }, "image/jpeg", 0.92);
      });
      gerarEl.disabled = false; gerarEl.textContent = "Gerar minhas artes ♥";
      if (window.innerWidth < 960) setTimeout(function () { results.scrollIntoView({ behavior: "smooth", block: "start" }); }, 300);
    });
  });
})();
