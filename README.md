# Absence App — Système Mobile de Gestion des Absences & Justificatifs

> **Université Privée de Fès (UPF) — GI4**  
> **Module :** Génie Logiciel & Design Patterns (TP 3 : Méthodologie Agile – Scrum)  
> **Auteurs :** Nahli Amine & Bouhsini Aya  
> **Base de données :** Neon PostgreSQL (Cloud)  
> **Architecture :** Monorepo (Spring Boot 3 + React Native Expo)

---

## Organisation du Projet & Découpage Séquentiel Agile

Le projet suit une **méthodologie séquentielle stricte par phase** pour éliminer toute dépendance circulaire :

1. **Phase 1 — Amine NAHLI (US01 à US09 — 37 SP) :**
   * **Cœur Opérationnel & Justificatifs (Terminé intégralement en premier).**
   * Authentification multi-profils, feuille d'appel enseignant avec blocage anti-doublon, rectification, consultation et détail des absences pour l'étudiant, et cycle complet des justificatifs (dépôt ≤ 5 Mo, suivi en direct, validation/rejet avec motif).
   * Amine livre une application 100% opérationnelle avec des absences et justificatifs réels.

2. **Phase 2 — Aya BOUHSINI (US10 à US18 — 41 SP) :**
   * **Analytics, Administration Globale, Emploi du temps & WebSockets (Démarre après la Phase 1).**
   * Aya attend la livraison de la Phase 1 pour exploiter directement les données réelles enregistrées : historique des absences prof, calcul automatique du taux d'absentéisme et alertes de seuil (> 20%), emploi du temps étudiant, administration complète (étudiants, enseignants, filières), tableaux de bord décisionnels BI de la direction et notifications en temps réel via WebSockets (SockJS / STOMP).

![Répartition Séquentielle des User Stories](docs/Répartition%20des%20User%20Stories%20Amine%20et%20Aya.png)

> **Indicateurs Clés du Projet :**
> - 👥 **2 Membres :** Amine NAHLI & Aya BOUHSINI
> - 📋 **18 User Stories :** 100% Réalisées
> - ⚡ **78 Story Points :** Total du projet (37 SP Amine + 41 SP Aya)

Consulter la documentation détaillée dans [docs/](docs/) :
* [**README_AMINE.md**](docs/README_AMINE.md) : Feuille de route d'Amine (US01 à US09).
* [**README_AYA.md**](docs/README_AYA.md) : Feuille de route d'Aya (US10 à US18).
* [**DATABASE_SCHEMA.md**](docs/DATABASE_SCHEMA.md) : Schéma relationnel complet Neon PostgreSQL (Mermaid ERD).

---

## 📋 Répartition Séquentielle des User Stories (78 SP)

### 🔹 Phase 1 : Amine — Cœur Opérationnel & Justificatifs (Total : 37 SP)

| # | User Story | Description | SP |
| :---: | :--- | :--- | :---: |
| **US01** | Authentification & Sécurité | Inscription, connexion, gestion des rôles | **3 SP** |
| **US02** | Liste des étudiants pour l'appel | Liste filtrable et recherche | **3 SP** |
| **US03** | Enregistrement absence avec anti-doublon | Validation et contrôle anti-doublon | **5 SP** |
| **US04** | Consultation des absences (étudiant) | Liste des absences, détails et statut | **5 SP** |
| **US05** | Détail d'une absence | Informations complètes d'une absence | **2 SP** |
| **US06** | Dépôt dématérialisé de justificatif | Téléversement (PDF/Photo ≤ 5 Mo) | **8 SP** |
| **US07** | Suivi en direct du statut justificatif | État en temps réel | **3 SP** |
| **US08** | Modification / rectification d'absence | Correction par l'enseignant | **3 SP** |
| **US09** | Validation / Rejet du justificatif | Acceptation ou rejet avec motif | **5 SP** |

---

