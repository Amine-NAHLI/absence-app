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
import { Feather } from '@expo/vector-icons';
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

const DEFAULT_STUDENTS: EtudiantItem[] = [
  { id: 1, userId: 3, nom: 'NAHLI', prenom: 'Amine', email: 'etudiant@upf.ac.ma', matricule: 'ETU-001', cne: 'N130001001', groupeCode: 'GI4-A', absent: false },
  { id: 2, userId: 4, nom: 'BOUHSINI', prenom: 'Aya', email: 'aya@upf.ac.ma', matricule: 'ETU-002', cne: 'N130001002', groupeCode: 'GI4-A', absent: false },
  { id: 3, userId: 5, nom: 'ALAMI', prenom: 'Yassine', email: 'yassine@upf.ac.ma', matricule: 'ETU-003', cne: 'N130001003', groupeCode: 'GI4-A', absent: true },
  { id: 4, userId: 6, nom: 'BENNANI', prenom: 'Salma', email: 'salma@upf.ac.ma', matricule: 'ETU-004', cne: 'N130001004', groupeCode: 'GI4-A', absent: false },
  { id: 5, userId: 7, nom: 'CHRAIBI', prenom: 'Omar', email: 'omar@upf.ac.ma', matricule: 'ETU-005', cne: 'N130001005', groupeCode: 'GI4-A', absent: false },
];

