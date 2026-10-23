# 📊 Découpage Séquentiel Strict : US01-US09 (Amine) puis US10-US18 (Aya)

> **Projet PFA :** Système Mobile & Web de Gestion des Absences & Justificatifs (UPF)  
> **Principe Séquentiel Absolu :** Amine réalise et termine intégralement la **Partie 1 (US01 à US09)**. Une fois terminé, Aya prend le relais et réalise la **Partie 2 (US10 à US18)**.  
> **Volume Global :** 78 Story Points (37 SP Amine + 41 SP Aya)

---

## 🎯 Pourquoi ce Découpage (US01-US09 puis US10-US18) ?

1. **Partie 1 (Amine : US01 à US09) = Le Cœur Opérationnel des Absences & Justificatifs :**
   * Amine met en place toute la fondation (Auth, BDD, Prise d'appel prof, anti-doublon, modification).
   * Amine gère également toute la chaîne opérationnelle de base pour l'étudiant et le justificatif (consultation des absences, dépôt de pièce justificative, suivi et arbitrage/validation par le prof ou l'admin).
   * **Amine termine à 100% et livre l'application avec un cycle complet d'absence fonctionnel.**

2. **Partie 2 (Aya : US10 à US18) = Analytics, Administration Globale, Emploi du temps & Notifications :**
   * Aya n'intervient qu'une fois la Partie 1 livrée.
   * Elle peut exploiter directement les vraies données d'absences saisies pour générer les historiques (**US10**), calculer les taux d'absentéisme et alertes (**US11**), et construire les graphiques décisionnels BI de la direction (**US17**).
   * Elle complète l'application avec l'emploi du temps (**US12**), la gestion administrative globale des comptes et filières (**US13, US14, US15, US16**) et les alertes push (**US18**).
   * **Zéro allers-retours, zéro blocage.**

---

## 🔄 Diagramme de Flux Séquentiel

```mermaid
flowchart TD
    subgraph PHASE1["🚀 PARTIE 1 : AMINE NAHLI (US01 à US09 — 37 SP)"]
        direction TB
        A1["US01 : Authentification & Sécurité (3 SP)"]
        A2["US02 : Liste des étudiants pour l'appel (3 SP)"]
        A3["US03 : Saisie d'absence & anti-doublon (5 SP)"]
        A4["US04 : Consultation absences côté étudiant (5 SP)"]
        A5["US05 : Détail d'une absence (2 SP)"]
        A6["US06 : Dépôt dématérialisé justificatif ≤ 5 Mo (8 SP)"]
        A7["US07 : Suivi direct statut justificatif (3 SP)"]
        A8["US08 : Modification/rectification absence (3 SP)"]
        A9["US09 : Validation / Rejet du justificatif (5 SP)"]

        A1 --> A2 --> A3 --> A8
        A3 --> A4 --> A5 --> A6 --> A7 --> A9
    end

    PHASE1 ==>|"Amine termine et livre la base opérationnelle à 100%<br/>(Aya attend la validation de la Partie 1)"| PHASE2

    subgraph PHASE2["⚡ PARTIE 2 : AYA BOUHSINI (US10 à US18 — 41 SP)"]
        direction TB
        B1["US10 : Historique des absences prof (5 SP)"]
        B2["US11 : Taux d'absentéisme & alertes seuil (5 SP)"]
        B3["US12 : Consultation emploi du temps (5 SP)"]
        B4["US13 : Création étudiant par l'admin (3 SP)"]
        B5["US14 : Modification fiche étudiant (2 SP)"]
        B6["US15 : Création compte enseignant (3 SP)"]
        B7["US16 : Gestion groupes, filières & cours (5 SP)"]
        B8["US17 : Statistiques globales & graphiques BI (8 SP)"]
        B9["US18 : Notification push lors d'absence (5 SP)"]

        B1 --> B2 --> B8
        B3 --> B8
        B4 --> B5 --> B6 --> B7
        B2 --> B9
    end
```

---

## 📋 Tableau Récapitulatif Complet

| Phase | Responsable | User Stories Prises en Charge | Détail des SP | Total SP |
| :---: | :---: | :--- | :---: | :---: |
| **Partie 1**<br>*(En premier)* | **Amine NAHLI** | • **US01** : Authentification & Sécurité<br>• **US02** : Liste des étudiants pour l'appel<br>• **US03** : Enregistrement absence avec anti-doublon<br>• **US04** : Consultation absences côté étudiant<br>• **US05** : Détail d'une absence<br>• **US06** : Dépôt justificatif dématérialisé<br>• **US07** : Suivi statut justificatif<br>• **US08** : Rectification d'absence<br>• **US09** : Validation / Rejet du justificatif | 3 + 3 + 5 + 5 + 2 + 8 + 3 + 3 + 5 | **37 SP** |
| **Partie 2**<br>*(Après Amine)* | **Aya BOUHSINI** | • **US10** : Historique absences enseignant<br>• **US11** : Taux absentéisme & alertes seuil<br>• **US12** : Consultation emploi du temps<br>• **US13** : Création d'étudiant par l'admin<br>• **US14** : Modification fiche étudiant<br>• **US15** : Création compte enseignant<br>• **US16** : Gestion groupes & affectations<br>• **US17** : Statistiques globales & graphiques BI<br>• **US18** : Notification push absence | 5 + 5 + 5 + 3 + 2 + 3 + 5 + 8 + 5 | **41 SP** |
| **TOTAL** | **Global Projet** | **US01 à US18 Couverture Intégrale** | — | **78 SP** |
