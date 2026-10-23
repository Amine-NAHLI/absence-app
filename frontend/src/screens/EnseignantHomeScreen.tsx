import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UserSession } from '../types/auth';
import { HeaderBar } from '../components/HeaderBar';
import { theme } from '../theme/theme';

interface EnseignantHomeScreenProps {
  session: UserSession;
  onLogout: () => void;
}

export const EnseignantHomeScreen: React.FC<EnseignantHomeScreenProps> = ({
  session,
  onLogout,
}) => {
  // Liste des étudiants du groupe GI4-A pour l'appel interactif
  const [etudiants, setEtudiants] = useState([
    { id: 1, nom: 'NAHLI', prenom: 'Amine', absent: true },
    { id: 2, nom: 'BOUHSINI', prenom: 'Aya', absent: false },
    { id: 3, nom: 'BENNANI', prenom: 'Yassine', absent: false },
    { id: 4, nom: 'IDRISSI', prenom: 'Salma', absent: false },
    { id: 5, nom: 'TAZI', prenom: 'Karim', absent: false },
  ]);

  const togglePresence = (id: number) => {
    setEtudiants((prev) =>
      prev.map((e) => (e.id === id ? { ...e, absent: !e.absent } : e))
    );
  };

  const totalAbsents = etudiants.filter((e) => e.absent).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Barre de navigation haute (Identique au screenshot) */}
      <HeaderBar
        title="UPF Absence"
        userInitial={session.prenom ? session.prenom[0] : 'P'}
        onLogout={onLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Titre de l'écran (comme "Demander une absence" sur l'écran gauche du screenshot) */}
        <Text style={styles.screenHeading}>Faire l'appel du cours</Text>

        {/* 1. Sélecteur : Type de séance (style dropdown du screenshot) */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Type de séance</Text>
          <View style={styles.selectBox}>
            <View style={styles.selectLeft}>
              <View style={styles.mintBadge}>
                <Text style={styles.mintBadgeText}>TP</Text>
              </View>
              <Text style={styles.selectText}>Génie Logiciel & Agilité</Text>
            </View>
            <Text style={styles.chevron}>▾</Text>
          </View>
        </View>

        {/* 2. Boîte d'information pastel bleue (style du screenshot) */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            5 étudiants inscrits dans le groupe GI4-A. Les absences saisies seront immédiatement visibles dans leur application mobile.
          </Text>
        </View>

        {/* 3. Sélecteur de date (style "Jours d'absence" du screenshot) */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Date et horaire de la séance</Text>
          <View style={styles.dateBox}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>23 oct. 2026 • 08:30 — 10:15 (Labo 3)</Text>
          </View>
        </View>

        {/* 4. Section : Liste d'appel des étudiants (style tableau "Autres personnes...") */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Étudiants du groupe GI4-A</Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>{totalAbsents} absent(s)</Text>
            </View>
          </View>

          {etudiants.map((etudiant) => (
            <TouchableOpacity
              key={etudiant.id}
              style={styles.studentRow}
              onPress={() => togglePresence(etudiant.id)}
              activeOpacity={0.7}
            >
              <View style={styles.studentInfo}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: etudiant.absent ? theme.colors.roseText : theme.colors.mintText },
                  ]}
                />
                <Text style={styles.studentName}>
                  {etudiant.nom} {etudiant.prenom}
                </Text>
              </View>

              {/* Bouton de bascule Présent / Absent */}
              <View
                style={[
                  styles.pillButton,
                  etudiant.absent ? styles.pillAbsent : styles.pillPresent,
                ]}
              >
                <Text
                  style={[
                    styles.pillButtonText,
                    etudiant.absent ? styles.textAbsent : styles.textPresent,
                  ]}
                >
                  {etudiant.absent ? 'ABSENT' : 'PRÉSENT'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 5. Boutons d'Action Inférieurs (Style Midnight Navy "Demander" / "Annuler") */}
        <View style={styles.actionButtonGroup}>
          {/* Bouton Sombre Midnight Navy */}
          <TouchableOpacity
            style={styles.primaryDarkButton}
            onPress={() => alert(`Appel enregistré avec succès ! (${totalAbsents} absent(s))`)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryDarkButtonText}>Enregistrer l'appel</Text>
          </TouchableOpacity>

          {/* Bouton Secondaire Annuler */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Annuler / Déconnexion</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textMain,
    marginVertical: 18,
    letterSpacing: -0.3,
  },
  fieldSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectBox: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.soft,
  },
  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mintBadge: {
    backgroundColor: theme.colors.mintBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  mintBadgeText: {
    color: theme.colors.mintText,
    fontSize: 11,
    fontWeight: '800',
  },
  selectText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  chevron: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.infoBoxBg,
    borderWidth: 1,
    borderColor: theme.colors.infoBoxBorder,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 18,
    gap: 10,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.infoBoxText,
    lineHeight: 17,
    fontWeight: '500',
  },
  dateBox: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...theme.shadows.soft,
  },
  dateIcon: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorderSubtle,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  counterBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorderSubtle,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  pillAbsent: {
    backgroundColor: theme.colors.roseBg,
  },
  pillPresent: {
    backgroundColor: theme.colors.mintBg,
  },
  pillButtonText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textAbsent: {
    color: theme.colors.roseText,
  },
  textPresent: {
    color: theme.colors.mintText,
  },
  actionButtonGroup: {
    gap: 10,
  },
  primaryDarkButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  primaryDarkButtonText: {
    color: theme.colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondaryButton,
    borderWidth: 1,
    borderColor: theme.colors.secondaryButtonBorder,
    borderRadius: theme.radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
