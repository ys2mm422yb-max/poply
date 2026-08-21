# Service-Momente

Arbeitsblock 5 macht bestehende Systeme situativ lesbarer, ohne eine zweite Event- oder Minigame-Schleife einzuführen.

## Grundregel

Service-Ruf bleibt der einzige Taktgeber. Immer wenn ein Service-Ruf bereit ist, leitet Poply aus dem aktuellen sichtbaren Spielzustand deterministisch einen kleinen Service-Moment ab. Der Moment empfiehlt einen konkreten Gast und einen vorhandenen Service-Ruf-Weg. Er verschwindet wieder mit dem Ruf.

Es gibt keinen Timer, kein verstecktes RNG, keine neue Currency und keinen separaten Save-State.

## Authored Varianten

- **Stammgast kommt**: Wenn ein sichtbarer Gast bereits Stammgast ist, wird er als kurzfristige Priorität markiert. Die Auszahlung bleibt ausschließlich die bereits existierende Loyalität plus der bestehende Service-Ruf.
- **Kaffee-Tag**: Ein sichtbarer Kaffee-Auftrag empfiehlt `Nachschub`. Während genau dieses Ruf-Ziel aktiv ist, zählt ein Kaffee-Generator-Tap einmal zusätzlich für den vorhandenen Nachschub-Zähler. Es entstehen keine zusätzlichen Coins/Sterne/XP.
- **Sonnenuntergang-Service**: Wenn die Lichter/Abendservice-Fähigkeit vorhanden ist und ein sichtbarer Auftrag ein Service Special hat, wird die bestehende Kombination `Special + Abendservice + Service-Ruf` lesbar priorisiert.
- **Rush Hour**: Fallback für den anspruchsvollsten sichtbaren Auftrag. Ein erfolgreich befolgter Direkt-Ruf lädt über das vorhandene FLOW-System `+1 FLOW`.

Die Auswahl rotiert deterministisch über `callsCompleted + callsExpired` innerhalb der aktuell sinnvollen Varianten. Dadurch entsteht Abwechslung ohne Zufall und ohne einen zweiten Fortschrittszähler.

## UI-Vertrag

- Der Moment erscheint nur bei bereitstehendem Service-Ruf.
- Er nennt `Moment → Gast → empfohlener Ruf-Weg → Nutzen`.
- Die vorhandene Gästekarte wird markiert; `Gast wählen` fokussiert denselben normalen Auftrag.
- Ist der Zielgast fokussiert, wird nur der passende bestehende Service-Ruf-Button als Empfehlung markiert.
- Bei aktivem passenden Ruf sitzt der Moment kompakt im vorhandenen Ruf-Panel.
- Board-Minikarten erhalten keinen neuen Mikrotext; nur das aktive Ziel bekommt einen Rahmen.
- Auf 390×720 wird die erklärende Nebenzeile ausgeblendet, nicht die Entscheidung.
- `prefers-reduced-motion` deaktiviert alle neuen Bewegungen.

## Save/Economy

Service-Momente haben keinen eigenen Persistenzschlüssel und benötigen keinen Save-Version-Bump. Bestehende Saves erhalten die Mechanik automatisch, sobald Service-Ruf bereit ist.

Die bestehenden Coin-/Star-/XP-Tabellen bleiben unangetastet. Der einzige neue Utility-Effekt ist `Rush Hour → +1 FLOW`; Kaffee-Tag verändert ausschließlich den vorhandenen Service-Ruf-Nachschubfortschritt. Stammgast und Sonnenuntergang-Service kombinieren ausschließlich schon existierende Belohnungs-/Power-Systeme.

## QA

`scripts/service-moments-qa.mjs` läuft verpflichtend in Browser QA und prüft WebKit auf 390×844 sowie 390×720:

- Kaffee-Tag ist sichtbar und empfiehlt Nachschub;
- Zielgast und empfohlener bestehender Ruf-Weg sind eindeutig;
- ein Kaffee-Generator-Tap ergibt im passenden Moment exakt `2/2` Nachschub;
- Sonnenuntergang-Service zeigt die bestehende Abendservice-Synergie;
- ein Stammgast erzeugt den authored Stammgast-Moment;
- Reduced Motion, kein Document Scroll, kein Dock-Overlap.

Vor Merge werden die erzeugten `340–346` Screenshots manuell geöffnet und visuell abgenommen.