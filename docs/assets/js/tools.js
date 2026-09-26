/* AllVeg.com — interactive tools + guides */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const qs = new URLSearchParams(location.search);

  /* ================= Substitution finder ================= */
  const sub = $("#sub-results");
  if (sub) fetch("data/subs.json").then(r => r.json()).then(D => {
    const q = $("#sub-q"), cats = $$("[data-subcat]"); let cat = "";
    function render() {
      const t = (q.value || "").toLowerCase();
      const l = D.filter(d => (!cat || d.cat === cat) && (!t || (d.item + d.subs.map(s => s.n + s.best).join(" ")).toLowerCase().includes(t)));
      sub.innerHTML = l.length ? l.map(d => `<div class="sub-item"><h3>${d.item} <span class="tag">${d.cat}</span></h3>${d.subs.map(s => `<p style="margin:6px 0"><strong>${s.n}</strong><span class="ratio">${s.r}</span><br><span class="muted small">Best for: ${s.best}</span></p>`).join("")}</div>`).join("")
        : `<p class="muted">No match yet. <a href="#ask">Ask us for a swap</a> and we will add it.</p>`;
      $("#sub-count").textContent = l.length + " ingredient" + (l.length === 1 ? "" : "s");
    }
    q.addEventListener("input", render);
    cats.forEach(b => b.addEventListener("click", () => { cat = cat === b.dataset.subcat ? "" : b.dataset.subcat; cats.forEach(x => x.classList.toggle("on", x.dataset.subcat === cat)); render(); }));
    if (qs.get("q")) q.value = qs.get("q");
    render();
  });

  /* ================= Protein calculator ================= */
  const pc = $("#protein-form");
  if (pc) {
    const out = $("#protein-out");
    const FOODS = [["Tempeh (100 g)", 20], ["Seitan (100 g)", 25], ["Firm tofu (150 g)", 18], ["Lentils, cooked (1 cup)", 18], ["Edamame (1 cup)", 17], ["Chickpeas, cooked (1 cup)", 15], ["Black beans (1 cup)", 15], ["Soy milk (1 cup)", 8], ["Greek-style soy yogurt (170 g)", 10], ["Peanut butter (2 tbsp)", 8], ["Hemp seeds (3 tbsp)", 10], ["Quinoa, cooked (1 cup)", 8], ["Pea protein shake (1 scoop)", 24], ["Paneer (100 g)", 18], ["Eggs (2)", 12], ["Greek yogurt, dairy (170 g)", 17]];
    pc.addEventListener("submit", e => {
      e.preventDefault();
      const f = new FormData(pc);
      let w = +f.get("weight"); if (f.get("unit") === "lb") w *= 0.4536;
      const goal = f.get("goal"); const veg = f.get("diet");
      const per = { sedentary: 0.9, active: 1.4, muscle: 1.8, fatloss: 2.0 }[goal];
      const g = Math.round(w * per);
      const meals = 4, perMeal = Math.round(g / meals);
      const pool = veg === "vegan" ? FOODS.filter(x => !/Paneer|Eggs|dairy/.test(x[0])) : FOODS;
      const sample = ["Breakfast", "Lunch", "Dinner", "Snack"].map((m, i) => { const a = pool[(i * 3) % pool.length], b = pool[(i * 3 + 1) % pool.length], c = pool[(i * 3 + 2) % pool.length]; return `<tr><td>${m}</td><td>${a[0]} + ${b[0]} + ${c[0]}</td><td>${a[1] + b[1] + c[1]} g</td></tr>`; }).join("");
      out.innerHTML = `<div class="result"><b class="big">${g} g protein / day</b><p>≈ <strong>${perMeal} g per meal</strong> across ${meals} meals (${per} g per kg for “${pc.goal.options[pc.goal.selectedIndex].text}”). Leucine threshold for muscle synthesis is ~2.5 g per meal — soy, lentils, pea protein and seitan get you there.</p>
        <div class="bar"><i style="width:${Math.min(100, g / 2)}%"></i></div>
        <h3 style="margin-top:16px">A sample day that hits ${g} g</h3><div class="table-wrap"><table class="tbl"><tr><th>Meal</th><th>Foods</th><th>Protein</th></tr>${sample}</table></div>
        <p class="small muted" style="margin-top:12px">Ranges based on ISSN and Academy of Nutrition & Dietetics position papers. Not medical advice — kidney conditions and pregnancy change the numbers; see a dietitian.</p>
        <div class="toolbar"><a class="btn btn-primary btn-sm" href="recipes.html?tag=high-protein">High-protein recipes →</a><a class="btn btn-outline btn-sm" href="article.html?id=vegetarian-protein-guide">Read the protein guide</a></div></div>
        <div class="form-card" style="margin-top:20px"><h3>Email me this plan + a 7-day high-protein menu</h3><form class="form" data-form="Protein plan request"><div class="honey"><input name="_gotcha"></div><input type="hidden" name="daily_protein_target" value="${g} g"><div class="form-row"><input type="text" name="name" placeholder="First name"><input type="email" name="email" placeholder="Email" required></div><button class="btn btn-lime" type="submit">Send my plan</button><div class="alert"></div></form></div>`;
      window.ALLVEG.track("tool_use", { tool: "protein" });
      wireForms(out);
    });
  }

  /* ================= Meal planner + grocery list ================= */
  const planner = $("#planner");
  if (planner) fetch("data/recipes.json").then(r => r.json()).then(R => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], slots = ["breakfast", "lunch", "dinner"];
    let plan = {}; try { plan = JSON.parse(localStorage.getItem("av_plan") || "{}"); } catch (_) {}
    const opts = s => `<option value="">— ${s} —</option>` + R.filter(r => r.cat === s || (s === "lunch" && r.cat === "dinner")).map(r => `<option value="${r.id}">${r.emoji} ${r.title}</option>`).join("");
    planner.innerHTML = days.map(d => `<div class="day"><h4>${d}</h4>${slots.map(s => `<select data-day="${d}" data-slot="${s}" aria-label="${d} ${s}">${opts(s)}</select>`).join("")}</div>`).join("");
    $$("select", planner).forEach(sel => { sel.value = plan[sel.dataset.day + sel.dataset.slot] || ""; sel.addEventListener("change", () => { plan[sel.dataset.day + sel.dataset.slot] = sel.value; save(); summary(); }); });
    const save = () => { try { localStorage.setItem("av_plan", JSON.stringify(plan)); } catch (_) {} };
    function summary() {
      const ids = Object.values(plan).filter(Boolean); const rs = ids.map(i => R.find(r => r.id === i)).filter(Boolean);
      const kcal = rs.reduce((a, r) => a + r.nutrition.kcal, 0), pro = rs.reduce((a, r) => a + r.nutrition.protein, 0), t = rs.reduce((a, r) => a + r.time, 0);
      $("#plan-kpi").innerHTML = `<div><b>${rs.length}</b>meals planned</div><div><b>${Math.round(kcal / 7)}</b>avg kcal / day</div><div><b>${Math.round(pro / 7)} g</b>avg protein / day</div><div><b>${Math.round(t / 60 * 10) / 10} h</b>total cook time</div>`;
      const g = {}; rs.forEach(r => r.ingredients.forEach(i => { const k = i.n.toLowerCase(); g[k] = g[k] || { n: i.n, q: 0, u: i.u }; g[k].q += i.q; }));
      const items = Object.values(g).sort((a, b) => a.n.localeCompare(b.n));
      $("#grocery").innerHTML = items.length ? `<ul class="ingredients">${items.map(i => `<li><label><input type="checkbox"><span><b>${+i.q.toFixed(2)} ${i.u}</b> ${i.n}</span></label></li>`).join("")}</ul>` : `<p class="muted">Pick meals above and your grocery list builds itself.</p>`;
      $("#grocery-copy").onclick = () => { navigator.clipboard?.writeText(items.map(i => `${+i.q.toFixed(2)} ${i.u} ${i.n}`).join("\n")); window.ALLVEG.toast("Grocery list copied"); };
    }
    $("#plan-auto").addEventListener("click", () => { const tag = $("#plan-tag").value; const pool = s => R.filter(r => (r.cat === s || (s === "lunch" && r.cat === "dinner")) && (!tag || r.tags.includes(tag))); days.forEach((d, i) => slots.forEach(s => { const p = pool(s); plan[d + s] = p.length ? p[(i * 7 + s.length) % p.length].id : ""; })); $$("select", planner).forEach(sel => sel.value = plan[sel.dataset.day + sel.dataset.slot] || ""); save(); summary(); window.ALLVEG.track("tool_use", { tool: "planner_auto" }); });
    $("#plan-clear").addEventListener("click", () => { plan = {}; save(); $$("select", planner).forEach(s => s.value = ""); summary(); });
    $("#plan-print").addEventListener("click", () => print());
    summary();
  });

  /* ================= Guides list ================= */
  const gl = $("#guides-grid");
  if (gl) fetch("data/articles.json").then(r => r.json()).then(A => {
    const cat = qs.get("cat") || ""; const cats = [...new Set(A.map(a => a.cat))];
    const bar = $("#guide-cats"); if (bar) bar.innerHTML = `<a class="pill ${!cat ? "on" : ""}" href="guides.html">All</a>` + cats.map(c => `<a class="pill ${c === cat ? "on" : ""}" href="guides.html?cat=${encodeURIComponent(c)}">${c}</a>`).join("");
    const l = A.filter(a => !cat || a.cat === cat).sort((a, b) => b.date.localeCompare(a.date));
    gl.innerHTML = l.map(a => `<article class="card"><a class="thumb" href="article.html?id=${a.id}" style="background:var(--lime-100)"><span>${a.emoji}</span><span class="badges"><span class="badge">${a.cat}</span></span></a><div class="body"><h3><a href="article.html?id=${a.id}">${a.title}</a></h3><p class="small muted" style="margin:0">${a.summary}</p><div class="meta"><span>📖 ${a.read} min read</span><span>${a.date}</span></div></div></article>`).join("");
  });
  $$("[data-articles]").forEach(el => fetch("data/articles.json").then(r => r.json()).then(A => { el.innerHTML = A.slice(0, +el.dataset.n || 3).map(a => `<article class="card"><a class="thumb" href="article.html?id=${a.id}" style="background:var(--lime-100)"><span>${a.emoji}</span></a><div class="body"><span class="eyebrow">${a.cat}</span><h3><a href="article.html?id=${a.id}">${a.title}</a></h3><div class="meta"><span>📖 ${a.read} min read</span></div></div></article>`).join(""); }));

  /* ================= Article page ================= */
  const art = $("#article");
  if (art) fetch("data/articles.json").then(r => r.json()).then(A => {
    const a = A.find(x => x.id === qs.get("id")) || A[0];
    document.title = a.title + " | AllVeg.com"; $('meta[name="description"]').content = a.summary;
    const others = A.filter(x => x.id !== a.id).slice(0, 3);
    art.innerHTML = `<div class="wrap"><nav class="breadcrumb"><a href="index.html">Home</a> › <a href="guides.html">Guides</a> › ${a.cat}</nav>
      <div class="article"><span class="eyebrow" style="margin-top:20px">${a.cat} · ${a.read} min read · Updated ${a.date}</span><h1>${a.title}</h1><p class="lead">${a.summary}</p>
      <div class="share"><button class="btn btn-ghost btn-sm" data-share>↗ Share</button><button class="btn btn-ghost btn-sm" data-print>🖨 Print</button></div>
      <div class="ad-slot leaderboard" data-slot="leaderboard"></div>
      <div class="prose">${a.body}</div>
      <div class="ad-slot inarticle" data-slot="inArticle"></div>
      <div class="cta-box" style="margin:36px 0"><div><h2>Get one useful email a week</h2><p>New recipes, a tool update and the best evidence-based guide. Plus the free Starter Kit.</p></div><form class="form" data-form="Newsletter (article)"><div class="honey"><input name="_gotcha"></div><input type="email" name="email" placeholder="Email" required><button class="btn btn-lime" type="submit">Subscribe free</button><div class="alert"></div></form></div>
      <h2>Keep reading</h2><div class="grid grid-3">${others.map(o => `<article class="card"><a class="thumb" href="article.html?id=${o.id}" style="background:var(--lime-100)"><span>${o.emoji}</span></a><div class="body"><h3><a href="article.html?id=${o.id}">${o.title}</a></h3></div></article>`).join("")}</div></div></div>`;
    wireForms(art);
    $$("[data-print]", art).forEach(b => b.onclick = () => print());
    $$("[data-share]", art).forEach(b => b.onclick = async () => { if (navigator.share) { try { await navigator.share({ title: a.title, url: location.href }); } catch (_) {} } else { await navigator.clipboard?.writeText(location.href); window.ALLVEG.toast("Link copied"); } });
    const ld = { "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.summary, datePublished: a.date, author: { "@type": "Organization", name: "AllVeg.com" }, publisher: { "@type": "Organization", name: "AllVeg.com" } };
    const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
    if (window.ALLVEG.adsense?.enabled) $$(".ad-slot", art).forEach(el => { el.innerHTML = '<span class="ad-label">Advertisement</span><span>AdSense slot · ' + el.dataset.slot + '</span>'; });
  });

  /* ================= Contest countdown ================= */
  $$("[data-countdown]").forEach(el => {
    const end = new Date(el.dataset.countdown).getTime();
    const tick = () => { const d = Math.max(0, end - Date.now()); const D = Math.floor(d / 864e5), H = Math.floor(d % 864e5 / 36e5), M = Math.floor(d % 36e5 / 6e4), S = Math.floor(d % 6e4 / 1e3); el.innerHTML = [[D, "days"], [H, "hrs"], [M, "min"], [S, "sec"]].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join(""); };
    tick(); setInterval(tick, 1000);
  });

  /* ================= Donation amount picker ================= */
  $$(".amounts").forEach(a => $$("button", a).forEach(b => b.addEventListener("click", () => { $$("button", a).forEach(x => x.classList.toggle("on", x === b)); const i = $("#donate-amount"); if (i) i.value = b.dataset.amt; })));

  /* dynamically-inserted forms use the same hidden-inbox routing as site.js */
  function wireForms(root) {
    $$("form[data-form]", root).forEach(f => f.addEventListener("submit", e => { e.preventDefault(); const d = new FormData(f); const lines = []; d.forEach((v, k) => { if (k !== "_gotcha" && String(v).trim()) lines.push(k.replace(/_/g, " ") + ": " + v); }); lines.push("", "Page: " + location.href); location.href = "mailto:" + window.ALLVEG.inbox() + "?subject=" + encodeURIComponent("[AllVeg.com] " + f.dataset.form) + "&body=" + encodeURIComponent(lines.join("\n")); const a = $(".alert", f); if (a) { a.textContent = "Your email app should open with the details pre-filled — press send."; a.classList.add("show"); } }));
  }
})();
