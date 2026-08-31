# Datenschutz – Änderungsvorschlag (Phase 5 Audit F-06)

**Status:** Entwurf zur manuellen Rechtsprüfung — **nicht veröffentlicht**  
**Bezugsdateien:** `datenschutz.html`, `datenschutz/index.html`, `checkout.js`, `below-hero.js`, `check/index.html`, `config.js`  
**Stand Codebasis:** 2026-08-31

---

## Bereits abgedeckt (kein Zwang zur Ergänzung)

| Thema | Ist-Zustand |
|-------|-------------|
| Whop (Zahlung/Auftragsverarbeitung) | Abschnitt 4 „Bezahlung“ + Abschnitt 5 nennt Whop Inc. als Auftragsverarbeiter |
| Vercel (Hosting) | Abschnitt 5 nennt Vercel Inc. als Auftragsverarbeiter für Webseitenbetrieb |

---

## Vorschlag 1 — Whop Embedded Checkout auf `/checkout/`

**Lücke:** Die Datenschutzerklärung beschreibt Zahlungsverarbeitung generisch, nicht das **eingebettete Whop-Checkout-Widget** (`checkout.js` lädt `https://js.whop.com/static/checkout/loader.js`, Container `#whop-embedded-checkout`).

**Vorgeschlagene Ergänzung** (neuer Unterabschnitt unter Abschnitt 4 oder Erweiterung Abschnitt 5):

> Beim Abschluss eines Abonnements über unsere Checkout-Seite (`/checkout/`) binden wir ein Zahlungsformular von Whop Inc. direkt in unsere Webseite ein. Dabei können Cookies, Local Storage oder vergleichbare Technologien des Zahlungsanbieters gesetzt werden, und personenbezogene Daten (z. B. Name, E-Mail-Adresse, Zahlungsdaten) werden direkt an Whop übermittelt. Welche Daten Whop verarbeitet, entnehmen Sie bitte der Datenschutzerklärung von Whop.

**BLOCKED_MANUAL_LEGAL:** Rechtsgrundlage, ob Einwilligung oder Vertragsschluss allein ausreicht, und ob ein Verweis auf Whop-Datenschutz ohne AVV-Details ausreicht — durch Rechtsberatung klären.

---

## Vorschlag 2 — Affiliate-Parameter `a` / sessionStorage

**Lücke:** `below-hero.js` (`captureAffiliate`) und `checkout.js` speichern den URL-Parameter `a` in `sessionStorage` unter `asas-affiliate` und reichen ihn an Checkout-URLs bzw. Whop (`whopCheckoutAffiliateCode`) weiter. In der Datenschutzerklärung fehlt eine Erwähnung.

**Vorgeschlagene Ergänzung** (neuer Abschnitt, z. B. „Affiliate-Zuordnung“):

> Wenn Sie unsere Webseite über einen Affiliate-Link mit dem Parameter `a` aufrufen, speichern wir diesen Wert vorübergehend in Ihrem Browser (sessionStorage), um eine Zuordnung beim Checkout zu ermöglichen. Der Wert wird beim Aufruf unserer Checkout-Seite an den Zahlungsdienstleister Whop weitergegeben, soweit ein Affiliate-Code übermittelt wird.

**BLOCKED_MANUAL_LEGAL:**
- Rechtsgrundlage (berechtigtes Interesse vs. Einwilligung)
- Speicherdauer / Löschung bei sessionStorage-Ende
- Ob Affiliate-Zuordnung als personenbezogene Verarbeitung einzuordnen ist, wenn nur ein Code ohne direkte Identifikation gespeichert wird

---

## Vorschlag 3 — Vercel Web Analytics (`/_vercel/insights/`)

**Lücke:** `check/index.html` lädt `/_vercel/insights/script.js` und sendet Events über `window.va(...)`. Die Datenschutzerklärung erwähnt Vercel nur als Hosting-Auftragsverarbeiter, **nicht** als Web-Analytics-Dienst.

**Vorgeschlagene Ergänzung** (Erweiterung Abschnitt 2 oder neuer Abschnitt „Web-Analyse“):

> Auf der Seite `/check/` setzen wir Vercel Web Analytics ein, um Seitenaufrufe und anonymisierte Nutzungsereignisse (z. B. Start und Abschluss des 7-Minuten-Checks) auszuwerten. Anbieter ist Vercel Inc. Es werden dabei keine Cookies zu Werbezwecken gesetzt; die Verarbeitung dient der Reichweiten- und Nutzungsmessung unseres kostenlosen Checks.

**BLOCKED_MANUAL_LEGAL:**
- Ob Vercel Analytics auf `/check/` als Auftragsverarbeitung unter Abschnitt 5 ausreichend abgedeckt ist oder eigener Abschnitt mit Rechtsgrundlage nötig
- Ob IP-Adressen / Gerätekennungen verarbeitet werden (Vercel-Dokumentation prüfen)
- Ob Opt-out-Hinweis oder Widerspruchsmöglichkeit erforderlich ist
- Gilt Analytics nur für `/check/` — andere Seiten der Salespage laden derzeit kein `/_vercel/insights/script.js`

---

## Nicht vorschlagen (bewusst ausgelassen)

- Konkrete Aufbewahrungsfristen für Affiliate-Codes (nicht im Code definiert)
- Drittlandgarantien / Standardvertragsklauseln für Whop oder Vercel Analytics (bereits teilweise in Abschnitt 5 implizit — **BLOCKED_MANUAL_LEGAL**)
- Erfindung neuer Rechtsgrundlagen oder Fristen ohne Rechtsberatung

---

## Checkliste vor Veröffentlichung

- [ ] Rechtsberatung zu allen `BLOCKED_MANUAL_LEGAL`-Punkten
- [ ] Whop-Datenschutz-URL verlinken
- [ ] Vercel Analytics-Dokumentation gegen Ist-Nutzung abgleichen
- [ ] `datenschutz.html` und `datenschutz/index.html` synchron aktualisieren
- [ ] Versionsdatum in Impressum/Datenschutz anpassen
