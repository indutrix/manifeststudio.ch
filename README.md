<div align="center">

# ✦ Manifest Studio

**Website for a manicure & nail care studio in Wattwil, Switzerland**

[![Live site](https://img.shields.io/badge/live-manifeststudio.ch-e8a3b8?style=flat-square)](https://manifeststudio.ch)
![Stack](https://img.shields.io/badge/stack-HTML%20%C2%B7%20CSS%20%C2%B7%20vanilla%20JS-444?style=flat-square)
![Dependencies](https://img.shields.io/badge/dependencies-none-success?style=flat-square)
![Languages](https://img.shields.io/badge/languages-DE%20%C2%B7%20PL%20%C2%B7%20EN%20%C2%B7%20RU%20%C2%B7%20UK-blue?style=flat-square)

</div>

---

## About

Manifest Studio is the portfolio and booking website of **Karolina**, a nail technician with over ten years of experience, based in Wattwil (canton of St. Gallen, Switzerland). The site presents her services and prices, shows her work, collects client reviews, and makes it easy to get in touch.

The design is soft and personal: a full-screen hero with a scroll-driven reveal, delicate floating flower and sparkle accents, and a calm pastel palette. Everything is hand-written static HTML, CSS and JavaScript — no frameworks, no build step, no trackers.

🔗 **Live site:** [manifeststudio.ch](https://manifeststudio.ch)

## Features

- **Five languages** — German (default), Polish, English, Russian and Ukrainian, switchable from the header. The chosen language is kept in the URL (`?lang=pl`), so links can be shared in any language.
- **Services & prices page** — a dedicated page listing every treatment (classic, gel, hybrid/shellac, extensions, lamination, nail art) with what is included.
- **Scroll-driven hero** — headline and decorations reveal as you scroll; the text block scales to fit the visible viewport on every screen size, including small laptops and phones.
- **Parallax decorations** — small flower and sparkle graphics drift at different speeds for depth.
- **Work gallery** — a showcase of previous nail designs.
- **Client reviews** — screenshots of real client messages, opening full size in a new tab.
- **Instagram feed** — an embedded profile preview.
- **Booking dialog** — one tap opens a native `<dialog>` with every way to reach the studio: WhatsApp, phone, Instagram and e-mail.
- **Google Maps** — an embedded map and a directions link for the studio address.
- **Floating contact buttons** — quick call and e-mail shortcuts that stay within reach.
- **Accessible by design** — skip link, semantic landmarks, keyboard-friendly menu and dialog (Escape and focus handling), ARIA labels in every language, and `prefers-reduced-motion` support that disables the animations.
- **Fast** — optimised WebP images (about 1.6 MB for the whole site), lazy-loaded media, and a preloaded hero image.

## Project structure

```
manifeststudio.ch/
├── index.html          # Home page: hero, about, benefits, services, gallery,
│                       #   training, Instagram, reviews, contact
├── prices.html         # Services & prices page
├── style.css           # All styles (responsive, with reduced-motion rules)
├── content.js          # Behaviour: language switching, menu, booking dialog,
│                       #   hero animation, parallax, map and Instagram embeds
├── translations.js     # All page text in DE / PL / EN / RU / UK
├── studio-config.js    # Public settings: address, Instagram, photos, reviews
├── icons.svg           # SVG icon sprite
├── favicon.svg
├── images/             # Optimised WebP images (work, reviews, decorations)
├── _archiwum/          # Archived logo drafts and image sources (not used by the live site)
└── CNAME               # Custom domain for static hosting
```

## Running locally

There is nothing to install. Because the site is plain static files, any local web server will do:

```bash
# from the repository root
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Add `?lang=en` to the address to preview another language.

> Opening `index.html` directly from disk also works, but a local server is closer to how the site behaves in production.

## Customising

### Studio details — `studio-config.js`

Public information lives in one small file, so common updates need no changes to the page itself:

```js
window.manifestStudio = {
  address: 'Wilerstrasse, 9630 Wattwil', // enables the map and directions
  instagram: 'manifest.studio.ch',        // username, without @
  owner: { image: 'images/profilepicture.webp' },
  reviews: [
    { image: 'images/opinia1.webp', alt: { de: '…', pl: '…', en: '…' } },
  ],
};
```

> ⚠️ This file is served to every visitor. Keep it to public content only — never put API keys or access tokens in it.

### Text and translations — `translations.js`

Every visible string is stored once per language, under a key that matches the `data-t="…"` attribute in the HTML. To change a sentence, edit it in each language block. To add a language, add a new block and a matching button in the language picker.

### Images

Use WebP files and keep the `width` and `height` attributes in the HTML, so the layout does not shift while images load.

## Deployment

The site is a set of static files and can be hosted anywhere that serves static content (GitHub Pages, Netlify, Cloudflare Pages, or classic web hosting). The `CNAME` file points the custom domain `manifeststudio.ch` at the host.

Stylesheet and script links carry a version query (for example `style.css?v=20261013-1915`). **Bump that value whenever you change the file**, so visitors' browsers fetch the update instead of using a cached copy.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari, on desktop and mobile. The page uses the native `<dialog>` element, `IntersectionObserver` and CSS custom properties.

## License

© Manifest Studio. All rights reserved. The code, text, graphics and photographs in this repository may not be copied, reused or redistributed without written permission.
