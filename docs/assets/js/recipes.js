/* AllVeg.com — recipe library: cards, filters, detail page, saved list */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const TAGS = { vegan: ["V", "v"], vegetarian: ["VEG", ""], "gluten-free": ["GF", "gf"], "high-protein": ["HP", "hp"], quick: ["QUICK", "q"], budget: ["$", ""] };
  const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
  const qs = new URLSearchParams(location.search);
  let ALL = [];

  const load = () => ALL.length ? Promise.resolve(ALL) : fetch("data/recipes.json").then(r => r.json()).then(d => (ALL = d));

  function card(r) {
    const badges = r.tags.slice(0, 3).map(t => `<span class="badge ${TAGS[t]?.[1] || ""}">${TAGS[t]?.[0] || t}</span>`).join("");
    return `<article class="card"><a class="thumb" href="recipe.html?id=${r.id}" aria-label="${r.title}"><span>${r.emoji}</span><span class="badges">${badges}</span></a>
      <div class="body"><h3><a href="recipe.html?id=${r.id}">${r.title}</a></h3>
      <div class="meta"><span>⏱ ${r.time} min</span><span>🔥 ${r.nutrition.kcal} kcal</span><span>💪 ${r.nutrition.protein} g protein</span></div>
      <div class="stars" title="${r.rating} from ${r.votes} ratings">${stars(r.rating)} <span class="muted small">${r.rating} (${r.votes})</span></div></div></article>`;
  }
  window.ALLVEG.recipeCard = card;

  /* ---- grids anywhere: <div data-recipes="featured|popular|quick|cat:dinner" data-n="6"> ---- */
  $$("[data-recipes]").forEach(async el => {
    const list = await load(); const n = +el.dataset.n || 6; const k = el.dataset.recipes;
    let sel = list.slice();
    if (k === "popular") sel.sort((a, b) => b.votes - a.votes);
    else if (k === "quick") sel = sel.filter(r => r.time <= 20);
    else if (k.startsWith("cat:")) sel = sel.filter(r => r.cat === k.slice(4));
    else if (k.startsWith("tag:")) sel = sel.filter(r => r.tags.includes(k.slice(4)));
    else if (k === "featured") sel.sort((a, b) => b.rating - a.rating || b.votes - a.votes);
    el.innerHTML = sel.slice(0, n).map(card).join("");
  });

  /* ---- recipe index with filters ---- */
  const idx = $("#recipe-index");
  if (idx) {
    const state = { q: qs.get("q") || "", cat: qs.get("cat") || "", tags: new Set(qs.get("tag") ? [qs.get("tag")] : []), sort: "popular", cuisine: "" };
    const search = $("#rq"), count = $("#rcount"), sort = $("#rsort"), cuisine = $("#rcuisine");
    if (search) search.value = state.q;
    function render() {
      let l = ALL.filter(r => (!state.cat || r.cat === state.cat) && [...state.tags].every(t => r.tags.includes(t)) && (!state.cuisine || r.cuisine === state.cuisine)
        && (!state.q || (r.title + r.summary + r.ingredients.map(i => i.n).join(" ")).toLowerCase().includes(state.q.toLowerCase())));
      if (state.sort === "popular") l.sort((a, b) => b.votes - a.votes);
      if (state.sort === "rating") l.sort((a, b) => b.rating - a.rating);
      if (state.sort === "quick") l.sort((a, b) => a.time - b.time);
      if (state.sort === "protein") l.sort((a, b) => b.nutrition.protein - a.nutrition.protein);
      if (state.sort === "kcal") l.sort((a, b) => a.nutrition.kcal - b.nutrition.kcal);
      idx.innerHTML = l.length ? l.map(card).join("") : `<p class="muted">No recipes match. <button class="pill" id="rclear">Clear filters</button></p>`;
      if (count) count.textContent = l.length + " recipe" + (l.length === 1 ? "" : "s");
      $("#rclear")?.addEventListener("click", () => { state.cat = ""; state.tags.clear(); state.q = ""; state.cuisine = ""; if (search) search.value = ""; sync(); render(); });
      const p = new URLSearchParams(); if (state.cat) p.set("cat", state.cat); if (state.tags.size) p.set("tag", [...state.tags][0]); if (state.q) p.set("q", state.q);
      history.replaceState(null, "", "recipes.html" + (p.toString() ? "?" + p : ""));
    }
    function sync() {
      $$("[data-cat]").forEach(b => b.classList.toggle("on", b.dataset.cat === state.cat));
      $$("[data-tag]").forEach(b => b.classList.toggle("on", state.tags.has(b.dataset.tag)));
    }
    $$("[data-cat]").forEach(b => b.addEventListener("click", () => { state.cat = state.cat === b.dataset.cat ? "" : b.dataset.cat; sync(); render(); }));
    $$("[data-tag]").forEach(b => b.addEventListener("click", () => { state.tags.has(b.dataset.tag) ? state.tags.delete(b.dataset.tag) : state.tags.add(b.dataset.tag); sync(); render(); }));
    search?.addEventListener("input", () => { state.q = search.value; render(); });
    sort?.addEventListener("change", () => { state.sort = sort.value; render(); });
    load().then(() => {
      if (cuisine) { [...new Set(ALL.map(r => r.cuisine))].sort().forEach(c => cuisine.insertAdjacentHTML("beforeend", `<option>${c}</option>`)); cuisine.addEventListener("change", () => { state.cuisine = cuisine.value; render(); }); }
      sync(); render();
    });
  }

  /* ---- recipe detail ---- */
  const det = $("#recipe");
  if (det) load().then(() => {
    const r = ALL.find(x => x.id === qs.get("id")) || ALL[0];
    let scale = 1;
    const fmt = q => { const v = q * scale; if (!v) return ""; const f = { .25: "¼", .5: "½", .75: "¾", .33: "⅓", .66: "⅔" }; const w = Math.floor(v), d = +(v - w).toFixed(2); return (w || "") + (f[d] || (d ? d.toFixed(2).replace(/0+$/, "").replace(/\.$/, "") : "")) || String(v); };
    document.title = r.title + " | AllVeg.com";
    $('meta[name="description"]').content = r.summary;
    const saved = () => window.ALLVEG.saved.get().includes(r.id);
    const renderIng = () => $("#ing").innerHTML = r.ingredients.map(i => `<li><label><input type="checkbox"><span><b>${fmt(i.q)} ${i.u}</b> ${i.n}</span></label></li>`).join("");
    const isVegan = r.tags.includes("vegan");
    det.innerHTML = `
      <div class="wrap"><nav class="breadcrumb"><a href="index.html">Home</a> › <a href="recipes.html">Recipes</a> › <a href="recipes.html?cat=${r.cat}">${r.cat[0].toUpperCase() + r.cat.slice(1)}</a> › ${r.title}</nav>
      <div class="recipe-hero"><div>
        <span class="eyebrow">${r.cuisine} · ${r.cat}</span><h1>${r.title}</h1><p class="lead">${r.summary}</p>
        <div class="stars">${stars(r.rating)} <span class="muted small">${r.rating} · ${r.votes} ratings</span></div>
        <div class="pill-row" style="margin-top:12px">${r.tags.map(t => `<a class="pill" href="recipes.html?tag=${t}">${t}</a>`).join("")}</div>
        <div class="toolbar"><a class="btn btn-primary" href="#card">↓ Jump to recipe</a><button class="btn btn-outline" id="save">${saved() ? "♥ Saved" : "♡ Save"}</button><button class="btn btn-ghost" data-print>🖨 Print</button><button class="btn btn-ghost" data-share>↗ Share</button></div>
      </div><div class="thumb">${r.emoji}</div></div>
      <div class="ad-slot leaderboard" data-slot="leaderboard"></div>
      <div class="recipe-layout"><div>
        <div class="recipe-card" id="card"><h2>${r.title}</h2>
          <div class="facts"><div><b>${r.time} min</b><span>Total time</span></div><div><b id="serv">${r.servings}</b><span>Servings</span></div><div><b>${r.nutrition.kcal}</b><span>kcal / serving</span></div><div><b>${r.nutrition.protein} g</b><span>Protein</span></div></div>
          <div class="toolbar"><span class="muted small">Scale:</span><div class="scaler"><button class="on" data-s="1">1×</button><button data-s="2">2×</button><button data-s="3">3×</button></div></div>
          <h3>Ingredients</h3><ul class="ingredients" id="ing"></ul>
          <h3 style="margin-top:20px">Method</h3><ol class="steps">${r.steps.map(s => `<li>${s}</li>`).join("")}</ol>
          <div class="callout"><strong>AllVeg tip:</strong> ${r.tip}</div>
          <h3>Nutrition (per serving, approx.)</h3><div class="nutri"><div><b>${r.nutrition.kcal}</b><br>kcal</div><div><b>${r.nutrition.protein} g</b><br>protein</div><div><b>${r.nutrition.carbs} g</b><br>carbs</div><div><b>${r.nutrition.fat} g</b><br>fat</div></div>
          <p class="form-note" style="margin-top:12px">Nutrition is estimated from standard ingredient databases and will vary with brands and portions.</p>
        </div>
        <div class="ad-slot inarticle" data-slot="inArticle"></div>
        <div class="recipe-card" style="margin-top:24px"><h3>Watch it made</h3><div class="grid grid-2" data-yt-grid="2"></div></div>
        <div class="recipe-card" style="margin-top:24px"><h3>Rate this recipe</h3><form class="form" data-form="Recipe rating: ${r.title}"><div class="honey"><input name="_gotcha"></div>
          <div class="form-row"><div><label>Your rating</label><select name="rating"><option>★★★★★ 5</option><option>★★★★ 4</option><option>★★★ 3</option><option>★★ 2</option><option>★ 1</option></select></div><div><label>Name</label><input type="text" name="name"></div></div>
          <div><label>Comment</label><textarea name="comment" placeholder="Did you make it? Any swaps?"></textarea></div>
          <button class="btn btn-primary" type="submit">Submit review</button><div class="alert"></div></form></div>
        <div style="margin-top:36px"><div class="sec-head"><h2>More ${r.cat} recipes</h2><a class="btn btn-ghost btn-sm" href="recipes.html?cat=${r.cat}">See all →</a></div><div class="grid grid-3" id="more"></div></div>
      </div>
      <aside class="sidebar">
        <div class="widget" style="background:var(--green-900);color:#e6f4ea"><h3 style="color:#fff">Free Starter Kit</h3><p class="small">20 quick recipes + 7-day plan. One email a week.</p><form class="form" data-form="Starter Kit (recipe sidebar)"><div class="honey"><input name="_gotcha"></div><input type="email" name="email" placeholder="Email" required><button class="btn btn-lime btn-block" type="submit">Get it free</button><div class="alert"></div></form></div>
        <div class="ad-slot rect" data-slot="sidebar"></div>
        <div class="widget"><h3>Need a swap?</h3><p class="small muted">${isVegan ? "Nut, soy or gluten allergy?" : "Make it vegan?"} Every ratio is in the substitution finder.</p><a class="btn btn-outline btn-sm" href="substitutes.html">Open Substitution Finder</a></div>
        <div class="widget"><h3>Popular now</h3><ul id="pop"></ul></div>
        <div class="widget"><h3>Support AllVeg</h3><p class="small muted">Recipes are free. If they save you time, buy us a coffee.</p><a class="btn btn-accent btn-sm" href="support.html">♥ Support</a></div>
      </aside></div></div>`;
    renderIng();
    $$(".scaler button").forEach(b => b.addEventListener("click", () => { scale = +b.dataset.s; $$(".scaler button").forEach(x => x.classList.toggle("on", x === b)); $("#serv").textContent = r.servings * scale; renderIng(); }));
    $("#save").addEventListener("click", e => { const on = window.ALLVEG.saved.toggle(r.id); e.target.textContent = on ? "♥ Saved" : "♡ Save"; window.ALLVEG.toast(on ? "Saved to your recipe box" : "Removed"); });
    $("#more").innerHTML = ALL.filter(x => x.cat === r.cat && x.id !== r.id).slice(0, 3).map(card).join("");
    $("#pop").innerHTML = ALL.slice().sort((a, b) => b.votes - a.votes).slice(0, 6).map(x => `<li><a href="recipe.html?id=${x.id}">${x.title}</a></li>`).join("");
    $$("[data-yt-grid]", det).forEach(g => g.innerHTML = (window.ALLVEG.youtube.featured || []).slice(0, 2).map(window.ALLVEG.ytCard).join(""));
    $$("[data-print]", det).forEach(b => b.addEventListener("click", () => print()));
    $$("[data-share]", det).forEach(b => b.addEventListener("click", async () => { if (navigator.share) { try { await navigator.share({ title: r.title, url: location.href }); } catch (_) {} } else { await navigator.clipboard?.writeText(location.href); window.ALLVEG.toast("Link copied"); } }));
    // wire dynamically inserted forms
    $$("form[data-form]", det).forEach(f => f.addEventListener("submit", e => { e.preventDefault(); const d = new FormData(f); const lines = []; d.forEach((v, k) => { if (k !== "_gotcha" && String(v).trim()) lines.push(k + ": " + v); }); lines.push("", "Page: " + location.href); location.href = "mailto:" + window.ALLVEG.inbox() + "?subject=" + encodeURIComponent("[AllVeg.com] " + f.dataset.form) + "&body=" + encodeURIComponent(lines.join("\n")); const a = $(".alert", f); if (a) { a.textContent = "Your email app should open with the details pre-filled — press send."; a.classList.add("show"); } }));
    // schema.org Recipe
    const ld = { "@context": "https://schema.org", "@type": "Recipe", name: r.title, description: r.summary, recipeCategory: r.cat, recipeCuisine: r.cuisine, keywords: r.tags.join(", "), totalTime: "PT" + r.time + "M", recipeYield: r.servings + " servings",
      recipeIngredient: r.ingredients.map(i => `${i.q} ${i.u} ${i.n}`.trim()), recipeInstructions: r.steps.map(s => ({ "@type": "HowToStep", text: s })),
      nutrition: { "@type": "NutritionInformation", calories: r.nutrition.kcal + " calories", proteinContent: r.nutrition.protein + " g", carbohydrateContent: r.nutrition.carbs + " g", fatContent: r.nutrition.fat + " g" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: r.rating, ratingCount: r.votes }, author: { "@type": "Organization", name: "AllVeg.com" }, suitableForDiet: isVegan ? "https://schema.org/VeganDiet" : "https://schema.org/VegetarianDiet" };
    const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
  });

  /* ---- saved recipes page ---- */
  const sv = $("#saved-grid");
  if (sv) load().then(() => { const ids = window.ALLVEG.saved.get(); const l = ALL.filter(r => ids.includes(r.id)); sv.innerHTML = l.length ? l.map(card).join("") : `<p class="muted">Nothing saved yet. Tap ♡ Save on any recipe — it is stored on this device.</p>`; });

  /* ---- global search box (home) ---- */
  $$("form[data-search]").forEach(f => f.addEventListener("submit", e => { e.preventDefault(); location.href = "recipes.html?q=" + encodeURIComponent(f.q.value); }));
})();
