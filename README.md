# Essensplan – KaisKantine Arcus Park

Web-App zum Bestellen, Verwalten und Abrechnen des Kantinenessens.
**Live:** https://deanosaurus89.github.io/Essensplan/

- `#kunde` – Kunde wählt Namen und bestellt für seine Anwesenheitstage
- `#kantine` – Ausgabe-/Planungsliste pro Tag (druckbar)
- `#admin` – Speiseplan pflegen, Kunden & Tage, Abrechnung (Druck/CSV), Datenexport

Reines HTML/CSS/JS ohne Build. Lokal: `python3 -m http.server` im Ordner, dann http://localhost:8000.
Daten v1: localStorage im Browser (Export/Import als JSON unter Admin → Daten).

## Admin-Passwort
`#admin` ist mit einem Passwort geschützt (Standard: `Kantine2026!`). Ändern: `printf 'NeuesPasswort' | sha256sum` ausführen und den Hash in `app.js` bei `ADMIN_PW_HASH` eintragen.
**Hinweis:** Rein clientseitiger Schutz – hält Neugierige ab, ist aber keine echte Sicherheit (Code ist öffentlich, Daten liegen im Browser).
