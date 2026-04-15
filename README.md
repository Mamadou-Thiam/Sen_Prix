# SénPrix - Plateforme de Surveillance des Marchés du Sénégal

SénPrix est une plateforme de digitalisation de la surveillance des marchés au Sénégal permettant aux citoyens, commerçants et autorités de suivre et réguler les prix des produits de première nécessité.

## 🚀 Fonctionnalités

- **Gestion des Produits**: CRUD complet des produits de première nécessité
- **Gestion des Marchés**: Suivi des marchés avec géolocalisation (Leaflet)
- **Signalement des Prix**: Ajout et historique des prix par produit/marché
- **Dashboard Intelligent**: Graphiques et statistiques en temps réel
- **Système d'Alertes**: Détection automatique des prix élevés et variations suspectes
- **Notation des Commerçant**: Système de notation 1-5 étoiles
- **Authentification JWT**: Sécurisée avec rôles et permissions

## 🛠️ Stack Technique

- **Frontend**: React 18 + TypeScript + Ant Design
- **Backend**: Node.js + Express.js
- **Base de données**: MongoDB (Mongoose)
- **Charts**: Recharts
- **Cartographie**: React-Leaflet (OpenStreetMap)
- **State Management**: Redux Toolkit

## 🎨 Design

Couleurs du drapeau du Sénégal:
- Vert: #00853F
- Jaune: #FCD116
- Rouge: #E31B23

## 👥 Rôles Utilisateurs

| Rôle | Permissions |
|------|-------------|
| Admin | Gestion complète, validation commerçants |
| Modérateur | Modération prix, gestion alertes |
| User | Signalement prix, consultation |
| Merchant | Ajout prix, gestion profil |

## 📦 Installation

### Prérequis

- Node.js 18+
- MongoDB (local ou Atlas)

### Backend

```bash
cd server
npm install
```

Créer un fichier `.env`:
```env
PORT=5000
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt_super_securise
JWT_EXPIRE=7d
NODE_ENV=development
```

> **Important**: Utilisez MongoDB Atlas ou une URI locale. Ne partagez JAMAIS vos identifiants.

Pour populer la base de données avec des données initiales:
```bash
npm run seed
```

Pour démarrer le serveur:
```bash
npm run dev    # Développement
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
│   ├── config/         # Configuration DB
│   ├── controllers/   # Logique métier
│   ├── middleware/    # Auth, erreurs
│   ├── models/        # Modèles MongoDB
│   ├── routes/        # Routes API
│   ├── index.js       # Point d'entrée
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
├── SPEC.md
└── README.md
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil

### Products
- `GET /api/products` - Liste produits
- `POST /api/products` - Créer (admin)
- `PUT /api/products/:id` - Modifier (admin)
- `DELETE /api/products/:id` - Supprimer (admin)

### Markets
- `GET /api/markets` - Liste marchés
- `POST /api/markets` - Créer (admin/moderator)
- `PUT /api/markets/:id` - Modifier
- `DELETE /api/markets/:id` - Supprimer (admin)

### Prices
- `GET /api/prices` - Liste prix (filtres)
- `POST /api/prices` - Ajouter prix
- `GET /api/prices/stats` - Statistiques
- `GET /api/prices/history/:productId` - Historique

### Alerts
- `GET /api/alerts` - Liste alertes
- `PUT /api/alerts/read/:id` - Marquer lu
- `PUT /api/alerts/read-all` - Tout marquer lu

### Users
- `GET /api/users` - Liste utilisateurs (admin)
- `PUT /api/users/:id/verify` - Valider marchand
- `PUT /api/users/:id/role` - Modifier rôle
- `POST /api/users/:id/rate` - Noter marchand

## 🧪 Tests

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

## 🚀 Déploiement

### Render / Heroku
1. Configurer variables d'environnement
2. Backend: `npm start`
3. Frontend: `npm run build`

### AWS EC2
1. Installer Node.js et MongoDB
2. Configurer PM2 pour le backend
3. Serveur Nginx pour le frontend

## 📝 License

MIT

---

Développé avec ❤️ pour le Sénégal
