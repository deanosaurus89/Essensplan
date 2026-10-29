# Essensplan – KaisKantine Arcus Park

Web-App zum Bestellen, Verwalten und Abrechnen des Kantinenessens.
**Live:** https://deanosaurus89.github.io/Essensplan/

- `#kunde` – Kunde wählt Namen und bestellt für seine Anwesenheitstage
- `#kantine` – Ausgabe-/Planungsliste pro Tag (druckbar)
- `#admin` – Speiseplan pflegen, Kunden & Tage, Abrechnung (Druck/CSV), Datenexport

Reines HTML/CSS/JS ohne Build. Lokal: `python3 -m http.server` im Ordner, dann http://localhost:8000.
Daten v1: localStorage im Browser (Export/Import als JSON unter Admin → Daten).
