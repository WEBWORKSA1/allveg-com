/* AllVeg.com — shared behaviour */
(function () {
  const C = window.ALLVEG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- hidden inbox (assembled only at click time) ---------- */
  function inbox() {
    try { return atob(C.mailToken).split("").reverse().join(""); } catch (e) { return ""; }
  }
  window.ALLVEG.inbox = inbox;

  /* ---------- nav ---------- */
  const burger = $(".burger"), menu = $(".menu");
  if (burger && menu) burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  const here = location.pathname.split("/").pop() || "index.html";
  $$(".menu a").forEach(a => { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });

  /* ---------- contact links: data-mail opens the hidden inbox ---------- */
  $$("[data-mail]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const subj = encodeURIComponent(a.dataset.mail || "AllVeg.com enquiry");
      location.href = "mailto:" + inbox() + "?subject=" + subj;
    });
  });

  /* ---------- forms: every form on the site routes to the hidden inbox ---------- */
  $$("form[data-form]").forEach(form => {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (form.querySelector(".honey input")?.value) return; // bot
      const data = new FormData(form);
      const kind = form.dataset.form;
      const lines = [];
      data.forEach((v, k) => { if (k !== "_gotcha" && String(v).trim()) lines.push(k.replace(/_/g, " ") + ": " + v); });
      lines.push("", "Sent from " + location.href);
      const subject = "[AllVeg.com] " + kind;
      const body = lines.join("\n");
      const ok = form.querySelector(".alert");
      if (C.formEndpoint) {
        try {
          const r = await fetch(C.formEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: data });
          if (r.ok) { form.reset(); if (ok) { ok.textContent = "Thanks — received. We reply within 48 hours."; ok.classList.add("show"); } toast("Submitted ✔"); track("form_submit", { kind }); return; }
        } catch (err) { /* fall through to mail client */ }
      }
      location.href = "mailto:" + inbox() + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      if (ok) { ok.textContent = "Your email app should open with the details pre-filled. Press send and we will reply within 48 hours."; ok.classList.add("show"); }
      track("form_submit", { kind });
      try { localStorage.setItem("av_lead_" + kind, "1"); } catch (_) {}
    });
  });

  /* ---------- Google AdSense ---------- */
  function ads() {
    const A = C.adsense; if (!A || !A.enabled) return;
    const slots = $$(".ad-slot");
    if (!slots.length) return;
    const live = A.client && !/X{6,}/.test(A.client);
    slots.forEach(el => {
      el.innerHTML = '<span class="ad-label">Advertisement</span>';
      if (!live) { el.insertAdjacentHTML("beforeend", "<span>AdSense slot · " + (el.dataset.slot || "auto") + "</span>"); return; }
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle"; ins.style.display = "block";
      ins.setAttribute("data-ad-client", A.client);
      ins.setAttribute("data-ad-slot", A.slots[el.dataset.slot] || A.slots.inArticle);
      ins.setAttribute("data-ad-format", el.dataset.format || "auto");
      ins.setAttribute("data-full-width-responsive", "true");
      el.appendChild(ins);
    });
    if (live) {
      const s = document.createElement("script");
      s.async = true; s.crossOrigin = "anonymous";
      s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + A.client;
      document.head.appendChild(s);
      s.onload = () => slots.forEach(() => { (window.adsbygoogle = window.adsbygoogle || []).push({}); });
    }
  }
  ads();

  /* ---------- YouTube lite embeds (click-to-load: fast, privacy-friendly) ---------- */
  window.ALLVEG.ytCard = function (v) {
    const placeholder = /REPLACE/.test(v.id);
    const thumb = placeholder ? "" : '<img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg">';
    return '<div><div class="yt" data-id="' + v.id + '" role="button" tabindex="0" aria-label="Play ' + v.title + '">' + thumb +
      '<div class="play"><b>▶</b></div></div><div class="yt-title">' + v.title + '</div></div>';
  };
  document.addEventListener("click", e => {
    const y = e.target.closest(".yt"); if (!y || y.querySelector("iframe")) return;
    if (/REPLACE/.test(y.dataset.id)) { toast("Add your YouTube video IDs in assets/js/config.js"); return; }
    y.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + y.dataset.id + '?autoplay=1&rel=0" title="YouTube video" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    track("video_play", { id: y.dataset.id });
  });
  $$("[data-yt-grid]").forEach(g => {
    const n = +g.dataset.ytGrid || 3;
    g.innerHTML = (C.youtube?.featured || []).slice(0, n).map(window.ALLVEG.ytCard).join("");
  });

  /* ---------- exit-intent / timed newsletter modal ---------- */
  const modal = $("#lead-modal");
  if (modal) {
    let shown = false;
    const seen = () => { try { return localStorage.getItem("av_modal") === "1"; } catch (_) { return false; } };
    const show = () => { if (shown || seen()) return; shown = true; modal.classList.add("show"); track("modal_open"); };
    const hide = () => { modal.classList.remove("show"); try { localStorage.setItem("av_modal", "1"); } catch (_) {} };
    setTimeout(show, 45000);
    document.addEventListener("mouseout", e => { if (e.clientY < 10 && !e.relatedTarget) show(); });
    $(".close", modal)?.addEventListener("click", hide);
    modal.addEventListener("click", e => { if (e.target === modal) hide(); });
    window.addEventListener("scroll", () => { if (window.scrollY / (document.body.scrollHeight - innerHeight) > 0.6) show(); }, { passive: true });
  }

  /* ---------- cookie notice (AdSense/GDPR) ---------- */
  const ck = $("#cookie");
  if (ck) {
    try { if (!localStorage.getItem("av_cookie")) ck.classList.add("show"); } catch (_) { ck.classList.add("show"); }
    $("button", ck)?.addEventListener("click", () => { ck.classList.remove("show"); try { localStorage.setItem("av_cookie", "1"); } catch (_) {} });
  }

  /* ---------- sticky bottom CTA after scroll ---------- */
  const sb = $(".sticky-bar");
  if (sb) window.addEventListener("scroll", () => { sb.classList.toggle("show", window.scrollY > 900); }, { passive: true });

  /* ---------- share ---------- */
  $$("[data-share]").forEach(b => b.addEventListener("click", async () => {
    const d = { title: document.title, url: location.href };
    if (navigator.share) { try { await navigator.share(d); } catch (_) {} }
    else { await navigator.clipboard?.writeText(d.url); toast("Link copied"); }
  }));
  $$("[data-print]").forEach(b => b.addEventListener("click", () => print()));

  /* ---------- toast ---------- */
  let tt;
  function toast(msg) {
    let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2600);
  }
  window.ALLVEG.toast = toast;

  /* ---------- analytics ---------- */
  function track(name, params) { if (window.gtag) gtag("event", name, params || {}); }
  window.ALLVEG.track = track;
  if (C.ga4) {
    const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + C.ga4; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag("js", new Date()); gtag("config", C.ga4);
  }

  /* ---------- social links + support links from config ---------- */
  $$("[data-social]").forEach(a => { const u = C.social?.[a.dataset.social]; if (u) a.href = u; });
  $$("[data-support]").forEach(a => { const k = a.dataset.support; const u = k.startsWith("stripe.") ? C.support?.stripeMonthly?.[k.split(".")[1]] : C.support?.[k]; if (u) a.href = u; });
  $$("[data-contact-url]").forEach(a => { a.href = C.contactUrl; });

  /* ---------- saved recipes counter in nav ---------- */
  window.ALLVEG.saved = {
    get() { try { return JSON.parse(localStorage.getItem("av_saved") || "[]"); } catch (_) { return []; } },
    toggle(id) { const s = this.get(); const i = s.indexOf(id); i > -1 ? s.splice(i, 1) : s.push(id); try { localStorage.setItem("av_saved", JSON.stringify(s)); } catch (_) {} return i === -1; }
  };
  /* ---------- year ---------- */
  $$("[data-year]").forEach(e => e.textContent = new Date().getFullYear());
})();
