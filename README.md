# AllVeg.com

Everything vegetarian & vegan: tested recipes, free interactive tools (substitution finder, protein calculator, meal planner, compare hub), evidence-based guides, the 30-Day Challenge, contests, jobs, ambassadors and support tiers. Static site — hosts free on GitHub Pages.

**Live:** https://webworksa1.github.io/allveg-com/ (custom domain: allveg.com once DNS + `CNAME` are set)

## Structure
- `docs/` — the published site (GitHub Pages source). Open `docs/index.html`.
- `src/pages/` — page bodies with JSON front-matter; `tools/build.py` wraps them in the shared layout and writes `docs/`.
- `docs/data/` — `recipes.json`, `articles.json`, `subs.json` (edit these to add content; run the build).
- `docs/assets/js/config.js` — **the only file you need to edit for monetization**: AdSense IDs, YouTube IDs, donation/affiliate links, socials, GA4, form endpoint.
- `BUILD_PROMPT.md` — business concept, research on 36 competitor sites, phase-wise build prompts.

## Build
```
python3 tools/gen_recipes.py   # optional: regenerate recipes.json
python3 tools/build.py         # rebuild docs/*.html + sitemap.xml
```

## Publish on GitHub Pages (free)
Settings → Pages → Source: **Deploy from a branch** → Branch `main`, folder `/docs` → Save. The site is then served at https://webworksa1.github.io/allveg-com/ within a minute or two.

Custom domain: add a `CNAME` file in `docs/` containing `allveg.com`, point the domain's A records at GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) and `www` CNAME at `webworksa1.github.io`, then set the custom domain in Settings → Pages and enable HTTPS.

## Contact & email policy
The top bar on every page links business enquiries to https://web.works/contact. All forms and contact links route to a single inbox that is stored obfuscated in `config.js` and never appears in the HTML/DOM.

## Disclosures
"AllVeg" is used descriptively as a domain name; no trademark is claimed. See `docs/disclaimer.html`.
