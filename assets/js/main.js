/* =====================================================================
   Míriam Ribas 55188 · script principal
   Tudo que muda de campanha para campanha fica em SITE_CONFIG.
   ===================================================================== */

window.SITE_CONFIG = {
  nome: "Míriam Ribas",
  numero: "55188",
  cargo: "Deputada Estadual",
  partido: "PSD",
  cnpj: "68.455.313/0001-78",
  // WhatsApp oficial da campanha (briefing do site): 11 91694-0104
  whatsapp: "5511916940104",
  whatsappMsg: "Olá! Vim pelo site da Míriam Ribas 55188 e quero saber mais sobre a campanha.",
  email: "Miriamribas55188@gmail.com",
  instagram: "https://www.instagram.com/miriamribas55188",
  // Endpoint do Google Apps Script que grava os formulários (cadastro e "Fale com a Míriam") na planilha (ver tools/apps-script.gs).
  // Vazio = os formulários abrem o WhatsApp da campanha com os dados.
  // Publicado em 18/09/2026 na conta miriamribas1963@gmail.com (planilha "Míriam Ribas 55188", projeto "Untitled project").
  formEndpoint: "https://script.google.com/macros/s/AKfycbw_zDtc-WZ6NDxRP0mrmGjcPzGzZEAnXKMCxPyRwqBeF9_wiK3Jw3te_S-rR72B-rxuIw/exec",
  // ID do vídeo do YouTube para a área de vídeo da home (vazio = mostra o poster com link).
  youtubeId: "",
  // Medição (preencher na etapa de SEO/anúncios). Só carregam depois do aceite de cookies.
  // Google Analytics 4 · conta miriamribas1963@gmail.com · propriedade "Site Míriam Ribas 55188" (13/09/2026)
  ga4Id: "G-0F8HKR86V5",
  metaPixelId: ""
};

