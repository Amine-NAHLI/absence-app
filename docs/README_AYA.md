# 📋 Feuille de Route & Tâches — Aya BOUHSINI (Personne 2)

> **Rôle :** Responsable Espace Étudiant, Téléversement des Justificatifs, Module Administration & Statistiques  
> **Volume Agile :** 39 Story Points (Sprint 1 & Sprint 2)  
> **Ordre de démarrage :** ⚡ En parallèle dès que le socle commun d'Amine est initialisé  
> **Branche Git :** `feature/aya-etudiant-admin`

---

## 🎯 Objectif Général
Aya prend en charge l'expérience utilisateur des étudiants (tableau de bord des absences, emploi du temps, dépôt dématérialisé de justificatifs avec pièces jointes) ainsi que le panneau de gestion administrative et le reporting statistique.

---

## 📌 User Stories prises en charge (39 SP)

| ID | Intitulé de la User Story | Priorité | Estimation |
| :--- | :--- | :---: | :---: |
| **US04** | Consulter la liste de ses propres absences (vue étudiant) | **Haute** | **5 SP** |
| **US05** | Consulter le détail d'une absence (matière, enseignant, horaire) | **Moyenne** | **2 SP** |
| **US06** | Déposer un justificatif dématérialisé (PDF, JPG, PNG ≤ 5 Mo) | **Moyenne** | **8 SP** |
| **US07** | Consulter le statut d'un justificatif (En attente / Accepté / Refusé) | **Moyenne** | **3 SP** |
| **US12** | Consulter son emploi du temps (jour / semaine) | **Basse** | **5 SP** |
| **US13** | Ajouter un nouvel étudiant par l'administration | **Haute** | **3 SP** |
| **US14** | Modifier les informations d'un étudiant (email, téléphone, etc.) | **Basse** | **2 SP** |
| **US15** | Ajouter un enseignant par l'administration | **Moyenne** | **3 SP** |
| **US17** | Consulter les statistiques globales d'absence sous forme graphique | **Basse** | **8 SP** |

---

## 🛠️ Travail à Réaliser par Couche

### 1. Backend Spring Boot (`backend/`)
- [ ] **Modèle de données & Persistance JPA :**
  - Entité `Justificatif` (`id`, `absence_id`, `nomFichier`, `cheminFichier`, `typeMime`, `tailleFichier`, `dateDepot`, `statut` : EN_ATTENTE / ACCEPTE / REFUSE, `motifRefus`).
  - Entité `EmploiDuTemps` ou `SeanceCours` (`id`, `groupe_id`, `matiere`, `jourSemaine`, `heureDebut`, `heureFin`, `salle`).
- [ ] **`JustificatifController` (Upload de fichiers) :**
  - `POST /api/justificatifs/upload` : réception en `multipart/form-data`.
    * ⚠️ **Contrôles obligatoires :** vérifier l'extension (PDF, PNG, JPG) et rejeter si le fichier dépasse 5 Mo (`400 BAD REQUEST`).
    * Sauvegarder le fichier dans un dossier `uploads/` ou en base de données.
    * Mettre à jour l'absence associée au statut `EN_ATTENTE`.
  - `GET /api/justificatifs/{id}/file` : téléchargement / visualisation du document justificatif.
  - `GET /api/justificatifs/etudiant/{etudiantId}` : historique des justificatifs déposés par l'étudiant.
- [ ] **`EtudiantController` :**
  - `GET /api/etudiants/{id}/absences` : retourne la liste des absences de l'étudiant connecté, triées de la plus récente à la plus ancienne (réponse en moins de 3 secondes).
  - `GET /api/etudiants/{id}/emploi-du-temps` : planning des cours de sa classe.
- [ ] **`AdminController` :**
  - `POST /api/admin/etudiants` : création de compte étudiant avec validation email unique.
  - `PUT /api/admin/etudiants/{id}` : mise à jour des coordonnées.
  - `POST /api/admin/enseignants` : création de compte enseignant.
  - `GET /api/admin/statistiques` : données d'agrégation (taux d'absence par filière, par matière, par mois).

### 2. Frontend Mobile Expo (`frontend/`)
- [ ] **Navigation Étudiant (`EtudiantTabs.tsx`) :**
  - Onglet 1 : *Mes Absences* (`DashboardEtudiantScreen.tsx`).
  - Onglet 2 : *Emploi du temps* (`EmploiDuTempsScreen.tsx`).
  - Onglet 3 : *Mon Profil* (`ProfilEtudiantScreen.tsx`).
- [ ] **Tableau de Bord Étudiant (`DashboardEtudiantScreen.tsx`) :**
  - Cartes synthétiques en haut : Total absences, Justifiées (vert), Non justifiées (rouge).
  - Liste des absences avec badge d'état (`Non justifiée`, `En attente`, `Justifiée`).
  - Message explicite et agréable si aucune absence enregistrée.
- [ ] **Écran de Dépôt de Justificatif (`DepotJustificatifScreen.tsx`) :**
  - Intégration de la sélection de fichier avec `expo-document-picker` et prise de photo avec `expo-image-picker`.
  - Aperçu du document sélectionné avec affichage du nom et du poids en Ko/Mo.
  - Alerte si le fichier dépasse 5 Mo avant même l'envoi.
  - Bouton d'envoi avec indicateur de chargement (`ActivityIndicator`).
- [ ] **Écran Emploi du Temps (`EmploiDuTempsScreen.tsx`) :**
  - Calendrier par jour de la semaine avec cartes indiquant : Matière, Salle, Enseignant, Horaires.
- [ ] **Espace Administration & Statistiques (`AdminStatsScreen.tsx`) :**
  - Formulaires simples d'ajout d'étudiants / enseignants.
  - Graphiques visuels (barres de progression ou diagrammes de répartition des absences).

---

## 🚀 Workflow Git pour Aya

```powershell
# 1. Se positionner dans le projet
cd "d:\4eme annee\s7\gl-dp\tp3\absence-app"

# 2. Récupérer les dernières mises à jour d'Amine sur main
git checkout main
git pull origin main

# 3. Créer sa branche dédiée
git checkout -b feature/aya-etudiant-admin

# 4. Travailler et commiter
git add .
git commit -m "feat(etudiant): création de l'écran du tableau de bord des absences"

# 5. Pousser sur GitHub
git push -u origin feature/aya-etudiant-admin
```
