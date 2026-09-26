#!/usr/bin/env python3
"""Static site builder for AllVeg.com.
Reads src/pages/*.html (with a small JSON front-matter block), wraps each in the
shared layout (top contact bar, header, nav, footer, lead modal, cookie notice)
and writes finished pages into docs/ — the folder GitHub Pages serves.
Also writes sitemap.xml. Run: python3 tools/build.py
"""
import json, pathlib, re, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "src/pages", ROOT / "docs"
SITE = "https://allveg.com"
TODAY = datetime.date.today().isoformat()

NAV = [
  ("Recipes", "recipes.html", [("All recipes","recipes.html"),("Breakfast","recipes.html?cat=breakfast"),("Lunch","recipes.html?cat=lunch"),("Dinner","recipes.html?cat=dinner"),("Snacks & desserts","recipes.html?cat=dessert"),("High-protein","recipes.html?tag=high-protein"),("Quick (≤20 min)","recipes.html?tag=quick"),("Budget","recipes.html?tag=budget"),("Saved recipes","saved.html")]),
  ("Tools", "tools.html", [("Substitution finder","substitutes.html"),("Protein calculator","protein-calculator.html"),("Meal planner & grocery list","meal-planner.html"),("Compare kits & powders","compare.html")]),
  ("Guides", "guides.html", [("Start here","start-here.html"),("Nutrition","guides.html?cat=Nutrition"),("Meal plans","guides.html?cat=Meal%20Plans"),("Reviews","guides.html?cat=Reviews"),("City guides","city-guides.html"),("Videos","videos.html")]),
  ("Community", "community.html", [("30-Day Challenge","challenge.html"),("Contests & prizes","contests.html"),("Jobs & talent","jobs.html"),("Ambassadors","ambassadors.html"),("Submit a recipe","submit-recipe.html")]),
  ("Partners", "partners.html", None),
  ("Support us", "support.html", None),
]

def nav_html():
    out = []
    for label, href, sub in NAV:
        if sub:
            items = "".join(f'<li><a href="{h}">{l}</a></li>' for l, h in sub)
            out.append(f'<li><a href="{href}" aria-haspopup="true">{label} ▾</a><ul class="sub">{items}</ul></li>')
        else:
            out.append(f'<li><a href="{href}">{label}</a></li>')
    return "".join(out)

LAYOUT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} | AllVeg.com</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{site}/{slug}">
<meta property="og:type" content="website"><meta property="og:site_name" content="AllVeg.com">
<meta property="og:title" content="{title}"><meta property="og:description" content="{description}">
<meta property="og:url" content="{site}/{slug}"><meta property="og:image" content="{site}/assets/img/og.svg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1f6b3a">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<script src="assets/js/config.js"></script>
{head}
</head>
<body>
<div class="topbar">Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership — <a href="https://web.works/contact" data-contact-url rel="noopener">web.works/contact</a></div>
<header class="site-header"><div class="wrap nav">
  <a class="logo" href="index.html" aria-label="AllVeg home"><span class="mark">🌱</span><span>All<b>Veg</b></span></a>
  <button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
  <ul class="menu">{nav}</ul>
  <div class="nav-cta"><a class="btn btn-sm btn-outline" href="newsletter.html">Newsletter</a><a class="btn btn-sm btn-primary" href="challenge.html">Free 30-Day Challenge</a></div>
