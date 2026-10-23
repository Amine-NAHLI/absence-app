# 📋 Feuille de Route & Tâches — Amine NAHLI (Phase 1 : Socle & Cœur Métier)

> **Rôle :** Responsable du Socle Technique, Authentification, Gestion Académique & Cœur Métier de l'Émargement  
> **Volume Agile :** 39 Story Points (Sprint 1 — 100% autonome et séquentiel)  
> **Ordre d'exécution :** 🚀 **PARTIE 1 — Réalisée et terminée intégralement en premier**  
> **Principe clé :** Amine réalise l'intégralité de la chaîne d'émargement sans aucune dépendance envers Aya. Lorsque la Partie 1 est finie, elle est livrée et validée.  
> **Branche Git :** `feature/amine-phase1-core`

---

## 🎯 Objectif Général de la Partie 1

Amine met en place le socle d'authentification, le modèle relationnel PostgreSQL, l'administration de base des étudiants et des groupes, ainsi que **tout le cycle de prise d'absence côté enseignant** (sélection de groupe, appel interactif, blocage anti-doublon, modification, historique, calcul du taux d'absentéisme et notifications push).

---

## 📌 User Stories prises en charge par Amine (39 SP)

| ID | Intitulé de la User Story | Priorité | Estimation | Statut |
| :--- | :--- | :---: | :---: | :---: |
| **US01** | Authentification & Sécurité (Connexion Enseignant / Étudiant / Admin) | **Haute** | **3 SP** | ✅ Réalisé |
| **US02** | Consulter la liste des étudiants d'un groupe pour l'appel | **Haute** | **3 SP** | ✅ Réalisé |
| **US03** | Enregistrer l'absence d'un étudiant avec règle anti-doublon absolue | **Haute** | **5 SP** | ✅ Réalisé |
| **US08** | Modifier / rectifier une absence en cas d'erreur de saisie | **Moyenne** | **3 SP** | ✅ Réalisé |
| **US10** | Consulter l'historique des absences par groupe et séance (vue prof) | **Moyenne** | **5 SP** | ✅ Réalisé |
| **US11** | Calculer le taux d'absentéisme d'un étudiant avec alerte de seuil | **Moyenne** | **5 SP** | ✅ Réalisé |
| **US13** | Créer des comptes étudiants par l'administration (avec matricule/groupe) | **Haute** | **3 SP** | ✅ Réalisé |
| **US14** | Mettre à jour et modifier la fiche d'un étudiant (coordonnées, groupe) | **Basse** | **2 SP** | ✅ Réalisé |
| **US16** | Gérer les groupes, filières et affectations de séances de cours | **Haute** | **5 SP** | ✅ Réalisé |
| **US18** | Notification push automatique lors de l'enregistrement d'une absence | **Moyenne** | **5 SP** | ✅ Réalisé |

**Total Phase 1 (Amine) : 39 Story Points**

---

## 🛠️ Travail Réalisé par Couche (Partie 1)

### 1. Socle Commun & Base de Données
- [x] **Modèle de données relationnel (Spring Boot JPA & Neon PostgreSQL) :**
  - Entité `User` (`email`, `motDePasse`, `role`, `nom`, `prenom`, `actif`).
  - Entité `Groupe` (`code`, `nom`, `filiere`, `anneeScolaire`).
  - Entité `Etudiant` (`matricule`, `cne`, lien `User`, lien `Groupe`).
  - Entité `Enseignant` (`matricule`, `departement`, lien `User`).
  - Entité `Matiere` et `Seance` (`dateSeance`, `heureDebut`, `heureFin`, `salle`, `typeSeance`).
  - Entité `Absence` (`etudiant`, `seance`, `enseignant`, `typePresence`, `dureeMinutes`, `statut`).
- [x] **Contraintes d'intégrité strictes :**
  - Contrainte d'unicité `UNIQUE(etudiant_id, seance_id)` pour empêcher tout doublon.
- [x] **Initialisation des données de démo (`data.sql`) :**
  - Comptes actifs pour Professeur Amine, Étudiants GI4-A, Administrateur.

### 2. Backend Spring Boot (`backend/`)
- [x] **`AuthController` (US01) :**
  - `POST /api/auth/login` : vérification email/mot de passe avec hash BCrypt et renvoi de la session utilisateur.
- [x] **`GroupeController` & `AdminController` (US13, US14, US16) :**
  - `GET /api/groupes` : récupération des groupes pédagogiques (ex: `GI4-A`, `GI4-B`).
  - `GET /api/groupes/{id}/etudiants` : liste des étudiants rattachés au groupe.
  - `POST /api/admin/etudiants` : enregistrement d'un nouvel étudiant avec matricule unique.
  - `PUT /api/admin/etudiants/{id}` : mise à jour des coordonnées de l'étudiant.
- [x] **`AbsenceController` (US02, US03, US08, US10, US11, US18) :**
  - `POST /api/absences` : enregistrement de la feuille d'appel avec validation anti-doublon (retourne `409 Conflict` si doublon).
  - `PUT /api/absences/{id}` : rectification immédiate du statut d'une absence (erreur de saisie).
  - `GET /api/absences/enseignant/{id}` : historique complet des feuilles d'appel émargées.
  - `GET /api/statistiques/etudiant/{id}/taux` : calcul du pourcentage d'absences et déclencheur d'alerte (> 20%).
  - `POST /api/notifications/push` : notification envoyée à l'étudiant marqué absent.

### 3. Frontend Mobile React Native (`frontend/`)
- [x] **Écran de Connexion Minimaliste (`LoginScreen.tsx` - US01) :**
  - Design institutionnel clair, sans émojis, icônes vectorielles Feather, accès direct multi-rôles.
- [x] **Écran d'Émargement Enseignant (`EnseignantHomeScreen.tsx` - US02, US03, US08, US10) :**
  - Sélection du groupe et créneau horaire.
  - Bascule Présent / Absent / Retard interactive.
  - Compteur dynamique en temps réel (Présents vs Absents).
  - Enregistrement immédiat avec confirmation et résilience hors-ligne.
- [x] **Composant d'En-tête (`HeaderBar.tsx`) :**
  - Affichage du profil connecté et bouton de déconnexion sécurisé.

---

## 🔒 Clôture de la Partie 1 & Passage de Relais
Lorsque la Partie 1 est terminée :
1. La base de données contient des étudiants, groupes, enseignants et des absences réelles enregistrées.
2. L'API backend est 100% fonctionnelle sur les endpoints d'appel.
3. Amine livre la branche `main`.
4. **Aya peut démarrer la Partie 2 immédiatement sans jamais solliciter Amine.**
