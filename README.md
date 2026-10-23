# 📱 Absence App — Application Mobile de Gestion des Absences

> **Université Privée de Fès (UPF) — GI4**  
> **Module :** Génie Logiciel & Design Patterns (TP 3 : Méthodologie Agile – Scrum)  
> **Auteurs :** Bouhsini Aya & Nahli Amine  
> **Base de données :** Neon PostgreSQL (Cloud)  

---

## 🔑 Comptes & Données de Test Disponibles (Seeders)

La base de données Neon contient déjà un jeu complet de données de test pré-insérées :

### 1. Comptes Utilisateurs

| Rôle | Nom & Prénom | Email (Identifiant) | Mot de passe | Détails / Identifiants |
| :--- | :--- | :--- | :---: | :--- |
| 👨‍🏫 **Enseignant** | EL HASSANI Mohammed | `prof@upf.ac.ma` | `123456` | Matricule : `ENS-001` (Génie Logiciel) |
| 👨‍🎓 **Étudiant** | NAHLI Amine | `etudiant@upf.ac.ma` | `123456` | Matricule : `ETU-001`, CNE : `N130001001` (GI4-A) |
| 👩‍🎓 **Étudiante** | BOUHSINI Aya | `aya@upf.ac.ma` | `123456` | Matricule : `ETU-002`, CNE : `N130001002` (GI4-A) |
| 👨‍🎓 **Étudiant** | BENNANI Yassine | `yassine@upf.ac.ma` | `123456` | Matricule : `ETU-003`, CNE : `N130001003` (GI4-A) |
| 👩‍🎓 **Étudiante** | IDRISSI Salma | `salma@upf.ac.ma` | `123456` | Matricule : `ETU-004`, CNE : `N130001004` (GI4-A) |
| 👨‍💼 **Administrateur** | ADMIN Principal | `admin@upf.ac.ma` | `admin123` | Gestion globale, statistiques & utilisateurs |

---

### 2. Données Pédagogiques Pré-configurées

* 📚 **Groupe :** `GI4-A` — *Génie Informatique 4ème Année - Groupe A* (Promotion 2026-2027).
* 📖 **Matière :** `GL401` — *Génie Logiciel & Méthodes Agiles* (Coeff: 4, 45h).
* 📅 **Séance active :** TP Génie Logiciel aujourd'hui de 08h30 à 10h15 (Salle : *Labo Informatique 3*).
* ❌ **Absence de test initiale :** 1 absence enregistrée pour **Amine Nahli** (statut `NON_JUSTIFIEE`), utile pour tester immédiatement l'affichage des absences et le dépôt de justificatif.

---

## 🏗️ Architecture du Projet

Le projet est structuré en **Monorepo** :

```text
absence-app/
├── backend/             # API REST Spring Boot 3 (Java 17, JPA, Neon PostgreSQL)
├── frontend/            # Application Mobile Expo (React Native, TypeScript)
└── docs/                # Feuilles de route et documentation de l'équipe
    ├── README_AMINE.md      # 🧑‍💻 Tâches & User Stories pour Amine (Enseignant & Socle)
    ├── README_AYA.md        # 👩‍💻 Tâches & User Stories pour Aya (Étudiant, Justificatifs & Admin)
    └── DATABASE_SCHEMA.md   # 🗄️ Schéma relationnel complet et diagramme Mermaid ERD
```

---

## 👥 Répartition du Travail Agile (39 SP chacun)

* 🚀 [**Consulter la Feuille de Route d'Amine (Personne 1)**](file:///d:/4eme%20annee/s7/gl-dp/tp3/absence-app/docs/README_AMINE.md)  
  *Socle commun, Authentification, Espace Enseignant, Saisie d'appel anti-doublon, Validation des justificatifs.*
* ⚡ [**Consulter la Feuille de Route d'Aya (Personne 2)**](file:///d:/4eme%20annee/s7/gl-dp/tp3/absence-app/docs/README_AYA.md)  
  *Espace Étudiant, Dashboard des absences, Upload des pièces jointes justificatives (PDF/Photos), Module Administration & Statistiques.*

---

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend (Spring Boot)
```powershell
cd backend
mvn spring-boot:run
```
*L'API est accessible sur `http://localhost:8080/api`.*

### 2. Démarrer le Frontend (Expo React Native)
```powershell
cd frontend
npm start
```
*Scanner le QR Code avec l'application **Expo Go** sur votre téléphone ou taper `w` pour tester dans le navigateur web.*  
*(L'adresse IP de votre PC est détectée automatiquement sans configuration manuelle).*
