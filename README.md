# Bugetul Meu — aplicație Angular pentru finanțe personale

Proiect **Angular 20 standalone**, responsive (desktop + telefon), în limba română.

## Pornire
1. Instalează Node.js (o versiune compatibilă Angular 20, de exemplu Node 22 LTS).
2. Deschide acest folder în VS Code.
3. În terminal rulează `npm install`.
4. Rulează `npm start`.
5. Deschide `http://localhost:4200`.

## Ce poți face
- Dashboard cu sold total, venituri, cheltuieli, diferență lunară, evoluție pe 6 luni și categorii.
- Adăugare, editare, ștergere tranzacții (venituri, cheltuieli, transferuri).
- Căutare și filtrare după lună, tip, categorie și cont.
- Conturi multiple, sold inițial, sold actual calculat și transferuri între conturi.
- Bugete lunare pe categorii, limite și progres.
- Mod luminos/întunecat, export CSV, backup/import JSON.
- Date demonstrative la prima deschidere; buton **Începe de la zero**.

## Stocare și confidențialitate
Această versiune este **doar frontend**: salvează datele în `localStorage` (în browser și pe dispozitiv). Nu are server, nu sincronizează automat între dispozitive și nu are autentificare. Nu stoca parole bancare sau informații de card. Fă regulat backup JSON din **Setări**. Dacă ștergi datele browserului sau folosești alt dispozitiv, datele nu vor apărea automat acolo. Pentru sincronizare sigură între dispozitive, pasul următor este un backend FastAPI + PostgreSQL cu autentificare și HTTPS.

## Publicare / telefon
`npm run build` generează fișierele de producție din `dist/bugetul-meu/browser/`. Acestea pot fi publicate pe o găzduire statică cu fallback pentru rutele SPA. Proiectul este responsive și funcționează în browserul telefonului. Include manifest și service worker de bază pentru instalare ca PWA. Instalarea necesită HTTPS (sau localhost). Resursele vizitate se păstrează în cache pentru utilizare offline; prima încărcare necesită internet.

## Atenție
Soldul conturilor ține cont de **toate tranzacțiile din toate lunile**, nu doar luna selectată. Veniturile și cheltuielile de pe dashboard sunt doar pentru luna selectată. Bugetele sunt limite repetate lunar (nu istoricul limitelor pe fiecare lună).
