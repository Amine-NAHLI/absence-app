import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DemandeInscription, UserSession } from '../types/auth';
import { AdminEnseignant, AdminEtudiant, Groupe, Matiere, Salle } from '../types/academic';
import { HeaderBar } from '../components/HeaderBar';
import {
  AdminStats,
  accepterDemandeInscription,
  createGroupe,
  createMatiere,
  createSalle,
  deleteEnseignant,
  deleteEtudiant,
  deleteGroupe,
  deleteMatiere,
  deleteSalle,
  getAdminStats,
  getAllEnseignants,
  getAllEtudiants,
  getDemandesInscription,
  getGroupes,
  getMatieres,
  getSalles,
  purgeComplete,
  refuserDemandeInscription,
} from '../services/adminService';
import { theme } from '../theme/theme';

interface AdminHomeScreenProps {
  session: UserSession;
  onLogout: () => void;
}

type AdminTab = 'DEMANDES' | 'ETUDIANTS' | 'ENSEIGNANTS' | 'GROUPES' | 'MATIERES' | 'SALLES';

export const AdminHomeScreen: React.FC<AdminHomeScreenProps> = ({
  session,
  onLogout,
}) => {
  const initial = session.prenom?.[0] || session.nom?.[0] || 'A';

  // Navigation onglets
  const [activeTab, setActiveTab] = useState<AdminTab>('DEMANDES');

  // Données
  const [demandes, setDemandes] = useState<DemandeInscription[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [etudiants, setEtudiants] = useState<AdminEtudiant[]>([]);
  const [enseignants, setEnseignants] = useState<AdminEnseignant[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Recherche
  const [searchEtudiant, setSearchEtudiant] = useState('');
  const [searchEnseignant, setSearchEnseignant] = useState('');

  // États d'exécution
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Formulaire Création Classe
  const [showAddGroupe, setShowAddGroupe] = useState(false);
  const [grpCode, setGrpCode] = useState('');
  const [grpNom, setGrpNom] = useState('');
  const [grpFiliere, setGrpFiliere] = useState('Génie Informatique');
  const [grpAnnee, setGrpAnnee] = useState('2026-2027');
  const [selectedMatiereIds, setSelectedMatiereIds] = useState<number[]>([]);

  // Formulaire Création Module
  const [showAddMatiere, setShowAddMatiere] = useState(false);
  const [matCode, setMatCode] = useState('');
  const [matNom, setMatNom] = useState('');
  const [matCoeff, setMatCoeff] = useState('4');
  const [matHeures, setMatHeures] = useState('45');

  // Formulaire Création Salle
  const [showAddSalle, setShowAddSalle] = useState(false);
  const [salCode, setSalCode] = useState('');
  const [salNom, setSalNom] = useState('');
  const [salCapacite, setSalCapacite] = useState('35');
  const [salType, setSalType] = useState('LABO');

  // Chargement global
  const loadAllData = async () => {
    try {
      const [fetchedDemandes, fetchedStats, fetchedGroupes, fetchedMatieres, fetchedSalles, fetchedEtudiants, fetchedEnseignants] =
        await Promise.all([
          getDemandesInscription(),
          getAdminStats(),
          getGroupes(),
          getMatieres(),
          getSalles(),
          getAllEtudiants(),
          getAllEnseignants(),
        ]);
      setDemandes(fetchedDemandes);
      setStats(fetchedStats);
      setGroupes(fetchedGroupes);
      setMatieres(fetchedMatieres);
      setSalles(fetchedSalles);
      setEtudiants(fetchedEtudiants);
      setEnseignants(fetchedEnseignants);
    } catch (error: any) {
      console.error('[AdminHomeScreen] Erreur chargement:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setFeedbackMessage(null);
    loadAllData();
  };

  // Suppression Étudiant
  const handleDeleteEtudiant = (id: number, nomComplet: string) => {
    Alert.alert('Confirmation', `Supprimer définitivement l'étudiant ${nomComplet} ainsi que son compte ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEtudiant(id);
            setFeedbackMessage(`Étudiant ${nomComplet} supprimé.`);
            loadAllData();
          } catch (err: any) {
            Alert.alert('Erreur', err.message || 'Suppression impossible.');
          }
        },
      },
    ]);
  };

  // Suppression Enseignant
  const handleDeleteEnseignant = (id: number, nomComplet: string) => {
    Alert.alert('Confirmation', `Supprimer définitivement l'enseignant ${nomComplet} ainsi que son compte ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEnseignant(id);
            setFeedbackMessage(`Enseignant ${nomComplet} supprimé.`);
            loadAllData();
          } catch (err: any) {
            Alert.alert('Erreur', err.message || 'Suppression impossible.');
          }
        },
      },
    ]);
  };

  const filteredEtudiants = etudiants.filter((e) => {
    const q = searchEtudiant.toLowerCase().trim();
    if (!q) return true;
    return (
      (e.nom && e.nom.toLowerCase().includes(q)) ||
      (e.prenom && e.prenom.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.matricule && e.matricule.toLowerCase().includes(q)) ||
      (e.cne && e.cne.toLowerCase().includes(q)) ||
      (e.groupeCode && e.groupeCode.toLowerCase().includes(q))
    );
  });

  const filteredEnseignants = enseignants.filter((p) => {
    const q = searchEnseignant.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.nom && p.nom.toLowerCase().includes(q)) ||
      (p.prenom && p.prenom.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.matricule && p.matricule.toLowerCase().includes(q)) ||
      (p.departement && p.departement.toLowerCase().includes(q)) ||
      (p.specialite && p.specialite.toLowerCase().includes(q))
    );
  });

  // Traitement Inscription : Accepter
  const handleAccepter = async (demande: DemandeInscription) => {
    setProcessingId(demande.userId);
    setFeedbackMessage(null);
    try {
      await accepterDemandeInscription(demande.userId);
      setFeedbackMessage(`Compte approuvé pour ${demande.prenom} ${demande.nom}.`);
      setDemandes((prev) => prev.filter((d) => d.userId !== demande.userId));
      loadAllData();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d\'activer ce compte.');
    } finally {
      setProcessingId(null);
    }
  };

  // Traitement Inscription : Refuser
  const handleRefuser = async (demande: DemandeInscription) => {
    Alert.alert(
      'Confirmation de refus',
      `Voulez-vous refuser et supprimer la demande de ${demande.prenom} ${demande.nom} ?`,
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
              setFeedbackMessage(`Demande de ${demande.prenom} ${demande.nom} supprimée.`);
              setDemandes((prev) => prev.filter((d) => d.userId !== demande.userId));
              loadAllData();
            } catch (err: any) {
              Alert.alert('Erreur', err.message || 'Impossible de refuser.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  // Création Salle
  const handleCreateSalle = async () => {
    if (!salCode.trim() || !salNom.trim()) {
      Alert.alert('Champs obligatoires', 'Veuillez saisir le code et le nom de la salle.');
      return;
    }
    const cap = parseInt(salCapacite.trim(), 10) || 30;
    try {
      await createSalle({
        code: salCode.trim(),
        nom: salNom.trim(),
        capacite: cap,
        type: salType,
      });
      setFeedbackMessage(`Salle ${salCode.toUpperCase()} créée avec succès.`);
      setSalCode('');
      setSalNom('');
      setShowAddSalle(false);
      loadAllData();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de créer la salle.');
    }
  };

  // Suppression Salle
  const handleDeleteSalle = async (id: number, code: string) => {
    Alert.alert('Confirmation', `Supprimer la salle ${code} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSalle(id);
            setFeedbackMessage(`Salle ${code} supprimée.`);
            loadAllData();
          } catch (err: any) {
            Alert.alert('Erreur', err.message || 'Suppression impossible.');
          }
        },
      },
    ]);
  };

  // Création Module
  const handleCreateMatiere = async () => {
    if (!matCode.trim() || !matNom.trim()) {
      Alert.alert('Champs obligatoires', 'Veuillez renseigner le code et l\'intitulé du module.');
      return;
    }
    const coeff = parseInt(matCoeff.trim(), 10) || 4;
    const heures = parseInt(matHeures.trim(), 10) || 45;
    try {
      await createMatiere({
        code: matCode.trim(),
        nom: matNom.trim(),
        coefficient: coeff,
        heuresTotal: heures,
      });
      setFeedbackMessage(`Module ${matCode.toUpperCase()} créé avec succès.`);
      setMatCode('');
      setMatNom('');
      setShowAddMatiere(false);
      loadAllData();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de créer le module.');
    }
  };

  // Suppression Module
  const handleDeleteMatiere = async (id: number, code: string) => {
    Alert.alert('Confirmation', `Supprimer le module ${code} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMatiere(id);
            setFeedbackMessage(`Module ${code} supprimé.`);
            loadAllData();
          } catch (err: any) {
            Alert.alert('Erreur', err.message || 'Suppression impossible.');
          }
        },
      },
    ]);
  };

  // Toggle sélection module pour classe
  const toggleMatiereSelection = (matId: number) => {
    setSelectedMatiereIds((prev) =>
      prev.includes(matId) ? prev.filter((id) => id !== matId) : [...prev, matId]
    );
  };

  // Création Classe avec association de modules
  const handleCreateGroupe = async () => {
    if (!grpCode.trim() || !grpNom.trim()) {
      Alert.alert('Champs obligatoires', 'Veuillez renseigner le code et le nom de la classe.');
      return;
    }
    try {
      await createGroupe({
        code: grpCode.trim(),
        nom: grpNom.trim(),
        filiere: grpFiliere.trim(),
        anneeScolaire: grpAnnee.trim(),
        matiereIds: selectedMatiereIds,
      });
      setFeedbackMessage(`Classe ${grpCode.toUpperCase()} créée avec ${selectedMatiereIds.length} module(s) associé(s).`);
      setGrpCode('');
      setGrpNom('');
      setSelectedMatiereIds([]);
      setShowAddGroupe(false);
      loadAllData();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de créer la classe.');
    }
  };

  // Suppression Classe
  const handleDeleteGroupe = async (id: number, code: string) => {
    Alert.alert('Confirmation', `Supprimer la classe ${code} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGroupe(id);
            setFeedbackMessage(`Classe ${code} supprimée.`);
            loadAllData();
          } catch (err: any) {
            Alert.alert('Erreur', err.message || 'Suppression impossible.');
          }
        },
      },
    ]);
  };

  // Purge complète
  const handlePurgeAll = () => {
    Alert.alert(
      'Remise à zéro complète',
      'Attention : cette action supprimera toutes les classes, modules, salles, étudiants et enseignants. Seul le compte administrateur (.env) sera conservé. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Purger toute la base',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await purgeComplete();
              setFeedbackMessage('Base de données 100% remise à zéro.');
              loadAllData();
            } catch (err: any) {
              Alert.alert('Erreur', err.message || 'Échec de la purge.');
            } finally {
              setLoading(false);
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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primaryDark]} />
          }
        >
          
          {/* Titre & Sous-titre */}
          <View style={styles.sectionHeading}>
            <Text style={styles.adminTitle}>Supervision Pédagogique Globale</Text>
            <Text style={styles.adminSubtitle}>
              Gestion intégrale des promotions, modules, salles et inscriptions
            </Text>
          </View>

          {/* Feedback Message */}
          {feedbackMessage && (
            <View style={styles.actionFeedbackBox}>
              <Feather name="check-circle" size={15} color="#059669" />
              <Text style={styles.actionFeedbackText}>{feedbackMessage}</Text>
            </View>
          )}

          {/* KPI Synthétiques en Grille */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiSmallCard}>
              <Text style={styles.kpiSmallLabel}>ÉTUDIANTS</Text>
              <Text style={styles.kpiSmallValue}>{etudiants.length}</Text>
            </View>
            <View style={styles.kpiSmallCard}>
              <Text style={styles.kpiSmallLabel}>PROFESSEURS</Text>
              <Text style={styles.kpiSmallValue}>{enseignants.length}</Text>
            </View>
            <View style={styles.kpiSmallCard}>
              <Text style={styles.kpiSmallLabel}>CLASSES</Text>
              <Text style={styles.kpiSmallValue}>{groupes.length}</Text>
            </View>
            <View style={styles.kpiSmallCard}>
              <Text style={styles.kpiSmallLabel}>MODULES</Text>
              <Text style={styles.kpiSmallValue}>{matieres.length}</Text>
            </View>
            <View style={[styles.kpiSmallCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Text style={[styles.kpiSmallLabel, { color: '#1D4ED8' }]}>EN ATTENTE</Text>
              <Text style={[styles.kpiSmallValue, { color: '#1D4ED8' }]}>{demandes.length}</Text>
            </View>
          </View>

          {/* Barre d'Onglets d'Administration avec défilement horizontal fluide */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.adminTabBarScroll}
            style={styles.adminTabBarWrapper}
          >
            <TouchableOpacity
              style={[styles.adminTabBtn, activeTab === 'DEMANDES' && styles.adminTabBtnActive]}
              onPress={() => setActiveTab('DEMANDES')}
              activeOpacity={0.8}
            >
              <Feather name="clock" size={12} color={activeTab === 'DEMANDES' ? '#1E293B' : '#64748B'} />
              <Text style={[styles.adminTabBtnText, activeTab === 'DEMANDES' && styles.adminTabBtnTextActive]}>
                Inscriptions {demandes.length > 0 ? `(${demandes.length})` : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminTabBtn, activeTab === 'ETUDIANTS' && styles.adminTabBtnActive]}
              onPress={() => setActiveTab('ETUDIANTS')}
              activeOpacity={0.8}
            >
              <Feather name="users" size={12} color={activeTab === 'ETUDIANTS' ? '#1E293B' : '#64748B'} />
              <Text style={[styles.adminTabBtnText, activeTab === 'ETUDIANTS' && styles.adminTabBtnTextActive]}>
                Étudiants ({etudiants.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminTabBtn, activeTab === 'ENSEIGNANTS' && styles.adminTabBtnActive]}
              onPress={() => setActiveTab('ENSEIGNANTS')}
              activeOpacity={0.8}
            >
              <Feather name="briefcase" size={12} color={activeTab === 'ENSEIGNANTS' ? '#1E293B' : '#64748B'} />
              <Text style={[styles.adminTabBtnText, activeTab === 'ENSEIGNANTS' && styles.adminTabBtnTextActive]}>
                Professeurs ({enseignants.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminTabBtn, activeTab === 'GROUPES' && styles.adminTabBtnActive]}
              onPress={() => setActiveTab('GROUPES')}
              activeOpacity={0.8}
            >
              <Feather name="layers" size={12} color={activeTab === 'GROUPES' ? '#1E293B' : '#64748B'} />
              <Text style={[styles.adminTabBtnText, activeTab === 'GROUPES' && styles.adminTabBtnTextActive]}>
                Classes ({groupes.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminTabBtn, activeTab === 'MATIERES' && styles.adminTabBtnActive]}
              onPress={() => setActiveTab('MATIERES')}
              activeOpacity={0.8}
            >
              <Feather name="book" size={12} color={activeTab === 'MATIERES' ? '#1E293B' : '#64748B'} />
              <Text style={[styles.adminTabBtnText, activeTab === 'MATIERES' && styles.adminTabBtnTextActive]}>
                Modules ({matieres.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminTabBtn, activeTab === 'SALLES' && styles.adminTabBtnActive]}
              onPress={() => setActiveTab('SALLES')}
              activeOpacity={0.8}
            >
              <Feather name="home" size={12} color={activeTab === 'SALLES' ? '#1E293B' : '#64748B'} />
              <Text style={[styles.adminTabBtnText, activeTab === 'SALLES' && styles.adminTabBtnTextActive]}>
                Salles ({salles.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* =========================================================================
              ONGLET 1 : DEMANDES D'INSCRIPTION EN ATTENTE
             ========================================================================= */}
          {activeTab === 'DEMANDES' && (
            <View>
              <View style={styles.tabSectionHeader}>
                <Text style={styles.tabSectionTitle}>DEMANDES D'INSCRIPTION EN ATTENTE</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
                  <Feather name="rotate-cw" size={13} color="#64748B" />
                  <Text style={styles.refreshBtnText}>Actualiser</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primaryDark} style={{ marginVertical: 20 }} />
              ) : demandes.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Feather name="check-circle" size={24} color="#059669" />
                  <Text style={styles.emptyCardTitle}>Aucune demande en attente</Text>
                  <Text style={styles.emptyCardSub}>Tous les comptes ont été arbitrés.</Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {demandes.map((item) => {
                    const isEtu = item.role === 'ETUDIANT';
                    const isBusy = processingId === item.userId;

                    return (
                      <View key={item.userId} style={styles.requestCard}>
                        <View style={styles.cardHeaderRow}>
                          <View style={[styles.roleBadge, isEtu ? styles.roleBadgeEtu : styles.roleBadgeProf]}>
                            <Feather name={isEtu ? 'user' : 'book-open'} size={11} color={isEtu ? '#1D4ED8' : '#047857'} />
                            <Text style={[styles.roleBadgeText, isEtu ? { color: '#1D4ED8' } : { color: '#047857' }]}>
                              {isEtu ? 'ÉTUDIANT' : 'ENSEIGNANT'}
                            </Text>
                          </View>
                          <Text style={styles.pendingBadge}>En attente</Text>
                        </View>

                        <Text style={styles.cardMainTitle}>{item.nom} {item.prenom}</Text>
                        <Text style={styles.cardSubText}>{item.email} {item.telephone ? `• ${item.telephone}` : ''}</Text>

                        <View style={styles.detailsBox}>
                          {isEtu ? (
                            <Text style={styles.detailsBoxText}>
                              Classe : <Text style={{ fontWeight: '700' }}>{item.groupeCode || 'Non affecté'}</Text> • Matricule : {item.matricule || 'N/A'} • CNE : {item.cne || 'N/A'}
                            </Text>
                          ) : (
                            <Text style={styles.detailsBoxText}>
                              Dép : <Text style={{ fontWeight: '700' }}>{item.departement || 'Génie Informatique'}</Text> • Module : {item.specialite || 'N/A'}
                            </Text>
                          )}
                        </View>

                        <View style={styles.cardActionRow}>
                          <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={() => handleRefuser(item)}
                            disabled={isBusy}
                          >
                            <Feather name="trash-2" size={13} color="#DC2626" />
                            <Text style={styles.rejectButtonText}>Refuser</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => handleAccepter(item)}
                            disabled={isBusy}
                          >
                            {isBusy ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <Feather name="check" size={14} color="#FFFFFF" />
                                <Text style={styles.acceptButtonText}>Valider l'inscription</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* =========================================================================
              ONGLET : LISTE DES ÉTUDIANTS
             ========================================================================= */}
          {activeTab === 'ETUDIANTS' && (
            <View>
              <View style={styles.tabSectionHeader}>
                <Text style={styles.tabSectionTitle}>
                  ÉTUDIANTS INSCRITS ({filteredEtudiants.length} / {etudiants.length})
                </Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
                  <Feather name="rotate-cw" size={13} color="#64748B" />
                  <Text style={styles.refreshBtnText}>Actualiser</Text>
                </TouchableOpacity>
              </View>

              {/* Barre de Recherche Étudiant */}
              <View style={styles.searchContainer}>
                <Feather name="search" size={14} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher par nom, matricule, classe, CNE..."
                  placeholderTextColor="#94A3B8"
                  value={searchEtudiant}
                  onChangeText={setSearchEtudiant}
                />
                {searchEtudiant.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchEtudiant('')}>
                    <Feather name="x" size={14} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>

              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primaryDark} style={{ marginVertical: 20 }} />
              ) : filteredEtudiants.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Feather name="users" size={26} color="#94A3B8" />
                  <Text style={styles.emptyCardTitle}>
                    {searchEtudiant ? 'Aucun résultat trouvé' : 'Aucun étudiant inscrit'}
                  </Text>
                  <Text style={styles.emptyCardSub}>
                    {searchEtudiant
                      ? 'Essayez avec un autre terme de recherche.'
                      : 'Les étudiants validés par l\'administrateur apparaîtront ici.'}
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {filteredEtudiants.map((etu) => {
                    const initials = `${etu.prenom?.[0] || ''}${etu.nom?.[0] || ''}`.toUpperCase() || 'E';
                    return (
                      <View key={etu.id} style={styles.userCard}>
                        <View style={styles.userCardHeader}>
                          <View style={styles.userAvatarCircle}>
                            <Text style={styles.userAvatarText}>{initials}</Text>
                          </View>

                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <Text style={styles.userName}>{etu.nom} {etu.prenom}</Text>
                              {etu.groupeCode ? (
                                <View style={styles.userClassBadge}>
                                  <Text style={styles.userClassBadgeText}>{etu.groupeCode}</Text>
                                </View>
                              ) : (
                                <View style={[styles.userClassBadge, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                                  <Text style={[styles.userClassBadgeText, { color: '#64748B' }]}>Sans classe</Text>
                                </View>
                              )}
                            </View>

                            <Text style={styles.userEmailText}>{etu.email}</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.deleteUserBtn}
                            onPress={() => handleDeleteEtudiant(etu.id, `${etu.prenom} ${etu.nom}`)}
                          >
                            <Feather name="trash-2" size={14} color="#DC2626" />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.userCardFooter}>
                          <View style={styles.userInfoChip}>
                            <Feather name="hash" size={11} color="#64748B" />
                            <Text style={styles.userInfoChipText}>{etu.matricule || 'N/A'}</Text>
                          </View>

                          {etu.cne ? (
                            <View style={styles.userInfoChip}>
                              <Feather name="credit-card" size={11} color="#64748B" />
                              <Text style={styles.userInfoChipText}>{etu.cne}</Text>
                            </View>
                          ) : null}

                          {etu.telephone ? (
                            <View style={styles.userInfoChip}>
                              <Feather name="phone" size={11} color="#64748B" />
                              <Text style={styles.userInfoChipText}>{etu.telephone}</Text>
                            </View>
                          ) : null}

                          <View style={[styles.userInfoChip, { backgroundColor: etu.actif ? '#ECFDF5' : '#FEF2F2', borderColor: etu.actif ? '#A7F3D0' : '#FECACA', marginLeft: 'auto' }]}>
                            <View style={[styles.statusDot, { backgroundColor: etu.actif ? '#10B981' : '#EF4444' }]} />
                            <Text style={[styles.userInfoChipText, { color: etu.actif ? '#047857' : '#B91C1C', fontWeight: '700' }]}>
                              {etu.actif ? 'Actif' : 'En attente'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* =========================================================================
              ONGLET : LISTE DES PROFESSEURS / ENSEIGNANTS
             ========================================================================= */}
          {activeTab === 'ENSEIGNANTS' && (
            <View>
              <View style={styles.tabSectionHeader}>
                <Text style={styles.tabSectionTitle}>
                  CORPS ENSEIGNANT ({filteredEnseignants.length} / {enseignants.length})
                </Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
                  <Feather name="rotate-cw" size={13} color="#64748B" />
                  <Text style={styles.refreshBtnText}>Actualiser</Text>
                </TouchableOpacity>
              </View>

              {/* Barre de Recherche Professeur */}
              <View style={styles.searchContainer}>
                <Feather name="search" size={14} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher par nom, département, spécialité..."
                  placeholderTextColor="#94A3B8"
                  value={searchEnseignant}
                  onChangeText={setSearchEnseignant}
                />
                {searchEnseignant.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchEnseignant('')}>
                    <Feather name="x" size={14} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>

              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primaryDark} style={{ marginVertical: 20 }} />
              ) : filteredEnseignants.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Feather name="award" size={26} color="#94A3B8" />
                  <Text style={styles.emptyCardTitle}>
                    {searchEnseignant ? 'Aucun résultat trouvé' : 'Aucun enseignant inscrit'}
                  </Text>
                  <Text style={styles.emptyCardSub}>
                    {searchEnseignant
                      ? 'Essayez avec un autre nom ou département.'
                      : 'Les professeurs validés par l\'administrateur apparaîtront ici.'}
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {filteredEnseignants.map((prof) => {
                    const initials = `${prof.prenom?.[0] || ''}${prof.nom?.[0] || ''}`.toUpperCase() || 'P';
                    return (
                      <View key={prof.id} style={styles.userCard}>
                        <View style={styles.userCardHeader}>
                          <View style={[styles.userAvatarCircle, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                            <Text style={[styles.userAvatarText, { color: '#166534' }]}>{initials}</Text>
                          </View>

                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <Text style={styles.userName}>{prof.nom} {prof.prenom}</Text>
                              <View style={[styles.userClassBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                                <Text style={[styles.userClassBadgeText, { color: '#047857' }]}>
                                  {prof.departement || 'Génie Informatique'}
                                </Text>
                              </View>
                            </View>

                            <Text style={styles.userEmailText}>{prof.email}</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.deleteUserBtn}
                            onPress={() => handleDeleteEnseignant(prof.id, `${prof.prenom} ${prof.nom}`)}
                          >
                            <Feather name="trash-2" size={14} color="#DC2626" />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.userCardFooter}>
                          <View style={styles.userInfoChip}>
                            <Feather name="hash" size={11} color="#64748B" />
                            <Text style={styles.userInfoChipText}>{prof.matricule || 'N/A'}</Text>
                          </View>

                          {prof.specialite ? (
                            <View style={styles.userInfoChip}>
                              <Feather name="book-open" size={11} color="#64748B" />
                              <Text style={styles.userInfoChipText}>{prof.specialite}</Text>
                            </View>
                          ) : null}

                          {prof.telephone ? (
                            <View style={styles.userInfoChip}>
                              <Feather name="phone" size={11} color="#64748B" />
                              <Text style={styles.userInfoChipText}>{prof.telephone}</Text>
                            </View>
                          ) : null}

                          <View style={[styles.userInfoChip, { backgroundColor: prof.actif ? '#ECFDF5' : '#FEF2F2', borderColor: prof.actif ? '#A7F3D0' : '#FECACA', marginLeft: 'auto' }]}>
                            <View style={[styles.statusDot, { backgroundColor: prof.actif ? '#10B981' : '#EF4444' }]} />
                            <Text style={[styles.userInfoChipText, { color: prof.actif ? '#047857' : '#B91C1C', fontWeight: '700' }]}>
                              {prof.actif ? 'Actif' : 'En attente'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* =========================================================================
              ONGLET 2 : GESTION DES CLASSES & ASSOCIATION DES MODULES
             ========================================================================= */}
          {activeTab === 'GROUPES' && (
            <View>
              <View style={styles.tabSectionHeader}>
                <Text style={styles.tabSectionTitle}>CLASSES & PROMOTIONS ({groupes.length})</Text>
                <TouchableOpacity
                  style={styles.addToggleBtn}
                  onPress={() => setShowAddGroupe(!showAddGroupe)}
                >
                  <Feather name={showAddGroupe ? 'x' : 'plus'} size={14} color="#FFFFFF" />
                  <Text style={styles.addToggleBtnText}>{showAddGroupe ? 'Fermer' : 'Nouvelle classe'}</Text>
                </TouchableOpacity>
              </View>

              {/* Formulaire Création Classe */}
              {showAddGroupe && (
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>Créer une Classe / Promotion</Text>

                  <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Code Classe *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="Ex: GI4-A"
                        value={grpCode}
                        onChangeText={setGrpCode}
                        autoCapitalize="characters"
                      />
                    </View>
                    <View style={{ flex: 1.5 }}>
                      <Text style={styles.formLabel}>Nom descriptif *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="Ex: GI 4ème Année - Grp A"
                        value={grpNom}
                        onChangeText={setGrpNom}
                      />
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Filière</Text>
                      <TextInput
                        style={styles.formInput}
                        value={grpFiliere}
                        onChangeText={setGrpFiliere}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Année Scolaire</Text>
                      <TextInput
                        style={styles.formInput}
                        value={grpAnnee}
                        onChangeText={setGrpAnnee}
                      />
                    </View>
                  </View>

                  {/* Association des Modules */}
                  <Text style={[styles.formLabel, { marginTop: 8 }]}>
                    Associer les Modules enseignés à cette classe ({selectedMatiereIds.length} sélectionné(s)) :
                  </Text>
                  {matieres.length === 0 ? (
                    <Text style={styles.formHelpText}>
                      Aucun module créé. Créez d'abord des modules dans l'onglet « Modules » pour les associer.
                    </Text>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginVertical: 6 }}>
                      {matieres.map((m) => {
                        const isSelected = selectedMatiereIds.includes(m.id);
                        return (
                          <TouchableOpacity
                            key={m.id}
                            style={[styles.matierePickChip, isSelected && styles.matierePickChipActive]}
                            onPress={() => toggleMatiereSelection(m.id)}
                            activeOpacity={0.8}
                          >
                            <Feather name={isSelected ? 'check-square' : 'square'} size={13} color={isSelected ? '#1D4ED8' : '#64748B'} />
                            <Text style={[styles.matierePickChipText, isSelected && { color: '#1D4ED8', fontWeight: '700' }]}>
                              {m.code}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}

                  <TouchableOpacity style={styles.submitFormBtn} onPress={handleCreateGroupe}>
                    <Text style={styles.submitFormBtnText}>Enregistrer la classe</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Liste des Classes existantes */}
              {groupes.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Feather name="layers" size={24} color="#64748B" />
                  <Text style={styles.emptyCardTitle}>Aucune classe configurée</Text>
                  <Text style={styles.emptyCardSub}>
                    Créez votre première promotion ci-dessus pour ouvrir les inscriptions aux étudiants.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {groupes.map((grp) => (
                    <View key={grp.id} style={styles.itemCard}>
                      <View style={styles.itemCardHeader}>
                        <View style={styles.itemTag}>
                          <Text style={styles.itemTagText}>{grp.code}</Text>
                        </View>
                        <Text style={styles.itemTitle}>{grp.nom}</Text>
                        <TouchableOpacity onPress={() => handleDeleteGroupe(grp.id, grp.code)} style={styles.deleteIconBtn}>
                          <Feather name="trash-2" size={14} color="#DC2626" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.itemMeta}>
                        Filière : {grp.filiere || 'Génie Informatique'} • Effectif : {grp.effectif ?? 0} étudiant(s)
                      </Text>

                      {/* Modules rattachés à la classe */}
                      <View style={styles.associatedModulesBox}>
                        <Text style={styles.associatedModulesLabel}>Modules affectés :</Text>
                        {grp.matieres && grp.matieres.length > 0 ? (
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                            {grp.matieres.map((m) => (
                              <View key={m.id} style={styles.moduleMiniTag}>
                                <Text style={styles.moduleMiniTagText}>{m.code} ({m.nom})</Text>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text style={styles.noModulesAssignedText}>Aucun module associé</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* =========================================================================
              ONGLET 3 : GESTION DES MODULES / MATIÈRES
             ========================================================================= */}
          {activeTab === 'MATIERES' && (
            <View>
              <View style={styles.tabSectionHeader}>
                <Text style={styles.tabSectionTitle}>CATALOGUE DES MODULES ({matieres.length})</Text>
                <TouchableOpacity
                  style={styles.addToggleBtn}
                  onPress={() => setShowAddMatiere(!showAddMatiere)}
                >
                  <Feather name={showAddMatiere ? 'x' : 'plus'} size={14} color="#FFFFFF" />
                  <Text style={styles.addToggleBtnText}>{showAddMatiere ? 'Fermer' : 'Nouveau module'}</Text>
                </TouchableOpacity>
              </View>

              {/* Formulaire Création Module */}
              {showAddMatiere && (
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>Créer un Module Pédagogique</Text>

                  <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Code Module *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="Ex: GL401"
                        value={matCode}
                        onChangeText={setMatCode}
                        autoCapitalize="characters"
                      />
                    </View>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.formLabel}>Intitulé du module *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="Ex: Génie Logiciel & Design Patterns"
                        value={matNom}
                        onChangeText={setMatNom}
                      />
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Coefficient</Text>
                      <TextInput
                        style={styles.formInput}
                        value={matCoeff}
                        onChangeText={setMatCoeff}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Volume Horaire (heures)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={matHeures}
                        onChangeText={setMatHeures}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <TouchableOpacity style={styles.submitFormBtn} onPress={handleCreateMatiere}>
                    <Text style={styles.submitFormBtnText}>Enregistrer le module</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Liste des Modules existants */}
              {matieres.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Feather name="book" size={24} color="#64748B" />
                  <Text style={styles.emptyCardTitle}>Aucun module configuré</Text>
                  <Text style={styles.emptyCardSub}>
                    Créez vos modules pour permettre aux enseignants de s'inscrire et les associer aux classes.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {matieres.map((mat) => (
                    <View key={mat.id} style={styles.itemCard}>
                      <View style={styles.itemCardHeader}>
                        <View style={[styles.itemTag, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                          <Text style={[styles.itemTagText, { color: '#047857' }]}>{mat.code}</Text>
                        </View>
                        <Text style={styles.itemTitle}>{mat.nom}</Text>
                        <TouchableOpacity onPress={() => handleDeleteMatiere(mat.id, mat.code)} style={styles.deleteIconBtn}>
                          <Feather name="trash-2" size={14} color="#DC2626" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.itemMeta}>
                        Coefficient : {mat.coefficient} • Volume : {mat.heuresTotal ?? 45} heures totales
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* =========================================================================
              ONGLET 4 : GESTION DES SALLES DE COURS
             ========================================================================= */}
          {activeTab === 'SALLES' && (
            <View>
              <View style={styles.tabSectionHeader}>
                <Text style={styles.tabSectionTitle}>INFRASTRUCTURE DES SALLES ({salles.length})</Text>
                <TouchableOpacity
                  style={styles.addToggleBtn}
                  onPress={() => setShowAddSalle(!showAddSalle)}
                >
                  <Feather name={showAddSalle ? 'x' : 'plus'} size={14} color="#FFFFFF" />
                  <Text style={styles.addToggleBtnText}>{showAddSalle ? 'Fermer' : 'Nouvelle salle'}</Text>
                </TouchableOpacity>
              </View>

              {/* Formulaire Création Salle */}
              {showAddSalle && (
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>Créer une Salle de Classe / TP</Text>

                  <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Code Salle *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="Ex: LABO-03"
                        value={salCode}
                        onChangeText={setSalCode}
                        autoCapitalize="characters"
                      />
                    </View>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.formLabel}>Nom descriptif *</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="Ex: Laboratoire Systèmes & IA"
                        value={salNom}
                        onChangeText={setSalNom}
                      />
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Capacité (places)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={salCapacite}
                        onChangeText={setSalCapacite}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1.5 }}>
                      <Text style={styles.formLabel}>Type d'espace</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        {['LABO', 'COURS', 'AMPHI'].map((t) => (
                          <TouchableOpacity
                            key={t}
                            style={[styles.typeChip, salType === t && styles.typeChipActive]}
                            onPress={() => setSalType(t)}
                          >
                            <Text style={[styles.typeChipText, salType === t && styles.typeChipTextActive]}>{t}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.submitFormBtn} onPress={handleCreateSalle}>
                    <Text style={styles.submitFormBtnText}>Enregistrer la salle</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Liste des Salles existantes */}
              {salles.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Feather name="home" size={24} color="#64748B" />
                  <Text style={styles.emptyCardTitle}>Aucune salle configurée</Text>
                  <Text style={styles.emptyCardSub}>
                    Créez vos salles de cours, laboratoires et amphithéâtres pour la planification des séances.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {salles.map((sal) => (
                    <View key={sal.id} style={styles.itemCard}>
                      <View style={styles.itemCardHeader}>
                        <View style={[styles.itemTag, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                          <Text style={[styles.itemTagText, { color: '#334155' }]}>{sal.code}</Text>
                        </View>
                        <Text style={styles.itemTitle}>{sal.nom}</Text>
                        <TouchableOpacity onPress={() => handleDeleteSalle(sal.id, sal.code)} style={styles.deleteIconBtn}>
                          <Feather name="trash-2" size={14} color="#DC2626" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.itemMeta}>
                        Capacité : {sal.capacite} places • Type : {sal.type}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* =========================================================================
              ACTIONS SYSTÈME : REMISE À ZÉRO & DÉCONNEXION
             ========================================================================= */}
          <View style={styles.systemActionsSection}>
            <TouchableOpacity
              style={styles.purgeButton}
              onPress={handlePurgeAll}
              activeOpacity={0.75}
            >
              <Feather name="alert-octagon" size={14} color="#B91C1C" />
              <Text style={styles.purgeButtonText}>Purger toute la base (Remise à zéro)</Text>
            </TouchableOpacity>

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
      </KeyboardAvoidingView>
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
    paddingVertical: 9,
    marginBottom: 12,
  },
  actionFeedbackText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiSmallCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    ...theme.shadows.subtle,
  },
  kpiSmallLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  kpiSmallValue: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.textMain,
    marginTop: 2,
  },
  adminTabBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: theme.radius.sm,
    padding: 3,
    marginBottom: 14,
    gap: 3,
  },
  adminTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 6,
  },
  adminTabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...theme.shadows.subtle,
  },
  adminTabBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  adminTabBtnTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  tabSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tabSectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshBtnText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  addToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.xs,
  },
  addToggleBtnText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 6,
    marginBottom: 14,
  },
  emptyCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  emptyCardSub: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
  },
  roleBadgeEtu: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  roleBadgeProf: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  pendingBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  cardMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  cardSubText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: theme.radius.xs,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsBoxText: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.xs,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: theme.radius.xs,
    backgroundColor: '#059669',
  },
  acceptButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 14,
    ...theme.shadows.card,
  },
  formTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: theme.colors.textMain,
    marginBottom: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: theme.radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: theme.colors.textMain,
  },
  formHelpText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginVertical: 4,
  },
  matierePickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.xs,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  matierePickChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  matierePickChipText: {
    fontSize: 11.5,
    color: '#475569',
  },
  typeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: theme.radius.xs,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  typeChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  typeChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  submitFormBtn: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.xs,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  submitFormBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  itemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  itemTag: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  itemTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  itemTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  deleteIconBtn: {
    padding: 4,
  },
  itemMeta: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  associatedModulesBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  associatedModulesLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  moduleMiniTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moduleMiniTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
  },
  noModulesAssignedText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  systemActionsSection: {
    marginTop: 18,
    gap: 10,
  },
  purgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.radius.sm,
    paddingVertical: 11,
  },
  purgeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
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
  adminTabBarWrapper: {
    marginBottom: 14,
  },
  adminTabBarScroll: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: theme.radius.sm,
    padding: 3,
    gap: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 12,
    ...theme.shadows.subtle,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: theme.colors.textMain,
    padding: 0,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  userAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  userClassBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  userClassBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  userEmailText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  deleteUserBtn: {
    padding: 6,
    borderRadius: 4,
  },
  userCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 2,
  },
  userInfoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  userInfoChipText: {
    fontSize: 10.5,
    color: '#475569',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
