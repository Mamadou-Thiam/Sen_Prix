  # SénPrix - Spécification du Projet

  ## 1. Project Overview

  **Nom du projet:** SénPrix  
  **Description:** Plateforme de digitalisation de la surveillance des marchés au Sénégal permettant aux citoyens, commerçants et autorités de suivre et réguler les prix des produits de première nécessité.  
  **Type d'application:** Application Web Fullstack MERN (SaaS)

  ---

  ## 2. Tech Stack

  ### Backend
  - **Runtime:** Node.js v18+
  - **Framework:** Express.js
  - **Base de données:** MongoDB avec Mongoose
  - **Authentification:** JWT + bcrypt
  - **Validation:** Joi
  - **Sécurité:** helmet, cors, express-rate-limit

  ### Frontend
  - **Framework:** React 18 + TypeScript
  - **UI Library:** Ant Design 5.x
  - **State Management:** Redux Toolkit
  - **Charts:** Recharts
  - **Cartographie:** React-Leaflet
  - **Routing:** React Router v6

  ---

  ## 3. Couleurs & Design

  ### Palette du Sénégal
  - **Vert:** #00853F
  - **Jaune:** #FCD116
  - **Rouge:** #E31B23

  ### Design
  - Moderne, minimaliste, professionnel
  - Dashboard type SaaS
  - Responsive (mobile, tablette, desktop)
  - Animations légères

  ---

  ## 4. Rôles Utilisateurs

  | Rôle | Permissions |
  |------|-------------|
  | Admin | Gestion complète, validation commerçants, gestion utilisateurs |
  | Modérateur | Modération prix, gestion alertes |
  | Utilisateur | Signalement prix, consultation dashboard, notation commerçants |
  | Commerçant | Ajout prix produits, gestion profil |

  ---

  ## 5. Modèles de Données

  ### User
  ```
  {
    _id: ObjectId,
    email: String (unique),
    password: String (hashed),
    firstName: String,
    lastName: String,
    role: Enum ['admin', 'moderator', 'user', 'merchant'],
    phone: String,
    isVerified: Boolean (pour marchand),
    market: ObjectId (ref: Market, optionnel),
    ratings: [{ user: ObjectId, rating: Number }],
    averageRating: Number,
    createdAt: Date,
    updatedAt: Date
  }
  ```

  ### Product
  ```
  {
    _id: ObjectId,
    name: String,
    category: Enum ['riz', 'huile', 'sucre', 'farine', 'lait', 'gaz', 'autre'],
    description: String,
    unit: String (kg, litre, bundle),
    image: String,
    createdAt: Date
  }
  ```

  ### Market
  ```
  {
    _id: ObjectId,
    name: String,
    city: String,
    address: String,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    createdAt: Date
  }
  ```

  ### Price
  ```
  {
    _id: ObjectId,
    product: ObjectId (ref: Product),
    market: ObjectId (ref: Market),
    user: ObjectId (ref: User),
    merchant: ObjectId (ref: User),
    price: Number,
    quantity: String,
    date: Date,
    isVerified: Boolean,
    createdAt: Date
  }
  ```

  ### Alert
  ```
  {
    _id: ObjectId,
    type: Enum ['high_price', 'suspicious_variation'],
    product: ObjectId (ref: Product),
    market: ObjectId (ref: Market),
    message: String,
    isRead: Boolean,
    createdAt: Date
  }
  ```

  ---

  ## 6. API Endpoints

  ### Auth
  - `POST /api/auth/register` - Inscription
  - `POST /api/auth/login` - Connexion
  - `GET /api/auth/me` - Profil actuel

  ### Products
  - `GET /api/products` - Liste produits (pagination, filtre)
  - `POST /api/products` - Créer produit (admin)
  - `PUT /api/products/:id` - Modifier produit (admin)
  - `DELETE /api/products/:id` - Supprimer produit (admin)

  ### Markets
  - `GET /api/markets` - Liste marchés
  - `POST /api/markets` - Créer marché (admin/moderator)
  - `PUT /api/markets/:id` - Modifier marché
  - `DELETE /api/markets/:id` - Supprimer marché

  ### Prices
  - `GET /api/prices` - Liste prix (filtres, pagination)
  - `POST /api/prices` - Ajouter prix
  - `GET /api/prices/stats` - Statistiques prix
  - `GET /api/prices/history/:productId` - Historique prix

  ### Alerts
  - `GET /api/alerts` - Liste alertes
  - `PUT /api/alerts/:id/read` - Marquer lu
  - `DELETE /api/alerts/:id` - Supprimer alerte

  ### Users
  - `GET /api/users` - Liste utilisateurs (admin)
  - `PUT /api/users/:id/verify` - Valider marchand (admin)
  - `PUT /api/users/:id/role` - Modifier rôle (admin)

  ---

  ## 7. Structure Frontend

  ### Pages
  - `/login` - Connexion
  - `/register` - Inscription
  - `/dashboard` - Tableau de bord
  - `/products` - Gestion produits
  - `/markets` - Gestion marchés
  - `/prices` - Signalement prix
  - `/alerts` - Alertes
  - `/profile` - Profil utilisateur

  ### Components
  - Layout (Sidebar, Navbar)
  - AuthGuard
  - ProtectedRoute
  - ProductCard
  - MarketCard
  - PriceChart
  - MapView
  - AlertCard
  - StatsCard

  ---

  ## 8. Fonctionnalités Principales

  ### Dashboard
  - Stats globales (nb produits, marchés, utilisateurs)
  - Prix moyens par produit (graphique)
  - Évolution des prix (chart ligne)
  - Comparaison par marché (chart barre)
  - Dernières alertes

  ### Gestion Produits
  - CRUD complet
  - Catégories pré-définies
  - Images

  ### Gestion Marchés
  - CRUD complet
  - Carte interactive (Leaflet)
  - Géolocalisation

  ### Signalement Prix
  - Formulaire ajout prix
  - Historique des prix
  - Filtres par produit/marché/date

  ### Système d'Alertes
  - Détection automatique prix élevé
  - Variation suspecte (>20%)
  - Notification UI

  ### Notation Marchands
  - Étoiles 1-5
  - Moyenne calculée

  ---

  ## 9. Sécurité

  - JWT access token
  - bcrypt password hashing
  - helemet headers
  - CORS configuré
  - Rate limiting
  - Validation input Joi
  - Middleware auth rôle

  ---

  ## 10. Structure Dossiers

  ### Backend
  ```
  server/
  ├── config/
  │   └── db.js
  ├── controllers/
  ├── middleware/
  │   ├── auth.js
  │   └── error.js
  ├── models/
  ├── routes/
  ├── services/
  ├── utils/
  ├── .env
  ├── index.js
  └── package.json
  ```

  ### Frontend
  ```
  client/
  ├── public/
  ├── src/
  │   ├── components/
  │   ├── pages/
  │   ├── services/
  │   ├── store/
  │   ├── styles/
  │   ├── types/
  │   ├── App.tsx
  │   └── index.tsx
  ├── .env
  └── package.json
  ```

  ---

  ## 12. Scripts

  ### Backend
  ```bash
  npm install
  npm run dev    # Développement
  npm start     # Production
  ```

  ### Frontend
  ```bash
  npm install
  npm start     # Développement
  npm run build # Production
  ```
