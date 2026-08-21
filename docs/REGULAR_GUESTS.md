# Gäste & Stammgäste

## Purpose
Arbeitsblock 3 verbindet die bereits vorhandenen Gast-, Loyalty- und Preference-Systeme zu einer verständlichen Personenschicht: Ein Auftrag gehört sichtbar zu einem Gast, dessen Vorliebe und nächster Loyalty-Payoff lesbar sind; bereits bediente Gäste tauchen außerdem als konkrete Personen im Café auf.

## Guest identities
- Mika — `Kombi`: mag Aufträge mit mehreren Komponenten.
- Nora — `Kaffee`: freut sich besonders über Kaffee-Aufträge.
- Sam — `Vielfalt`: mag Aufträge aus mehreren Produktfamilien.

Die bestehenden Trait-Boni bleiben unverändert und werden weiterhin erst über die Menüwand freigeschaltet. Block 3 erfindet keine zusätzlichen Bonuswerte.

## Loyalty contract
Die vorhandenen automatischen Meilensteine bleiben exakt:
- 1 Besuch → `Bekannt` → +25 Coins
- 5 Besuche → `Stammgast` → +100 Coins
- 12 Besuche → `Lieblingsgast` → +250 Coins

Im fokussierten Auftrag steht kompakt Gast + Preference sowie der Weg zum nächsten Loyalty-Payoff, z. B. `Nora · Kaffee` und `2/5 → +100 ●`. Die Board-Auftragsleiste bleibt unverändert kompakt und erhält keinen zusätzlichen Beschreibungstext.

## Living Place contract
`guestVisits` bleibt die einzige Persistenzquelle. `regularGuestsForPlace()` leitet daraus deterministisch bis zu drei sichtbare Café-Stammgäste ab:
1. mehr Besuche zuerst;
2. bei Gleichstand stabile Reihenfolge Mika → Nora → Sam;
3. Gäste mit 0 Besuchen erscheinen nicht als benannte Stammgäste.

Die existierende Living-Place-Szene wird weiterverwendet. Bediente Gäste erhalten stabile Identitätsakzente und sichtbare Namens-/Rangschilder. Es gibt keine neue Save-Version, keinen Recency-Zeitstempel und keine Zufallsauswahl.

## Non-goals
- keine neuen Loyalty-Rewards oder Economy-Werte;
- keine separate Gäste-Seite oder neue Navigation;
- keine Timer/FOMO/RNG;
- kein Backend/Neon;
- keine Änderung an Requirements, Order-Rewards, Service-Ruf, FLOW oder Place Powers.

## QA
Der dedizierte WebKit-Gate `regular-guests-qa.mjs` prüft 390×844 und 390×720:
- fokussierter Auftrag zeigt Gast, Preference, Loyalty-Rang und nächsten Payoff ohne Clipping;
- Theme-Story, Requirements und primäre Aktion bleiben lesbar;
- die Café-Szene zeigt für einen deterministischen Seed Mika/Nora/Sam entsprechend `guestVisits` als konkrete Stammgäste;
- Namens-/Rangschilder sind sichtbar;
- kein Document-Scroll und keine Dock-Überlappung.

Kanonische Screenshots:
- `350-regular-guest-order-390x844.png`
- `350-regular-guest-order-390x720.png`
- `351-regular-guests-place-390x844.png`
- `351-regular-guests-place-390x720.png`