### 🔹 Phase 2 : Aya — Analytics, Admin, Emploi du temps & WebSockets (Total : 41 SP)

| # | User Story | Description | SP |
| :---: | :--- | :--- | :---: |
| **US10** | Historique des absences prof | Consultation et filtrage avancé | **5 SP** |
| **US11** | Taux d'absence & alertes seuil | Calcul automatique et seuil > 20% | **5 SP** |
| **US12** | Consultation emploi du temps | Planning hebdomadaire dynamique | **5 SP** |
| **US13** | Création d'étudiant par l'admin | Ajout avec matricule unique | **3 SP** |
| **US14** | Modification fiche étudiant | Mise à jour des informations | **2 SP** |
| **US15** | Création compte enseignant | Ajout et gestion des enseignants | **3 SP** |
| **US16** | Gestion des groupes & affectations | Création des groupes et filières | **5 SP** |
| **US17** | Statistiques globales & graphiques | Tableaux de bord décisionnels | **8 SP** |
| **US18** | Notification temps réel (WebSocket) | Notifications instantanées | **5 SP** |

---

### 📊 Synthèse du Projet

| Métrique | Valeur |
| :--- | :---: |
| **Équipe de développement** | **2 Membres (Amine \| Aya)** |
| **Total User Stories livrées** | **18 / 18 (100% Réalisées)** |
| **Story Points totaux** | **78 SP (37 SP Amine + 41 SP Aya)** |

---

## 🔐 Sécurité & Gestion des Accès (Configuration via `.env`)

Conformément aux exigences de sécurité, **aucun compte ni mot de passe n'est stocké en dur dans le code ou la documentation** :

1. **Compte Administrateur Initial :**
   * Configuré de façon privée et sécurisée dans votre fichier `backend/.env` (ignoré par Git) :
     ```env
     ADMIN_EMAIL=votre_email_admin@upf.com
     ADMIN_PASSWORD=votre_mot_de_passe_securise
     ```
   * Ce compte permet de piloter la scolarité et de valider les demandes d'accès.

2. **Création des Comptes Enseignants & Étudiants :**
   * Les utilisateurs créent directement leur compte depuis l'écran de connexion de l'application mobile via l'onglet **« Créer un compte »**.
   * Chaque demande est transmise à l'administrateur en attente de validation (`actif = false`).
   * L'administrateur valide ou refuse les inscriptions depuis son tableau de bord.

3. **Architecture Zéro-Seeder & Autonomie Administrateur :**
   * Aucun groupe, module, salle ni faux profil n'est codé en dur en base de données.
   * L'administrateur gère l'ensemble de l'infrastructure académique depuis son hub de pilotage :
     * **Salles de classe :** Création et dimensionnement des salles de cours et laboratoires.
     * **Modules / Matières :** Définition des modules, coefficients et volumes horaires.
     * **Classes & Promotions :** Création des classes et association aux modules d'enseignement.
   * **Garde-fous intelligents à l'inscription :** Les inscriptions des étudiants et des enseignants sont automatiquement conditionnées par la configuration préalable des classes et modules par l'administrateur.

---

## Démarrage Rapide

### Option A — 1-Clic sous Windows (Recommandée)
Double-cliquez sur le script racine :
* **[`start.bat`](start.bat)** : Lance en simultané le backend Spring Boot (Port 8080) et le frontend Expo Metro (Port 8081).
* **[`start-tunnel.bat`](start-tunnel.bat)** : Variante avec Expo Tunnel (si votre téléphone est en 4G ou si le pare-feu isole les ports).

### Option B — Lancement Manuel

#### 1. Démarrer le Backend (Spring Boot 3)
```powershell
cd backend
mvn spring-boot:run
```
*API disponible sur `http://localhost:8080/api`.*

#### 2. Démarrer le Frontend (React Native Expo)
```powershell
cd frontend
npm start
```
*Scannez le QR Code avec **Expo Go** sur votre smartphone ou tapez `w` pour tester dans le navigateur.*
