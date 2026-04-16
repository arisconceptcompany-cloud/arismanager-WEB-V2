# Gestion des Employés - ARIS RH

Système de gestion des ressources humaines développé avec React + Vite et Node.js + MySQL.

## Fonctionnalités

### Authentification
- Login avec matricule (format ARIS-xxxx)
- Mot de passe avec visualisation/masquage
- Cookies pour la gestion des sessions
- Comptes par défaut pour les employés

### Tableau de bord
- Vue d'ensemble des statistiques personnelles
- Jours de présence, taux de présence
- Jours de congé, projets actifs

### Mon Profil
- Consultation et modification des informations personnelles
- Coordonnées, poste, département

### Mes Pointages
- Historique des pointages
- Ajout de nouveaux pointages
- Statistiques annuelles

### Mes Congés
- Demande de congés (annuel, maladie, maternité, paternité, sans solde)
- Suivi des demandes et statuts
- Historique complet

### Projets
- Liste des projets assignés
- Détails et équipe du projet

### Mon Salaire
- Bulletin de salaire actuel
- Historique des paiements

### Mon Rapport
- Création et modification de rapports d'activité
- Soumission pour validation

## Prérequis

- Node.js v18+
- MySQL 8.0+
- npm ou yarn

## Installation

### 1. Base de données MySQL

Assurez-vous que MySQL est installé et en cours d'exécution.

```bash
mysql -u root -p
```

Créez la base de données (les tables seront créées automatiquement au premier démarrage):

```sql
CREATE DATABASE IF NOT EXISTS gestion_employes;
```

### 2. Backend

```bash
cd backend
npm install
```

Configurez la connexion MySQL dans `src/config/db.js` si nécessaire:

```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'votre_mot_de_passe',
  database: 'gestion_employes',
  // ...
});
```

Démarrez le serveur:

```bash
npm start
# ou
npm run dev
```

Le serveur sera disponible sur `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## Comptes par défaut

Les comptes suivants sont créés automatiquement:

| Matricule    | Nom      | Prénom | Mot de passe    | Rôle     |
|-------------|----------|--------|-----------------|----------|
| ARIS-0001   | Dupont   | Jean   | password123     | Employé  |
| ARIS-0002   | Martin   | Marie  | password123     | RH       |
| ARIS-0003   | Bernard  | Pierre | password123     | Admin    |
| ARIS-0004   | Dubois   | Sophie | password123     | Employé  |
| ARIS-0005   | Thomas   | Nicolas| password123     | Employé  |

## Structure du projet

```
GestionEmploye/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── initDb.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── employeController.js
│   │   │   ├── pointageController.js
│   │   │   ├── congeController.js
│   │   │   ├── projetController.js
│   │   │   ├── salaireController.js
│   │   │   └── rapportController.js
│   │   ├── models/
│   │   │   └── ...
│   │   ├── routes/
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── index.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Pointages.jsx
    │   │   ├── Conges.jsx
    │   │   ├── Projets.jsx
    │   │   ├── Salaires.jsx
    │   │   └── Rapports.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── config/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── App.css
    └── package.json
```

## API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/check` - Vérifier l'authentification

### Employé
- `GET /api/employe/profile` - Profil utilisateur
- `PUT /api/employe/profile` - Modifier le profil
- `GET /api/employe` - Liste des employés

### Pointages
- `GET /api/pointages` - Liste des pointages
- `POST /api/pointages` - Ajouter un pointage
- `GET /api/pointages/stats` - Statistiques

### Congés
- `GET /api/conges` - Liste des congés
- `POST /api/conges` - Demande de congé
- `GET /api/conges/stats` - Statistiques

### Projets
- `GET /api/projets` - Projets de l'employé
- `GET /api/projets/all` - Tous les projets
- `GET /api/projets/:id` - Détail d'un projet

### Salaires
- `GET /api/salaires` - Historique des salaires
- `GET /api/salaires/actuel` - Salaire actuel

### Rapports
- `GET /api/rapports` - Liste des rapports
- `POST /api/rapports` - Créer un rapport
- `PUT /api/rapports/:id` - Modifier un rapport
- `PUT /api/rapports/:id/submit` - Soumettre un rapport

## Technologies

### Backend
- Express.js
- MySQL2
- bcryptjs
- cookie-parser
- CORS

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- Lucide React (icônes)

## Licence

MIT
