/* =====================================================================
   AllVeg.com — single source of truth for site-wide settings.
   Edit THIS file to change monetization IDs, links and integrations.
   ===================================================================== */
window.ALLVEG = {
  siteName: "AllVeg",
  domain: "AllVeg.com",
  tagline: "Everything vegetarian & vegan — recipes, tools, guides and community.",
  // Absolute URL used for canonical/OG tags once the custom domain is live.
  siteUrl: "https://allveg.com",

  // Contact route for domain / sponsorship / advertising / partnership enquiries.
  contactUrl: "https://web.works/contact",

  // The site's only inbox, stored obfuscated so it is never present in
  // plain text anywhere in the HTML or JS. Assembled at click time only.
  // (reversed + base64). Never write the address itself into any file.
  mailToken: "bW9jLmxpYW1nQDFhc2tyb3diZXc=",

  // Optional: a form backend (Formspree / FormSubmit / Basin / Getform).
  // Leave empty to fall back to the visitor's own email client.
  formEndpoint: "",

  // ---------- Google AdSense ----------
  adsense: {
    enabled: true,
    client: "ca-pub-XXXXXXXXXXXXXXXX",     // <- replace with your publisher ID
    slots: {
      leaderboard: "1111111111",
      inArticle:   "2222222222",
      sidebar:     "3333333333",
      footer:      "4444444444",
      multiplex:   "5555555555"
    }
  },

  // ---------- YouTube ----------
  youtube: {
    channelUrl: "https://www.youtube.com/@allveg",
    // Video IDs shown on the Videos page and inside recipes/guides.
    // Replace with your own uploads; thumbnails load from img.youtube.com.
    featured: [
      { id: "REPLACE_VIDEO_ID_1", title: "5 High-Protein Vegetarian Dinners in 20 Minutes" },
      { id: "REPLACE_VIDEO_ID_2", title: "Vegan Egg Substitutes: Tested & Ranked" },
      { id: "REPLACE_VIDEO_ID_3", title: "The 30-Day AllVeg Challenge — Week 1 Meal Prep" },
      { id: "REPLACE_VIDEO_ID_4", title: "Best Plant-Based Protein Powders Compared" },
      { id: "REPLACE_VIDEO_ID_5", title: "Restaurant-Style Paneer Butter Masala at Home" },
      { id: "REPLACE_VIDEO_ID_6", title: "Vegan Meal Kits Ranked: Purple Carrot vs Veestro" }
    ]
  },

  // ---------- Donations / support ----------
  support: {
    paypal:   "https://www.paypal.com/donate/?hosted_button_id=REPLACE",
    kofi:     "https://ko-fi.com/allveg",
    bmac:     "https://www.buymeacoffee.com/allveg",
    github:   "https://github.com/sponsors/webworksa1",
    stripeMonthly: {
      supporter: "https://buy.stripe.com/REPLACE_supporter",
      member:    "https://buy.stripe.com/REPLACE_member",
      business:  "https://buy.stripe.com/REPLACE_business"
    }
  },

  // ---------- Affiliate links (comparison pages) ----------
  affiliate: {
    amazonTag: "allveg-20",
    purpleCarrot: "https://www.purplecarrot.com/",
    veestro: "https://www.veestro.com/",
    thriveMarket: "https://thrivemarket.com/",
    forksPlanner: "https://www.forksmealplanner.com/"
  },

  // ---------- Social ----------
  social: {
    youtube:   "https://www.youtube.com/@allveg",
    instagram: "https://www.instagram.com/allveg",
    pinterest: "https://www.pinterest.com/allveg",
    tiktok:    "https://www.tiktok.com/@allveg",
    facebook:  "https://www.facebook.com/allveg",
    x:         "https://x.com/allveg"
  },

  // ---------- Analytics ----------
  ga4: "" // e.g. "G-XXXXXXXXXX" — leave empty to disable
};
