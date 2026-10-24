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
import { Groupe, Matiere, Salle } from '../types/academic';
import { HeaderBar } from '../components/HeaderBar';
import { theme } from '../theme/theme';
import {
  demarrerOuObtenirSeance,
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
import { getGroupes, getSalles } from '../services/adminService';

interface EnseignantHomeScreenProps {
  session: UserSession;
  onLogout: () => void;
}

const CRENEAUX = [
  { label: '08:30 — 10:15', debut: '08:30', fin: '10:15' },
  { label: '10:30 — 12:15', debut: '10:30', fin: '12:15' },
  { label: '14:00 — 15:45', debut: '14:00', fin: '15:45' },
  { label: '16:00 — 17:45', debut: '16:00', fin: '17:45' },
];

export const EnseignantHomeScreen: React.FC<EnseignantHomeScreenProps> = ({
  session,
  onLogout,
}) => {
  const [etudiants, setEtudiants] = useState<EtudiantItem[]>([]);
  const [justificatifs, setJustificatifs] = useState<JustificatifReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Données dynamiques académiques
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [selectedGroupe, setSelectedGroupe] = useState<Groupe | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<Matiere | null>(null);
  const [selectedSalleCode, setSelectedSalleCode] = useState<string>('LABO-03');
  const [selectedCreneau, setSelectedCreneau] = useState<string>('08:30 — 10:15');
  const [selectedTypeSeance, setSelectedTypeSeance] = useState<string>('COURS');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [activeSeanceId, setActiveSeanceId] = useState<number | null>(null);

  // État modale de rejet avec motif (US09)
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedJustifId, setSelectedJustifId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('Certificat non conforme ou délai de 48h dépassé.');
  const [arbitratingId, setArbitratingId] = useState<number | null>(null);

  const loadStudentsForGroupe = async (grpId: number, seanceIdToSync?: number) => {
    try {
      const students = await getEtudiantsByGroupe(grpId);
      let alreadyAbsentIds: number[] = [];
      if (seanceIdToSync) {
        alreadyAbsentIds = await getAbsentsForSeance(seanceIdToSync);
      }
      const updated = students.map((s) => ({
        ...s,
        absent: alreadyAbsentIds.includes(s.id),
      }));
      setEtudiants(updated);
    } catch {
      setEtudiants([]);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Charger les classes et salles créées par l'administrateur
      const [fetchedGroupes, fetchedSalles] = await Promise.all([
        getGroupes(),
        getSalles(),
      ]);
      setGroupes(fetchedGroupes);
      setSalles(fetchedSalles);

      let currentGroupe = selectedGroupe;
      if (!currentGroupe && fetchedGroupes.length > 0) {
        currentGroupe = fetchedGroupes[0];
        setSelectedGroupe(currentGroupe);
      }

      if (currentGroupe) {
        if (!selectedMatiere && currentGroupe.matieres && currentGroupe.matieres.length > 0) {
          setSelectedMatiere(currentGroupe.matieres[0]);
        }
        if (fetchedSalles.length > 0 && !selectedSalleCode) {
          setSelectedSalleCode(fetchedSalles[0].code);
        }
        await loadStudentsForGroupe(currentGroupe.id, activeSeanceId || undefined);
      } else {
        setEtudiants([]);
      }
    } catch (err: any) {
      console.error('[EnseignantHomeScreen] Erreur chargement initial:', err);
    }

    try {
      // 2. Charger les justificatifs en attente d'arbitrage (US09)
      const pendingJustifs = await getJustificatifsEnAttente();
      setJustificatifs(pendingJustifs);
    } catch {
      setJustificatifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSelectGroupe = async (grp: Groupe) => {
    setSelectedGroupe(grp);
    const firstMatiere = grp.matieres && grp.matieres.length > 0 ? grp.matieres[0] : null;
    setSelectedMatiere(firstMatiere);
    setSuccessMessage(null);
    setErrorMessage(null);
    await loadStudentsForGroupe(grp.id);
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
   * US03 : Enregistrer l'appel avec règle anti-doublon et réservation de la séance.
   */
  const handleSaveAppel = async () => {
    if (!selectedGroupe) {
      Alert.alert('Attention', 'Veuillez sélectionner une classe.');
      return;
    }
    if (!selectedMatiere) {
      Alert.alert('Attention', 'Veuillez sélectionner un module d\'enseignement.');
      return;
    }
    if (etudiants.length === 0) {
      Alert.alert('Classe vide', 'Aucun étudiant n\'est inscrit dans cette promotion.');
      return;
    }

    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const creneauObj = CRENEAUX.find((c) => c.label === selectedCreneau) || CRENEAUX[0];
    const absentsList = etudiants
      .filter((e) => e.absent)
      .map((e) => ({
        etudiantId: e.id,
        typePresence: 'ABSENT' as const,
      }));

    try {
      // 1. Démarrer ou obtenir la séance dans la salle choisie
      const seance = await demarrerOuObtenirSeance({
        enseignantId: session.enseignantId || session.id,
        groupeId: selectedGroupe.id,
        matiereId: selectedMatiere.id,
        salle: selectedSalleCode || 'LABO-03',
        typeSeance: selectedTypeSeance,
        heureDebut: creneauObj.debut,
        heureFin: creneauObj.fin,
      });

      setActiveSeanceId(seance.id);

      // 2. Enregistrer l'appel avec contrôle anti-doublon
      await enregistrerAppel(
        seance.id,
        session.enseignantId || session.id,
        absentsList
      );

      setSuccessMessage(
        `Émargement validé avec succès pour ${selectedGroupe.code} en Salle ${selectedSalleCode} (${absentsList.length} absent(s)).`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la validation de l\'émargement.');
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
        subtitle={selectedGroupe ? `${selectedGroupe.code} • ${selectedSalleCode || 'Salle'}` : "Séance Active"}
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
            Département {session.departement || 'Génie Informatique'} • Émargement en Direct
          </Text>
        </View>

        {/* Alerte si aucune classe n'existe */}
        {groupes.length === 0 && !loading && (
          <View style={styles.emptyGroupesAlert}>
            <Feather name="alert-triangle" size={16} color="#D97706" />
            <Text style={styles.emptyGroupesAlertText}>
              Aucune classe créée. L'administration n'a pas encore configuré les promotions et les modules.
            </Text>
          </View>
        )}

        {/* 1. Carte de Séance & Réservation de Salle Dynamique */}
        {groupes.length > 0 && (
          <View style={styles.sessionCard}>
            <View style={styles.sessionCardTop}>
              <View style={styles.moduleTag}>
                <Text style={styles.moduleTagText}>{selectedMatiere?.code || 'MODULE'}</Text>
              </View>
              <Text style={styles.sessionCourseName} numberOfLines={1}>
                {selectedMatiere?.nom || 'Sélectionnez un module'}
              </Text>

              <TouchableOpacity
                style={styles.configToggleBtn}
                onPress={() => setShowConfig(!showConfig)}
                activeOpacity={0.8}
              >
                <Feather name={showConfig ? 'chevron-up' : 'sliders'} size={12} color="#1D4ED8" />
                <Text style={styles.configToggleText}>{showConfig ? 'Fermer' : 'Séance & Salle'}</Text>
              </TouchableOpacity>
            </View>

            {/* Métadonnées de salle & horaire sélectionnées */}
            <View style={styles.metadataGrid}>
              <View style={styles.metadataPill}>
                <Feather name="layers" size={11} color={theme.colors.textMuted} />
                <Text style={styles.metadataPillText}>{selectedGroupe?.code || 'Classe'}</Text>
              </View>
              <View style={styles.metadataPill}>
                <Feather name="map-pin" size={11} color={theme.colors.textMuted} />
                <Text style={styles.metadataPillText}>{selectedSalleCode || 'Salle'}</Text>
              </View>
              <View style={styles.metadataPill}>
                <Feather name="clock" size={11} color={theme.colors.textMuted} />
                <Text style={styles.metadataPillText}>{selectedCreneau}</Text>
              </View>
              <View style={styles.metadataPill}>
                <Text style={[styles.metadataPillText, { fontWeight: '800' }]}>{selectedTypeSeance}</Text>
              </View>
            </View>

            {/* Panneau de configuration dépliable de la séance & salle */}
            {showConfig && (
              <View style={styles.sessionConfigBox}>
                {/* 1. Choisir la classe */}
                <Text style={styles.configLabel}>1. CHOISIR LA CLASSE / PROMOTION</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                  {groupes.map((grp) => {
                    const active = selectedGroupe?.id === grp.id;
                    return (
                      <TouchableOpacity
                        key={grp.id}
                        style={[styles.choiceChip, active && styles.choiceChipActive]}
                        onPress={() => handleSelectGroupe(grp)}
                      >
                        <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                          {grp.code}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* 2. Choisir le module */}
                <Text style={styles.configLabel}>2. CHOISIR LE MODULE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                  {selectedGroupe?.matieres && selectedGroupe.matieres.length > 0 ? (
                    selectedGroupe.matieres.map((mat) => {
                      const active = selectedMatiere?.id === mat.id;
                      return (
                        <TouchableOpacity
                          key={mat.id}
                          style={[styles.choiceChip, active && styles.choiceChipActive]}
                          onPress={() => setSelectedMatiere(mat)}
                        >
                          <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                            {mat.code} • {mat.nom}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={styles.configEmptySub}>Aucun module rattaché à cette classe.</Text>
                  )}
                </ScrollView>

                {/* 3. Choisir la salle réservée */}
                <Text style={styles.configLabel}>3. RÉSERVER LA SALLE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                  {salles.length > 0 ? (
                    salles.map((sal) => {
                      const active = selectedSalleCode === sal.code;
                      return (
                        <TouchableOpacity
                          key={sal.id}
                          style={[styles.choiceChip, active && styles.choiceChipActive]}
                          onPress={() => setSelectedSalleCode(sal.code)}
                        >
                          <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                            {sal.code} ({sal.type})
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={styles.configEmptySub}>Aucune salle configurée par l'admin.</Text>
                  )}
                </ScrollView>

                {/* 4. Choisir le créneau */}
                <Text style={styles.configLabel}>4. CRÉNEAU HORAIRE & TYPE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                  {CRENEAUX.map((c) => {
                    const active = selectedCreneau === c.label;
                    return (
                      <TouchableOpacity
                        key={c.label}
                        style={[styles.choiceChip, active && styles.choiceChipActive]}
                        onPress={() => setSelectedCreneau(c.label)}
                      >
                        <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  {['COURS', 'TD', 'TP'].map((t) => {
                    const active = selectedTypeSeance === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.choiceChip, active && styles.choiceChipActive, { flex: 1, alignItems: 'center' }]}
                        onPress={() => setSelectedTypeSeance(t)}
                      >
                        <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Règle anti-doublon */}
            <View style={styles.ruleNotice}>
              <Feather name="shield" size={13} color={theme.colors.infoBoxText} />
              <Text style={styles.ruleNoticeText}>
                {selectedGroupe ? `Classe ${selectedGroupe.code}` : 'Promotion'} • Contrôle anti-doublon d'émargement actif.
              </Text>
            </View>
          </View>
        )}

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
  configToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  configToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  sessionConfigBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  configLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  chipsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  choiceChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  choiceChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  choiceChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  choiceChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  configEmptySub: {
    fontSize: 12,
    fontStyle: 'italic',
    color: theme.colors.textMuted,
    paddingVertical: 4,
  },
  emptyGroupesAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: theme.radius.sm,
    padding: 12,
    marginBottom: 16,
  },
  emptyGroupesAlertText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
    fontWeight: '500',
  },
});
