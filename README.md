# SénPrix - Plateforme de Surveillance des Marchés du Sénégal

SénPrix est une plateforme de digitalisation de la surveillance des marchés au Sénégal permettant aux citoyens, commerçants et autorités de suivre et réguler les prix des produits de première nécessité.

## 🚀 Fonctionnalités

- **🗺️ Carte des écarts de prix** : Visualisation interactive des marchés avec codes couleur selon l'écart entre prix officiel et prix signalé
- **📦 Gestion des Produits** : CRUD complet des produits de première nécessité
- **🏪 Gestion des Marchés** : Suivi des marchés avec géolocalisation
- **💰 Signalement des Prix** : Ajout et historique des prix par produit/marché
- **📊 Dashboard** : Graphiques et statistiques en temps réel
- **🔔 Système d'Alertes** : Détection automatique des prix élevés et variations suspectes
- **⭐ Notation des Commerçants** : Système de notation 1-5 étoiles
- **🔐 Authentification JWT** : Sécurisée avec rôles et permissions

## 🛠️ Stack Technique

- **Frontend** : React 18 + TypeScript + Ant Design
- **Backend** : Node.js + Express.js
- **Base de données** : MongoDB (Mongoose)
- **Charts** : Recharts
- **Cartographie** : React-Leaflet (OpenStreetMap)
- **State Management** : Redux Toolkit

## 🎨 Design

Couleurs du drapeau du Sénégal :
- Vert : `#00853F`
- Jaune : `#FCD116`
- Rouge : `#E31B23`

## 👥 Rôles Utilisateurs

| Rôle | Permissions |
|------|-------------|
| Admin | Gestion complète, dashboard, modération |
| User | Signalement de prix, consultation de la carte |
| Merchant | Ajout de prix, gestion du profil |

## 📦 Installation

### Prérequis

- Node.js 18+
- MongoDB (local ou Atlas)

### Backend

```bash
cd server
npm install
```

Créer un fichier `.env` :
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/senprix
JWT_SECRET=votre_secret_jwt_super_securise
JWT_EXPIRE=7d
NODE_ENV=development
```

Pour populer la base de données :

```bash
npm run seed          # Produits + Marchés
npm run seed-prices   # Prix de test avec écarts simulés
```

Démarrer le serveur :

```bash
npm run dev   # Développement (nodemon)
npm start     # Production
```

### Frontend

```bash
cd client
npm install
npm start
```

## 📁 Structure du Projet

```
SénPrix/
├── server/
│   ├── config/           # Configuration DB
│   ├── controllers/      # Logique métier
│   ├── middleware/       # Auth, erreurs
│   ├── models/           # Modèles MongoDB (User, Product, Market, Price, Report, Alert)
│   ├── routes/           # Routes API
│   ├── index.js          # Point d'entrée Express
│   ├── seed.js           # Seed produits + marchés
│   ├── seed-prices.js    # Seed prix de test
│   └── package.json
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── logo_sp.png   # Favicon
│   └── src/
│       ├── assets/       # Images (logo)
│       ├── components/   # Layout, composants réutilisables
│       ├── pages/        # Dashboard, MapView, Products, Markets, Alerts, Reports...
│       ├── services/     # Appels API (Axios)
│       ├── store/        # Redux Toolkit (auth, alerts)
│       ├── styles/       # CSS
│       ├── types/        # Interfaces TypeScript
│       ├── App.tsx       # Routes
│       └── index.tsx     # Point d'entrée React
├── SPEC.md
├── senprix.jdl
└── README.md
```

## 🔌 API Endpoints

### Auth
| Méthode | Route | Accès |
|---------|-------|-------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authentifié |

### Products
| Méthode | Route | Accès |
|---------|-------|-------|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Markets
| Méthode | Route | Accès |
|---------|-------|-------|
| GET | `/api/markets` | Public |
| GET | `/api/markets/:id` | Public |
| POST | `/api/markets` | Admin |
| PUT | `/api/markets/:id` | Admin |
| DELETE | `/api/markets/:id` | Admin |

### Prices
| Méthode | Route | Accès |
|---------|-------|-------|
| GET | `/api/prices` | Authentifié |
| GET | `/api/prices/map-data` | **Public** |
| GET | `/api/prices/stats` | Admin |
| GET | `/api/prices/dashboard-stats` | Admin |
| GET | `/api/prices/history/:productId` | Authentifié |
| GET | `/api/prices/pending` | Admin |
| POST | `/api/prices` | Authentifié |
| PUT | `/api/prices/verify/:id` | Admin |

### Alerts
| Méthode | Route | Accès |
|---------|-------|-------|
| GET | `/api/alerts` | Authentifié |
| GET | `/api/alerts/unread-count` | Authentifié |
| PUT | `/api/alerts/read/:id` | Authentifié |
| PUT | `/api/alerts/read-all` | Authentifié |
| DELETE | `/api/alerts/:id` | Authentifié |

### Users
| Méthode | Route | Accès |
|---------|-------|-------|
| GET | `/api/users` | Admin |
| GET | `/api/users/stats` | Admin |
| GET | `/api/users/:id` | Authentifié |
| POST | `/api/users` | Admin |
| PUT | `/api/users/profile` | Authentifié |
| PUT | `/api/users/:id/role` | Admin |
| PUT | `/api/users/:id/market` | Admin |
| POST | `/api/users/:id/rate` | Authentifié |
| DELETE | `/api/users/:id` | Admin |

### Reports
| Méthode | Route | Accès |
|---------|-------|-------|
| GET | `/api/reports` | Admin |
| GET | `/api/reports/my-reports` | Authentifié |
| GET | `/api/reports/unread-count` | Admin |
| GET | `/api/reports/:id` | Authentifié |
| POST | `/api/reports` | Authentifié |
| PUT | `/api/reports/:id` | Admin |
| PUT | `/api/reports/:id/read` | Admin |
| PUT | `/api/reports/read-all` | Admin |
| DELETE | `/api/reports/:id` | Admin |

### Health
| Méthode | Route | Accès |
|---------|-------|-------|
| GET | `/api/health` | Public |

## 🚀 Déploiement (Render)

### Backend - Web Service
- **Root Directory** : `server`
- **Runtime** : Node
- **Build Command** : `npm install`
- **Start Command** : `node index.js`
- **Variables** : `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `NODE_ENV=production`

### Frontend - Static Site
- **Root Directory** : `client`
- **Build Command** : `npm install && npm run build`
- **Publish Directory** : `build`
- **Variable** : `REACT_APP_API_URL=https://<api>.onrender.com/api`
- **Rewrites** : `/*` → `/index.html` (Rewrite)

## 📝 License

MIT

---

Développé avec ❤️ pour le Sénégal
