# 👩‍💻 Rapport Individuel de Contribution Technique & Produit
**Étudiante :** Aya BOUHSINI  
**Promotion :** 4ème Année Génie Informatique (GI4 - S7)  
**Module :** Génie Logiciel & Design Patterns (GL-DP) — TP3  
**Institution :** Université Privée de Fès (UPF)  
**Rôle Scrum :** Product Owner (PO) & Lead Développeuse Frontend Mobile  
**Application :** 7ader — Système Intelligent de Gestion de l'Assiduité  

---

## 1. Synthèse du Rôle & Responsabilités Clés

Dans le cadre du projet **7ader**, j'ai exercé une double mission fondamentale combinant gestion de produit et ingénierie mobile :
1. **Product Owner (PO) :** Définition de la vision produit, cadrage des besoins métier à l'UPF, rédaction des User Stories, formalisation des critères d'acceptation, priorisation de la valeur dans le Product Backlog et recette finale des fonctionnalités.
2. **Lead Développeuse Frontend Mobile :** Conception ergonomique (UI/UX) Mobile-First, architecture applicative sous **React Native Expo (TypeScript)**, développement de l'ensemble des écrans pour les trois profils utilisateurs (Enseignant, Étudiant, Administrateur), gestion des états applicatifs et intégration avec l'API REST.

---

## 2. Réalisations Produit (Product Owner) Détaillées

### A. Analyse du Contexte Universitaire & Vision Produit
* Étude approfondie des limites du système traditionnel d'émargement papier à l'UPF (lenteur d'enregistrement en classe, risques de falsification, opacité pour l'étudiant, surcharge administrative pour le traitement manuel des justificatifs).
* Définition de la proposition de valeur de **7ader** : *une application mobile unifiée, réactive et sécurisée offrant une transparence absolue de l'assiduité en temps réel*.

### B. Formalisation du Product Backlog & des User Stories
* Rédaction standardisée de toutes les exigences fonctionnelles selon la syntaxe agile :
  > *« En tant que **[Acteur]**, je veux **[Fonctionnalité]**, afin de **[Bénéfice Métier]**. »*
* Définition rigoureuse de la **Definition of Ready (DoR)** avant engagement dans le sprint :
  * L'expression de besoin est sans ambiguïté.
  * Les maquettes d'écrans sont validées.
  * Les données nécessaires en entrée et en sortie de l'API sont convenues avec le Scrum Master / Backend.
* Établissement de la **Definition of Done (DoD)** pour valider la livraison :
  * L'interface répond parfaitement aux critères d'acceptation.
  * Les interactions tactiles sont fluides et préviennent les erreurs de saisie.
  * Les appels API sont sécurisés et testés en conditions réelles avec le serveur.

### C. Arbitrage & Recette Fonctionnelle
* Priorisation des User Stories selon la méthode MoSCoW pour composer un premier sprint de 20 Story Points garantissant un **MVP opérationnel** pour la prise d'appel.
* Animation des phases de recette utilisateur à chaque fin d'itération (Sprint Review).

---

## 3. Réalisations Techniques Mobile (React Native Expo & UI/UX)

