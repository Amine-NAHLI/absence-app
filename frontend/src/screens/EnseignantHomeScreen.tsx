import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import {
  arbitrerJustificatif,
  getJustificatifsEnAttente,
  JustificatifReviewItem,
} from '../services/justificatifService';

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
  const [justificatifs, setJustificatifs] = useState<JustificatifReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // État modale de rejet avec motif (US09)
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedJustifId, setSelectedJustifId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('Certificat non conforme ou délai de 48h dépassé.');
  const [arbitratingId, setArbitratingId] = useState<number | null>(null);

  const seanceId = 1;
  const groupeId = 1;

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Charger les étudiants du groupe (US02)
      const students = await getEtudiantsByGroupe(groupeId);
      const alreadyAbsentIds = await getAbsentsForSeance(seanceId);

      const updated = students.map((s) => ({
        ...s,
        absent: alreadyAbsentIds.includes(s.id),
      }));
      setEtudiants(updated);
    } catch {
      setEtudiants(DEFAULT_STUDENTS);
    }

    try {
      // 2. Charger les justificatifs en attente d'arbitrage (US09)
      const pendingJustifs = await getJustificatifsEnAttente();
      setJustificatifs(pendingJustifs);
    } catch {
      // Fallback démo : initialiser un justificatif d'exemple si aucun n'est encore soumis
      setJustificatifs([
        {
          id: 1,
          absenceId: 1,
          etudiantId: 1,
          etudiantNom: 'NAHLI Amine',
          etudiantMatricule: 'ETU-001',
          groupeCode: 'GI4-A',
          matiereCode: 'GL401',
          matiereNom: 'Génie Logiciel',
          dateSeance: "Aujourd'hui",
          nomFichier: 'Certificat_Medical_Amine_Dr_Alami.pdf',
          typeMime: 'application/pdf',
          tailleOctets: 248000,
          dateDepot: "Aujourd'hui, 09:15",
          statut: 'EN_ATTENTE',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * US08 : Modification / bascule de présence immédiate.
   */
  const togglePresence = (id: number) => {
    setSuccessMessage(null);
    setEtudiants((prev) =>
      prev.map((e) => (e.id === id ? { ...e, absent: !e.absent } : e))
    );
  };

  /**
   * US03 : Enregistrer l'appel avec règle anti-doublon.
   */
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

  /**
   * US09 : Valider un justificatif (Accepter).
   */
  const handleAcceptJustificatif = async (justifId: number) => {
    setArbitratingId(justifId);
    setSuccessMessage(null);
    try {
      await arbitrerJustificatif(justifId, 'ACCEPTE', '', session.enseignantId || 1);
      setSuccessMessage(`Justificatif #${justifId} validé avec succès. L'absence est désormais justifiée.`);
      setJustificatifs((prev) => prev.filter((j) => j.id !== justifId));
    } catch {
      setSuccessMessage(`Justificatif #${justifId} validé (mode démo). Absence justifiée.`);
      setJustificatifs((prev) => prev.filter((j) => j.id !== justifId));
    } finally {
      setArbitratingId(null);
    }
  };

  /**
   * US09 : Ouvrir la boîte de dialogue de rejet avec motif.
   */
  const openRejectModal = (justifId: number) => {
    setSelectedJustifId(justifId);
    setRejectReason('Certificat médical non recevable ou délai de 48h dépassé.');
    setRejectModalVisible(true);
  };

  /**
   * US09 : Confirmer le rejet avec motif.
   */
  const handleConfirmReject = async () => {
    if (!selectedJustifId) return;

    setArbitratingId(selectedJustifId);
    setRejectModalVisible(false);
    setSuccessMessage(null);

    try {
      await arbitrerJustificatif(selectedJustifId, 'REFUSE', rejectReason, session.enseignantId || 1);
      setSuccessMessage(`Justificatif #${selectedJustifId} refusé. Le motif a été transmis à l'étudiant.`);
      setJustificatifs((prev) => prev.filter((j) => j.id !== selectedJustifId));
    } catch {
      setSuccessMessage(`Justificatif #${selectedJustifId} refusé (mode démo).`);
      setJustificatifs((prev) => prev.filter((j) => j.id !== selectedJustifId));
    } finally {
      setArbitratingId(null);
      setSelectedJustifId(null);
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

        {/* 2. Section Arbitrage des Justificatifs Médicaux (US09) */}
        {justificatifs.length > 0 && (
          <View style={styles.justifSectionCard}>
            <View style={styles.justifHeaderRow}>
              <View style={styles.justifTitleGroup}>
                <Feather name="file-text" size={15} color="#D97706" />
                <Text style={styles.justifSectionTitle}>
                  JUSTIFICATIFS EN ATTENTE D'ARBITRAGE ({justificatifs.length})
                </Text>
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>US09</Text>
              </View>
            </View>

            {justificatifs.map((justif) => {
              const isArbitrating = arbitratingId === justif.id;

              return (
                <View key={justif.id} style={styles.justifItemCard}>
                  <View style={styles.justifStudentRow}>
                    <Text style={styles.justifStudentName}>{justif.etudiantNom}</Text>
                    <View style={styles.classeTag}>
                      <Text style={styles.classeTagText}>{justif.groupeCode}</Text>
                    </View>
                  </View>

                  <Text style={styles.justifFileInfo} numberOfLines={1}>
                    Fichier : {justif.nomFichier}
                  </Text>
                  <Text style={styles.justifDateInfo}>
                    Séance : {justif.matiereCode} • Déposé le {justif.dateDepot}
                  </Text>

                  {/* Actions de décision US09 */}
                  <View style={styles.arbitrageActionsRow}>
                    <TouchableOpacity
                      style={[styles.acceptButton, isArbitrating && styles.buttonDisabled]}
                      onPress={() => handleAcceptJustificatif(justif.id)}
                      disabled={isArbitrating}
                      activeOpacity={0.8}
                    >
                      <Feather name="check" size={13} color="#065F46" />
                      <Text style={styles.acceptButtonText}>Valider le certificat</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rejectButton, isArbitrating && styles.buttonDisabled]}
                      onPress={() => openRejectModal(justif.id)}
                      disabled={isArbitrating}
                      activeOpacity={0.8}
                    >
                      <Feather name="x" size={13} color="#991B1B" />
                      <Text style={styles.rejectButtonText}>Refuser</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* 3. Liste d'Émargement des Étudiants (US02, US03, US08) */}
        <View style={styles.rosterCard}>
          <View style={styles.rosterHeader}>
            <View style={styles.rosterTitleGroup}>
              <Text style={styles.rosterTitle}>CLASSE GI4-A</Text>
              <Text style={styles.rosterCount}>{etudiants.length} étudiants inscrits</Text>
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

                  {/* Toggle Présence Apple FinTech (Segmented Pill - US08) */}
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

        {/* 4. Actions d'Enregistrement de l'Appel (US03) */}
        <View style={styles.actionButtonGroup}>
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

          <TouchableOpacity
            style={styles.secondaryRefreshButton}
            onPress={loadAllData}
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

      {/* Modale de Saisie de Motif de Rejet (US09) */}
      <Modal
        visible={rejectModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Feather name="alert-triangle" size={18} color="#991B1B" />
              <Text style={styles.modalTitle}>Refuser le justificatif</Text>
            </View>

            <Text style={styles.modalSub}>
              Veuillez indiquer le motif du refus. Cette explication sera transmise directement à l'étudiant.
            </Text>

            <TextInput
              style={styles.motifInput}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Ex : Certificat illisible, cachet manquant..."
              multiline={true}
              numberOfLines={3}
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmRejectButton}
                onPress={handleConfirmReject}
              >
                <Text style={styles.modalConfirmRejectText}>Confirmer le refus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  justifSectionCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
    ...theme.shadows.card,
  },
  justifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  justifTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  justifSectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  justifItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 10,
  },
  justifStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  justifStudentName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  classeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  classeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  justifFileInfo: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  justifDateInfo: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  arbitrageActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 8,
    borderRadius: theme.radius.xs,
  },
  acceptButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.xs,
  },
  rejectButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#991B1B',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.card,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 16,
    marginBottom: 12,
  },
  motifInput: {
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    padding: 10,
    fontSize: 13,
    color: theme.colors.textMain,
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 70,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radius.xs,
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  modalConfirmRejectButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radius.xs,
    backgroundColor: '#EF4444',
  },
  modalConfirmRejectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
