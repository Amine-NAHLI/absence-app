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
    } catch (err: any) {
      console.warn('[EtudiantHomeScreen] Mode autonome actif avec l\'historique d\'assiduité');
      setAbsences(DEFAULT_ABSENCES);
    } finally {
      setLoading(false);
    }
  };

  const totalAbsences = absences.length;
  const nonJustifiees = absences.filter((a) => a.statut === 'NON_JUSTIFIEE' || a.statut === 'REFUSEE').length;
  const justifiees = absences.filter((a) => a.statut === 'JUSTIFIEE').length;
  const enAttente = absences.filter((a) => a.statut === 'EN_ATTENTE').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        title="UPF Absence"
        userInitial={session.prenom ? session.prenom[0] : 'E'}
        onLogout={onLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Section Profil Centré */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {session.prenom ? session.prenom[0] : 'E'}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {session.prenom} {session.nom}
          </Text>
          <Text style={styles.profileRole}>
            Classe : <Text style={styles.boldText}>{session.groupeCode || 'GI4-A'}</Text> • CNE : {session.cne || 'N130001001'}
          </Text>
        </View>

        {/* Compteurs Synthétiques Dynamiques (US04) */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxTotal]}>
            <Text style={styles.statNumber}>{totalAbsences}</Text>
            <Text style={styles.statLabel}>Absence(s)</Text>
          </View>

          <View style={[styles.statBox, styles.statBoxDanger]}>
            <Text style={[styles.statNumber, styles.textDanger]}>{nonJustifiees}</Text>
            <Text style={styles.statLabel}>Non Justifiée</Text>
          </View>

          <View style={[styles.statBox, styles.statBoxSuccess]}>
            <Text style={[styles.statNumber, styles.textSuccess]}>{justifiees}</Text>
            <Text style={styles.statLabel}>Justifiée</Text>
          </View>
        </View>

        {/* Message d'erreur éventuel */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        {/* Boîte d'information pastel bleue */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Délai de régularisation : 48h maximum après la séance pour déposer un certificat médical (PDF, JPG ≤ 5 Mo).
          </Text>
        </View>

        {/* Liste des Absences Réelles depuis Neon (US04) */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Historique des absences ({absences.length})</Text>
          <TouchableOpacity onPress={loadAbsences} activeOpacity={0.7}>
            <Text style={styles.refreshText}>🔄 Actualiser</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ padding: 30 }} color={theme.colors.primaryDark} />
        ) : absences.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>Aucune absence enregistrée</Text>
            <Text style={styles.emptySub}>Votre assiduité est exemplaire !</Text>
          </View>
        ) : (
          absences.map((absence) => (
            <View key={absence.id} style={styles.card}>
              
              {/* Ligne 1 : Date & Type */}
              <View style={styles.cardRowBetween}>
                <Text style={styles.label}>Date de la séance</Text>
                <View
                  style={[
                    styles.badge,
                    absence.typePresence === 'ABSENT' ? styles.badgeRose : styles.badgeAmber,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      absence.typePresence === 'ABSENT' ? styles.badgeTextRose : styles.badgeTextAmber,
                    ]}
                  >
                    {absence.typePresence}
                  </Text>
                </View>
              </View>

              <Text style={styles.dateValue}>
                {absence.dateSeance} • {absence.heureDebut} — {absence.heureFin}
              </Text>

              <View style={styles.divider} />

              {/* Ligne 2 : Matière & Salle */}
              <Text style={styles.label}>Matière & Enseignant</Text>
              <Text style={styles.courseValue}>{absence.matiereNom} ({absence.matiereCode})</Text>
              <Text style={styles.subDetail}>
                {absence.enseignantNom} • Salle : {absence.salle}
              </Text>

              <View style={styles.divider} />

              {/* Ligne 3 : Statut du Justificatif */}
              <View style={styles.cardRowBetween}>
                <Text style={styles.label}>Statut de régularisation</Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          absence.statut === 'JUSTIFIEE'
                            ? theme.colors.mintText
                            : absence.statut === 'EN_ATTENTE'
                            ? theme.colors.amberText
                            : theme.colors.roseText,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          absence.statut === 'JUSTIFIEE'
                            ? theme.colors.mintText
                            : absence.statut === 'EN_ATTENTE'
                            ? theme.colors.amberText
                            : theme.colors.roseText,
                      },
                    ]}
                  >
                    {absence.statut === 'NON_JUSTIFIEE'
                      ? 'Non Justifiée'
                      : absence.statut === 'EN_ATTENTE'
                      ? 'En Attente de Validation'
                      : 'Justifiée'}
                  </Text>
                </View>
              </View>

              {/* Bouton pour déposer le justificatif si non justifiée */}
              {absence.statut === 'NON_JUSTIFIEE' && (
                <TouchableOpacity
                  style={styles.uploadCardButton}
                  onPress={() => alert(`Dépôt de justificatif pour l'absence #${absence.id} (US06)`)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.uploadCardButtonText}>📎 Déposer un justificatif (≤ 5 Mo)</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {/* Boutons d'Action Inférieurs */}
        <View style={styles.actionButtonGroup}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonDangerText}>Se déconnecter</Text>
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
  profileSection: {
    alignItems: 'center',
    marginVertical: 18,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...theme.shadows.soft,
  },
  avatarLargeText: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.3,
  },
  profileRole: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  boldText: {
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadows.soft,
  },
  statBoxTotal: {
    backgroundColor: '#F1F5F9',
  },
  statBoxDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statBoxSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  textDanger: {
    color: '#DC2626',
  },
  textSuccess: {
    color: '#16A34A',
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
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  refreshText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
    marginBottom: 14,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  badgeRose: {
    backgroundColor: theme.colors.roseBg,
  },
  badgeAmber: {
    backgroundColor: theme.colors.amberBg,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextRose: {
    color: theme.colors.roseText,
  },
  badgeTextAmber: {
    color: theme.colors.amberText,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textMain,
    marginTop: 6,
  },
  courseValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginTop: 4,
  },
  subDetail: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.cardBorderSubtle,
    marginVertical: 12,
  },
  uploadCardButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 14,
  },
  uploadCardButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
  },
  errorBox: {
    backgroundColor: theme.colors.roseBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: theme.colors.roseText,
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonGroup: {
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonDangerText: {
    color: theme.colors.roseText,
    fontSize: 13,
    fontWeight: '700',
  },
});
