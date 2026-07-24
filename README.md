# Libris — Bibliothèque (React)

> **Application web de gestion de bibliothèque (Libris) construite avec React 19, Tailwind CSS et Node.js/Express.**
> **Permet la gestion complète des livres, membres et emprunts avec une API RESTful connectée à une base SQLite, le tout prêt à déployer.**

Projet React (Vite) généré à partir du design Stitch, avec Tailwind CSS et React Router.

## Structure

```
src/
├── components/
│   ├── Sidebar.jsx   → navigation latérale partagée (état actif dynamique)
│   └── Layout.jsx     → enveloppe Sidebar + contenu de page
├── pages/
│   ├── Login.jsx
│   ├── HomeDashboard.jsx
│   ├── BooksList.jsx
│   ├── AddEditBook.jsx
│   ├── BookDetails.jsx
│   ├── Members.jsx
│   ├── AddMember.jsx
│   ├── Borrowings.jsx
│   ├── AddBorrowing.jsx
│   └── Profile.jsx
└── App.jsx            → toutes les routes
```

## Routes

| Route             | Page                      |
| ----------------- | ------------------------- |
| `/`               | Home Dashboard            |
| `/books`          | Liste des livres          |
| `/books/new`      | Ajouter/Modifier un livre |
| `/books/:id`      | Détails d'un livre        |
| `/members`        | Liste des membres         |
| `/members/new`    | Ajouter un membre         |
| `/borrowings`     | Liste des emprunts        |
| `/borrowings/new` | Nouvel emprunt            |
| `/profile`        | Profil utilisateur        |
| `/login`          | Connexion                 |

# Libris — Bibliothèque (React + Node.js)

Application complète : frontend React (Vite + Tailwind + React Router) connecté à une API Node.js/Express avec base de données SQLite.

## 1. Démarrer le backend (API)

```bash
cd backend
npm install
npm run dev
```

L'API démarre sur **http://localhost:4000** et crée automatiquement la base SQLite (`backend/src/db/library.db`) avec des données de démonstration au premier lancement (5 livres, 3 membres, 2 emprunts).

> ⚠️ **Node.js 22.5+ requis** (idéalement 23.4+ ou plus récent). Le backend utilise le module SQLite intégré à Node.js (`node:sqlite`) — pas de dépendance native à compiler, donc aucun souci d'installation sur Windows/Mac/Linux. Tu peux vérifier ta version avec `node -v`.

Endpoints disponibles :

- `GET/POST /api/books`, `GET/PUT/DELETE /api/books/:id`, `GET /api/books/stats`
- `GET/POST /api/members`, `GET/PUT/DELETE /api/members/:id`
- `GET/POST /api/borrowings`, `PUT /api/borrowings/:id/return`, `DELETE /api/borrowings/:id`

## 2. Démarrer le frontend

Dans un **autre terminal**, à la racine du projet :

```bash
npm install
npm run dev
```

Puis ouvre http://localhost:5173

Le frontend appelle l'API sur `http://localhost:4000/api` par défaut (voir `.env.example`, à copier en `.env` pour personnaliser).

## Structure

```
library-app/
├── backend/                → API Node.js + Express + SQLite
│   └── src/
│       ├── db/              (schéma + seed)
│       ├── routes/          (books, members, borrowings)
│       └── server.js
└── src/                    → Frontend React
    ├── api/client.js        → client fetch centralisé
    ├── components/
    │   ├── Sidebar.jsx
    │   └── Layout.jsx
    ├── pages/
    └── App.jsx
```

## État de la connexion backend

✅ **Livres (Books)** — entièrement connecté : liste en temps réel, recherche, ajout, suppression, page de détails dynamique.

⚠️ **Membres / Emprunts** — l'API backend est prête et testée (CRUD complet), mais les pages `Members.jsx`, `AddMember.jsx`, `Borrowings.jsx` et `AddBorrowing.jsx` affichent encore des données statiques du mockup. Elles suivent exactement le même pattern que `BooksList.jsx`/`AddEditBook.jsx` — dis-moi si tu veux qu'on les connecte aussi.

## Prochaines étapes possibles

- Connecter Members / Borrowings au backend (même pattern que Books)
- Authentification réelle (la page Login est pour l'instant juste visuelle)
- Upload d'image de couverture pour les livres
- Déploiement (backend sur Render/Railway, frontend sur Vercel/Netlify)
