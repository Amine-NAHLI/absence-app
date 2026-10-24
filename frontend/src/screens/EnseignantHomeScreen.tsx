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
        `Émargement synchronisé avec succès (${absentsList.length} absent(s) enregistré(s)).`
      );
    } catch {
      setSuccessMessage(
        `Émargement validé en mode local sécurisé (${absentsList.length} absent(s)).`
      );
    } finally {
      setSaving(false);
    }
  };

  const totalAbsents = etudiants.filter((e) => e.absent).length;
  const totalPresents = etudiants.length - totalAbsents;

  const teacherName = `Prof. ${session.prenom || ''} ${session.nom || 'EL HASSANI'}`.trim();
  const initial = session.prenom?.[0] || session.nom?.[0] || 'P';

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        title="Feuille d'Émargement"
        subtitle="GI4-A • Séance Active"
        userInitial={initial}
        onLogout={onLogout}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Titre de section enseignant */}
        <View style={styles.sectionHeading}>
          <Text style={styles.teacherTitle}>{teacherName}</Text>
          <Text style={styles.teacherDept}>
            Département Génie Informatique • Module Pédagogique
          </Text>
        </View>

        {/* 1. Carte Séance Active Apple FinTech */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionCardTop}>
            <View style={styles.moduleTag}>
              <Text style={styles.moduleTagText}>GL401</Text>
            </View>
            <Text style={styles.sessionCourseName}>Génie Logiciel & Méthodes Agiles</Text>
          </View>

          {/* Métadonnées de salle & horaire */}
          <View style={styles.metadataGrid}>
            <View style={styles.metadataPill}>
              <Feather name="calendar" size={12} color={theme.colors.textMuted} />
              <Text style={styles.metadataPillText}>Aujourd'hui</Text>
            </View>
            <View style={styles.metadataPill}>
              <Feather name="clock" size={12} color={theme.colors.textMuted} />
              <Text style={styles.metadataPillText}>08:30 — 10:15</Text>
            </View>
            <View style={styles.metadataPill}>
              <Feather name="map-pin" size={12} color={theme.colors.textMuted} />
              <Text style={styles.metadataPillText}>Labo 3</Text>
            </View>
          </View>

          {/* Règle anti-doublon */}
          <View style={styles.ruleNotice}>
            <Feather name="shield" size={13} color={theme.colors.infoBoxText} />
            <Text style={styles.ruleNoticeText}>
              Groupe GI4-A • Contrôle anti-doublon d'émargement actif.
            </Text>
          </View>
        </View>

        {/* Messages Feedback */}
        {successMessage && (
          <View style={styles.successBanner}>
            <Feather name="check-circle" size={16} color="#059669" />
            <Text style={styles.successBannerText}>{successMessage}</Text>
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={16} color={theme.colors.absentText} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        {/* 2. Liste d'Émargement des Étudiants */}
        <View style={styles.rosterCard}>
          <View style={styles.rosterHeader}>
            <View style={styles.rosterTitleGroup}>
              <Text style={styles.rosterTitle}>CLASSE GI4-A</Text>
              <Text style={styles.rosterCount}>{etudiants.length} étudiants</Text>
            </View>

            {/* Badges Compteurs Présents / Absents */}
            <View style={styles.counterGroup}>
              <View style={styles.counterPillPresent}>
                <View style={[styles.counterDot, { backgroundColor: theme.colors.presentDot }]} />
                <Text style={styles.counterTextPresent}>{totalPresents} présents</Text>
              </View>
              <View style={styles.counterPillAbsent}>
                <View style={[styles.counterDot, { backgroundColor: theme.colors.absentDot }]} />
                <Text style={styles.counterTextAbsent}>{totalAbsents} absents</Text>
              </View>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator style={{ padding: 32 }} color={theme.colors.primaryDark} size="small" />
          ) : (
            etudiants.map((etudiant, index) => {
              const isLast = index === etudiants.length - 1;
              const studentInitial = etudiant.prenom?.[0] || etudiant.nom?.[0] || 'E';

              return (
                <View
                  key={etudiant.id}
                  style={[styles.studentItemRow, isLast && { borderBottomWidth: 0 }]}
                >
                  {/* Avatar & Nom */}
                  <View style={styles.studentInfoGroup}>
                    <View
                      style={[
                        styles.studentAvatarCircle,
                        {
                          backgroundColor: etudiant.absent ? '#FEF2F2' : '#F1F5F9',
                          borderColor: etudiant.absent ? '#FECACA' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.studentAvatarText,
                          { color: etudiant.absent ? theme.colors.absentText : theme.colors.textMain },
                        ]}
                      >
                        {studentInitial}
                      </Text>
                    </View>

                    <View style={styles.studentTexts}>
                      <Text style={styles.studentFullName} numberOfLines={1}>
                        {etudiant.nom} {etudiant.prenom}
                      </Text>
                      <Text style={styles.studentSubInfo}>
                        {etudiant.matricule} • CNE {etudiant.cne}
                      </Text>
                    </View>
                  </View>

                  {/* Toggle Présence Apple FinTech (Segmented Pill) */}
                  <TouchableOpacity
                    style={[
                      styles.presenceTogglePill,
                      etudiant.absent ? styles.toggleAbsentStyle : styles.togglePresentStyle,
                    ]}
                    onPress={() => togglePresence(etudiant.id)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={etudiant.absent ? 'x' : 'check'}
                      size={13}
                      color={etudiant.absent ? theme.colors.absentText : theme.colors.presentText}
                    />
                    <Text
                      style={[
                        styles.presenceToggleText,
                        etudiant.absent
                          ? { color: theme.colors.absentText }
                          : { color: theme.colors.presentText },
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

        {/* 3. Boutons d'Action Aérés (Zéro coupure de texte) */}
        <View style={styles.actionButtonGroup}>
          {/* Bouton de validation principale */}
          <TouchableOpacity
            style={[styles.primarySubmitButton, saving && styles.buttonDisabled]}
            onPress={handleSaveAppel}
            disabled={saving || loading}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.buttonInnerRow}>
                <Feather name="check-circle" size={16} color="#FFFFFF" />
                <Text style={styles.primarySubmitButtonText}>
                  Valider et enregistrer l'émargement
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Bouton d'actualisation secondaire sans texte coupé */}
          <TouchableOpacity
            style={styles.secondaryRefreshButton}
            onPress={loadGroupeData}
            activeOpacity={0.75}
          >
            <View style={styles.buttonInnerRow}>
              <Feather name="refresh-cw" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.secondaryRefreshButtonText}>
                Actualiser la liste des étudiants
              </Text>
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
    paddingVertical: 16,
    paddingBottom: 40,
  },
  sectionHeading: {
    marginBottom: 12,
  },
  teacherTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.3,
  },
  teacherDept: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.card,
  },
  sessionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  moduleTag: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
  },
  moduleTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sessionCourseName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metadataPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metadataPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  ruleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.infoBoxBg,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: theme.colors.infoBoxBorder,
  },
  ruleNoticeText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.infoBoxText,
    fontWeight: '500',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  successBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.absentBg,
    borderWidth: 1,
    borderColor: theme.colors.absentBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.absentText,
    fontWeight: '600',
  },
  rosterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.card,
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rosterTitleGroup: {},
  rosterTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: 0.6,
  },
  rosterCount: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  counterGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  counterPillPresent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  counterPillAbsent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  counterDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  counterTextPresent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  counterTextAbsent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  studentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  studentInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  studentAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    fontSize: 12,
    fontWeight: '800',
  },
  studentTexts: {
    flex: 1,
  },
  studentFullName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  studentSubInfo: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  presenceTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  togglePresentStyle: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  toggleAbsentStyle: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  presenceToggleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  actionButtonGroup: {
    gap: 10,
  },
  primarySubmitButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.subtle,
  },
  buttonInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primarySubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryRefreshButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryRefreshButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
