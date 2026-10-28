# 🗄️ Schéma Relationnel Détaillé de la Base de Données (Neon PostgreSQL)

Ce document décrit l'ensemble des tables, colonnes, contraintes d'intégrité et relations pour l'application **Absence App**.

---

##  Diagramme Entité-Relation (Mermaid ERD)

```mermaid
erDiagram
    UTILISATEURS ||--o| ETUDIANTS : "1:1 profil etudiant"
    UTILISATEURS ||--o| ENSEIGNANTS : "1:1 profil enseignant"
    UTILISATEURS ||--o{ NOTIFICATIONS : "1:N alertes recues"

    GROUPES ||--o{ ETUDIANTS : "1:N contient"
    GROUPES ||--o{ SEANCES : "1:N planifiees pour"

    ENSEIGNANTS ||--o{ SEANCES : "1:N dispense"
    ENSEIGNANTS ||--o{ ABSENCES : "1:N enregistre"
    ENSEIGNANTS ||--o{ JUSTIFICATIFS : "1:N valide ou rejette"

    MATIERES ||--o{ SEANCES : "1:N associee a"

    SEANCES ||--o{ ABSENCES : "1:N constatees"
    ETUDIANTS ||--o{ ABSENCES : "1:N concerne"

    ABSENCES ||--o| JUSTIFICATIFS : "1:1 piece justificative"

    UTILISATEURS {
        bigserial id PK "Identifiant unique"
        varchar email UK "Email institutionnel unique"
        varchar mot_de_passe "Hachage sécurisé bcrypt"
        varchar nom "Nom de famille"
        varchar prenom "Prénom"
        varchar telephone "Téléphone de contact"
        varchar role "ETUDIANT | ENSEIGNANT | ADMIN"
        boolean actif "Compte activé ou suspendu"
        timestamp created_at "Date de création du compte"
    }

    GROUPES {
        bigserial id PK "Identifiant unique"
        varchar code UK "Code du groupe (ex: GI4-A)"
        varchar nom "Libellé (ex: Génie Informatique 4A)"
        varchar filiere "Filière de rattachement"
        varchar annee_scolaire "Ex: 2026-2027"
    }

    ETUDIANTS {
        bigserial id PK "Identifiant étudiant"
        bigint user_id FK,UK "Lien compte utilisateur"
        varchar matricule UK "Matricule étudiant"
        varchar cne UK "Code National Étudiant"
        bigint groupe_id FK "Groupe assigné"
        varchar photo_url "Photo de trombinoscope"
    }

    ENSEIGNANTS {
        bigserial id PK "Identifiant enseignant"
        bigint user_id FK,UK "Lien compte utilisateur"
        varchar matricule UK "Matricule professeur"
        varchar departement "Ex: Génie Informatique"
        varchar specialite "Ex: Génie Logiciel"
    }

    MATIERES {
        bigserial id PK "Identifiant matière"
        varchar code UK "Code matière (ex: GL401)"
        varchar nom "Libellé (ex: Génie Logiciel)"
        int coefficient "Coefficient du module"
        int heures_total "Volume horaire global"
    }

    SEANCES {
        bigserial id PK "Identifiant séance"
        date date_seance "Date du cours"
        time heure_debut "Heure début (ex: 08:30)"
        time heure_fin "Heure fin (ex: 10:15)"
        varchar type_seance "COURS | TD | TP"
        varchar salle "Ex: Amphi A, Labo 3"
        bigint matiere_id FK "Matière dispensée"
        bigint enseignant_id FK "Professeur présent"
        bigint groupe_id FK "Classe concernée"
        varchar statut "PLANIFIEE | TERMINEE"
    }

    ABSENCES {
        bigserial id PK "Identifiant absence"
        bigint etudiant_id FK "Étudiant absent"
        bigint seance_id FK "Séance concernée"
        bigint enseignant_id FK "Enseignant ayant fait l'appel"
        timestamp date_marquage "Horodatage de saisie"
        varchar type_presence "ABSENT | RETARD"
        int duree_minutes "Durée d'absence (ex: 90 min)"
        varchar statut "NON_JUSTIFIEE | EN_ATTENTE | JUSTIFIEE | REFUSEE"
    }

    JUSTIFICATIFS {
        bigserial id PK "Identifiant justificatif"
        bigint absence_id FK,UK "Absence rattachée (1 max)"
        bigint etudiant_id FK "Étudiant dépositaire"
        varchar nom_fichier "Nom original du fichier"
        varchar chemin_stockage "Chemin sur le serveur"
        varchar type_mime "PDF | JPG | PNG"
        bigint taille_octets "Taille en octets (max 5 Mo)"
        timestamp date_depot "Date et heure de l'envoi"
        timestamp date_traitement "Date de décision de l'enseignant"
        varchar statut "EN_ATTENTE | ACCEPTE | REFUSE"
        text motif_refus "Explication si refusé"
        bigint valide_par_id FK "Enseignant qui a statué"
    }

    NOTIFICATIONS {
        bigserial id PK "Identifiant notification"
        bigint user_id FK "Destinataire de l'alerte"
        varchar titre "Titre de la notification"
        text message "Corps du message push"
        varchar type "ABSENCE | VALIDATION | REFUS"
        boolean lu "État de lecture"
        timestamp date_envoi "Date d'émission"
    }
```

---

## 🔒 Règles de Gestion & Contraintes Métier

1. **Anti-doublon d'absence (US03) :**
   * Contrainte UNIQUE : `UNIQUE(etudiant_id, seance_id)`
   * Un enseignant ne peut jamais enregistrer deux fois le même étudiant absent lors de la même séance.
2. **Intégrité des justificatifs (US06) :**
   * Contrainte UNIQUE : `UNIQUE(absence_id)`
   * Une absence ne possède qu'un seul justificatif à la fois.
   * Contrainte de taille : `taille_octets <= 5242880` (5 Mo maximum).
3. **Unicité des accès (US01 & US13) :**
   * Contrainte UNIQUE sur `utilisateurs(email)`.
   * Contrainte UNIQUE sur `etudiants(cne)` et `etudiants(matricule)`.
