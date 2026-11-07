# Demo Website — Decision Ledger

Isolierte Kopie der offiziellen Marketing-Site (asas-mind.com), Stand Mirror-Erstellung.

## Zweck
- Parallel zur Live-Site umbauen, ohne asas-mind.com anzufassen
- Treuer Ausgangspunkt: gleiche Struktur, Styles, Assets, Interaktionen
- `noindex` — nicht für SEO/Produktion

## Beibehalten (von asas-mind.com)
- Seitenstruktur: Hero, Proof, Produkt, Share Studio, Community, Pricing, FAQ, Footer
- Unterseiten: Über ASAS, Affiliate, Abo verwalten, Artikel
- CSS/JS: site.css, hero-slides.css, below-hero.css, site.js, below-hero.js, config.js
- Wordmark, Hero-Focus-SVGs, Share-Studio-Bilder, Community-Asset
- Checkout- und App-Links zeigen auf Produktion (`asas-mind.com/checkout`, `app.asas-mind.com`)

## Neu / isoliert
- Route-Prefix `/demo-website`
- Assets unter `public/demo-website/`
- Public-Access in `app/server/route-access.ts`
- Clean-URL Rewrites in `next.config.ts`
- Vercel Insights entfernt
- Canonical durch noindex ersetzt

## Unberührt
- Live asas-mind.com
- App-Produktion (`app/page.tsx`, Buy, Auth, DB)
- Bestehende React-Demos `/demo-oktober` und `/demo-protokoll`

## Umbau-Pfad
1. `/demo-website` Homepage = React Part-1 Umbau (`app/demo-website/`)
2. Mirror-Unterseiten bleiben unter `public/demo-website/*/index.html`
3. Erst dann Live-Site ersetzen — nicht umgekehrt

## Part 1 (Brand + Shop Hero)
- Brand-Hero: geblurrtes Tisch-Foto (`hero/asas-auf-tisch-*.jpg`), Wordmark groß mittig, Tagline „Das System gegen Stillstand“ (Outfit/SVG), CTAs näher am Logo, Radius ~9px (kein Billig-Pill)
- Product-Hero: Farbübergang Brand-Ende → helles warmes Paper; physische Produkt-Komposition (Stage + Ground + Info); Titel „ASAS Execution System“; Ink-CTA mit Preis-Typo; Copy linksbündig
- Direction: fokussiert, ruhig, luxuriös, clean — Section für Section
- Below Product (Shop-Flow): System, Dual-Marquee Proof, Pains-Widgets, Stories (tiefe Experiences aus Live), Share Studio (echte Share-Assets), Community + Affiliate, Qualify („Nichts für jeden“), Origin/Founder, Pricing, FAQ, Footer
- Richtung: neue Brand-/Shop-Hülle + Inhalts-Tiefe der alten Live-Site
- Foto-Platzhalter: `public/demo-website/placeholders/experience-0x.svg` → später durch echte Bilder ersetzen
- Homepage-Rewrite entfernt; React-Route übernimmt `/demo-website`
- Alter Mirror-Homepage umbenannt zu `_mirror-homepage.html` (sonst überschreibt `public/` die React-Route)