</div></header>
<main id="main">
{body}
</main>
<footer class="site-footer"><div class="wrap">
  <div class="foot-grid">
    <div><a class="logo" href="index.html" style="color:#fff"><span class="mark">🌱</span><span>All<b style="color:#8dc63f">Veg</b></span></a>
      <p style="margin-top:12px">Everything vegetarian and vegan in one place: 1,000+ recipe ideas, free tools, evidence-based guides and a community that helps you stick with it.</p>
      <div class="social-row"><a data-social="youtube" href="#" aria-label="YouTube">YT</a><a data-social="instagram" href="#" aria-label="Instagram">IG</a><a data-social="pinterest" href="#" aria-label="Pinterest">PIN</a><a data-social="tiktok" href="#" aria-label="TikTok">TT</a><a data-social="facebook" href="#" aria-label="Facebook">FB</a><a data-social="x" href="#" aria-label="X">X</a></div></div>
    <div><h4>Explore</h4><ul><li><a href="recipes.html">Recipes</a></li><li><a href="guides.html">Guides</a></li><li><a href="videos.html">Videos</a></li><li><a href="city-guides.html">City guides</a></li><li><a href="compare.html">Compare</a></li><li><a href="saved.html">Saved recipes</a></li></ul></div>
    <div><h4>Tools</h4><ul><li><a href="substitutes.html">Substitution finder</a></li><li><a href="protein-calculator.html">Protein calculator</a></li><li><a href="meal-planner.html">Meal planner</a></li><li><a href="challenge.html">30-Day Challenge</a></li><li><a href="newsletter.html">Newsletter</a></li></ul></div>
    <div><h4>Community</h4><ul><li><a href="contests.html">Contests & prizes</a></li><li><a href="jobs.html">Jobs & talent</a></li><li><a href="ambassadors.html">Ambassadors</a></li><li><a href="submit-recipe.html">Submit a recipe</a></li><li><a href="support.html">Donate / Support</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="about.html">About</a></li><li><a href="partners.html">Advertise & partner</a></li><li><a href="contact.html">Contact</a></li><li><a href="privacy.html">Privacy</a></li><li><a href="terms.html">Terms</a></li><li><a href="disclaimer.html">Disclosures</a></li></ul></div>
  </div>
  <div class="foot-bottom"><span>© <span data-year></span> AllVeg.com. All rights reserved. "AllVeg" is used descriptively as a domain name; see <a href="disclaimer.html">trademark &amp; copyright disclosure</a>.</span><span>Content is for general information only and is not medical advice.</span></div>
</div></footer>
<div class="modal" id="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lm-title">
  <div class="box"><button class="close" aria-label="Close">×</button>
    <span class="eyebrow">Free download</span><h3 id="lm-title">Get the AllVeg Starter Kit</h3>
    <p class="muted">20 quick high-protein recipes, a pantry checklist and the 7-day plan — free, plus one useful email a week.</p>
    <form class="form" data-form="Starter Kit (popup)"><div class="honey"><input name="_gotcha" tabindex="-1" autocomplete="off"></div>
      <input type="email" name="email" placeholder="you@example.com" required aria-label="Email">
      <button class="btn btn-primary btn-block" type="submit">Send me the kit</button>
      <div class="alert"></div><p class="form-note">No spam. Unsubscribe any time.</p></form>
  </div></div>
<div class="cookie" id="cookie">We use cookies for analytics and to show ads that keep AllVeg free. <a href="privacy.html">Privacy</a> <button class="btn btn-sm btn-primary" style="margin-left:8px">OK</button></div>
<div class="sticky-bar"><span>🌱 Start the free 30-Day AllVeg Challenge</span><a class="btn btn-sm btn-lime" href="challenge.html">Join free</a></div>
<script src="assets/js/site.js"></script>
{scripts}
</body>
</html>"""

def build():
    pages = []
    for f in sorted(SRC.glob("*.html")):
        txt = f.read_text(encoding="utf-8")
        m = re.match(r"^---\n(.*?)\n---\n(.*)$", txt, re.S)
        meta = json.loads(m.group(1)); body = m.group(2)
        html = LAYOUT.format(title=meta["title"], description=meta["description"], site=SITE, slug=f.name if f.name != "index.html" else "",
                             nav=nav_html(), body=body, head=meta.get("head", ""), scripts=meta.get("scripts", ""))
        (OUT / f.name).write_text(html, encoding="utf-8")
        if meta.get("sitemap", True): pages.append((f.name, meta.get("priority", "0.6")))
        print("built", f.name)
    urls = "".join(f"<url><loc>{SITE}/{'' if n=='index.html' else n}</loc><lastmod>{TODAY}</lastmod><priority>{p}</priority></url>" for n, p in pages)
    recipes = json.loads((OUT / "data/recipes.json").read_text())
    urls += "".join(f"<url><loc>{SITE}/recipe.html?id={r['id']}</loc><lastmod>{TODAY}</lastmod><priority>0.7</priority></url>" for r in recipes)
    arts = json.loads((OUT / "data/articles.json").read_text())
    urls += "".join(f"<url><loc>{SITE}/article.html?id={a['id']}</loc><lastmod>{a['date']}</lastmod><priority>0.7</priority></url>" for a in arts)
    (OUT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>')
    print("sitemap:", len(pages) + len(recipes) + len(arts), "urls")

if __name__ == "__main__":
    build()
