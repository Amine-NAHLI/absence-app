# 📋 Feuille de Route & Tâches — Amine NAHLI (Phase 1 : US01 à US09)

> **Rôle :** Responsable du Cœur Opérationnel — Authentification, Émargement & Cycle Complet des Justificatifs  
> **Périmètre Strict :** **US01 jusqu'à US09**  
> **Volume Agile :** 37 Story Points (Sprint 1)  
> **Ordre d'exécution :** 🚀 **PARTIE 1 — Réalisée et terminée intégralement en premier**  
> **Règle d'or :** Amine développe, teste et livre l'ensemble des User Stories US01 à US09. Aya attend qu'Amine ait entièrement terminé avant de commencer sa phase.  
> **Branche Git :** `feature/amine-phase1-us01-us09`

---

## 🎯 Objectif Général de la Partie 1

Amine met en place le socle complet de l'application : l'authentification multi-rôles, la gestion de l'appel pour les enseignants avec blocage anti-doublon, ainsi que l'intégralité du cycle de vie des absences et des pièces justificatives (consultation par l'étudiant, téléversement de certificat, suivi du statut et arbitrage/validation par l'enseignant ou la scolarité).

---

## 📌 User Stories prises en charge par Amine (US01 à US09 — 37 SP)

| ID | Intitulé de la User Story | Rôle Concerné | Estimation | Priorité |
| :--- | :--- | :---: | :---: | :---: |
| **US01** | Se connecter à l'application (Authentification & Sécurité multi-profils) | Tous | **3 SP** | Haute |
| **US02** | Consulter la liste des étudiants d'un groupe pour réaliser l'appel | Enseignant | **3 SP** | Haute |
| **US03** | Enregistrer l'absence d'un étudiant avec blocage strict de doublon | Enseignant | **5 SP** | Haute |
| **US04** | Consulter la liste de ses propres absences sur le tableau de bord mobile | Étudiant | **5 SP** | Haute |
| **US05** | Consulter le détail d'une absence (matière, séance, professeur, motif) | Étudiant | **2 SP** | Moyenne |
| **US06** | Déposer un justificatif dématérialisé (Upload PDF, JPG, PNG ≤ 5 Mo) | Étudiant | **8 SP** | Haute |
| **US07** | Consulter et suivre en direct le statut de son justificatif (En attente / Validé / Rejeté) | Étudiant | **3 SP** | Moyenne |
| **US08** | Modifier / rectifier une absence en cas d'erreur de saisie | Enseignant | **3 SP** | Moyenne |
| **US09** | Valider ou refuser un justificatif d'absence avec motif de décision | Enseignant / Admin | **5 SP** | Haute |

**Sous-total Partie 1 (Amine) : 37 Story Points**

---

## 🛠️ Travail à Réaliser par Couche (Partie 1)

### 1. Socle Commun & Base de Données (Neon PostgreSQL & Spring Boot)
- [x] **Modèle relationnel JPA :**
  - Entité `User` (email, mot de passe hashé, rôles : ENSEIGNANT, ETUDIANT, ADMIN).
  - Entité `Groupe` (code, nom, filière, année scolaire).
  - Entité `Etudiant` (matricule, cne, lien User, lien Groupe).
  - Entité `Enseignant` (matricule, département, lien User).
  - Entité `Seance` (date, créneau, salle, type cours/TD/TP).
  - Entité `Absence` (lien étudiant, lien séance, type de présence, statut).
  - Entité `Justificatif` (nom fichier, chemin stockage, taille ≤ 5 Mo, statut EN_ATTENTE/VALIDE/REFUSE, motif).
- [x] **Contraintes d'intégrité métier :**
  - Contrainte `UNIQUE(etudiant_id, seance_id)` (anti-doublon d'appel).
  - Contrainte `UNIQUE(absence_id)` (un justificatif unique par absence).

### 2. Backend Spring Boot (`backend/`)
- [x] **`AuthController` (US01) :**
  - `POST /api/auth/login` : authentification et retour de session.
- [x] **`GroupeController` (US02) :**
  - `GET /api/groupes/{id}/etudiants` : liste des étudiants pour l'émargement.
- [x] **`AbsenceController` (US03, US04, US05, US08) :**
  - `POST /api/absences` : enregistrement avec vérification anti-doublon (409 Conflict si doublon).
  - `GET /api/absences/etudiant/{id}` : liste des absences de l'étudiant connecté.
  - `GET /api/absences/{id}` : détail complet d'une absence.
  - `PUT /api/absences/{id}` : rectification d'une absence.
- [ ] **`JustificatifController` (US06, US07, US09) :**
  - `POST /api/justificatifs/upload` : réception `multipart/form-data` avec vérification de taille (< 5 Mo) et de format (PDF, PNG, JPG).
  - `GET /api/justificatifs/etudiant/{id}` : suivi des justificatifs soumis.
  - `PUT /api/justificatifs/{id}/decision` : validation ou refus avec enregistrement du motif.

### 3. Frontend Mobile React Native (`frontend/`)
- [x] **Écran de Connexion (`LoginScreen.tsx` - US01) :** Formulaire clair, icônes vectorielles, aiguillage par rôle.
- [x] **Écran d'Émargement Enseignant (`EnseignantHomeScreen.tsx` - US02, US03, US08) :** Appel interactif, puces Présent/Absent, blocage doublons.
- [x] **Écran Tableau de Bord Étudiant (`EtudiantHomeScreen.tsx` - US04, US05, US07) :** Synthèse d'assiduité, liste d'absences, badges d'état.
- [ ] **Écran de Dépôt & Validation de Justificatif (US06, US09) :** Sélecteur de fichier/photo et modal d'arbitrage.

---

## 🔒 Livrable & Relais vers la Partie 2
Dès qu'Amine a terminé les **User Stories 01 à 09**, l'application possède :
1. Un système d'authentification fonctionnel.
2. Des enseignants qui peuvent faire l'appel et modifier les absences.
3. Des étudiants qui voient leurs absences et peuvent déposer des justificatifs.
4. Un mécanisme de validation / rejet des justificatifs opérationnel.

> **Amine valide et livre sa branche sur `main`. Aya peut alors démarrer la Partie 2.**
