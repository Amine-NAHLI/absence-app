# 📚 Dossier de Documentation du Projet — 7ader
**Module :** Génie Logiciel & Design Patterns (GL-DP)  
**TP3 :** Méthodologie Agile – Scrum & Application Mobile-First  
**Institution :** Université Privée de Fès (UPF) — Faculté des Sciences de l'Ingénieur  
**Filière :** 4ème Année Génie Informatique (GI4 - S7)  
**Binôme d'Ingénierie :** Amine NAHLI & Aya BOUHSINI  

---

## 🎯 Présentation du Projet 7ader

**7ader** est une plateforme logicielle complète conçue pour moderniser et dématérialiser la gestion de l'assiduité universitaire à l'UPF. 

Elle repose sur une architecture **N-Tiers** distribuée combinant :
* **Un Backend robuste :** API RESTful sous **Spring Boot 3 (Java 17)**, sécurisée par **Spring Security 6 (JWT / RBAC)** et adossée à une base **PostgreSQL (Neon Cloud)**.
* **Un Frontend mobile intuitif :** Application mobile sous **React Native Expo (TypeScript)** adaptée aux trois profils de l'université (*Enseignants*, *Étudiants*, *Administrateurs*).

---

## 📑 Sommaire des Livrables Documentaires

Afin de faciliter l'évaluation académique, l'ensemble des livrables méthodologiques et techniques est structuré dans les documents suivants :

| Fichier Documentaire | Description & Contenu Clé | Rôles Concernés |
| :--- | :--- | :---: |
| [**`REPARTITION_DES_TACHES_SCRUM.md`**](./REPARTITION_DES_TACHES_SCRUM.md) | **Dossier méthodologique complet :**<br>• Rôles Scrum (PO, SM, Developers).<br>• Matrice de répartition détaillée tâche par tâche pour chaque User Story (US01 à US17).<br>• Description des rituels Scrum vécus (Sprint Planning, Daily, Review, Rétrospective).<br>• Matrice RACI synthétique. | **Binôme**<br>(Amine & Aya) |
| [**`CONTRIBUTION_AMINE_NAHLI.md`**](./CONTRIBUTION_AMINE_NAHLI.md) | **Rapport de contribution individuelle :**<br>• Rôle : **Scrum Master (SM)** & **Lead Backend**.<br>• Conception N-Tiers, Patterns de conception (GL-DP).<br>• Schéma relationnel BDD, sécurité Spring Security 6 & JWT.<br>• Logique métier anti-doublon, calcul d'assiduité, gestion centralisée des erreurs. | **Amine NAHLI** |
| [**`CONTRIBUTION_AYA_BOUHSINI.md`**](./CONTRIBUTION_AYA_BOUHSINI.md) | **Rapport de contribution individuelle :**<br>• Rôle : **Product Owner (PO)** & **Lead Frontend Mobile**.<br>• Vision produit, formalisation du Product Backlog & critères d'acceptation (DoR/DoD).<br>• Conception ergonomique UI/UX Mobile-First sur React Native Expo.<br>• Développement des 3 espaces métier (Enseignant, Étudiant, Administrateur). | **Aya BOUHSINI** |
| [**`DATABASE_SCHEMA.md`**](./DATABASE_SCHEMA.md) | **Spécifications techniques de la base de données :**<br>• Schéma Entité-Relation en diagramme Mermaid.<br>• Dictionnaire complet des 10 tables et clés étrangères.<br>• Règles d'intégrité référentielle et contraintes d'unicité. | **Technique** |

---

## 🛠️ Stack Technologique & Patterns Mis en Œuvre

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION MOBILE                               │
│                    React Native Expo (TypeScript)                           │
│      [Espace Enseignant]     [Espace Étudiant]     [Espace Administrateur]  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Requêtes HTTP / JSON (Axios & JWT)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND RESTful N-TIERS                            │
│                            Spring Boot 3 (Java 17)                          │
│                                                                             │
│  [REST Controllers]  ──>  [Business Services]  ──>  [Spring Data JPA Repos] │
│           │                       │                             │           │
│  Spring Security & JWT       Règles Métier &          Hibernate ORM         │
│  Contrôle d'accès RBAC       Logique Anti-Doublon      Pool HikariCP        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ TCP / SSL
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BASE DE DONNÉES RELATIONNELLE                         │
│                           Neon PostgreSQL (Cloud)                           │
│  10 Tables : Utilisateurs, Classes, Séances, Émargements, Justificatifs...   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Synthèse des Rôles Scrum du Binôme

* **Aya BOUHSINI** : Product Owner (PO) & Développeuse Mobile React Native.
* **Amine NAHLI** : Scrum Master (SM) & Développeur Backend Spring Boot / BDD.

---
*Dossier technique et méthodologique rédigé dans le cadre des travaux pratiques de Génie Logiciel.*
