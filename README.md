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

## Gemeinsame Datenbank (Supabase) – einmalig einrichten
Ohne Einrichtung speichert jeder Browser für sich. Mit Supabase (kostenlos) sehen alle Geräte dieselben Daten:
1. Auf https://supabase.com kostenlos registrieren → **New project** (Region z. B. Frankfurt).
2. Im Projekt **SQL Editor** öffnen, Inhalt von `supabase-setup.sql` einfügen, **Run**.
3. **Project Settings → API**: „Project URL“ und „anon public“ Key kopieren und in `config.js` eintragen, committen, pushen.
4. Seite einmal auf dem Admin-Gerät öffnen: Ist die Datenbank leer, wird der vorhandene Stand (bzw. KW-44-Beispiel) automatisch hochgeladen.

Sync: Änderungen werden sofort gespeichert, andere Geräte aktualisieren sich alle 15 Sekunden. Status oben in der Leiste (☁️/⚠️).
Hinweis: Der anon-Key ist öffentlich; v1 erlaubt damit Lesen/Schreiben für alle, die die Seite kennen.
