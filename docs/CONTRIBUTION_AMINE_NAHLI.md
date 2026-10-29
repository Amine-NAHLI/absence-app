# 👨‍💻 Rapport Individuel de Contribution Technique
**Étudiant :** Amine NAHLI  
**Promotion :** 4ème Année Génie Informatique (GI4 - S7)  
**Module :** Génie Logiciel & Design Patterns (GL-DP) — TP3  
**Institution :** Université Privée de Fès (UPF)  
**Rôle Scrum :** Scrum Master (SM) & Lead Développeur Backend / Architecture  
**Application :** 7ader — Système Intelligent de Gestion de l'Assiduité  

---

## 1. Synthèse du Rôle & Responsabilités Clés

Dans le cadre du projet **7ader**, j'ai assuré une double casquette méthodologique et technique :
1. **Scrum Master (SM) :** Garant de la méthodologie Scrum, animation des réunions quotidiennes (Daily Scrum), suivi de la vélocité de l'équipe, maintenance du tableau Kanban et suppression proactive de tous les obstacles techniques (réseau, déploiement, configuration).
2. **Lead Architecte & Développeur Backend :** Conception de l'architecture logicielle N-Tiers, modélisation de la base de données relationnelle sur PostgreSQL Neon, développement complet de l'API RESTful sous **Spring Boot 3 (Java 17)**, sécurisation par tokens JWT et écriture de la logique métier critique.

---

## 2. Réalisations Architecturales & Techniques Détaillées

### A. Architecture N-Tiers & Patterns de Conception (GL-DP)
J'ai conçu et mis en place une architecture logicielle modulaire respectant les standards du Génie Logiciel :
* **Couche Contrôleurs (REST Web Layer) :** Définition des endpoints RESTful normalisés, validation des requêtes entrantes via `@Valid`, gestion des codes HTTP sémantiques (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`).
* **Couche Service (Business Logic Layer) :** Isolation stricte des règles métier et garantie de l'intégrité transactionnelle avec l'annotation `@Transactional`.
* **Couche Accès aux Données (Spring Data JPA) :** Requêtage optimisé par requêtes dérivées et requêtes JPQL annotées `@Query` pour prévenir le problème des requêtes $N+1$.
* **Couche Modèle (JPA Entities & DTOs) :** Séparation nette entre les entités persistantes de base de données et les objets de transfert de données (DTOs), évitant toute exposition de données sensibles (mots de passe, tokens internes).

### B. Modélisation et Implémentation de la Base de Données (Neon PostgreSQL)
* Élaboration du schéma relationnel global composé de 10 tables interconnectées avec intégrité référentielle stricte (`ON DELETE CASCADE` / `SET NULL`).
* Configuration de la source de données cloud serverless **Neon PostgreSQL** via `application.properties`.
* Indexation des clés étrangères (`etudiant_id`, `seance_id`, `classe_id`) pour assurer un temps de réponse inférieur à 50ms sur les requêtes volumineuses.

### C. Sécurité Avancée Multi-Rôles (Spring Security 6 & JWT)
* Implémentation du protocole d'authentification sans état (Stateless) basé sur **JSON Web Tokens (JWT)**.
* Chiffrement fort des mots de passe à l'aide de l'algorithme `BCryptPasswordEncoder`.
* Mise en place du contrôle d'accès basé sur les rôles (**RBAC - Role-Based Access Control**) :
  * `ROLE_PROFESSEUR` : Autorisé à créer des séances, lister ses étudiants et soumettre l'émargement.
  * `ROLE_ETUDIANT` : Autorisé à consulter son taux personnel et à déposer des justificatifs.
  * `ROLE_ADMIN` : Accès aux dashboards décisionnels (BI), gestion des utilisateurs et validation des justificatifs.
* Configuration des filtres de sécurité `JwtAuthenticationFilter` et gestion globale des règles CORS pour autoriser les requêtes cross-origin de l'application mobile React Native Expo.

### D. Algorithmes & Règles Métier Critiques Implémentées
1. **Contrôle d'Émargement Anti-Doublon :**
   * Verrouillage transactionnel interdisant l'enregistrement multiple d'une même présence/absence pour un étudiant lors d'une même séance.
   * Mise à jour automatique si l'enseignant rectifie son appel (`upsert` intelligent).
2. **Moteur de Calcul d'Assiduité Dynamique :**
   * Calcul en temps réel du taux d'assiduité individuel :
     $$\text{Taux d'assiduité} = \left(\frac{\text{Heures de présence validées}}{\text{Volume horaire total dispensé}}\right) \times 100$$
   * Détection préventive du seuil critique d'élimination (fixé à $75\%$ de présence).
3. **Gestion Centralisée des Exceptions & Logging Détaillé :**
   * Implémentation d'un composant `@RestControllerAdvice` (`GlobalExceptionHandler`) renvoyant des payloads d'erreur structurés en JSON : `timestamp`, `status`, `error`, `message`, `path`.
   * Logs détaillés en console pour un diagnostic immédiat des anomalies réseau et d'accès aux données.

---

## 3. Détail de mes Contributions par User Story

| User Story | Périmètre Développé par Amine NAHLI | Statut de Recette |
| :--- | :--- | :---: |
| **US01 - Authentification** | Services `AuthService`, `UserDetailsServiceImpl`, génération & validation des tokens JWT, endpoints `/api/auth/login` et `/api/auth/register`. | ✅ Validé & Testé |
| **US02 - Liste Étudiants** | Requête optimisée `findByClasseIdWithDetails`, DTO `EtudiantSummaryDTO`, endpoint `/api/classes/{id}/etudiants`. | ✅ Validé & Testé |
| **US03 - Appel Anti-doublon** | Logique transactionnelle dans `EmargementService`, gestion des statuts de présence (PRÉSENT, ABSENT, RETARD), endpoint `/api/seances/{id}/emargement`. | ✅ Validé & Testé |
| **US04 - Taux Assiduité** | Service analytique `AssiduiteService`, agrégation des statistiques par étudiant et par matière, endpoint `/api/etudiants/{id}/assiduite`. | ✅ Validé & Testé |
| **US06 - Dépôt Justificatif** | Système de réception multipart/form-data, stockage physique et métadonnées en base, endpoint `/api/justificatifs/upload`. | ✅ Validé & Testé |
| **US08 - Validation Admin** | Workflow de décision (acceptation/refus avec motif d'arbitrage) répercutant l'état de l'absence en base, endpoint `/api/admin/justificatifs/{id}/decision`. | ✅ Validé & Testé |
| **US17 - Analytics Décisionnel** | Requêtes agrégées pour les indicateurs BI : taux moyen de présence par filière, classes en alerte, endpoint `/api/admin/analytics/kpis`. | ✅ Validé & Testé |

---

## 4. Bilan Personnel & Acquis

Ce projet m'a permis de consolider mes compétences pratiques en :
* **Génie Logiciel & Architecture :** Conception rigoureuse d'une API industrielle en couches étanches avec Spring Boot 3.
* **Méthodologie Scrum :** En tant que Scrum Master, j'ai veillé à maintenir une cadence régulière, éliminer les freins techniques (gestion de ports, synchronisation IP LAN avec Expo) et assurer la convergence fluide entre le Frontend et le Backend.
* **Qualité & Fiabilité :** Conception de règles métier robustes garantissant l'intégrité des données universitaires.
