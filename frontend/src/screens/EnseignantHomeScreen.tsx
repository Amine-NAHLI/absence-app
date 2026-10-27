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
import { Groupe, Matiere, Salle, SeanceAujourdhui, SeanceHistorique } from '../types/academic';
import { HeaderBar } from '../components/HeaderBar';
import { theme } from '../theme/theme';
import {
  cloturerSeance,
  demarrerOuObtenirSeance,
  enregistrerAppel,
  EtudiantItem,
  getAbsentsForSeance,
  getEtudiantsByGroupe,
  getHistoriqueAbsences,
  getSeancesAujourdhui,
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

  // Séances du jour de l'enseignant
  const [seancesAujourdhui, setSeancesAujourdhui] = useState<SeanceAujourdhui[]>([]);
  const [activeSeance, setActiveSeance] = useState<SeanceAujourdhui | null>(null);
  const [activeSeanceId, setActiveSeanceId] = useState<number | null>(null);

  // Configuration de la séance sélectionnée / à réserver
  const [selectedGroupe, setSelectedGroupe] = useState<Groupe | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<Matiere | null>(null);
  const [selectedSalleCode, setSelectedSalleCode] = useState<string>('LABO-03');
  const [selectedCreneau, setSelectedCreneau] = useState<string>('08:30 — 10:15');
  const [selectedTypeSeance, setSelectedTypeSeance] = useState<string>('COURS');

  // Modale de réservation de salle & nouvelle séance
  const [showReserverModal, setShowReserverModal] = useState<boolean>(false);
  const [reserving, setReserving] = useState<boolean>(false);

  // Recherche locale d'étudiant
  const [searchStudent, setSearchStudent] = useState<string>('');

  // État modale de rejet avec motif (US09)
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedJustifId, setSelectedJustifId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('Certificat non conforme ou délai de 48h dépassé.');
  const [arbitratingId, setArbitratingId] = useState<number | null>(null);

  // US10 : Historique des absences enseignant
  const [showHistoriqueModal, setShowHistoriqueModal] = useState<boolean>(false);
  const [historiqueList, setHistoriqueList] = useState<SeanceHistorique[]>([]);
  const [historiqueLoading, setHistoriqueLoading] = useState<boolean>(false);
  const [filterHistGroupeId, setFilterHistGroupeId] = useState<number | null>(null);
  const [filterHistMatiereId, setFilterHistMatiereId] = useState<number | null>(null);
  const [expandedSeanceId, setExpandedSeanceId] = useState<number | null>(null);

  const loadHistorique = async (grpId?: number | null, matId?: number | null) => {
    setHistoriqueLoading(true);
    try {
      const targetGrp = grpId !== undefined ? grpId : filterHistGroupeId;
      const targetMat = matId !== undefined ? matId : filterHistMatiereId;
      const data = await getHistoriqueAbsences({
        enseignantId: session.enseignantId,
        groupeId: targetGrp || undefined,
        matiereId: targetMat || undefined,
      });
      setHistoriqueList(data);
    } catch {
      setHistoriqueList([]);
    } finally {
      setHistoriqueLoading(false);
    }
  };

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

  const loadSeances = async (): Promise<SeanceAujourdhui[]> => {
    try {
      const todayList = await getSeancesAujourdhui(session.enseignantId);
      setSeancesAujourdhui(todayList);
      return todayList;
    } catch {
      setSeancesAujourdhui([]);
      return [];
    }
  };

  const handleSelectSeance = async (seance: SeanceAujourdhui, grpsList = groupes) => {
    setActiveSeance(seance);
    setActiveSeanceId(seance.id);
    setSelectedSalleCode(seance.salle);
    setSelectedCreneau(
      seance.heureDebut && seance.heureFin
        ? `${seance.heureDebut.substring(0, 5)} — ${seance.heureFin.substring(0, 5)}`
        : '08:30 — 10:15'
    );
    setSelectedTypeSeance(seance.typeSeance || 'COURS');

    // Associer la classe et le module
    const matchedGroupe = grpsList.find((g) => g.id === seance.groupeId);
    if (matchedGroupe) {
      setSelectedGroupe(matchedGroupe);
      const matchedMatiere = matchedGroupe.matieres?.find((m) => m.id === seance.matiereId);
      if (matchedMatiere) {
        setSelectedMatiere(matchedMatiere);
      }
    }

    setSuccessMessage(null);
    setErrorMessage(null);
    await loadStudentsForGroupe(seance.groupeId, seance.id);
  };

  const loadAllData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [fetchedGroupes, fetchedSalles, todaySeances] = await Promise.all([
        getGroupes(),
        getSalles(),
        loadSeances(),
      ]);
      setGroupes(fetchedGroupes);
      setSalles(fetchedSalles);

      if (todaySeances.length > 0) {
        await handleSelectSeance(todaySeances[0], fetchedGroupes);
      } else if (fetchedGroupes.length > 0) {
        const defaultGrp = fetchedGroupes[0];
        setSelectedGroupe(defaultGrp);
        if (defaultGrp.matieres && defaultGrp.matieres.length > 0) {
          setSelectedMatiere(defaultGrp.matieres[0]);
        }
        if (fetchedSalles.length > 0) {
          setSelectedSalleCode(fetchedSalles[0].code);
        }
        await loadStudentsForGroupe(defaultGrp.id);
      } else {
        setEtudiants([]);
      }
    } catch (err: any) {
      console.error('[EnseignantHomeScreen] Erreur chargement initial:', err);
    }

    try {
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

  const handleSelectGroupeInModal = (grp: Groupe) => {
    setSelectedGroupe(grp);
    const firstMatiere = grp.matieres && grp.matieres.length > 0 ? grp.matieres[0] : null;
    setSelectedMatiere(firstMatiere);
  };

  /**
   * Confirmer la réservation d'une salle et création de séance (Aujourd'hui)
   */
  const handleConfirmReservation = async () => {
    if (!selectedGroupe) {
      Alert.alert('Attention', 'Veuillez sélectionner une classe.');
      return;
    }
    if (!selectedMatiere) {
      Alert.alert('Attention', 'Veuillez sélectionner un module d\'enseignement.');
      return;
    }
    if (!selectedSalleCode) {
      Alert.alert('Attention', 'Veuillez sélectionner une salle.');
      return;
    }

    setReserving(true);
    const creneauObj = CRENEAUX.find((c) => c.label === selectedCreneau) || CRENEAUX[0];

    try {
      const newSeance = await demarrerOuObtenirSeance({
        enseignantId: session.enseignantId || session.id,
        groupeId: selectedGroupe.id,
        matiereId: selectedMatiere.id,
        salle: selectedSalleCode,
        typeSeance: selectedTypeSeance,
        heureDebut: creneauObj.debut,
        heureFin: creneauObj.fin,
      });

      setShowReserverModal(false);
      setSuccessMessage(
        `Séance ${newSeance.typeSeance || 'COURS'} réservée avec succès en salle ${newSeance.salle || selectedSalleCode} !`
      );

      const updatedList = await loadSeances();
      const matched = updatedList.find((s) => s.id === newSeance.id) || newSeance;
      await handleSelectSeance(matched);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de réserver cette salle.');
    } finally {
      setReserving(false);
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

  const handleMarkAllPresent = () => {
    setSuccessMessage(null);
    setEtudiants((prev) => prev.map((e) => ({ ...e, absent: false })));
  };

  const handleToggleAll = () => {
    setSuccessMessage(null);
    setEtudiants((prev) => prev.map((e) => ({ ...e, absent: !e.absent })));
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
      let seanceId = activeSeanceId;
      if (!seanceId) {
        const seance = await demarrerOuObtenirSeance({
          enseignantId: session.enseignantId || session.id,
          groupeId: selectedGroupe.id,
          matiereId: selectedMatiere.id,
          salle: selectedSalleCode || 'LABO-03',
          typeSeance: selectedTypeSeance,
          heureDebut: creneauObj.debut,
          heureFin: creneauObj.fin,
        });
        seanceId = seance.id;
        setActiveSeanceId(seance.id);
      }

      await enregistrerAppel(
        seanceId!,
        session.enseignantId || session.id,
        absentsList
      );

      setSuccessMessage(
        `Émargement validé avec succès pour ${selectedGroupe.code} (${absentsList.length} absent(s)). Règle anti-doublon appliquée.`
      );

      const refreshed = await loadSeances();
      if (activeSeanceId) {
        const found = refreshed.find((s) => s.id === activeSeanceId);
        if (found) setActiveSeance(found);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la validation de l\'émargement.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloturer = async () => {
    if (!activeSeanceId) return;
    Alert.alert(
      'Clôturer la séance',
      'Voulez-vous marquer cette séance comme terminée ? L\'appel restera conservé pour consultation.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Clôturer la séance',
          style: 'default',
          onPress: async () => {
            try {
              await cloturerSeance(activeSeanceId);
              setSuccessMessage('Séance clôturée avec succès.');
              await loadSeances();
            } catch (err: any) {
              Alert.alert('Erreur', err.message || 'Impossible de clôturer la séance.');
            }
          },
        },
      ]
    );
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
   * US09 : Boîte de dialogue rejet.
   */
  const openRejectModal = (justifId: number) => {
    setSelectedJustifId(justifId);
    setRejectReason('Certificat médical non recevable ou délai de 48h dépassé.');
    setRejectModalVisible(true);
  };

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

  const filteredEtudiants = etudiants.filter((e) => {
    if (!searchStudent) return true;
    const q = searchStudent.toLowerCase().trim();
    return (
      e.nom.toLowerCase().includes(q) ||
      e.prenom.toLowerCase().includes(q) ||
      (e.matricule && e.matricule.toLowerCase().includes(q))
    );
  });

  const totalAbsents = etudiants.filter((e) => e.absent).length;
  const totalPresents = etudiants.length - totalAbsents;

  const teacherName = `Prof. ${session.prenom || ''} ${session.nom || 'EL HASSANI'}`.trim();
  const initial = session.prenom?.[0] || session.nom?.[0] || 'P';

  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        title="Espace Enseignant"
        subtitle={selectedGroupe ? `${selectedGroupe.code} • ${selectedSalleCode || 'Salle'}` : "Séance Active"}
        userInitial={initial}
        onLogout={onLogout}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Titre de section enseignant & Date du Jour */}
        <View style={styles.sectionHeading}>
          <Text style={styles.teacherTitle}>{teacherName}</Text>
          <Text style={styles.teacherDept}>
            Département {session.departement || 'Génie Informatique'} • {todayFormatted}
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

        {/* =========================================================================
            1. SECTION SÉANCES DU JOUR (Affichage de la liste + Réservation de salle)
           ========================================================================= */}
        <View style={styles.todaySectionCard}>
          <View style={styles.todayHeaderRow}>
            <View style={styles.todayTitleGroup}>
              <View style={styles.todayIconCircle}>
                <Feather name="calendar" size={15} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.todaySectionTitle}>SÉANCES D'AUJOURD'HUI</Text>
                <Text style={styles.todaySubText}>
                  {seancesAujourdhui.length} séance(s) programmée(s)
                </Text>
              </View>
            </View>

            {/* Boutons d'Action : Historique (US10) & Réserver une Salle */}
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TouchableOpacity
                style={styles.historyTriggerBtn}
                onPress={() => {
                  loadHistorique();
                  setShowHistoriqueModal(true);
                }}
                activeOpacity={0.8}
              >
                <Feather name="archive" size={13} color="#0369A1" />
                <Text style={styles.historyTriggerBtnText}>Historique (US10)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reserverBtn}
                onPress={() => setShowReserverModal(true)}
                activeOpacity={0.8}
              >
                <Feather name="plus-circle" size={13} color="#FFFFFF" />
                <Text style={styles.reserverBtnText}>Réserver une Salle</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste des séances d'aujourd'hui */}
          {seancesAujourdhui.length === 0 ? (
            <View style={styles.emptyTodayBox}>
              <Feather name="clock" size={24} color="#94A3B8" />
              <Text style={styles.emptyTodayTitle}>Aucune séance enregistrée pour aujourd'hui</Text>
              <Text style={styles.emptyTodaySub}>
                Cliquez sur le bouton ci-dessous pour réserver une salle et démarrer un cours ou un TD.
              </Text>
              <TouchableOpacity
                style={styles.emptyReserverAction}
                onPress={() => setShowReserverModal(true)}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={14} color="#2563EB" />
                <Text style={styles.emptyReserverActionText}>Créer & Réserver une séance</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seancesScrollRow}>
              {seancesAujourdhui.map((s) => {
                const isSelected = activeSeanceId === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.seanceCardItem,
                      isSelected && styles.seanceCardItemActive,
                    ]}
                    onPress={() => handleSelectSeance(s)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.seanceCardTop}>
                      <View style={styles.seanceTimeBadge}>
                        <Feather name="clock" size={11} color="#1E293B" />
                        <Text style={styles.seanceTimeText}>
                          {s.heureDebut?.substring(0, 5)} — {s.heureFin?.substring(0, 5)}
                        </Text>
                      </View>

                      {/* Statut de l'appel */}
                      <View
                        style={[
                          styles.seanceAppelBadge,
                          s.appelFait
                            ? { backgroundColor: '#DCFCE7' }
                            : { backgroundColor: '#FEF3C7' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.seanceAppelBadgeText,
                            s.appelFait ? { color: '#166534' } : { color: '#92400E' },
                          ]}
                        >
                          {s.appelFait ? `Appel fait (${s.nbAbsents} abs.)` : 'À émarger'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.seanceMatiereName} numberOfLines={1}>
                      {s.matiereCode} • {s.matiereNom}
                    </Text>

                    <View style={styles.seanceMetaRow}>
                      <View style={styles.seanceMetaPill}>
                        <Feather name="map-pin" size={10} color="#64748B" />
                        <Text style={styles.seanceMetaPillText}>{s.salle || 'Salle'}</Text>
                      </View>

                      <View style={styles.seanceMetaPill}>
                        <Feather name="layers" size={10} color="#64748B" />
                        <Text style={styles.seanceMetaPillText}>{s.groupeCode || 'Classe'}</Text>
                      </View>

                      <View style={styles.seanceMetaPill}>
                        <Text style={[styles.seanceMetaPillText, { fontWeight: '800' }]}>
                          {s.typeSeance || 'COURS'}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View style={styles.seanceActiveRibbon}>
                        <Feather name="check" size={12} color="#FFFFFF" />
                        <Text style={styles.seanceActiveRibbonText}>Séance active</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
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

        {/* =========================================================================
            2. SECTION FEUILLE D'ÉMARGEMENT EN DIRECT (De la séance sélectionnée)
           ========================================================================= */}
        <View style={styles.rosterCard}>
          <View style={styles.rosterHeader}>
            <View style={styles.rosterTitleGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.rosterTitle}>
                  {selectedGroupe?.code || 'CLASSE'} • {selectedMatiere?.code || 'MODULE'}
                </Text>
                {activeSeance?.statut && (
                  <View style={styles.statutSeancePill}>
                    <Text style={styles.statutSeancePillText}>{activeSeance.statut}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.rosterCount}>
                Salle {selectedSalleCode} • {selectedCreneau} • {etudiants.length} étudiants
              </Text>
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

          {/* Règle anti-doublon et aide */}
          <View style={styles.ruleNotice}>
            <Feather name="shield" size={13} color={theme.colors.infoBoxText} />
            <Text style={styles.ruleNoticeText}>
              Contrôle anti-doublon actif : vous pouvez corriger l'appel sans risquer de créer des doublons.
            </Text>
          </View>

          {/* Outils d'appel rapide & Recherche */}
          <View style={styles.rosterToolsRow}>
            <View style={styles.searchStudentBox}>
              <Feather name="search" size={13} color="#94A3B8" />
              <TextInput
                style={styles.searchStudentInput}
                placeholder="Rechercher par nom, prénom ou matricule..."
                value={searchStudent}
                onChangeText={setSearchStudent}
                placeholderTextColor="#94A3B8"
              />
              {searchStudent.length > 0 && (
                <TouchableOpacity onPress={() => setSearchStudent('')}>
                  <Feather name="x" size={13} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.quickBulkRow}>
              <TouchableOpacity style={styles.quickBulkBtn} onPress={handleMarkAllPresent}>
                <Text style={styles.quickBulkBtnText}>Tous présents</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBulkBtn} onPress={handleToggleAll}>
                <Text style={styles.quickBulkBtnText}>Inverser</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste des étudiants */}
          {loading ? (
            <ActivityIndicator style={{ padding: 32 }} color={theme.colors.primaryDark} size="small" />
          ) : filteredEtudiants.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                {searchStudent ? 'Aucun étudiant ne correspond à cette recherche.' : 'Aucun étudiant dans cette classe.'}
              </Text>
            </View>
          ) : (
            filteredEtudiants.map((etudiant, index) => {
              const isLast = index === filteredEtudiants.length - 1;
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
                        {etudiant.matricule || 'N/A'} • CNE {etudiant.cne || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Bouton de Présence / Absence */}
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

        {/* 3. Actions d'Enregistrement de l'Appel (US03) */}
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
                  Valider et enregistrer l'émargement ({totalAbsents} absents)
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {activeSeance && activeSeance.statut !== 'TERMINEE' && (
            <TouchableOpacity
              style={styles.cloturerButton}
              onPress={handleCloturer}
              activeOpacity={0.8}
            >
              <Feather name="lock" size={14} color="#475569" />
              <Text style={styles.cloturerButtonText}>Clôturer cette séance</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* =========================================================================
            4. SECTION ARBITRAGE DES JUSTIFICATIFS MÉDICAUX (US09)
           ========================================================================= */}
        {justificatifs.length > 0 && (
          <View style={styles.justifSectionCard}>
            <View style={styles.justifHeaderRow}>
              <View style={styles.justifTitleGroup}>
                <Feather name="file-text" size={15} color="#D97706" />
                <Text style={styles.justifSectionTitle}>
                  JUSTIFICATIFS EN ATTENTE D'ARBITRAGE ({justificatifs.length})
                </Text>
              </View>
            </View>

            <Text style={styles.justifSubTitle}>
              Validez les certificats médicaux ou formulez un motif explicatif en cas de rejet (US09).
            </Text>

            {justificatifs.map((justif) => {
              const isArbitrating = arbitratingId === justif.id;

              return (
                <View key={justif.id} style={styles.justifCardItem}>
                  <View style={styles.justifTopRow}>
                    <View style={styles.justifEtudiantTag}>
                      <Text style={styles.justifEtudiantName}>
                        {justif.etudiantNom}
                      </Text>
                      <Text style={styles.justifMatriculeText}>{justif.etudiantMatricule || 'N/A'}</Text>
                    </View>
                    <View style={styles.justifHourTag}>
                      <Feather name="layers" size={10} color="#64748B" />
                      <Text style={styles.justifHourText}>{justif.groupeCode || 'Classe'}</Text>
                    </View>
                  </View>

                  <Text style={styles.justifMotifText}>
                    <Text style={{ fontWeight: '700' }}>Module : </Text>
                    {justif.matiereCode} • {justif.matiereNom}
                  </Text>

                  <Text style={styles.justifFileInfo} numberOfLines={1}>
                    Fichier : {justif.nomFichier}
                  </Text>
                  <Text style={styles.justifDateInfo}>
                    Séance : {justif.matiereCode} • Déposé le {justif.dateDepot}
                  </Text>

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

      </ScrollView>

      {/* =========================================================================
          MODALE 1 : RÉSERVER UNE SALLE & NOUVELLE SÉANCE (Aujourd'hui)
         ========================================================================= */}
      <Modal
        visible={showReserverModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReserverModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCardWide}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.reserverModalIcon}>
                  <Feather name="calendar" size={16} color="#1D4ED8" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Réserver une Salle & Séance</Text>
                  <Text style={styles.modalSubSmall}>Programmer un cours ou un TD pour aujourd'hui</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowReserverModal(false)}>
                <Feather name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* 1. Classe */}
              <Text style={styles.formSectionLabel}>1. SÉLECTIONNER LA CLASSE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {groupes.map((grp) => {
                  const active = selectedGroupe?.id === grp.id;
                  return (
                    <TouchableOpacity
                      key={grp.id}
                      style={[styles.choiceChip, active && styles.choiceChipActive]}
                      onPress={() => handleSelectGroupeInModal(grp)}
                    >
                      <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                        {grp.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* 2. Module */}
              <Text style={styles.formSectionLabel}>2. SÉLECTIONNER LE MODULE</Text>
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

              {/* 3. Salle */}
              <Text style={styles.formSectionLabel}>3. RÉSERVER LA SALLE</Text>
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

              {/* 4. Horaire */}
              <Text style={styles.formSectionLabel}>4. CRÉNEAU HORAIRE</Text>
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

              {/* 5. Type de cours */}
              <Text style={styles.formSectionLabel}>5. TYPE D'ENSEIGNEMENT</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
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
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowReserverModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBookingButton, reserving && styles.buttonDisabled]}
                onPress={handleConfirmReservation}
                disabled={reserving}
              >
                {reserving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmBookingText}>Confirmer la Réservation</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          MODALE 2 : SAISIE DE MOTIF DE REJET (US09)
         ========================================================================= */}
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

      {/* =========================================================================
          US10 : MODAL HISTORIQUE DES ABSENCES & ASSIDUITÉ PAR CLASSE / MATIÈRE
         ========================================================================= */}
      <Modal
        visible={showHistoriqueModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistoriqueModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%', maxWidth: 720 }]}>
            {/* Entête de la modale */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="archive" size={17} color="#0284C7" />
                  <Text style={styles.modalTitle}>Historique des Séances & Assiduité</Text>
                </View>
                <Text style={styles.modalSub}>
                  US10 : Consultation détaillée des émargements passés et taux de présence
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowHistoriqueModal(false)}
                style={{ padding: 4 }}
              >
                <Feather name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Filtres par Groupe et par Matière */}
            <View style={styles.histFiltersBox}>
              <Text style={styles.histFilterLabel}>Filtrer par promotion :</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginVertical: 6 }}>
                <TouchableOpacity
                  style={[styles.histChip, filterHistGroupeId === null && styles.histChipActive]}
                  onPress={() => {
                    setFilterHistGroupeId(null);
                    loadHistorique(null, filterHistMatiereId);
                  }}
                >
                  <Text style={[styles.histChipText, filterHistGroupeId === null && styles.histChipTextActive]}>
                    Toutes ({groupes.length})
                  </Text>
                </TouchableOpacity>
                {groupes.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.histChip, filterHistGroupeId === g.id && styles.histChipActive]}
                    onPress={() => {
                      setFilterHistGroupeId(g.id);
                      loadHistorique(g.id, filterHistMatiereId);
                    }}
                  >
                    <Text style={[styles.histChipText, filterHistGroupeId === g.id && styles.histChipTextActive]}>
                      {g.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Liste scrollable des séances historiques */}
            {historiqueLoading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0284C7" />
                <Text style={{ marginTop: 10, fontSize: 13, color: '#64748B' }}>Chargement de l'historique...</Text>
              </View>
            ) : historiqueList.length === 0 ? (
              <View style={styles.histEmptyBox}>
                <Feather name="inbox" size={32} color="#94A3B8" />
                <Text style={styles.histEmptyTitle}>Aucune séance trouvée</Text>
                <Text style={styles.histEmptySub}>
                  Aucun émargement n'a été enregistré pour les filtres sélectionnés.
                </Text>
              </View>
            ) : (
              <ScrollView style={{ marginTop: 8 }} showsVerticalScrollIndicator={false}>
                {historiqueList.map((hist) => {
                  const isExpanded = expandedSeanceId === hist.seanceId;
                  const presencePct = hist.tauxPresence ?? 100;
                  const isHighPresence = presencePct >= 80;

                  return (
                    <View key={hist.seanceId} style={styles.histCard}>
                      {/* Entête Séance */}
                      <View style={styles.histCardTop}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.histCardDate}>{hist.dateSeance}</Text>
                            <View style={styles.histTypeBadge}>
                              <Text style={styles.histTypeBadgeText}>{hist.typeSeance || 'COURS'}</Text>
                            </View>
                            <Text style={styles.histTimeSlot}>{hist.heureDebut?.substring(0, 5)} - {hist.heureFin?.substring(0, 5)}</Text>
                          </View>
                          <Text style={styles.histMatiereNom}>{hist.matiereCode} — {hist.matiereNom}</Text>
                          <Text style={styles.histGroupeNom}>Classe : {hist.groupeCode} • Salle : {hist.salle || 'N/A'}</Text>
                        </View>

                        {/* Taux de présence */}
                        <View style={styles.histTauxContainer}>
                          <Text style={[styles.histTauxNum, { color: isHighPresence ? '#059669' : '#DC2626' }]}>
                            {presencePct.toFixed(0)}%
                          </Text>
                          <Text style={styles.histTauxSub}>Présence</Text>
                        </View>
                      </View>

                      {/* Barre de Présence */}
                      <View style={styles.histProgressBarBg}>
                        <View
                          style={[
                            styles.histProgressBarFill,
                            {
                              width: `${Math.min(100, Math.max(0, presencePct))}%` as any,
                              backgroundColor: isHighPresence ? '#10B981' : '#EF4444',
                            },
                          ]}
                        />
                      </View>

                      {/* Badges Compteurs */}
                      <View style={styles.histCountersRow}>
                        <View style={[styles.histBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                          <Text style={[styles.histBadgeText, { color: '#065F46' }]}>
                            ✓ {hist.totalPresents} présent(s)
                          </Text>
                        </View>
                        <View style={[styles.histBadge, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                          <Text style={[styles.histBadgeText, { color: '#991B1B' }]}>
                            ✗ {hist.totalAbsents} absent(s)
                          </Text>
                        </View>
                        {hist.totalRetards > 0 && (
                          <View style={[styles.histBadge, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                            <Text style={[styles.histBadgeText, { color: '#92400E' }]}>
                              ⏱ {hist.totalRetards} retard(s)
                            </Text>
                          </View>
                        )}

                        {hist.detailsAbsents && hist.detailsAbsents.length > 0 && (
                          <TouchableOpacity
                            style={styles.histToggleDetailsBtn}
                            onPress={() => setExpandedSeanceId(isExpanded ? null : hist.seanceId)}
                          >
                            <Text style={styles.histToggleDetailsText}>
                              {isExpanded ? 'Masquer la liste' : 'Voir les absents'}
                            </Text>
                            <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={13} color="#0284C7" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Accordéon : Liste des absents et statut justificatif */}
                      {isExpanded && hist.detailsAbsents && hist.detailsAbsents.length > 0 && (
                        <View style={styles.histDetailsList}>
                          <Text style={styles.histDetailsHeader}>Étudiants signalés sur cette séance :</Text>
                          {hist.detailsAbsents.map((abs, idx) => (
                            <View key={idx} style={styles.histDetailItem}>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.histDetailName}>{abs.nom} {abs.prenom}</Text>
                                <Text style={styles.histDetailMatricule}>Matricule : {abs.matricule}</Text>
                              </View>
                              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                                <View style={[styles.histMiniBadge, { backgroundColor: abs.typePresence === 'RETARD' ? '#FFFBEB' : '#FEF2F2' }]}>
                                  <Text style={[styles.histMiniBadgeText, { color: abs.typePresence === 'RETARD' ? '#B45309' : '#DC2626' }]}>
                                    {abs.typePresence}
                                  </Text>
                                </View>
                                <View
                                  style={[
                                    styles.histMiniBadge,
                                    {
                                      backgroundColor:
                                        abs.statut === 'JUSTIFIEE'
                                          ? '#ECFDF5'
                                          : abs.statut === 'EN_ATTENTE'
                                          ? '#EFF6FF'
                                          : '#FEF2F2',
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.histMiniBadgeText,
                                      {
                                        color:
                                          abs.statut === 'JUSTIFIEE'
                                            ? '#059669'
                                            : abs.statut === 'EN_ATTENTE'
                                            ? '#2563EB'
                                            : '#DC2626',
                                      },
                                    ]}
                                  >
                                    {abs.statut === 'JUSTIFIEE'
                                      ? 'Justifiée'
                                      : abs.statut === 'EN_ATTENTE'
                                      ? 'En attente'
                                      : 'Non justifiée'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}

            {/* Bouton de Fermeture */}
            <View style={{ marginTop: 14, borderTopWidth: 1, borderColor: '#E2E8F0', paddingTop: 12, alignItems: 'flex-end' }}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowHistoriqueModal(false)}
              >
                <Text style={styles.modalCancelText}>Fermer</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
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

  // Section Séances du Jour
  todaySectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.card,
  },
  todayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todaySectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  todaySubText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  reserverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2563EB',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: theme.radius.xs,
  },
  reserverBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyTodayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTodayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  emptyTodaySub: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyReserverAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.xs,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  emptyReserverActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  seancesScrollRow: {
    gap: 10,
    paddingVertical: 2,
  },
  seanceCardItem: {
    width: 240,
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.md,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 7,
  },
  seanceCardItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    ...theme.shadows.subtle,
  },
  seanceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seanceTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  seanceTimeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  seanceAppelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  seanceAppelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  seanceMatiereName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  seanceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  seanceMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  seanceMetaPillText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  seanceActiveRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  seanceActiveRibbonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Feedback Banners
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: theme.radius.sm,
    padding: 10,
    marginBottom: 14,
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
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.radius.sm,
    padding: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },

  // Feuille d'appel (Roster)
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rosterTitleGroup: {
    flex: 1,
    paddingRight: 8,
  },
  rosterTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.2,
  },
  statutSeancePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statutSeancePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  rosterCount: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  counterGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  counterPillPresent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  counterPillAbsent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  counterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  counterTextPresent: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.presentText,
  },
  counterTextAbsent: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.absentText,
  },
  ruleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.infoBoxBg,
    borderRadius: theme.radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  ruleNoticeText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.infoBoxText,
    lineHeight: 15,
  },
  rosterToolsRow: {
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  searchStudentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchStudentInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
  },
  quickBulkRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  quickBulkBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  quickBulkBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  studentItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    fontSize: 13,
    fontWeight: '800',
  },
  studentTexts: {
    flex: 1,
  },
  studentFullName: {
    fontSize: 13.5,
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
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  togglePresentStyle: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  toggleAbsentStyle: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  presenceToggleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Actions d'enregistrement
  actionButtonGroup: {
    gap: 10,
    marginBottom: 20,
  },
  primarySubmitButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.subtle,
  },
  primarySubmitButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cloturerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cloturerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  buttonInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },

  // Section Justificatifs
  justifSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 20,
    ...theme.shadows.card,
  },
  justifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  justifTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  justifSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.4,
  },
  justifSubTitle: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  justifCardItem: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 10,
  },
  justifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  justifEtudiantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  justifEtudiantName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  justifMatriculeText: {
    fontSize: 11,
    color: '#78350F',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  justifHourTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  justifHourText: {
    fontSize: 10.5,
    color: '#92400E',
    fontWeight: '600',
  },
  justifMotifText: {
    fontSize: 12,
    color: '#78350F',
    marginBottom: 4,
  },
  justifFileInfo: {
    fontSize: 11,
    color: '#92400E',
    fontStyle: 'italic',
  },
  justifDateInfo: {
    fontSize: 10.5,
    color: '#B45309',
    marginTop: 2,
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
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    paddingVertical: 8,
    borderRadius: theme.radius.xs,
  },
  acceptButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 8,
    borderRadius: theme.radius.xs,
  },
  rejectButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#991B1B',
  },

  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 18,
    width: '100%',
    maxWidth: 380,
    ...theme.shadows.card,
  },
  modalCardWide: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.xl,
    padding: 18,
    width: '100%',
    maxWidth: 440,
    ...theme.shadows.card,
  },
  reserverModalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubSmall: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  modalSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 16,
    marginBottom: 12,
  },
  formSectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  chipsScroll: {
    gap: 6,
    paddingVertical: 4,
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
    fontSize: 11.5,
    fontStyle: 'italic',
    color: theme.colors.textMuted,
    paddingVertical: 4,
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
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
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
  modalConfirmBookingButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radius.xs,
    backgroundColor: '#2563EB',
  },
  modalConfirmBookingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // --- US10 : Styles Historique ---
  historyTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: theme.radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  historyTriggerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  histFiltersBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.sm,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  histFilterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  histChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  histChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  histChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  histChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  histEmptyBox: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.md,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  histEmptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  histEmptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  histCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
    ...theme.shadows.subtle,
  },
  histCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  histCardDate: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  histTypeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  histTypeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  histTimeSlot: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  histMatiereNom: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 3,
  },
  histGroupeNom: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  histTauxContainer: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 60,
  },
  histTauxNum: {
    fontSize: 15,
    fontWeight: '900',
  },
  histTauxSub: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
  histProgressBarBg: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  histProgressBarFill: {
    height: 5,
    borderRadius: 3,
  },
  histCountersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  histBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  histBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  histToggleDetailsBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  histToggleDetailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  histDetailsList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  histDetailsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  histDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  histDetailName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  histDetailMatricule: {
    fontSize: 10,
    color: '#64748B',
  },
  histMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  histMiniBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
});