(function () {
  "use strict";
  var C = window.SITE_CONFIG;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ---------- links dinâmicos (WhatsApp, e-mail, redes) ---------- */
  function waLink(msg) {
    return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(msg || C.whatsappMsg);
  }
  $$("[data-wa]").forEach(function (a) {
    a.href = waLink(a.getAttribute("data-wa") || C.whatsappMsg);
    a.target = "_blank"; a.rel = "noopener";
  });
  $$("[data-mail]").forEach(function (a) { a.href = "mailto:" + C.email; if (a.hasAttribute("data-mail-text")) a.textContent = C.email; });
  $$("[data-instagram]").forEach(function (a) { a.href = C.instagram; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-wa-number]").forEach(function (el) {
    var n = C.whatsapp.replace(/^55/, "");
    el.textContent = "(" + n.slice(0, 2) + ") " + n.slice(2, 7) + "-" + n.slice(7);
  });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- header ---------- */
  var header = $(".header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 12); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var toggle = $(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("nav-open"); }); });
  }
  var page = document.body.getAttribute("data-page");
  if (page) $$(".nav a[data-nav='" + page + "']").forEach(function (a) { a.classList.add("is-active"); a.setAttribute("aria-current", "page"); });

  /* ---------- reveal ao rolar ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- contadores ---------- */
  var counters = $$("[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10), dur = 1600, start = null;
    var prefix = el.getAttribute("data-prefix") || "", suffix = el.getAttribute("data-suffix") || "";
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString("pt-BR") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); io2.unobserve(e.target); } });
    }, { threshold: .5 });
    counters.forEach(function (el) { io2.observe(el); });
  } else { counters.forEach(function (el) { el.textContent = (el.getAttribute("data-prefix") || "") + el.getAttribute("data-count") + (el.getAttribute("data-suffix") || ""); }); }

  /* ---------- lightbox da galeria ---------- */
  var lb = $(".lightbox");
  if (lb) {
    var lbImg = $("img", lb);
    $$("[data-lightbox]").forEach(function (a) {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        lbImg.src = a.getAttribute("href"); lbImg.alt = a.getAttribute("data-alt") || "";
        lb.classList.add("is-open"); document.body.style.overflow = "hidden";
      });
    });
    function closeLb() { lb.classList.remove("is-open"); document.body.style.overflow = ""; }
    lb.addEventListener("click", function (ev) { if (ev.target === lb || ev.target.closest(".lightbox__close")) closeLb(); });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") { closeLb(); document.body.classList.remove("nav-open"); } });
  }

  /* ---------- vídeo (YouTube) ---------- */
  var video = $("[data-video]");
  if (video) {
    if (C.youtubeId) {
      var cta = $(".video-wrap__cta", video);
      var play = function () {
        video.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + C.youtubeId + '?autoplay=1&rel=0" title="Vídeo da Míriam Ribas" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
      };
      if (cta) { cta.addEventListener("click", function (ev) { ev.preventDefault(); play(); }); cta.setAttribute("href", "#"); }
    }
  }

  /* ---------- formulários: cadastro de apoiadores (Apoie) e "Fale com a Míriam" (home) ---------- */
  // Com formEndpoint: grava na planilha (Apps Script). Sem endpoint: abre o WhatsApp da campanha com os dados.
  function ligaFormulario(form, cfg) {
    if (!form) return;
    var msg = $(".form__msg", form), btn = $("button[type=submit]", form), rotulo = btn.textContent;
    var tel = $("input[name=whatsapp]", form);
    if (tel) tel.addEventListener("input", function () {
      var v = tel.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 6) v = "(" + v.slice(0, 2) + ") " + v.slice(2, 7) + "-" + v.slice(7);
      else if (v.length > 2) v = "(" + v.slice(0, 2) + ") " + v.slice(2);
      tel.value = v;
    });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if ($("input[name=site]", form).value) return; // honeypot
      var data = cfg.dados();
      data.origem = location.href;
      data.data = new Date().toLocaleString("pt-BR");
      if (!cfg.completo(data) || data.whatsapp.replace(/\D/g, "").length < 10 || !form.lgpd.checked) {
        msg.className = "form__msg erro"; msg.textContent = cfg.erro;
        return;
      }
      btn.disabled = true; btn.textContent = "Enviando…";
      var done = function (peloWhats) {
        msg.className = "form__msg ok";
        msg.innerHTML = peloWhats ? "Abrimos o WhatsApp da campanha com os seus dados. É só tocar em enviar." : cfg.ok(data);
        form.reset(); btn.disabled = false; btn.textContent = rotulo;
        if (window.gtag) window.gtag("event", "generate_lead", { event_category: cfg.evento });
        if (window.fbq) window.fbq("track", "Lead");
      };
      if (C.formEndpoint) {
        // x-www-form-urlencoded: o Apps Script lê direto em e.parameter; honeypot e consentimento vão junto
        var fd = new URLSearchParams(); Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
        fd.append("lgpd", "Sim"); fd.append("site", $("input[name=site]", form).value);
        fetch(C.formEndpoint, { method: "POST", mode: "no-cors", body: fd }).then(function () { done(false); }).catch(function () {
          btn.disabled = false; btn.textContent = rotulo;
          msg.className = "form__msg erro"; msg.innerHTML = "Não conseguimos enviar agora. <a href=\"" + waLink(cfg.texto(data)) + "\" target=\"_blank\" rel=\"noopener\">Envie pelo WhatsApp</a>.";
        });
      } else {
        window.open(waLink(cfg.texto(data)), "_blank", "noopener");
        done(true);
      }
    });
  }

  var fc = $("#form-cadastro");
  ligaFormulario(fc, {
    evento: "cadastro",
    dados: function () {
      return {
        nome: fc.nome.value.trim(), whatsapp: fc.whatsapp.value.trim(), bairro: fc.bairro.value.trim(),
        voluntario: fc.voluntario.checked ? "Sim" : "Não", como_conheceu: fc.como_conheceu.value
      };
    },
    completo: function (d) { return d.nome && d.bairro; },
    erro: "Preencha nome, WhatsApp, bairro/cidade e aceite o aviso de privacidade.",
    ok: function (d) {
      return "Cadastro recebido! Obrigada por caminhar com a Míriam. <a href=\"" + waLink("Olá! Acabei de me cadastrar no site. Meu nome é " + d.nome + " (" + d.bairro + ").") + "\" target=\"_blank\" rel=\"noopener\">Quer falar com a equipe agora no WhatsApp?</a>";
    },
    texto: function (d) {
      return "Cadastro pelo site Míriam Ribas 55188\nNome: " + d.nome + "\nWhatsApp: " + d.whatsapp + "\nBairro/cidade: " + d.bairro + "\nVoluntário(a): " + d.voluntario + "\nComo conheceu: " + d.como_conheceu;
    }
  });

  var ff = $("#form-fale");
  ligaFormulario(ff, {
    evento: "mensagem",
    dados: function () {
      return { tipo: "mensagem", nome: ff.nome.value.trim(), whatsapp: ff.whatsapp.value.trim(), email: ff.email.value.trim(), mensagem: ff.mensagem.value.trim() };
    },
    completo: function (d) { return d.nome && d.mensagem; },
    erro: "Preencha nome, WhatsApp, a mensagem e aceite o aviso de privacidade.",
    ok: function () { return "Mensagem enviada! A equipe da Míriam vai ler e responder pelo WhatsApp ou pelo e-mail."; },
    texto: function (d) {
      return "Mensagem pelo site Míriam Ribas 55188\nNome: " + d.nome + "\nWhatsApp: " + d.whatsapp + (d.email ? "\nE-mail: " + d.email : "") + "\n\n" + d.mensagem;
    }
  });

  /* ---------- cookies + medição ---------- */
  var cookie = $(".cookie");
  function loadTracking() {
    if (C.ga4Id && !window.gtag) {
      var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + C.ga4Id; document.head.appendChild(s);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", C.ga4Id, { anonymize_ip: true });
    }
    if (C.metaPixelId && !window.fbq) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", C.metaPixelId); window.fbq("track", "PageView");
    }
  }
  var consent = null;
  try { consent = localStorage.getItem("mr-cookies"); } catch (e) {}
  if (consent === "aceito") loadTracking();
  else if (!consent && cookie) cookie.classList.add("is-visible");
  if (cookie) {
    $$("[data-cookie]", cookie).forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-cookie");
        try { localStorage.setItem("mr-cookies", v); } catch (e) {}
        cookie.classList.remove("is-visible");
        if (v === "aceito") loadTracking();
      });
    });
  }

  /* ---------- compartilhar (artigos) ---------- */
  $$("[data-share]").forEach(function (a) {
    var url = encodeURIComponent(location.href), t = encodeURIComponent(document.title);
    var map = {
      whatsapp: "https://wa.me/?text=" + t + "%20" + url,
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + url,
      x: "https://twitter.com/intent/tweet?url=" + url + "&text=" + t,
      copiar: ""
    };
    var k = a.getAttribute("data-share");
    if (k === "copiar") {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { a.textContent = "Link copiado!"; });
      });
    } else { a.href = map[k]; a.target = "_blank"; a.rel = "noopener"; }
  });
})();
