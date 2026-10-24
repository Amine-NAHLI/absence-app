import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { loginUser, registerUser } from '../services/authService';
import { getPublicGroupes, getPublicMatieres } from '../services/adminService';
import { RegisterPayload, UserSession } from '../types/auth';
import { Groupe, Matiere } from '../types/academic';
import { theme } from '../theme/theme';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER';
type UserRoleSelection = 'ETUDIANT' | 'ENSEIGNANT';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  // Mode d'authentification
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');

  // Données académiques réelles (chargées dynamiquement depuis la base)
  const [availableGroupes, setAvailableGroupes] = useState<Groupe[]>([]);
  const [availableMatieres, setAvailableMatieres] = useState<Matiere[]>([]);
  const [loadingAcademic, setLoadingAcademic] = useState(false);

  // Champs de Connexion
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Champs d'Inscription
  const [selectedRole, setSelectedRole] = useState<UserRoleSelection>('ETUDIANT');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [telephone, setTelephone] = useState('');
  
  // Champs Étudiant
  const [groupeCode, setGroupeCode] = useState('');
  const [matriculeEtu, setMatriculeEtu] = useState('');
  const [cne, setCne] = useState('');

  // Champs Enseignant
  const [matriculeProf, setMatriculeProf] = useState('');
  const [departement, setDepartement] = useState('Génie Informatique');
  const [specialite, setSpecialite] = useState('');

  // États d'exécution et messages
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Chargement des classes et modules réels pour l'inscription
  const loadAcademicData = async () => {
    setLoadingAcademic(true);
    try {
      const [groupes, matieres] = await Promise.all([
        getPublicGroupes(),
        getPublicMatieres(),
      ]);
      setAvailableGroupes(groupes);
      setAvailableMatieres(matieres);

      if (groupes.length > 0 && !groupeCode) {
        setGroupeCode(groupes[0].code);
      }
      if (matieres.length > 0 && !specialite) {
        setSpecialite(matieres[0].nom);
      }
    } catch (err) {
      console.error('[LoginScreen] Erreur chargement academic data:', err);
    } finally {
      setLoadingAcademic(false);
    }
  };

  useEffect(() => {
    loadAcademicData();
  }, []);

  // Gestion de la Connexion
  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    try {
      const session = await loginUser(cleanEmail, cleanPass);
      onLoginSuccess(session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Identifiants invalides ou erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'Inscription
  const handleRegister = async () => {
    // Vérification garde-fous
    if (selectedRole === 'ETUDIANT' && availableGroupes.length === 0) {
      setErrorMessage("Impossible de s'inscrire : Aucune classe n'a été créée par l'administration.");
      return;
    }

    if (selectedRole === 'ENSEIGNANT' && availableMatieres.length === 0) {
      setErrorMessage("Impossible de s'inscrire : Aucun module d'enseignement n'a été créé par l'administration.");
      return;
    }

    if (!nom.trim() || !prenom.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires (Nom, Prénom, Email, Mot de passe).');
      return;
    }

    if (registerPassword.trim().length < 4) {
      setErrorMessage('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: RegisterPayload = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: registerEmail.trim().toLowerCase(),
      motDePasse: registerPassword.trim(),
      telephone: telephone.trim() || undefined,
      role: selectedRole,
      matricule: selectedRole === 'ETUDIANT' 
        ? (matriculeEtu.trim() || undefined)
        : (matriculeProf.trim() || undefined),
      cne: selectedRole === 'ETUDIANT' ? (cne.trim() || undefined) : undefined,
      groupeCode: selectedRole === 'ETUDIANT' ? (groupeCode || (availableGroupes[0]?.code ?? undefined)) : undefined,
      departement: selectedRole === 'ENSEIGNANT' ? departement.trim() : undefined,
      specialite: selectedRole === 'ENSEIGNANT' ? (specialite.trim() || (availableMatieres[0]?.nom ?? undefined)) : undefined,
    };

    try {
      const res = await registerUser(payload);
      setSuccessMessage(
        res.message || 'Demande d\'inscription transmise avec succès à l\'administrateur pour approbation.'
      );
      setLoginEmail(registerEmail.trim().toLowerCase());
      setNom('');
      setPrenom('');
      setRegisterEmail('');
      setRegisterPassword('');
      setTelephone('');
      setMatriculeEtu('');
      setCne('');
      setMatriculeProf('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Échec lors de l\'enregistrement de votre demande.');
    } finally {
      setLoading(false);
    }
  };

  const isPendingWarning = errorMessage && (
    errorMessage.toLowerCase().includes('attente') || 
    errorMessage.toLowerCase().includes('approbation') ||
    errorMessage.toLowerCase().includes('valide')
  );

  const canStudentRegister = availableGroupes.length > 0;
  const canTeacherRegister = availableMatieres.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header institutionnel Apple FinTech */}
          <View style={styles.header}>
            <View style={styles.brandBadge}>
              <View style={styles.brandBadgeDot} />
              <Text style={styles.brandBadgeText}>UNIVERSITÉ PRIVÉE DE FÈS</Text>
            </View>
            <Text style={styles.screenTitle}>Portail d'Assiduité</Text>
            <Text style={styles.screenSubtitle}>
              Système de gestion des présences & validation académique
            </Text>
          </View>

          {/* Sélecteur d'Onglets Connexion / Inscription */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, authMode === 'LOGIN' && styles.tabButtonActive]}
              onPress={() => {
                setAuthMode('LOGIN');
                setErrorMessage(null);
              }}
              activeOpacity={0.8}
            >
              <Feather 
                name="log-in" 
                size={14} 
                color={authMode === 'LOGIN' ? theme.colors.primaryDark : theme.colors.textMuted} 
              />
              <Text style={[styles.tabText, authMode === 'LOGIN' && styles.tabTextActive]}>
                Se connecter
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, authMode === 'REGISTER' && styles.tabButtonActive]}
              onPress={() => {
                setAuthMode('REGISTER');
                setErrorMessage(null);
                setSuccessMessage(null);
                loadAcademicData();
              }}
              activeOpacity={0.8}
            >
              <Feather 
                name="user-plus" 
                size={14} 
                color={authMode === 'REGISTER' ? theme.colors.primaryDark : theme.colors.textMuted} 
              />
              <Text style={[styles.tabText, authMode === 'REGISTER' && styles.tabTextActive]}>
                Créer un compte
              </Text>
            </TouchableOpacity>
          </View>

          {/* Messages d'alerte et de succès */}
          {errorMessage && (
            <View style={[styles.messageBox, isPendingWarning ? styles.warningBox : styles.errorBox]}>
              <Feather 
                name={isPendingWarning ? 'clock' : 'alert-circle'} 
                size={16} 
                color={isPendingWarning ? '#D97706' : theme.colors.absentText} 
              />
              <Text style={[styles.messageText, isPendingWarning ? styles.warningText : styles.errorText]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {successMessage && (
            <View style={[styles.messageBox, styles.successBox]}>
              <Feather name="check-circle" size={16} color="#059669" />
              <View style={styles.successTextContainer}>
                <Text style={styles.successTitle}>Demande transmise avec succès !</Text>
                <Text style={styles.successSub}>{successMessage}</Text>
                <TouchableOpacity
                  style={styles.switchLoginBtn}
                  onPress={() => {
                    setAuthMode('LOGIN');
                    setSuccessMessage(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.switchLoginBtnText}>Aller à l'écran de connexion →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ===================== MODE 1 : CONNEXION ===================== */}
          {authMode === 'LOGIN' && (
            <View style={styles.card}>
              <View style={styles.infoBox}>
                <Feather name="shield" size={15} color={theme.colors.infoBoxText} />
                <Text style={styles.infoText}>
                  Authentification académique UPF. Les comptes doivent être activés par l'administration.
                </Text>
              </View>

              {/* Champ Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adresse email institutionnelle</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="mail" size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="nom@upf.ac.ma"
                    placeholderTextColor={theme.colors.placeholder}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Champ Mot de Passe */}
              <View style={styles.inputGroup}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <TouchableOpacity
                    onPress={() => setShowLoginPassword(!showLoginPassword)}
                    activeOpacity={0.7}
                    style={styles.togglePasswordBtn}
                  >
                    <Feather 
                      name={showLoginPassword ? 'eye-off' : 'eye'} 
                      size={13} 
                      color={theme.colors.textMuted} 
                    />
                    <Text style={styles.togglePasswordText}>
                      {showLoginPassword ? 'Masquer' : 'Afficher'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mot de passe du compte"
                    placeholderTextColor={theme.colors.placeholder}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    secureTextEntry={!showLoginPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Bouton de Connexion */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>Se connecter</Text>
                    <Feather name="arrow-right" size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ===================== MODE 2 : CRÉER UN COMPTE ===================== */}
          {authMode === 'REGISTER' && (
            <View style={styles.card}>
              <View style={styles.registerHeaderBox}>
                <Text style={styles.registerSectionTitle}>Formulaire d'inscription académique</Text>
                <Text style={styles.registerSectionSub}>
                  Votre demande sera transmise à l'administrateur pour activation de profil.
                </Text>
              </View>

              {/* Sélecteur de Rôle */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Je souhaite m'inscrire en tant que :</Text>
                <View style={styles.rolePickerRow}>
                  <TouchableOpacity
                    style={[styles.roleChip, selectedRole === 'ETUDIANT' && styles.roleChipActive]}
                    onPress={() => setSelectedRole('ETUDIANT')}
                    activeOpacity={0.8}
                  >
                    <Feather 
                      name="user" 
                      size={15} 
                      color={selectedRole === 'ETUDIANT' ? '#2563EB' : theme.colors.textMuted} 
                    />
                    <Text style={[styles.roleChipText, selectedRole === 'ETUDIANT' && styles.roleChipTextActive]}>
                      Étudiant(e)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleChip, selectedRole === 'ENSEIGNANT' && styles.roleChipActive]}
                    onPress={() => setSelectedRole('ENSEIGNANT')}
                    activeOpacity={0.8}
                  >
                    <Feather 
                      name="book-open" 
                      size={15} 
                      color={selectedRole === 'ENSEIGNANT' ? '#059669' : theme.colors.textMuted} 
                    />
                    <Text style={[styles.roleChipText, selectedRole === 'ENSEIGNANT' && styles.roleChipTextActive]}>
                      Enseignant(e)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ================= GARDE-FOUS ACADÉMIQUES ================= */}
              {selectedRole === 'ETUDIANT' && !canStudentRegister && !loadingAcademic && (
                <View style={styles.guardrailCard}>
                  <Feather name="alert-triangle" size={18} color="#D97706" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guardrailTitle}>Inscriptions Étudiants suspendues</Text>
                    <Text style={styles.guardrailSub}>
                      Aucune classe n'est ouverte pour le moment. L'administration de l'établissement doit d'abord créer et configurer les promotions dans son tableau de bord.
                    </Text>
                  </View>
                </View>
              )}

              {selectedRole === 'ENSEIGNANT' && !canTeacherRegister && !loadingAcademic && (
                <View style={styles.guardrailCard}>
                  <Feather name="alert-triangle" size={18} color="#D97706" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guardrailTitle}>Inscriptions Enseignants suspendues</Text>
                    <Text style={styles.guardrailSub}>
                      Aucun module d'enseignement n'est disponible pour le moment. L'administration doit d'abord créer les modules pédagogiques dans son tableau de bord.
                    </Text>
                  </View>
                </View>
              )}

              {/* Ligne Nom & Prénom */}
              <View style={styles.dualInputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Nom *</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: NAHLI"
                      placeholderTextColor={theme.colors.placeholder}
                      value={nom}
                      onChangeText={setNom}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Prénom *</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Amine"
                      placeholderTextColor={theme.colors.placeholder}
                      value={prenom}
                      onChangeText={setPrenom}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>

              {/* Email institutionnel */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email institutionnel UPF *</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="mail" size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={selectedRole === 'ETUDIANT' ? 'amine.etu@upf.ac.ma' : 'prof.nom@upf.ac.ma'}
                    placeholderTextColor={theme.colors.placeholder}
                    value={registerEmail}
                    onChangeText={setRegisterEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Mot de passe */}
              <View style={styles.inputGroup}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.label}>Mot de passe souhaité *</Text>
                  <TouchableOpacity
                    onPress={() => setShowRegisterPassword(!showRegisterPassword)}
                    activeOpacity={0.7}
                    style={styles.togglePasswordBtn}
                  >
                    <Feather 
                      name={showRegisterPassword ? 'eye-off' : 'eye'} 
                      size={13} 
                      color={theme.colors.textMuted} 
                    />
                    <Text style={styles.togglePasswordText}>
                      {showRegisterPassword ? 'Masquer' : 'Afficher'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Au moins 4 caractères"
                    placeholderTextColor={theme.colors.placeholder}
                    value={registerPassword}
                    onChangeText={setRegisterPassword}
                    secureTextEntry={!showRegisterPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Téléphone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Téléphone portable</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="phone" size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+212 612-345678"
                    placeholderTextColor={theme.colors.placeholder}
                    value={telephone}
                    onChangeText={setTelephone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* ================= CHAMPS ÉTUDIANT ================= */}
              {selectedRole === 'ETUDIANT' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Classe / Promotion affectée *</Text>
                    {availableGroupes.length === 0 ? (
                      <View style={styles.emptySelectorBox}>
                        <Text style={styles.emptySelectorText}>
                          Aucune classe configurée par l'administration.
                        </Text>
                      </View>
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {availableGroupes.map((grp) => {
                          const isSelected = (groupeCode || availableGroupes[0]?.code) === grp.code;
                          return (
                            <TouchableOpacity
                              key={grp.id}
                              style={[styles.dynamicSelectChip, isSelected && styles.dynamicSelectChipActive]}
                              onPress={() => setGroupeCode(grp.code)}
                              activeOpacity={0.8}
                            >
                              <Text style={[styles.dynamicSelectChipText, isSelected && styles.dynamicSelectChipTextActive]}>
                                {grp.code}
                              </Text>
                              <Text style={[styles.dynamicSelectChipSub, isSelected && { color: '#1D4ED8' }]}>
                                {grp.nom}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>

                  <View style={styles.dualInputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Matricule</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          placeholder="Ex: ETU-001"
                          placeholderTextColor={theme.colors.placeholder}
                          value={matriculeEtu}
                          onChangeText={setMatriculeEtu}
                          autoCapitalize="characters"
                        />
                      </View>
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>CNE / Massar</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          placeholder="Ex: N130001001"
                          placeholderTextColor={theme.colors.placeholder}
                          value={cne}
                          onChangeText={setCne}
                          autoCapitalize="characters"
                        />
                      </View>
                    </View>
                  </View>
                </>
              )}

              {/* ================= CHAMPS ENSEIGNANT ================= */}
              {selectedRole === 'ENSEIGNANT' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Module d'enseignement principal *</Text>
                    {availableMatieres.length === 0 ? (
                      <View style={styles.emptySelectorBox}>
                        <Text style={styles.emptySelectorText}>
                          Aucun module configuré par l'administration.
                        </Text>
                      </View>
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {availableMatieres.map((mat) => {
                          const isSelected = (specialite || availableMatieres[0]?.nom) === mat.nom;
                          return (
                            <TouchableOpacity
                              key={mat.id}
                              style={[styles.dynamicSelectChip, isSelected && styles.dynamicSelectChipActive]}
                              onPress={() => setSpecialite(mat.nom)}
                              activeOpacity={0.8}
                            >
                              <Text style={[styles.dynamicSelectChipText, isSelected && styles.dynamicSelectChipTextActive]}>
                                {mat.code}
                              </Text>
                              <Text style={[styles.dynamicSelectChipSub, isSelected && { color: '#047857' }]}>
                                {mat.nom}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Matricule Enseignant</Text>
                    <View style={styles.inputWrapper}>
                      <Feather name="hash" size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Ex: ENS-001"
                        placeholderTextColor={theme.colors.placeholder}
                        value={matriculeProf}
                        onChangeText={setMatriculeProf}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Département académique</Text>
                    <View style={styles.inputWrapper}>
                      <Feather name="briefcase" size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Ex: Génie Informatique"
                        placeholderTextColor={theme.colors.placeholder}
                        value={departement}
                        onChangeText={setDepartement}
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Bouton de Soumission d'Inscription */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  ((selectedRole === 'ETUDIANT' && !canStudentRegister) ||
                   (selectedRole === 'ENSEIGNANT' && !canTeacherRegister) ||
                   loading) && styles.buttonDisabled,
                ]}
                onPress={handleRegister}
                disabled={
                  (selectedRole === 'ETUDIANT' && !canStudentRegister) ||
                  (selectedRole === 'ENSEIGNANT' && !canTeacherRegister) ||
                  loading
                }
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>
                      {(selectedRole === 'ETUDIANT' && !canStudentRegister) ||
                       (selectedRole === 'ENSEIGNANT' && !canTeacherRegister)
                        ? 'Inscriptions fermées'
                        : "Envoyer la demande d'inscription"}
                    </Text>
                    <Feather name="send" size={15} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Mentions institutionnelles */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              UPF Absence • Université Privée de Fès • Direction des Études
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const ANDROID_STATUSBAR = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: ANDROID_STATUSBAR + 6,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  brandBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primaryAccent,
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.6,
  },
  screenTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: theme.radius.sm,
    padding: 3,
    marginBottom: 16,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 7,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    ...theme.shadows.subtle,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
  },
  messageText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: theme.colors.absentBg,
    borderColor: theme.colors.absentBorder,
  },
  errorText: {
    color: theme.colors.absentText,
  },
  warningBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  warningText: {
    color: '#92400E',
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  successSub: {
    fontSize: 11.5,
    color: '#047857',
    lineHeight: 16,
    marginBottom: 6,
  },
  switchLoginBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.xs,
    marginTop: 2,
  },
  switchLoginBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guardrailCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: theme.radius.sm,
    padding: 12,
    marginBottom: 14,
  },
  guardrailTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  guardrailSub: {
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
    marginBottom: 18,
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
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 11.5,
    color: theme.colors.infoBoxText,
    lineHeight: 16,
    fontWeight: '500',
  },
  registerHeaderBox: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  registerSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  registerSectionSub: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  roleChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  roleChipTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  dynamicSelectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 110,
  },
  dynamicSelectChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  dynamicSelectChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  dynamicSelectChipTextActive: {
    color: '#1D4ED8',
  },
  dynamicSelectChipSub: {
    fontSize: 10.5,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  emptySelectorBox: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptySelectorText: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  dualInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: 5,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  togglePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  togglePasswordText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 13.5,
    color: theme.colors.textMain,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...theme.shadows.subtle,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footer: {
    marginTop: 14,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
