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
import { AbsenceItem, getAbsencesByEtudiant } from '../services/absenceService';

interface EtudiantHomeScreenProps {
  session: UserSession;
  onLogout: () => void;
}

const DEFAULT_ABSENCES: AbsenceItem[] = [
  {
    id: 1,
    seanceId: 1,
    matiereCode: 'GL401',
    matiereNom: 'Génie Logiciel & Scrum',
    dateSeance: '2026-10-23',
    heureDebut: '08:30',
    heureFin: '10:15',
    enseignantNom: 'EL HASSANI Mohammed',
    salle: 'Labo 3',
    typePresence: 'ABSENT',
    dureeMinutes: 105,
    statut: 'NON_JUSTIFIEE',
    dateMarquage: '2026-10-23 09:00',
  },
];

export const EtudiantHomeScreen: React.FC<EtudiantHomeScreenProps> = ({
  session,
  onLogout,
}) => {
  const [absences, setAbsences] = useState<AbsenceItem[]>(DEFAULT_ABSENCES);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAbsences();
  }, []);

  const loadAbsences = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const etudiantId = session.etudiantId || 1;
      const data = await getAbsencesByEtudiant(etudiantId);
      setAbsences(data);
    } catch {
      setAbsences(DEFAULT_ABSENCES);
    } finally {
      setLoading(false);
    }
  };

  const totalAbsences = absences.length;
  const nonJustifiees = absences.filter((a) => a.statut === 'NON_JUSTIFIEE' || a.statut === 'REFUSEE').length;
  const justifiees = absences.filter((a) => a.statut === 'JUSTIFIEE').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        title="UPF Absence"
        subtitle="Espace Étudiant"
        userInitial={session.prenom ? session.prenom[0] : 'E'}
        onLogout={onLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* En-tête Profil Étudiant Minimaliste */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {session.prenom ? session.prenom[0] : 'E'}
            </Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>
              {session.prenom} {session.nom}
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>Classe {session.groupeCode || 'GI4-A'}</Text>
              </View>
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>CNE {session.cne || 'N130001001'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3 Cartes KPI d'Assiduité (US04) */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalAbsences}</Text>
            <Text style={styles.statLabel}>Total séances</Text>
          </View>

          <View style={[styles.statBox, styles.statBoxDanger]}>
            <View style={styles.statHeader}>
              <View style={[styles.microDot, { backgroundColor: theme.colors.absentDot }]} />
              <Text style={styles.statLabelDanger}>Non justifiées</Text>
            </View>
            <Text style={[styles.statNumber, styles.textDanger]}>{nonJustifiees}</Text>
          </View>

          <View style={[styles.statBox, styles.statBoxSuccess]}>
            <View style={styles.statHeader}>
              <View style={[styles.microDot, { backgroundColor: theme.colors.presentDot }]} />
              <Text style={styles.statLabelSuccess}>Justifiées</Text>
            </View>
            <Text style={[styles.statNumber, styles.textSuccess]}>{justifiees}</Text>
          </View>
        </View>

        {/* Message d'erreur éventuel */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={14} color={theme.colors.absentText} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Règle administrative de régularisation */}
        <View style={styles.infoBox}>
          <Feather name="info" size={14} color={theme.colors.infoBoxText} />
          <Text style={styles.infoText}>
            Délai de régularisation : 48h maximum après la séance pour déposer un certificat médical (PDF, JPG ≤ 5 Mo).
          </Text>
        </View>

        {/* Historique des séances */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Relevé d'assiduité ({absences.length})</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadAbsences}
            activeOpacity={0.7}
          >
            <Feather name="refresh-cw" size={12} color={theme.colors.textSecondary} />
            <Text style={styles.refreshButtonText}>Actualiser</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ padding: 24 }} color={theme.colors.primaryDark} size="small" />
        ) : absences.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="check-circle" size={24} color="#059669" />
            <Text style={styles.emptyTitle}>Assiduité parfaite</Text>
            <Text style={styles.emptySub}>Aucune absence enregistrée pour ce semestre.</Text>
          </View>
        ) : (
          absences.map((absence) => (
            <View key={absence.id} style={styles.card}>
              
              {/* En-tête de la carte */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.codeTag}>
                  <Text style={styles.codeTagText}>{absence.matiereCode}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    absence.statut === 'JUSTIFIEE'
                      ? styles.badgePresent
                      : styles.badgeAbsent,
                  ]}
                >
                  <View
                    style={[
                      styles.microDot,
                      {
                        backgroundColor:
                          absence.statut === 'JUSTIFIEE'
                            ? theme.colors.presentDot
                            : theme.colors.absentDot,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      absence.statut === 'JUSTIFIEE'
                        ? styles.textPresent
                        : styles.textAbsent,
                    ]}
                  >
                    {absence.statut === 'JUSTIFIEE' ? 'Justifiée' : 'Non régularisée'}
                  </Text>
                </View>
              </View>

              {/* Titre du cours */}
              <Text style={styles.courseTitle}>{absence.matiereNom}</Text>
              <Text style={styles.teacherSub}>
                Enseignant : {absence.enseignantNom} • Salle : {absence.salle}
              </Text>

              {/* Métadonnées de date et créneau */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Feather name="calendar" size={12} color={theme.colors.textMuted} />
                  <Text style={styles.metaText}>{absence.dateSeance}</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Feather name="clock" size={12} color={theme.colors.textMuted} />
                  <Text style={styles.metaText}>{absence.heureDebut} — {absence.heureFin}</Text>
                </View>
              </View>

              {/* Action : Dépôt de justificatif si non régularisée */}
              {absence.statut === 'NON_JUSTIFIEE' && (
                <TouchableOpacity
                  style={styles.uploadCardButton}
                  onPress={() => alert(`Transmission de justificatif pour l'absence #${absence.id} (US06)`)}
                  activeOpacity={0.8}
                >
                  <Feather name="paperclip" size={13} color={theme.colors.primaryDark} />
                  <Text style={styles.uploadCardButtonText}>Transmettre un certificat médical (PDF / JPG)</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {/* Déconnexion */}
        <View style={styles.actionButtonGroup}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.logoutButtonText}>Fermer la session</Text>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 14,
    gap: 12,
    ...theme.shadows.subtle,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  pillBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  statBoxDanger: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.absentBorder,
  },
  statBoxSuccess: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.presentBorder,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  microDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.textMain,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statLabelDanger: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.absentText,
  },
  statLabelSuccess: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.presentText,
  },
  textDanger: {
    color: theme.colors.absentText,
  },
  textSuccess: {
    color: theme.colors.presentText,
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
    marginBottom: 14,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.infoBoxText,
    lineHeight: 16,
    fontWeight: '500',
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
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: theme.colors.absentText,
    fontSize: 12,
    fontWeight: '600',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.xs,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  refreshButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 10,
    ...theme.shadows.subtle,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
  },
  badgePresent: {
    backgroundColor: theme.colors.presentBg,
    borderColor: theme.colors.presentBorder,
  },
  badgeAbsent: {
    backgroundColor: theme.colors.absentBg,
    borderColor: theme.colors.absentBorder,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textPresent: {
    color: theme.colors.presentText,
  },
  textAbsent: {
    color: theme.colors.absentText,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: 2,
  },
  teacherSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#E2E8F0',
  },
  uploadCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingVertical: 9,
    marginTop: 10,
  },
  uploadCardButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  actionButtonGroup: {
    marginTop: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingVertical: 11,
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
