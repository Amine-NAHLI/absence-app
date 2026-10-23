# 📋 Feuille de Route & Tâches — Aya BOUHSINI (Phase 2 : Espace Étudiant, Justificatifs & Analytics)

> **Rôle :** Responsable Espace Étudiant, Cycle Complet des Justificatifs (Dépôt + Décision), Emploi du temps & Reporting BI  
> **Volume Agile :** 39 Story Points (Sprint 2 — 100% autonome sur base stable)  
> **Ordre d'exécution :** ⚡ **PARTIE 2 — Démarre après achèvement complet de la Partie 1 d'Amine**  
> **Principe clé :** Aya prend en charge l'expérience étudiant et détient **100% du cycle des justificatifs** (dépôt, suivi et validation/rejet). Aucun aller-retour ni dépendance envers Amine.  
> **Branche Git :** `feature/aya-phase2-etudiant-justificatifs`

---

## 🎯 Objectif Général de la Partie 2

Aya s'appuie sur la base opérationnelle livrée par Amine (où des séances et absences réelles existent déjà). Elle développe l'espace mobile étudiant, l'emploi du temps, la chaîne complète dématérialisée des pièces justificatives (upload, stockage sécurisé, arbitrage scolarité avec motif), et le tableau de bord décisionnel d'absentéisme global de l'établissement.

---

## 📌 User Stories prises en charge par Aya (39 SP)

| ID | Intitulé de la User Story | Priorité | Estimation | Statut |
| :--- | :--- | :---: | :---: | :---: |
| **US04** | Consulter la liste de ses propres absences (tableau de bord étudiant) | **Haute** | **5 SP** | ✅ Réalisé |
| **US05** | Consulter le détail d'une absence (matière, enseignant, créneau, statut) | **Moyenne** | **2 SP** | ✅ Réalisé |
| **US06** | Déposer un justificatif dématérialisé (Upload PDF, JPG, PNG ≤ 5 Mo) | **Haute** | **8 SP** | 🔄 En cours |
| **US07** | Suivre en direct le statut de son justificatif (En attente / Validé / Refusé) | **Moyenne** | **3 SP** | ✅ Réalisé |
| **US09** | Traiter, valider ou refuser un justificatif avec motif (vue scolarité/admin) | **Haute** | **5 SP** | 🔄 En cours |
| **US12** | Consulter son emploi du temps hebdomadaire (matières, salles, horaires) | **Moyenne** | **5 SP** | 🔄 En cours |
| **US15** | Créer des comptes enseignants par l'administration (avec département) | **Moyenne** | **3 SP** | ✅ Réalisé |
| **US17** | Consulter les statistiques globales d'assiduité sous forme graphique | **Haute** | **8 SP** | ✅ Réalisé |

**Total Phase 2 (Aya) : 39 Story Points**

---

## 🛠️ Travail Réalisé par Couche (Partie 2)

### 1. Cycle Complet des Justificatifs (US06, US07, US09)
*Ce module est 100% unifié sous la responsabilité d'Aya : elle gère le dépôt côté étudiant ET la validation côté administration sans dépendre d'Amine.*
- [ ] **Modèle & Stockage JPA :**
  - Entité `Justificatif` (`absence_id`, `etudiant_id`, `nomFichier`, `cheminFichier`, `typeMime`, `tailleFichier`, `dateDepot`, `statut`, `motifRefus`, `validePar_id`).
- [ ] **`JustificatifController` (Upload & Décision) :**
  - `POST /api/justificatifs/upload` : réception `multipart/form-data`, vérification MIME (PDF, JPG, PNG) et limite stricte ≤ 5 Mo.
  - `GET /api/justificatifs/etudiant/{etudiantId}` : liste des justificatifs soumis avec statut en temps réel.
  - `GET /api/justificatifs/{id}/file` : visualisation ou téléchargement du document original.
  - `PUT /api/justificatifs/{id}/decision` : validation (`JUSTIFIEE`) ou rejet (`REFUSEE` avec motif obligatoire).
- [ ] **Interface Mobile Justificatifs :**
  - Sélecteur de fichier avec `expo-document-picker` et prise de photo avec `expo-image-picker`.
  - Contrôle de taille côté client avant l'envoi (< 5 Mo).
  - Modal d'examen et arbitrage pour l'administration/scolarité avec boutons « Valider » et « Refuser ».

### 2. Espace Étudiant & Emploi du Temps (US04, US05, US12)
- [x] **Écran de Suivi Personnel (`EtudiantHomeScreen.tsx`) :**
  - Synthèse par cartes KPI : Total d'absences, Justifiées (vert), Non justifiées (rouge).
  - Liste chronologique des absences avec libellé de cours et enseignant.
  - Puce d'accès direct au dépôt de justificatif (`paperclip`).
- [ ] **Écran Emploi du Temps (`EmploiDuTempsScreen.tsx`) :**
  - `GET /api/etudiants/{id}/emploi-du-temps` : affichage du planning de la semaine avec créneau, matière et salle.

### 3. Pilotage Administratif & BI Analytics (US15, US17)
- [x] **Tableau de Bord Direction (`AdminHomeScreen.tsx`) :**
  - Cartes d'indicateurs d'assiduité générale de l'établissement.
  - Taux de présence par classe (`GI4-A`, `GI4-B`) avec jauges graphiques de conformité.
  - Création de professeurs (`POST /api/admin/enseignants`).

---

## 🚀 Workflow Git pour Aya (Démarrage Phase 2)

```powershell
# 1. Se positionner dans le projet
cd "d:\4eme annee\s7\gl-dp\tp3\absence-app"

# 2. Récupérer le travail complet d'Amine terminé sur main
git checkout main
git pull origin main

# 3. Créer sa branche dédiée pour la Phase 2
git checkout -b feature/aya-phase2-etudiant-justificatifs

# 4. Travailler en toute indépendance et commiter
git add .
git commit -m "feat(justificatifs): upload de certificat médical et validation scolarite"

# 5. Pousser sur GitHub
git push -u origin feature/aya-phase2-etudiant-justificatifs
```