### A. Architecture Logicielle Frontend Mobile-First
J'ai conçu l'architecture frontend sur **React Native Expo** en adoptant une structure modulaire et scalable :
* **Organisation modulaire :** Séparation claire entre les composants réutilisables (`components/`), les écrans métier (`screens/`), les services réseau (`services/api/`) et la gestion d'état global.
* **Système de Navigation Sécurisé :** Mise en place d'une navigation conditionnelle basée sur le rôle de l'utilisateur connecté (redirection automatique vers l'espace Enseignant, Étudiant ou Administrateur dès validation du token JWT).
* **Gestion du Design System & Typographie :** Respect strict de la charte graphique UPF (palette de bleus institutionnels, cartes avec coins arrondis `16px`, typographie moderne, feedback haptique et micro-animations).

### B. Conception et Développement des Espaces Métier

#### 1. Espace Authentification & Inscription Multi-Rôles
* Conception d'une interface d'accueil moderne avec un sélecteur de profil clair (*Professeur*, *Étudiant*, *Admin*).
* Formulaire d'inscription académique complet avec validation dynamique des champs obligatoires (CNE/Massar pour les étudiants, matricule enseignant, adresse email institutionnelle `@upf.ac.ma`).
* Sauvegarde persistante du jeton d'authentification (JWT) et déconnexion sécurisée.

#### 2. Espace Enseignant — Prise d'Appel Rapide & Anti-Doublon
* **Gestion des cours :** Consultation des séances du jour, planification et réservation rapide d'une nouvelle séance avec choix de la salle et de la matière.
* **Feuille d'émargement interactive :** Affichage optimisé des étudiants de la classe avec barre de recherche en temps réel par nom ou matricule.
* **Ergonomie optimisée en classe :** Boutons d'action rapide en un clic (*"Tous présents"*, *"Inverser la sélection"*), pastilles d'état colorées, et bouton de validation avec indicateur dynamique du nombre d'absents constatés.

#### 3. Espace Étudiant — Transparence de l'Assiduité & Démarches Dématérialisées
* **Dashboard personnel :** Visualisation immédiate du pourcentage d'assiduité global avec code couleur préventif (Vert = assiduité exemplaire, Rouge = risque d'élimination sous $75\%$).
* **Emploi du temps & Notifications :** Consultation des créneaux de cours programmés par jour de la semaine et alertes en direct en cas d'absence signalée.
* **Module de Justificatifs Dématérialisé :** Interface intuitive permettant à l'étudiant de téléverser son certificat médical (PDF ou prise de photo via le smartphone), avec suivi en direct de l'état de traitement (*En attente*, *Validé*, *Rejeté*).

#### 4. Espace Administrateur — Pilotage Académique & Décisionnel (BI)
* **Tableau de bord de supervision :** Visualisation des compteurs globaux (effectifs étudiants, enseignants, classes actives, demandes d'inscription en attente d'arbitrage).
* **Analytics BI :** Cartes de performance académique, suivi du taux d'assiduité moyen par filière et détection des groupes en difficulté.
* **Modération administrative :** Interface d'arbitrage pour valider ou rejeter les comptes étudiants et les justificatifs médicaux avec saisie du motif.

---

## 4. Détail de mes Contributions par User Story

| User Story | Périmètre Conçu & Développé par Aya BOUHSINI | Validation PO |
| :--- | :--- | :---: |
| **US01 - Authentification** | Écran `LoginScreen.tsx`, `RegisterScreen.tsx`, sélecteur de rôle, gestion du token JWT dans le contexte d'authentification. | ✅ Validé |
| **US02 - Liste Étudiants** | Écran de gestion des classes, liste interactive des élèves avec recherche textuelle instantanée. | ✅ Validé |
| **US03 - Appel Anti-doublon** | Interface de feuille d'émargement `AttendanceScreen.tsx`, boutons "Tous présents", feedback visuel de confirmation. | ✅ Validé |
| **US04 - Taux Assiduité** | Écran d'accueil étudiant `StudentHomeScreen.tsx`, jauge de présence, récapitulatif séances manquées. | ✅ Validé |
| **US06 - Dépôt Justificatif** | Intégration de l'API de sélection de document, formulaire d'upload avec prévisualisation et suivi du statut. | ✅ Validé |
| **US08 - Validation Admin** | Écran d'arbitrage pour la scolarité, consultation des pièces jointes, modals d'approbation et de rejet. | ✅ Validé |
| **US17 - Analytics Décisionnel** | Écran de Business Intelligence `AdminAnalyticsScreen.tsx`, cartes graphiques et filtres multi-critères. | ✅ Validé |

---

## 5. Bilan Personnel & Acquis

Ce projet m'a apporté des compétences concrètes et transversales :
* **Product Management & Vision Agile :** Savoir transformer une problématique terrain complexe en un backlog structuré, priorisé et réalisable dans un délai imparti.
* **Développement Mobile React Native :** Maîtrise avancée du framework Expo, création d'interfaces ergonomiques centrées utilisateur (UX Mobile) et communication sans faille avec une API REST Spring Boot.
* **Travail en Binôme :** Collaboration étroite et constante avec le Scrum Master pour aligner en permanence les modèles de données backend avec les exigences de l'interface mobile.
