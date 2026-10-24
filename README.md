# Absence App — Système Mobile de Gestion des Absences & Justificatifs

> **Université Privée de Fès (UPF) — GI4**  
> **Module :** Génie Logiciel & Design Patterns (TP 3 : Méthodologie Agile – Scrum)  
> **Auteurs :** Nahli Amine & Bouhsini Aya  
> **Base de données :** Neon PostgreSQL (Cloud)  
> **Architecture :** Monorepo (Spring Boot 3 + React Native Expo)

---

## Organisation du Projet & Découpage Séquentiel Agile

Le projet suit une **méthodologie séquentielle stricte par phase** pour éliminer toute dépendance circulaire :

1. **Partie 1 — Amine NAHLI (US01 à US09 — 37 SP) :**
   * **Cœur Opérationnel & Justificatifs (Terminé intégralement en premier).**
   * Authentification multi-profils, feuille d'appel enseignant avec blocage anti-doublon, rectification, consultation et détail des absences pour l'étudiant, et cycle complet des justificatifs (dépôt ≤ 5 Mo, suivi en direct, validation/rejet avec motif).
   * Amine livre une application 100% opérationnelle avec des absences et justificatifs réels.

2. **Partie 2 — Aya BOUHSINI (US10 à US18 — 41 SP) :**
   * **Analytics, Administration Globale, Emploi du temps & Notifications (Démarre après la Partie 1).**
   * Aya attend la livraison de la Partie 1 pour exploiter directement les données réelles enregistrées : historique des absences prof, calcul automatique du taux d'absentéisme et alertes de seuil, emploi du temps étudiant, administration complète (étudiants, enseignants, filières), tableaux de bord décisionnels BI de la direction et notifications push.

![Répartition Séquentielle des User Stories](docs/Répartition%20des%20User%20Stories%20Amine%20et%20Aya.png)

Consulter la documentation détaillée dans [docs/](docs/) :
* [**README_AMINE.md**](docs/README_AMINE.md) : Feuille de route d'Amine (US01 à US09).
* [**README_AYA.md**](docs/README_AYA.md) : Feuille de route d'Aya (US10 à US18).
* [**REPARTITION_SEQUENTIELLE.md**](docs/REPARTITION_SEQUENTIELLE.md) : Synthèse méthodologique et diagramme de flux séquentiel.
* [**DATABASE_SCHEMA.md**](docs/DATABASE_SCHEMA.md) : Schéma relationnel complet Neon PostgreSQL (Mermaid ERD).

---

## Tableau Récapitulatif des 18 User Stories (78 SP)

| Phase | Responsable | Périmètre | User Stories Assignées | Total SP |
| :---: | :---: | :--- | :--- | :---: |
| **Partie 1**<br>*(En premier)* | **Amine NAHLI** | **Cœur Opérationnel & Justificatifs** | **US01** Authentification & Sécurité (3 SP)<br>**US02** Liste des étudiants pour l'appel (3 SP)<br>**US03** Saisie d'absence & anti-doublon (5 SP)<br>**US04** Consultation absences étudiant (5 SP)<br>**US05** Détail d'une absence (2 SP)<br>**US06** Dépôt justificatif dématérialisé (8 SP)<br>**US07** Suivi en direct du justificatif (3 SP)<br>**US08** Modification/rectification absence (3 SP)<br>**US09** Validation / Rejet justificatif (5 SP) | **37 SP** |
| **Partie 2**<br>*(Après Amine)* | **Aya BOUHSINI** | **Analytics, Admin & Notifications** | **US10** Historique des absences prof (5 SP)<br>**US11** Taux absentéisme & alertes seuil (5 SP)<br>**US12** Consultation emploi du temps (5 SP)<br>**US13** Création étudiant par l'admin (3 SP)<br>**US14** Modification fiche étudiant (2 SP)<br>**US15** Création compte enseignant (3 SP)<br>**US16** Gestion groupes & affectations (5 SP)<br>**US17** Statistiques globales & graphiques BI (8 SP)<br>**US18** Notification push absence (5 SP) | **41 SP** |
| **TOTAL** | — | **Couverture Globale du Projet** | **18 User Stories** | **78 SP** |

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

* **Groupes académiques initialisés :** `GI4-A`, `GI4-B` (Génie Informatique 4ème Année).
* **Module académique initialisé :** `GL401` — Génie Logiciel & Design Patterns.

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
