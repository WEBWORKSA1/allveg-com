# AllVeg.com — Business Concept, Research Findings & Phase-wise Build Prompt

> Use this file as the master prompt for building, extending and operating AllVeg.com. Each phase is a self-contained prompt you can hand to a developer or an AI coding agent.

---

## 0. The idea (decision)

**AllVeg.com = "the all-in-one vegetarian & vegan hub" — recipes for traffic, tools for retention, a challenge for the email list, comparisons for affiliate revenue, and a community layer (contests, jobs, ambassadors) for defensibility.**

Why this and not a directory, a media brand, or a meal-kit:

| Option | Evidence | Verdict |
|---|---|---|
| Recipe site (ads) | 9/12 top recipe sites monetise with Raptive/Mediavine; food RPM $10–40; "vegan recipes" 49.5k US searches/mo, "vegan" 550k | **Core traffic engine** |
| Restaurant/review directory | abillion (28M users, $17M raised) shut down Mar 2026; HappyCow dominates; AI answers eat "near me" queries | Do city guides + paid listings only, no UGC directory |
| Interactive tools | **No competitor in 36 sites has a substitution finder, protein calculator or free planner** (they lock them in apps/PDFs) | **Differentiator + retention + links** |
| Pledge/challenge lead-gen | Veganuary form (name, email, country, start date) is the best-converting pattern in the niche | **Primary lead magnet** |
| Membership/donations | Vegan Society £2/mo, VegSoc £3/mo, OGP "ad-free" membership | Tiers at $3 / $8 / $25 + one-off |
| Affiliate comparisons | Meal kits ($11–13/dinner), protein powders, Thrive Market — nobody compares them properly | **Highest revenue per visit** |

Revenue stack (in order of expected contribution at scale): display ads (AdSense → Mediavine/Raptive at 50k sessions) → affiliate comparisons → sponsored recipes/newsletter → memberships/donations → business listings → contest sponsorship → YouTube ad revenue → domain/site sale enquiries (top bar on every page).

Market context: vegan food market ≈ $24.5B (2026), ~11.5% CAGR (Grand View Research).

---

## 1. Research summary — 36 sites audited

**Recipe/creator sites (12):** Minimalist Baker, Oh She Glows, Love & Lemons, Cookie and Kate, Forks Over Knives, Pick Up Limes, Vegan Richa, Nora Cooks, Rainbow Plant Life, It Doesn't Taste Like Chicken, The Full Helping, Hebbar's Kitchen.
**Advocacy/directory/media (12):** HappyCow, Vegetarian Society, VRG, Veganuary, VegNews, LiveKindly, Plant Based News, PETA Living, The Vegan Society, Vegetarian Times, One Green Planet, Vegan.com.
**Commerce/tools/health (12):** Purple Carrot, Thrive Market, Veestro, Forks Meal Planner, PlantYou, NutritionFacts.org, VeganHealth.org, abillion (closed), Vegancuts, Vegan Food & Living, Green Matters, BBC Good Food (blocked — prior knowledge).

### Features adopted (ranked by prevalence) → implemented
1. Recipe index with category + dietary filters (12/12) ✔
2. Site search (12/12) ✔
3. Inline newsletter capture + lead magnet (12/12; 7/12 with freebie) ✔ Starter Kit
4. Social links / social proof (12/12) ✔
5. Image-led card grid (12/12) ✔
6. Dietary badges GF/V/HP/quick (10/12) ✔
7. Affiliate shop/comparisons + disclosure (9/12) ✔ Compare hub
8. Display ad network (9/12) ✔ AdSense slots (leaderboard, in-article, sidebar)
9. YouTube embeds on recipes (9/12) ✔ click-to-load lite embeds
10. Star ratings with counts (8/12) ✔ + review form
11. Jump-to-recipe / print (8/12) ✔
12. Save/favourite (7/12) ✔ localStorage recipe box
13. Serving scaler 1×/2×/3× (5/12) ✔
14. Nutrition per serving (5/12) ✔ + Recipe JSON-LD
15. "Start Here" beginner path (3/12) ✔
16. Exit-intent modal (Pick Up Limes) ✔
17. Monthly contest (IDTLC, VegNews) ✔ with countdown + official rules
18. Pledge form with country + start date (Veganuary) ✔ 30-Day Challenge
19. Donate / monthly membership tiers (Vegan Society, VegSoc, PETA, PBN) ✔
20. Jobs board / Write for us (VegNews, PBN, VRG) ✔
21. Ambassador program (HappyCow) ✔
22. Advertise / media-kit page with enquiry form (VegNews, PBN) ✔
23. City guides + "add listing" (HappyCow) ✔
24. Cookie/consent notice for AdSense ✔
25. Trademark/copyright/affiliate/medical disclosures ✔

### Lead-gen forms observed → fields used on AllVeg
Veganuary: first, last, email, country, start date, consent · PETA: name, email, (address), list prefs · VegNews: email + giveaway entry · Vegancuts: giveaway tracker · Thrive: onboarding quiz. AllVeg uses all of these patterns across the Challenge, Newsletter, Starter Kit, Contest, Partner and Protein-plan forms.

---

## 2. Architecture (as built)

