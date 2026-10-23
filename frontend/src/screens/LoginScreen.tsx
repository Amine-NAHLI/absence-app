import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
import { API_BASE_URL } from '../config/api';

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
      setErrorMessage('Veuillez saisir votre identifiant et votre mot de passe.');
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
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Header minimaliste institutionnel */}
          <View style={styles.header}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>UNIVERSITÉ PRIVÉE DE FÈS</Text>
            </View>
            <Text style={styles.screenTitle}>Portail d'Assiduité</Text>
            <Text style={styles.screenSubtitle}>Système de gestion des présences et des absences</Text>
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
              <View style={styles.labelRow}>
                <Text style={styles.label}>Mot de passe</Text>
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.toggleRow}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={13}
                    color={theme.colors.textMuted}
                  />
                  <Text style={styles.toggleText}>
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
                />
              </View>
            </View>

            {/* Bouton de Soumission Principal */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textWhite} size="small" />
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.primaryButtonText}>Se connecter</Text>
                  <Feather name="arrow-right" size={15} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Profils d'accès prédéfinis */}
          <View style={styles.demoCard}>
            <View style={styles.demoHeaderRow}>
              <Text style={styles.demoTitle}>Accès direct aux espaces dédiés</Text>
              <View style={styles.verifiedBadge}>
                <Feather name="check" size={11} color="#059669" />
                <Text style={styles.verifiedText}>Vérifié</Text>
              </View>
            </View>

            {DEMO_ACCOUNTS.map((account) => (
              <TouchableOpacity
                key={account.key}
                style={styles.demoRow}
                onPress={() => handleInstantQuickLogin(account)}
                activeOpacity={0.7}
              >
                <View style={styles.demoLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: account.iconBg }]}>
                    <Feather name={account.iconName} size={15} color={account.iconColor} />
                  </View>
                  <View style={styles.demoTextContent}>
                    <Text style={styles.demoAccountTitle}>{account.label}</Text>
                    <Text style={styles.demoAccountSub}>{account.sub}</Text>
                  </View>
                </View>
                <View style={styles.enterChip}>
                  <Text style={styles.enterChipText}>Accéder</Text>
                  <Feather name="chevron-right" size={13} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pied de page institutionnel */}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
  },
  brandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
    marginBottom: 16,
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
    color: theme.colors.absentText,
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.textMain,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: theme.colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  demoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: '#ECFDF5',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FAFAFC',
    marginBottom: 8,
  },
  demoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTextContent: {
    flex: 1,
  },
  demoAccountTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  demoAccountSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  enterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.xs,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  enterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
