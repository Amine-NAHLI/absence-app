import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DemandeInscription, UserSession } from '../types/auth';
import { HeaderBar } from '../components/HeaderBar';
import {
  AdminStats,
  accepterDemandeInscription,
  getAdminStats,
  getDemandesInscription,
  refuserDemandeInscription,
} from '../services/adminService';
import { theme } from '../theme/theme';

interface AdminHomeScreenProps {
  session: UserSession;
  onLogout: () => void;
}

export const AdminHomeScreen: React.FC<AdminHomeScreenProps> = ({
  session,
  onLogout,
}) => {
  const initial = session.prenom?.[0] || session.nom?.[0] || 'A';

  // États pour les demandes et les statistiques
  const [demandes, setDemandes] = useState<DemandeInscription[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Chargement des données administratives
  const loadData = async () => {
    try {
      const [fetchedDemandes, fetchedStats] = await Promise.all([
        getDemandesInscription(),
        getAdminStats(),
      ]);
      setDemandes(fetchedDemandes);
      setStats(fetchedStats);
    } catch (error: any) {
      console.error('[AdminHomeScreen] Erreur chargement données:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setFeedbackMessage(null);
    loadData();
  };

  // Traitement : Accepter la demande d'inscription
  const handleAccepter = async (demande: DemandeInscription) => {
    setProcessingId(demande.userId);
    setFeedbackMessage(null);
    try {
      const res = await accepterDemandeInscription(demande.userId);
      setFeedbackMessage(`Compte approuvé pour ${demande.prenom} ${demande.nom} (${demande.email}).`);
      // Mettre à jour la liste locale
      setDemandes((prev) => prev.filter((d) => d.userId !== demande.userId));
      // Recharger les stats
      getAdminStats().then(setStats).catch(() => {});
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d\'activer ce compte.');
    } finally {
      setProcessingId(null);
    }
  };

  // Traitement : Refuser et supprimer la demande
  const handleRefuser = async (demande: DemandeInscription) => {
    Alert.alert(
      'Confirmation de refus',
      `Voulez-vous refuser et supprimer définitivement la demande de ${demande.prenom} ${demande.nom} (${demande.email}) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser et supprimer',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(demande.userId);
            setFeedbackMessage(null);
            try {
              await refuserDemandeInscription(demande.userId);
              setFeedbackMessage(`Demande de ${demande.prenom} ${demande.nom} rejetée et supprimée.`);
              setDemandes((prev) => prev.filter((d) => d.userId !== demande.userId));
              getAdminStats().then(setStats).catch(() => {});
            } catch (err: any) {
              Alert.alert('Erreur', err.message || 'Impossible de refuser cette demande.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        title="Espace Administration"
        subtitle="Direction des Études"
        userInitial={initial}
        onLogout={onLogout}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primaryDark]} />
        }
      >
        
        {/* Titre & Sous-titre institutionnel */}
        <View style={styles.sectionHeading}>
          <Text style={styles.adminTitle}>Tableau de bord de scolarité</Text>
          <Text style={styles.adminSubtitle}>
            Supervision académique UPF : validation des inscriptions & assiduité
          </Text>
        </View>

        {/* Message de notification d'action */}
        {feedbackMessage && (
          <View style={styles.actionFeedbackBox}>
            <Feather name="check-circle" size={15} color="#059669" />
            <Text style={styles.actionFeedbackText}>{feedbackMessage}</Text>
          </View>
        )}

        {/* ===================== SECTION 1 : DEMANDES D'INSCRIPTION EN ATTENTE ===================== */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>DEMANDES D'INSCRIPTION EN ATTENTE</Text>
            <View style={[styles.badgeCount, { backgroundColor: demandes.length > 0 ? '#FEF3C7' : '#E2E8F0' }]}>
              <Text style={[styles.badgeCountText, { color: demandes.length > 0 ? '#92400E' : '#475569' }]}>
                {demandes.length}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={onRefresh} activeOpacity={0.7} style={styles.refreshIconBtn}>
            <Feather name="rotate-cw" size={13} color={theme.colors.textMuted} />
            <Text style={styles.refreshIconText}>Actualiser</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={theme.colors.primaryDark} />
            <Text style={styles.loadingText}>Vérification des demandes...</Text>
          </View>
        ) : demandes.length === 0 ? (
          <View style={styles.emptyRequestsCard}>
            <View style={styles.emptyIconCircle}>
              <Feather name="check" size={20} color="#059669" />
            </View>
            <Text style={styles.emptyRequestsTitle}>Toutes les demandes sont traitées</Text>
            <Text style={styles.emptyRequestsSub}>
              Aucun compte étudiant ou enseignant n'est en attente de validation.
            </Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {demandes.map((item) => {
              const isEtudiant = item.role === 'ETUDIANT';
              const isItemBusy = processingId === item.userId;

              return (
                <View key={item.userId} style={styles.requestCard}>
                  {/* Top card row: Role Chip & Status */}
                  <View style={styles.requestCardTop}>
                    <View style={[styles.roleTag, isEtudiant ? styles.roleTagEtudiant : styles.roleTagEnseignant]}>
                      <Feather 
                        name={isEtudiant ? 'user' : 'book-open'} 
                        size={12} 
                        color={isEtudiant ? '#2563EB' : '#059669'} 
                      />
                      <Text style={[styles.roleTagText, isEtudiant ? styles.roleTagTextEtudiant : styles.roleTagTextEnseignant]}>
                        {isEtudiant ? 'ÉTUDIANT' : 'ENSEIGNANT'}
                      </Text>
                    </View>

                    <View style={styles.pendingStatusBadge}>
                      <View style={styles.pendingDot} />
                      <Text style={styles.pendingStatusText}>En attente</Text>
                    </View>
                  </View>

                  {/* Nom complet & coordonnées */}
                  <Text style={styles.requestFullName}>
                    {item.nom} {item.prenom}
                  </Text>
                  
                  <View style={styles.requestMetaRow}>
                    <Feather name="mail" size={12} color={theme.colors.textMuted} />
                    <Text style={styles.requestEmail}>{item.email}</Text>
                    {item.telephone ? (
                      <>
                        <Text style={styles.metaDivider}>•</Text>
                        <Feather name="phone" size={12} color={theme.colors.textMuted} />
                        <Text style={styles.requestPhone}>{item.telephone}</Text>
                      </>
                    ) : null}
                  </View>

                  {/* Détails académiques selon profil */}
                  <View style={styles.academicDetailsBox}>
                    {isEtudiant ? (
                      <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailItemLabel}>CLASSE</Text>
                          <Text style={styles.detailItemValue}>{item.groupeCode || 'GI4-A'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailItemLabel}>MATRICULE</Text>
                          <Text style={styles.detailItemValue}>{item.matricule || 'Auto-attribué'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailItemLabel}>CNE</Text>
                          <Text style={styles.detailItemValue}>{item.cne || 'Non renseigné'}</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailItemLabel}>DÉPARTEMENT</Text>
                          <Text style={styles.detailItemValue}>{item.departement || 'Génie Informatique'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailItemLabel}>MATRICULE</Text>
                          <Text style={styles.detailItemValue}>{item.matricule || 'Auto-attribué'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailItemLabel}>SPÉCIALITÉ</Text>
                          <Text style={styles.detailItemValue} numberOfLines={1}>
                            {item.specialite || 'Génie Logiciel'}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Boutons d'Arbitrage Administrateur */}
                  <View style={styles.arbitrageActionsRow}>
                    <TouchableOpacity
                      style={[styles.rejectBtn, isItemBusy && styles.btnDisabled]}
                      onPress={() => handleRefuser(item)}
                      disabled={isItemBusy}
                      activeOpacity={0.75}
                    >
                      <Feather name="trash-2" size={14} color="#DC2626" />
                      <Text style={styles.rejectBtnText}>Refuser</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.acceptBtn, isItemBusy && styles.btnDisabled]}
                      onPress={() => handleAccepter(item)}
                      disabled={isItemBusy}
                      activeOpacity={0.88}
                    >
                      {isItemBusy ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Feather name="check" size={15} color="#FFFFFF" />
                          <Text style={styles.acceptBtnText}>Valider l'inscription</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ===================== SECTION 2 : KPI INSTITUTIONNELS ===================== */}
        <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
          <Text style={styles.sectionTitle}>MÉTRIQUES DE GESTION ACADÉMIQUE</Text>
        </View>

        <View style={styles.kpiContainer}>
          <View style={styles.dualKpiRow}>
            {/* Étudiants Actifs */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiCardHeader}>
                <Feather name="users" size={15} color={theme.colors.primaryAccent} />
                <Text style={styles.kpiCardLabel}>ÉTUDIANTS</Text>
              </View>
              <Text style={styles.kpiMainNumber}>{stats?.totalEtudiants ?? 0}</Text>
              <Text style={styles.kpiSubLabel}>Comptes validés</Text>
            </View>

            {/* Corps Professoral */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiCardHeader}>
                <Feather name="briefcase" size={15} color={theme.colors.textSecondary} />
                <Text style={styles.kpiCardLabel}>ENSEIGNANTS</Text>
              </View>
              <Text style={styles.kpiMainNumber}>{stats?.totalEnseignants ?? 0}</Text>
              <Text style={styles.kpiSubLabel}>Enseignants actifs</Text>
            </View>
          </View>

          {/* Assiduité Globale */}
          <View style={styles.attendanceSummaryCard}>
            <View style={styles.attendanceHeader}>
              <View style={styles.attendanceTitleGroup}>
                <Feather name="trending-up" size={16} color="#10B981" />
                <Text style={styles.attendanceLabel}>ASSIDUITÉ GLOBALE</Text>
              </View>
              <View style={styles.targetBadge}>
                <Text style={styles.targetBadgeText}>Objectif ≥ 90%</Text>
              </View>
            </View>

            <View style={styles.attendanceScoreRow}>
              <Text style={styles.attendanceBigScore}>{stats?.tauxAssiduite ?? '94.2%'}</Text>
              <Text style={styles.attendanceComment}>
                {stats?.totalAbsences ?? 0} absence(s) totale(s) enregistrée(s)
              </Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: stats?.tauxAssiduite || '94.2%' }]} />
            </View>
          </View>
        </View>

        {/* ===================== SECTION 3 : STRUCTURE PAR PROMOTION ===================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>STRUCTURE DES PROMOTIONS & GROUPES</Text>
        </View>

        <View style={styles.cohortCard}>
          {/* Groupe GI4-A */}
          <View style={styles.cohortRow}>
            <View style={styles.cohortInfoTop}>
              <View style={styles.cohortTag}>
                <Text style={styles.cohortTagText}>GI4-A</Text>
              </View>
              <Text style={styles.cohortName}>Génie Informatique 4A</Text>
              <Text style={styles.cohortPercent}>Assiduité 94%</Text>
            </View>
            <View style={styles.cohortBarTrack}>
              <View style={[styles.cohortBarFill, { width: '94%', backgroundColor: '#10B981' }]} />
            </View>
          </View>

          {/* Groupe GI4-B */}
          <View style={[styles.cohortRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
            <View style={styles.cohortInfoTop}>
              <View style={styles.cohortTag}>
                <Text style={styles.cohortTagText}>GI4-B</Text>
              </View>
              <Text style={styles.cohortName}>Génie Informatique 4B</Text>
              <Text style={styles.cohortPercent}>Assiduité 96%</Text>
            </View>
            <View style={styles.cohortBarTrack}>
              <View style={[styles.cohortBarFill, { width: '96%', backgroundColor: '#2563EB' }]} />
            </View>
          </View>
        </View>

        {/* ===================== DÉCONNEXION ===================== */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.75}
          >
            <Feather name="log-out" size={15} color={theme.colors.textSecondary} />
            <Text style={styles.logoutButtonText}>Fermer la session Administrateur</Text>
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
    paddingVertical: 14,
    paddingBottom: 40,
  },
  sectionHeading: {
    marginBottom: 12,
  },
  adminTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.3,
  },
  adminSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  actionFeedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  actionFeedbackText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
  },
  badgeCount: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  badgeCountText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  refreshIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshIconText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  loadingText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  emptyRequestsCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
    marginBottom: 8,
  },
  emptyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyRequestsTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: 3,
  },
  emptyRequestsSub: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  requestsList: {
    gap: 12,
    marginBottom: 6,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
  },
  requestCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
  },
  roleTagEtudiant: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  roleTagEnseignant: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  roleTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  roleTagTextEtudiant: {
    color: '#1D4ED8',
  },
  roleTagTextEnseignant: {
    color: '#047857',
  },
  pendingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D97706',
  },
  pendingStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  requestFullName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  requestMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  requestEmail: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  metaDivider: {
    color: theme.colors.textLight,
  },
  requestPhone: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  academicDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailItemLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  detailItemValue: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  arbitrageActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: theme.radius.sm,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: theme.radius.sm,
    backgroundColor: '#059669',
    ...theme.shadows.subtle,
  },
  acceptBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  kpiContainer: {
    marginBottom: 18,
    gap: 10,
  },
  dualKpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  kpiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  kpiCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  kpiMainNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.textMain,
    marginVertical: 2,
  },
  kpiSubLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  attendanceSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attendanceTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attendanceLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
  },
  targetBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  targetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  attendanceScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
  },
  attendanceBigScore: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  attendanceComment: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  cohortCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 18,
    ...theme.shadows.card,
  },
  cohortRow: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cohortInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cohortTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
    marginRight: 8,
  },
  cohortTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  cohortName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  cohortPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  cohortBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  cohortBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  bottomActions: {
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    ...theme.shadows.subtle,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
});
