import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import {
  enregistrerAppel,
  EtudiantItem,
  getAbsentsForSeance,
  getEtudiantsByGroupe,
} from '../services/absenceService';

interface EnseignantHomeScreenProps {
  session: UserSession;
  onLogout: () => void;
}

export const EnseignantHomeScreen: React.FC<EnseignantHomeScreenProps> = ({
  session,
  onLogout,
}) => {
  const [etudiants, setEtudiants] = useState<EtudiantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Séance courante (Séance ID 1 créée par DataInitializer)
  const seanceId = 1;
  const groupeId = 1;

  useEffect(() => {
    loadGroupeData();
  }, []);

  const loadGroupeData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Charger les étudiants du groupe
      const students = await getEtudiantsByGroupe(groupeId);

      // 2. Charger les absences déjà enregistrées pour cette séance
      const alreadyAbsentIds = await getAbsentsForSeance(seanceId);

      // 3. Fusionner l'état
      const updated = students.map((s) => ({
        ...s,
        absent: alreadyAbsentIds.includes(s.id),
      }));

      setEtudiants(updated);
    } catch (err: any) {
      setErrorMessage('Impossible de charger les étudiants du groupe.');
    } finally {
      setLoading(false);
    }
  };

  const togglePresence = (id: number) => {
    setSuccessMessage(null);
    setEtudiants((prev) =>
      prev.map((e) => (e.id === id ? { ...e, absent: !e.absent } : e))
    );
  };

  const handleSaveAppel = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const absentsList = etudiants
      .filter((e) => e.absent)
      .map((e) => ({
        etudiantId: e.id,
        typePresence: 'ABSENT' as const,
      }));

    try {
      const res = await enregistrerAppel(
        seanceId,
        session.enseignantId || 1,
        absentsList
      );
      setSuccessMessage(
        `✅ Appel validé et synchronisé avec Neon ! (${absentsList.length} absent(s))`
      );
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'enregistrement de l'appel");
    } finally {
      setSaving(false);
    }
  };

  const totalAbsents = etudiants.filter((e) => e.absent).length;
  const totalPresents = etudiants.length - totalAbsents;

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        title="UPF Absence"
        userInitial={session.prenom ? session.prenom[0] : 'P'}
        onLogout={onLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Titre de l'écran */}
        <Text style={styles.screenHeading}>Faire l'appel du cours (US02 & US03)</Text>

        {/* 1. Sélecteur : Type de séance */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Type de séance</Text>
          <View style={styles.selectBox}>
            <View style={styles.selectLeft}>
              <View style={styles.mintBadge}>
                <Text style={styles.mintBadgeText}>TP</Text>
              </View>
              <Text style={styles.selectText}>Génie Logiciel & Méthodes Agiles</Text>
            </View>
            <Text style={styles.chevron}>▾</Text>
          </View>
        </View>

        {/* 2. Boîte d'information pastel bleue */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Groupe GI4-A • {etudiants.length} étudiants inscrits. Les absences enregistrées sont protégées contre les doublons.
          </Text>
        </View>

        {/* 3. Date et créneau */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Date et horaire de la séance</Text>
          <View style={styles.dateBox}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>Aujourd'hui • 08:30 — 10:15 (Labo 3)</Text>
          </View>
        </View>

        {/* Bannière de Succès ou d'Erreur */}
        {successMessage && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        {/* 4. Tableau d'Appel des Étudiants */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Feuille d'émargement interactive</Text>
            <View style={styles.counterRow}>
              <View style={styles.counterBadgePresent}>
                <Text style={styles.counterTextPresent}>{totalPresents} présent(s)</Text>
              </View>
              <View style={styles.counterBadgeAbsent}>
                <Text style={styles.counterTextAbsent}>{totalAbsents} absent(s)</Text>
              </View>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator style={{ padding: 20 }} color={theme.colors.primaryDark} />
          ) : (
            etudiants.map((etudiant) => (
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
                      {
                        backgroundColor: etudiant.absent
                          ? theme.colors.roseText
                          : theme.colors.mintText,
                      },
                    ]}
                  />
                  <View>
                    <Text style={styles.studentName}>
                      {etudiant.nom} {etudiant.prenom}
                    </Text>
                    <Text style={styles.studentMatricule}>
                      {etudiant.matricule} • CNE : {etudiant.cne}
                    </Text>
                  </View>
                </View>

                {/* Pastille interactive Présent / Absent */}
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
            ))
          )}
        </View>

        {/* 5. Bouton d'Action Principal (Midnight Navy) */}
        <View style={styles.actionButtonGroup}>
          <TouchableOpacity
            style={[styles.primaryDarkButton, saving && styles.buttonDisabled]}
            onPress={handleSaveAppel}
            disabled={saving || loading}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.textWhite} />
            ) : (
              <Text style={styles.primaryDarkButtonText}>Enregistrer l'appel dans Neon</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={loadGroupeData}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>🔄 Actualiser les données</Text>
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
  successBox: {
    backgroundColor: theme.colors.mintBg,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: theme.colors.mintText,
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: theme.colors.roseBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: theme.colors.roseText,
    fontSize: 13,
    fontWeight: '600',
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorderSubtle,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  counterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  counterBadgePresent: {
    backgroundColor: theme.colors.mintBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  counterTextPresent: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.mintText,
  },
  counterBadgeAbsent: {
    backgroundColor: theme.colors.roseBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  counterTextAbsent: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.roseText,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorderSubtle,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  studentMatricule: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  buttonDisabled: {
    opacity: 0.7,
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
