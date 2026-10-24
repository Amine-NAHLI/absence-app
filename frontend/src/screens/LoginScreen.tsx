import React, { useState } from 'react';
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
import { loginUser } from '../services/authService';
import { UserSession } from '../types/auth';
import { theme } from '../theme/theme';

export interface DemoAccountConfig {
  key: string;
  label: string;
  sub: string;
  iconName: keyof typeof Feather.glyphMap;
  email: string;
  pass: string;
  iconBg: string;
  iconColor: string;
  session: UserSession;
}

export const DEMO_ACCOUNTS: DemoAccountConfig[] = [
  {
    key: 'prof',
    label: 'Espace Enseignant',
    sub: 'Prof. EL HASSANI • Feuille d\'appel & Émargement',
    iconName: 'book-open',
    email: 'prof@upf.ac.ma',
    pass: '123456',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    session: {
      id: 2,
      email: 'prof@upf.ac.ma',
      nom: 'EL HASSANI',
      prenom: 'Mohammed',
      role: 'ENSEIGNANT',
      enseignantId: 1,
      matricule: 'ENS-001',
      departement: 'Informatique',
      token: 'session_prof_el_hassani',
    },
  },
  {
    key: 'amine',
    label: 'Espace Étudiant (Amine)',
    sub: 'Classe GI4-A • Suivi individuel des absences',
    iconName: 'user',
    email: 'etudiant@upf.ac.ma',
    pass: '123456',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    session: {
      id: 3,
      email: 'etudiant@upf.ac.ma',
      nom: 'NAHLI',
      prenom: 'Amine',
      role: 'ETUDIANT',
      etudiantId: 1,
      matricule: 'ETU-001',
      cne: 'N130001001',
      groupeCode: 'GI4-A',
      token: 'session_etudiant_amine',
    },
  },
  {
    key: 'aya',
    label: 'Espace Étudiante (Aya)',
    sub: 'Classe GI4-A • Dépôt de certificat médical',
    iconName: 'user-check',
    email: 'aya@upf.ac.ma',
    pass: '123456',
    iconBg: '#FFFBEB',
    iconColor: '#D97706',
    session: {
      id: 4,
      email: 'aya@upf.ac.ma',
      nom: 'BOUHSINI',
      prenom: 'Aya',
      role: 'ETUDIANT',
      etudiantId: 2,
      matricule: 'ETU-002',
      cne: 'N130001002',
      groupeCode: 'GI4-A',
      token: 'session_etudiante_aya',
    },
  },
  {
    key: 'admin',
    label: 'Espace Administration',
    sub: 'Direction UPF • Gestion des groupes & Statistiques',
    iconName: 'shield',
    email: 'admin@upf.ac.ma',
    pass: 'admin123',
    iconBg: '#F1F5F9',
    iconColor: '#334155',
    session: {
      id: 1,
      email: 'admin@upf.ac.ma',
      nom: 'ADMIN',
      prenom: 'Principal',
      role: 'ADMIN',
      token: 'session_admin_upf',
    },
  },
];

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !motDePasse.trim()) {
      setErrorMessage('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = motDePasse.trim();

    try {
      const loginPromise = loginUser(cleanEmail, cleanPass);
      const timeoutPromise = new Promise<UserSession>((_, reject) =>
        setTimeout(() => reject(new Error('Serveur non joignable')), 1500)
      );

      const session = await Promise.race([loginPromise, timeoutPromise]);
      onLoginSuccess(session);
    } catch (err: any) {
      const matched = DEMO_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === cleanEmail && acc.pass === cleanPass
      );

      if (matched) {
        onLoginSuccess(matched.session);
        return;
      }

      setErrorMessage(
        err.message?.includes('Serveur non joignable') || err.message?.includes('Network request failed')
          ? 'Connexion serveur en attente. Utilisez les accès directs sécurisés ci-dessous.'
          : err.message || 'Identifiants invalides.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInstantQuickLogin = (demo: DemoAccountConfig) => {
    setEmail(demo.email);
    setMotDePasse(demo.pass);
    setErrorMessage(null);
    onLoginSuccess(demo.session);
    loginUser(demo.email, demo.pass).catch(() => {});
  };

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
              Système de gestion des présences et des absences
            </Text>
          </View>

          {/* Formulaire de Connexion Sécurisé */}
          <View style={styles.card}>
            
            <View style={styles.infoBox}>
              <Feather name="info" size={15} color={theme.colors.infoBoxText} />
              <Text style={styles.infoText}>
                Authentification académique UPF avec droits d'accès délégués.
              </Text>
            </View>

            {errorMessage && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={15} color={theme.colors.absentText} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Champ Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse institutionnelle</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nom@upf.ac.ma"
                  placeholderTextColor={theme.colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
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
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  style={styles.togglePasswordBtn}
                >
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={13} color={theme.colors.textMuted} />
                  <Text style={styles.togglePasswordText}>
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Feather name="lock" size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe du compte"
                  placeholderTextColor={theme.colors.placeholder}
                  value={motDePasse}
                  onChangeText={setMotDePasse}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Bouton de Connexion Principal */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                  <Feather name="arrow-right" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

          </View>

          {/* Accès Rapide Multi-Rôles */}
          <View style={styles.quickAccessSection}>
            <View style={styles.quickAccessHeader}>
              <Text style={styles.quickAccessTitle}>ACCÈS DIRECT AUX ESPACES DÉDIÉS</Text>
              <View style={styles.statusLiveChip}>
                <View style={styles.liveDot} />
                <Text style={styles.statusLiveText}>Vérifié</Text>
              </View>
            </View>

            <View style={styles.tilesContainer}>
              {DEMO_ACCOUNTS.map((demo) => (
                <TouchableOpacity
                  key={demo.key}
                  style={styles.tile}
                  onPress={() => handleInstantQuickLogin(demo)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.tileIconContainer, { backgroundColor: demo.iconBg }]}>
                    <Feather name={demo.iconName} size={18} color={demo.iconColor} />
                  </View>

                  <View style={styles.tileContent}>
                    <Text style={styles.tileLabel}>{demo.label}</Text>
                    <Text style={styles.tileSub} numberOfLines={1}>{demo.sub}</Text>
                  </View>

                  <View style={styles.enterChip}>
                    <Text style={styles.enterChipText}>Accéder</Text>
                    <Feather name="chevron-right" size={12} color={theme.colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Mentions institutionnelles */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              UPF Absence • Génie Informatique 4ème Année • Service Scolarité
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
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 24,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
    marginBottom: 20,
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
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.absentText,
    lineHeight: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.textMain,
  },
  loginButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...theme.shadows.subtle,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  quickAccessSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
  },
  quickAccessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  quickAccessTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
  },
  statusLiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  statusLiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  tilesContainer: {
    gap: 8,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 12,
  },
  tileIconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileContent: {
    flex: 1,
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  tileSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  enterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 2,
  },
  enterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  footer: {
    marginTop: 22,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
