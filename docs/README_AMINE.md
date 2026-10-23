# 📋 Feuille de Route & Tâches — Amine NAHLI (Personne 1)

> **Rôle :** Responsable du Socle Technique, Authentification, Espace Enseignant & Cœur Métier des Absences  
> **Volume Agile :** 39 Story Points (Sprint 1 & Sprint 2)  
> **Ordre de démarrage :** 🚀 **En premier** (Mise en place de la base commune)  
> **Branche Git :** `feature/amine-enseignant-core`

---

## 🎯 Objectif Général
Amine met en place le socle d'authentification et toute la logique métier liée aux enseignants : sélection des groupes, appel interactif, enregistrement sans doublon, modification et arbitrage des justificatifs.

---

## 📌 User Stories prises en charge (39 SP)

| ID | Intitulé de la User Story | Priorité | Estimation |
| :--- | :--- | :---: | :---: |
| **US01** | Se connecter à l'application (Enseignant / Étudiant / Admin) | **Haute** | **3 SP** |
| **US02** | Consulter la liste des étudiants d'un groupe (pour l'appel) | **Haute** | **3 SP** |
| **US03** | Enregistrer l'absence d'un étudiant (avec blocage de doublon) | **Haute** | **5 SP** |
| **US08** | Modifier / rectifier une absence en cas d'erreur de saisie | **Moyenne** | **3 SP** |
| **US09** | Valider ou refuser un justificatif d'absence (côté enseignant) | **Moyenne** | **5 SP** |
| **US10** | Consulter l'historique des absences par groupe et matière | **Moyenne** | **5 SP** |
| **US11** | Consulter le taux d'absentéisme d'un étudiant avec alerte de seuil | **Basse** | **5 SP** |
| **US16** | Gérer les groupes et les affectations de cours | **Moyenne** | **5 SP** |
| **US18** | Notification push lors de l'enregistrement d'une absence | **Basse** | **5 SP** |

---

## 🛠️ Travail à Réaliser par Couche

### 1. Socle Commun (À faire dès le début)
- [ ] **Modèle de données relationnel (Spring Boot JPA) :**
  - Entité `User` (`id`, `nom`, `prenom`, `email`, `motDePasse`, `role` : ENSEIGNANT, ETUDIANT, ADMIN).
  - Entité `Enseignant` (spécialisation ou liée à `User`).
  - Entité `Groupe` (`id`, `nom`, `filiere`, `annee`).
  - Entité `Absence` (`id`, `etudiant_id`, `enseignant_id`, `date`, `seance`, `matiere`, `statut` : NON_JUSTIFIEE, EN_ATTENTE, JUSTIFIEE).
- [ ] **Initialisation des données de test (`data.sql` ou CommandLineRunner) :**
  - Créer des comptes de test : un prof (`prof@upf.ac.ma`), un étudiant (`etudiant@upf.ac.ma`), un admin.
  - Créer un groupe exemple : `GI4-A` avec 5 étudiants.

### 2. Backend Spring Boot (`backend/`)
- [ ] **`AuthController` :**
  - `POST /api/auth/login` : vérification email/mot de passe, retour du rôle et de l'utilisateur (ou token JWT).
- [ ] **`GroupeController` :**
  - `GET /api/groupes` : liste des groupes attribués à l'enseignant connecté.
  - `GET /api/groupes/{id}/etudiants` : liste des étudiants du groupe.
- [ ] **`AbsenceController` :**
  - `POST /api/absences` : enregistrement d'une ou plusieurs absences.
    * ⚠️ **Règle anti-doublon obligatoire :** lever une erreur `409 CONFLICT` si l'absence existe déjà pour le même étudiant, la même date et la même séance.
  - `PUT /api/absences/{id}` : rectification d'une absence (changer statut, annuler l'absence).
  - `GET /api/absences/enseignant/{id}` : historique des absences enregistrées par le professeur.
  - `PUT /api/absences/{id}/statut` : validation ou rejet du justificatif (`JUSTIFIEE` ou `REFUSEE` avec motif).
  - `GET /api/statistiques/etudiant/{id}/taux` : calcul du pourcentage d'absence de l'étudiant.

### 3. Frontend Mobile Expo (`frontend/`)
- [ ] **Architecture Navigation :**
  - `AuthStack` : Écran `LoginScreen.tsx`.
  - `EnseignantTabs` : navigation par onglets pour l'enseignant (`AppelScreen`, `HistoriqueScreen`, `ProfilScreen`).
- [ ] **Écran de Connexion (`LoginScreen.tsx`) :**
  - Formulaire propre avec validation, message d'erreur clair si échec.
  - Redirection automatique selon le rôle retourné par l'API.
- [ ] **Écran de Saisie d'Absence (`AppelScreen.tsx`) :**
  - Sélecteur de groupe (`GI4-A`, etc.), date du jour et créneau horaire (ex: 8h30 - 10h15).
  - Liste défilante des étudiants avec bascule rapide : **Présent** / **Absent** / **Retard**.
  - Bouton de validation globale avec dialogue de confirmation.
- [ ] **Écran d'Arbitrage des Justificatifs (`JustificatifsReviewScreen.tsx`) :**
  - Liste des justificatifs en attente avec boutons « Accepter » et « Refuser ».
- [ ] **Écran Historique & Taux (`StatsProfScreen.tsx`) :**
  - Liste des absences passées et badge de couleur pour le taux d'absentéisme (vert < 10%, rouge > 20%).

---

## 🚀 Workflow Git pour Amine

```powershell
# 1. Se positionner dans le projet
cd "d:\4eme annee\s7\gl-dp\tp3\absence-app"

# 2. Créer sa branche de travail
git checkout -b feature/amine-enseignant-core

# 3. Travailler et faire des commits réguliers
git add .
git commit -m "feat(auth): ajout du service de login et de l'écran de connexion"

# 4. Pousser sur GitHub
git push -u origin feature/amine-enseignant-core
```