- **Stack:** static HTML/CSS/vanilla JS; no build dependencies beyond Python 3 for `tools/build.py`. Hosted free on GitHub Pages from `/docs`.
- **Data-driven pages:** `docs/data/recipes.json` (36 recipes), `articles.json` (12 guides), `subs.json` (22 ingredients / 60+ swaps). `recipe.html?id=…` and `article.html?id=…` render from JSON with schema.org JSON-LD.
- **Single config:** `docs/assets/js/config.js` — AdSense IDs, YouTube IDs, donation links, affiliate links, socials, GA4, form endpoint.
- **Email policy:** the single inbox is stored reversed+base64 in `config.js` (`mailToken`) and only assembled at click/submit time. It never appears in HTML, JS source or the DOM. Every form/contact link routes to it. Optional `formEndpoint` (Formspree/Basin) upgrades forms to server-side delivery without exposing the address.
- **Top bar on every page:** "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership" → https://web.works/contact.
- **Relative links only** so the site works at `webworksa1.github.io/allveg-com/` and at `allveg.com` unchanged.

---

## 3. Phase-wise build prompts

### Phase 1 — Foundation & design system (done)
> Build a responsive static site for AllVeg.com with a green/lime/terracotta palette, Fraunces + Inter typography, sticky header with dropdown nav, mobile burger, top contact bar linking to web.works/contact on every page, footer with 5 columns, cookie notice, exit-intent lead modal, sticky bottom CTA. All CSS in one file, all behaviour in `site.js`. No email address anywhere in source; store it obfuscated and assemble at click time.

### Phase 2 — Content engine (done)
> Create a JSON recipe schema (id, title, emoji, cat, cuisine, tags, time, servings, nutrition, rating, votes, summary, ingredients[q,u,n], steps, tip). Seed 36 original tested recipes across breakfast/lunch/dinner/snack/dessert/drink with Indian, Mediterranean, Asian, Mexican coverage. Build `recipes.html` (search, category pills, diet pills, cuisine select, 5 sort orders, URL-synced state) and `recipe.html` (hero, scaler, ingredient checklist, numbered method, tip, nutrition, video, review form, related, sidebar lead form, JSON-LD). Add guides JSON with 12 evidence-based articles and `guides.html`/`article.html`.

### Phase 3 — Tools (done)
> Ship four browser-only tools: Substitution Finder (search + category filters over subs.json), Protein Calculator (weight/unit/goal/diet → daily grams, per-meal split, sample day, email-me-the-plan form), Meal Planner (7×3 selects, auto-fill by tag, live kcal/protein KPIs, merged grocery list with copy/print, localStorage), Compare hub (meal kits + protein powders tables with rel=sponsored links).

### Phase 4 — Lead generation & monetization (done)
> Add the 30-Day Challenge page (Veganuary-style form: first/last/email/country/current diet/goal/start/consent), Starter Kit forms (home, start-here, sidebar, popup), Newsletter page with interest checkboxes, recipe/tool/video request forms. Insert AdSense slots (leaderboard, in-article, sidebar, multiplex) that render placeholders until a real publisher ID is set; add ads.txt. Add YouTube lite-embeds fed from config. Add Support page with $3/$8/$25 tiers, one-off amounts, PayPal/Ko-fi/BMAC/GitHub Sponsors links and "sponsor a project" form. Add Partners page with six offer types and a budget-qualified enquiry form.

### Phase 5 — Community & operations (done)
> Add Contests (prize tiers, live countdown, entry form, rules summary), Jobs & Talent (five briefs + application form), Ambassadors (creator/city/expert tracks + form), Submit a Recipe, City Guides (8 cities + listing form), Community hub. Legal: Privacy (AdSense disclosure), Terms (contest rules), Disclosures (trademark, copyright, affiliate, medical, prizes, donations).

### Phase 6 — Launch (this repo)
> Push to github.com/webworksa1/allveg-com; enable GitHub Pages from `main` `/docs` (or the included Actions workflow). Then: (1) replace `ca-pub-XXXX` in config.js + ads.txt after AdSense approval; (2) paste real YouTube IDs; (3) paste Stripe/PayPal/Ko-fi links; (4) set `formEndpoint` to a Formspree/Basin endpoint pointed at the inbox; (5) add `CNAME` file containing `allveg.com` and set DNS A records to GitHub Pages IPs; (6) submit sitemap.xml to Search Console; (7) set GA4 ID.

### Phase 7 — Growth (next 90 days)
> Publish 3 recipes + 1 guide per week from the 20 keyword pillars (vegan cheese/pizza/breakfast/desserts/protein powder/stir fry/pancakes/burger/mac and cheese/snacks…). Film 1 YouTube video per recipe cluster; embed on recipe pages. Run the monthly contest with a sponsor. Pitch meal-kit and protein-powder affiliate programs. At 1,000 sessions apply to Mediavine Journey; at 50k sessions move to Raptive/Mediavine (2–4× AdSense RPM).

### Phase 8 — Expansion (6–12 months)
> Add: calorie/iron/B12 trackers, PWA offline mode, Hindi/Spanish recipe translations (Hebbar's model), member-gated PDF cookbooks and synced recipe box (Supabase or Firebase), paid business listings with Stripe checkout, restaurant "AllVeg-Friendly" badge program (Vegan Society trademark model), annual AllVeg Awards (VegNews model), affiliate program for ambassadors.

---

## 4. Trademark / copyright note
"AllVeg" is used descriptively as the domain name only; no trademark is claimed and no affiliation with any "All Veg"/"AllVeg" business is implied. Full text on `disclaimer.html`. All recipes, guides and code are original to this repository; third-party brand names appear nominatively for comparison only.
