# Langzeitmotivation — Arbeitsblock 6

Arbeitsblock 6 ist der Abschluss der verbindlichen 1→6-Produktionssequenz aus Issue #42. Ziel ist mehr langfristige Bindung ohne zweite Meta-Spielwelt.

## Generator-Meisterschaft

Poply verwendet **keinen neuen Save-State**. Generatoren besitzen bereits einen `taps`-Zähler für ihre echte Nutzung. `aaa-generator-mastery.js` liest ausschließlich diesen vorhandenen Wert und leitet vier sichtbare Stufen ab:

- Neu: 0–7 Nutzungen
- Vertraut: ab 8
- Geübt: ab 24
- Meister: ab 50

Die Meisterschaft ist bewusst Sammlung/Identität, **kein Economy-Buff**. Sie vergibt keine Coins, Sterne, XP, Energie oder neue Currency. Alte Saves sind automatisch kompatibel, weil vorhandene Generator-Taps direkt weiterverwendet werden.

## Collection Book

Das Collection Book bleibt der einzige Ort für Unbekanntes. Noch nicht entdeckte Item-Stufen dürfen hier als Silhouette und `???` erscheinen. Aktive Aufträge zeigen weiterhin konkrete benötigte Items und niemals einen `?`-/`???`-Platzhalter.

Bekannte Generatoren zeigen im bestehenden Weltbereich ihre Mastery-Stufe und Fortschritt; gemeisterte Generatoren bekommen einen kleinen goldenen Abschlusszustand. Es gibt keinen weiteren Tab und kein separates Mastery-Menü.

## Tagesgeschichten

Die Daily-Mechanik, Zieltypen, Zielwerte und Belohnungen bleiben unverändert. `aaa-daily-story.js` rahmt denselben Tag deterministisch anhand von **lokalem Tages-Key + aktivem Place** als kleine Geschichte, z. B. Morgenandrang, Goldene Stunde oder Ernte-Tag.

Der Daily-Ribbon zeigt den Story-Titel; das bestehende Sheet erklärt den Tag kurz und formuliert die vorhandenen Ziele natürlicher. Es bleibt ausdrücklich: kein Streak, keine Strafe, kein FOMO.

## Vollständige Poply-Welt

Sind alle 18 Ausbauten der drei Places gebaut, ersetzt der Place-Abschluss die bisherige Sackgasse durch einen kompakten Payoff: alle drei Places restauriert, Item-Sammlungsfortschritt und gemeisterte bekannte Generatoren. Danach verweist der Text auf die bestehenden Langzeitpfade Sammlung, Generator-Meisterschaft und Tagesgeschichten.

Es gibt dafür keine zusätzliche Abschluss-Currency und keinen versteckten Reward-Table-Eingriff.

## Evaluierte kosmetische Place-Wahlen

Kleine rein visuelle Place-Wahlmenüs wurden bewusst **nicht** eingeführt. Sie würden zusätzlichen Save-State, UI-Chrome und Entscheidungsschein erzeugen, ohne das Gameplay zu verändern. Block 6 stärkt stattdessen den sichtbaren Abschlusszustand der bereits authored Places. Eine spätere Place-Wahl sollte erst dann gebaut werden, wenn jede Option eine echte spielerische Konsequenz oder klaren Ausdruck mit vertretbarer Persistenz besitzt.

## QA

`scripts/long-term-qa.mjs` läuft verpflichtend in Browser QA auf 390×844 und 390×720 und prüft:

- Generator-Meisterschaft aus realen vorhandenen Taps;
- Collection-Silhouetten und kein `???` im aktiven Auftrag;
- Daily Story im Ribbon und Sheet;
- vollständigen Welt-Payoff;
- Reduced Motion, kein Document Scroll und kein Dock-Overlap.

Vor Merge werden die sechs Screenshots `360–365` manuell geöffnet und visuell abgenommen. Zusätzlich müssen CI, Browser QA, PWA Update QA und Place03 QA auf exakt demselben PR-Head grün sein.
