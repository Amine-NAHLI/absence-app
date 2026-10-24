# 📋 Feuille de Route & Tâches — Aya BOUHSINI (Phase 2 : US10 à US18)

> **Rôle :** Responsable Historiques, Analytics Avancés, Emploi du Temps, Administration & Notifications  
> **Périmètre Strict :** **US10 jusqu'à US18**  
> **Volume Agile :** 41 Story Points (Sprint 2)  
> **Ordre d'exécution :** ⚡ **PARTIE 2 — Démarre après l'achèvement complet de la Partie 1 (Amine : US01 à US09)**  
> **Règle d'or :** Aya attend qu'Amine ait terminé et livré les User Stories US01 à US09. Aya prend ensuite le relais sur une base stable et opérationnelle.  
> **Branche Git :** `feature/aya-phase2-us10-us18`

---

## 🎯 Objectif Général de la Partie 2

Aya intervient sur une application dont le cœur fonctionne déjà (utilisateurs connectés, absences saisies, justificatifs traités). Elle prend en charge :
1. Les modules d'historique et de surveillance (journal enseignant, taux d'absentéisme et alertes).
2. L'emploi du temps interactif des étudiants.
3. La gestion administrative complète (création/modification d'étudiants, enseignants, groupes et affectations).
4. Le tableau de bord décisionnel d'assiduité globale (graphiques BI).
5. Le système d'alertes et de notifications push en temps réel.

---

## 📌 User Stories prises en charge par Aya (US10 à US18 — 41 SP)

| ID | Intitulé de la User Story | Rôle Concerné | Estimation | Priorité |
| :--- | :--- | :---: | :---: | :---: |
| **US10** | Consulter l'historique complet des absences par groupe et matière | Enseignant | **5 SP** | Moyenne |
| **US11** | Consulter le taux d'absentéisme d'un étudiant avec alerte de seuil (> 20%) | Enseignant / Étudiant | **5 SP** | Moyenne |
| **US12** | Consulter son emploi du temps (jour / semaine / créneaux) | Étudiant | **5 SP** | Moyenne |
| **US13** | Ajouter un nouvel étudiant par l'administration (avec matricule unique) | Admin | **3 SP** | Haute |
| **US14** | Modifier les informations d'un étudiant (email, téléphone, classe) | Admin | **2 SP** | Basse |
| **US15** | Ajouter un enseignant par l'administration (département, matière) | Admin | **3 SP** | Moyenne |
| **US16** | Gérer les groupes, filières et affectations de cours | Admin | **5 SP** | Haute |
| **US17** | Consulter les statistiques globales d'absence sous forme graphique (BI) | Admin / Direction | **8 SP** | Haute |
| **US18** | Envoyer une notification en temps réel lors d'une absence via **WebSockets (SockJS / STOMP)** *(Contournement blocage SDK Expo push)* | Système / WebSocket | **5 SP** | Moyenne |

**Sous-total Partie 2 (Aya) : 41 Story Points**

---

## 🛠️ Travail à Réaliser par Couche (Partie 2)

### 1. Backend Spring Boot (`backend/`)
- [ ] **`Historique & Analytics` (US10, US11, US17) :**
  - `GET /api/absences/historique` : filtre par groupe, date et matière pour les professeurs.
  - `GET /api/statistiques/etudiant/{id}/taux` : calcul du pourcentage d'absence par rapport au volume horaire global.
  - `GET /api/admin/statistiques` : agrégations globales pour la direction (taux par filière, par niveau GI4, par mois).
- [ ] **`EmploiDuTempsController` (US12) :**
  - `GET /api/etudiants/{id}/emploi-du-temps` : planning hebdomadaire de la classe.
- [ ] **`AdminController` (US13, US14, US15, US16) :**
  - `POST /api/admin/etudiants` : création de compte étudiant avec validation email et matricule unique.
  - `PUT /api/admin/etudiants/{id}` : mise à jour de la fiche étudiant.
  - `POST /api/admin/enseignants` : création d'enseignants.
  - `POST /api/admin/groupes` & `PUT /api/admin/groupes/{id}/affectations` : gestion des filières et cours.
- [ ] **`WebSocketNotificationService` (US18 — Déviation Technique justifiée) :**
  - Mise en place du broker de messages WebSocket (`WebSocketConfig` avec STOMP + SockJS).
  - Diffusion instantanée sur `/topic/etudiant/{id}/absences` dès qu'une absence est enregistrée par l'enseignant.
  - *Justification technique :* Le SDK Expo actuel (Expo Go) bloque les notifications push distantes (FCM / APNs) sans configuration EAS Build et compte payant. L'utilisation des WebSockets garantit des alertes temps réel immédiates et fiables.

### 2. Frontend Mobile React Native (`frontend/`)
- [ ] **Écran Historique & Taux d'absentéisme (US10, US11) :**
  - Vue détaillée des séances passées et pastille de couleur pour les étudiants au-delà du seuil critique (> 20%).
- [ ] **Écran Emploi du Temps (`EmploiDuTempsScreen.tsx` - US12) :**
  - Planning de la semaine avec cartes horaires et salles.
- [ ] **Espace Administration & Gestion Scolarité (`AdminHomeScreen.tsx` - US13, US14, US15, US16, US17) :**
  - Formulaires d'ajout rapide d'étudiants, enseignants et groupes.
  - Graphiques visuels et barres de progression d'assiduité par groupe (GI4-A / GI4-B).
- [ ] **Module d'Alerte Temps Réel WebSocket (US18) :**
  - Connexion au flux WebSocket du backend lors de la connexion de l'étudiant.
  - Bannière animée in-app et vibration lors de la réception d'une alerte d'absence.

---

## 🚀 Workflow Git pour Aya (Démarrage après Amine)

```powershell
# 1. Se positionner dans le projet
cd "d:\4eme annee\s7\gl-dp\tp3\absence-app"

# 2. Récupérer le travail complet d'Amine (US01 à US09 validés sur main)
git checkout main
git pull origin main

# 3. Créer sa branche dédiée
git checkout -b feature/aya-phase2-us10-us18

# 4. Travailler sur US10 à US18 et commiter régulièrement
git add .
git commit -m "feat(analytics): ajout du calcul des taux d'absentéisme et seuils d'alerte"

# 5. Pousser sur GitHub
git push -u origin feature/aya-phase2-us10-us18
```