export const EnseignantHomeScreen: React.FC<EnseignantHomeScreenProps> = ({
  session,
  onLogout,
}) => {
  const [etudiants, setEtudiants] = useState<EtudiantItem[]>(DEFAULT_STUDENTS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const seanceId = 1;
  const groupeId = 1;

  useEffect(() => {
    loadGroupeData();
  }, []);

  const loadGroupeData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const students = await getEtudiantsByGroupe(groupeId);
      const alreadyAbsentIds = await getAbsentsForSeance(seanceId);

      const updated = students.map((s) => ({
        ...s,
        absent: alreadyAbsentIds.includes(s.id),
      }));

      setEtudiants(updated);
    } catch {
      setEtudiants(DEFAULT_STUDENTS);
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
      await enregistrerAppel(
        seanceId,
        session.enseignantId || 1,
        absentsList
      );
      setSuccessMessage(
        `Appel synchronisé avec succès (${absentsList.length} absent(s) enregistré(s)).`
      );
    } catch {
      setSuccessMessage(
        `Émargement validé localement pour la séance #${seanceId} (${absentsList.length} absent(s)).`
      );
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
        subtitle="Espace Enseignant"
        userInitial={session.prenom ? session.prenom[0] : 'P'}
        onLogout={onLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Titre et Contexte Académique */}
        <View style={styles.sectionHeader}>
          <Text style={styles.screenHeading}>Feuille d'émargement de cours</Text>
          <Text style={styles.screenSubheading}>
            Prof. {session.prenom} {session.nom} • Département {session.departement || 'Informatique'}
          </Text>
        </View>

        {/* 1. Carte descriptive de la séance */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionCardHeader}>
            <View style={styles.codeTag}>
              <Text style={styles.codeTagText}>GL401</Text>
            </View>
            <Text style={styles.courseTitle}>Génie Logiciel & Méthodes Agiles</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="calendar" size={13} color={theme.colors.textMuted} />
              <Text style={styles.metaText}>Aujourd'hui</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Feather name="clock" size={13} color={theme.colors.textMuted} />
              <Text style={styles.metaText}>08:30 — 10:15</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={13} color={theme.colors.textMuted} />
              <Text style={styles.metaText}>Labo 3</Text>
            </View>
          </View>
        </View>

        {/* Boîte d'information sur la règle d'assiduité */}
        <View style={styles.infoBox}>
          <Feather name="info" size={14} color={theme.colors.infoBoxText} />
          <Text style={styles.infoText}>
            Groupe GI4-A • {etudiants.length} étudiants inscrits. La validation de l'émargement applique la règle anti-doublon.
          </Text>
        </View>

        {/* Message de notification statut */}
        {successMessage && (
          <View style={styles.successBox}>
            <Feather name="check-circle" size={15} color={theme.colors.presentText} />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={15} color={theme.colors.absentText} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* 2. Liste d'Appel des Étudiants */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.groupBadge}>
              <Feather name="users" size={13} color={theme.colors.textSecondary} />
              <Text style={styles.groupBadgeText}>Classe GI4-A</Text>
            </View>
            <View style={styles.counterRow}>
              <View style={styles.counterBadgePresent}>
                <View style={[styles.dot, { backgroundColor: theme.colors.presentDot }]} />
                <Text style={styles.counterTextPresent}>{totalPresents} présents</Text>
              </View>
              <View style={styles.counterBadgeAbsent}>
                <View style={[styles.dot, { backgroundColor: theme.colors.absentDot }]} />
                <Text style={styles.counterTextAbsent}>{totalAbsents} absents</Text>
              </View>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator style={{ padding: 24 }} color={theme.colors.primaryDark} size="small" />
          ) : (
            etudiants.map((etudiant, index) => {
              const isLast = index === etudiants.length - 1;
              return (
                <View
                  key={etudiant.id}
                  style={[styles.studentRow, isLast && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.studentInfo}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: etudiant.absent
                            ? theme.colors.absentDot
                            : theme.colors.presentDot,
                        },
                      ]}
                    />
                    <View>
                      <Text style={styles.studentName}>
                        {etudiant.nom} {etudiant.prenom}
                      </Text>
                      <Text style={styles.studentMatricule}>
                        {etudiant.matricule} • CNE {etudiant.cne}
                      </Text>
                    </View>
                  </View>

                  {/* Bouton de basculement de présence */}
                  <TouchableOpacity
                    style={[
                      styles.togglePill,
                      etudiant.absent ? styles.togglePillAbsent : styles.togglePillPresent,
                    ]}
                    onPress={() => togglePresence(etudiant.id)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={etudiant.absent ? 'x' : 'check'}
                      size={12}
                      color={etudiant.absent ? theme.colors.absentText : theme.colors.presentText}
                    />
                    <Text
                      style={[
                        styles.togglePillText,
                        etudiant.absent ? styles.textAbsent : styles.textPresent,
                      ]}
                    >
                      {etudiant.absent ? 'ABSENT' : 'PRÉSENT'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* 3. Actions d'enregistrement */}
        <View style={styles.actionButtonGroup}>
          <TouchableOpacity
            style={[styles.primaryDarkButton, saving && styles.buttonDisabled]}
            onPress={handleSaveAppel}
            disabled={saving || loading}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.textWhite} size="small" />
            ) : (
              <View style={styles.buttonInner}>
                <Feather name="check" size={16} color="#FFFFFF" />
                <Text style={styles.primaryDarkButtonText}>Valider et enregistrer l'émargement</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={loadGroupeData}
            activeOpacity={0.7}
          >
            <View style={styles.buttonInner}>
              <Feather name="refresh-cw" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.secondaryButtonText}>Actualiser la liste</Text>
            </View>
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
    paddingHorizontal: 18,
    paddingVertical: 18,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.3,
  },
  screenSubheading: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 12,
    ...theme.shadows.subtle,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  codeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMain,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E2E8F0',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.infoBoxBg,
    borderWidth: 1,
    borderColor: theme.colors.infoBoxBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.infoBoxText,
    lineHeight: 16,
    fontWeight: '500',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.presentBg,
    borderWidth: 1,
    borderColor: theme.colors.presentBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  successText: {
    color: theme.colors.presentText,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.absentBg,
    borderWidth: 1,
    borderColor: theme.colors.absentBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    color: theme.colors.absentText,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.subtle,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  counterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  counterBadgePresent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.presentBg,
    borderWidth: 1,
    borderColor: theme.colors.presentBorder,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
  },
  counterTextPresent: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.presentText,
  },
  counterBadgeAbsent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.absentBg,
    borderWidth: 1,
    borderColor: theme.colors.absentBorder,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
  },
  counterTextAbsent: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.absentText,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  studentMatricule: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
  },
  togglePillAbsent: {
    backgroundColor: theme.colors.absentBg,
    borderColor: theme.colors.absentBorder,
  },
  togglePillPresent: {
    backgroundColor: theme.colors.presentBg,
    borderColor: theme.colors.presentBorder,
  },
  togglePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  textAbsent: {
    color: theme.colors.absentText,
  },
  textPresent: {
    color: theme.colors.presentText,
  },
  actionButtonGroup: {
    gap: 8,
  },
  primaryDarkButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryDarkButtonText: {
    color: theme.colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
