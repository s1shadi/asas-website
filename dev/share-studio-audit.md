# Share Studio Audit (F-11)

**Datum:** 2026-08-31  
**Scope:** Read-only Audit + Extension-Fix für aktive Layer-Bilder

---

## Aktive CSS-Referenzen (`below-hero.css`)

| CSS-Klasse | Datei (nach Fix) | Verwendung |
|------------|------------------|------------|
| `.share-moment--left` | `share-layer-left.jpg` | Hintergrund links |
| `.share-moment--right` | `share-layer-right.jpg` | Hintergrund rechts |
| `.share-moment--front` | `share-layer-middle.jpg` | Vordergrund-Moment |

---

## Dateiformat vs. Extension (`file`)

| Datei | Extension | Tatsächliches Format | Abmessungen | Größe |
|-------|-----------|---------------------|-------------|-------|
| `share-layer-left.jpg` | `.jpg` | JPEG | 576×1024 | ~169 KB |
| `share-layer-middle.jpg` | `.jpg` | JPEG | 576×1024 | ~71 KB |
| `share-layer-right.jpg` | `.jpg` | JPEG | 576×1024 | ~122 KB |
| `share-layer-01.jpg` | `.jpg` | **PNG** (Mismatch) | 1024×1536 | ~2.0 MB |
| `share-layer-01.svg` … `07.svg` | `.svg` | SVG Platzhalter | — | ~0.7–0.9 KB |

**Fix angewendet:** `share-layer-left.png`, `share-layer-middle.png`, `share-layer-right.png` → `.jpg` umbenannt, CSS-URLs aktualisiert. Kein Bildinhalt geändert.

**Offen:** `share-layer-01.jpg` ist PNG mit `.jpg`-Extension — wird derzeit **nicht** in CSS referenziert (nur SVG-Platzhalter 01–07 existieren parallel).

---

## Live Content-Type (curl HEAD, asas-mind.com, 2026-08-31)

| Datei (live) | HTTP | Content-Type | Content-Length | Anmerkung |
|--------------|------|--------------|----------------|-----------|
| `share-layer-left.png` | 200 | `image/png` | 172765 | Extension `.png`, Datei ist JPEG — MIME falsch |
| `share-layer-middle.png` | 200 | `image/png` | 73064 | Extension `.png`, Datei ist JPEG — MIME falsch |
| `share-layer-right.png` | 200 | `image/png` | 124567 | Extension `.png`, Datei ist JPEG — MIME falsch |

Lokal nach Rename: `.jpg`-Dateien; Live noch `.png`-Pfade bis Deploy.

---

## Mobile Crop-Regeln (`below-hero.css`)

| Breakpoint | Verhalten |
|------------|-----------|
| `@media (max-width: 768px)` | `.share-moment--back { display: none }` — nur 3 sichtbare Layer |
| `@media (max-width: 768px)` | Front: zentriert `260×334px`, `top: 70px` |
| `@media (max-width: 768px)` | Left: `210×270px`, `left: -76px` (teilweise off-canvas) |
| `@media (max-width: 768px)` | Right: `215×276px`, `right: -78px` (teilweise off-canvas) |
| `@media (max-width: 760px)` | Stage-Höhe `470px`, `padding-top: 72px` |
| `background-size: cover` + `background-position` | Left: `center bottom`; Right: `center 58%`; Front: `center bottom` |

**390px Viewport:** Side-Layer bewusst an den Rand geschoben (negative left/right) für Überlapp-Effekt; Overflow muss im Browser-Smoke geprüft werden.

---

## Empfehlung

- Extension-Fix für die drei aktiven Layer: **erledigt**
- `share-layer-01.jpg` PNG→JPG-Rename optional, wenn Datei künftig produktiv genutzt wird
- SVG-Platzhalter 02–07 können entfernt werden, sobald finale Assets eingebunden sind (nicht Teil dieses Audits)
