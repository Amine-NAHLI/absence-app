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
import { loginUser } from '../services/authService';
import { UserSession } from '../types/auth';
import { theme } from '../theme/theme';
import { API_BASE_URL } from '../config/api';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Connexion manuelle via le formulaire
  const handleLogin = async () => {
    if (!email.trim() || !motDePasse.trim()) {
      setErrorMessage('Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const session = await loginUser(email, motDePasse);
      onLoginSuccess(session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  // Connexion directe en 1 CLIC pour la démo (Enseignant, Étudiant Amine, Étudiante Aya, Admin)
  const handleInstantQuickLogin = async (
    targetEmail: string,
    targetPass: string,
    fallbackSession: UserSession
  ) => {
    setEmail(targetEmail);
    setMotDePasse(targetPass);
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Tenter la connexion réelle sur le Backend Spring Boot
      const session = await loginUser(targetEmail, targetPass);
      onLoginSuccess(session);
    } catch (err: any) {
      console.warn(
        `[QuickLogin] Connexion directe via profil de secours (${fallbackSession.role}) :`,
        err.message
      );
      // 2. Si le backend met du temps ou n'est pas encore joignable, connecter directement au bon espace !
      onLoginSuccess(fallbackSession);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Header minimaliste épuré */}
          <View style={styles.header}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandLetter}>b</Text>
            </View>
            <Text style={styles.screenTitle}>Connexion</Text>
            <Text style={styles.screenSubtitle}>Gestion des Absences • UPF GI4</Text>
          </View>

          {/* Carte Principale de Saisie */}
          <View style={styles.card}>
            
            {/* Boîte d'information pastel bleue */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Connectez-vous avec vos identifiants ou cliquez ci-dessous sur l'espace souhaité en 1 clic.
              </Text>
            </View>

            {errorMessage && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            )}

            {/* Champ Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse Email institutionnelle</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: prof@upf.ac.ma"
                placeholderTextColor={theme.colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Champ Mot de Passe */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Mot de passe</Text>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.togglePassword}>
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Votre mot de passe"
                placeholderTextColor={theme.colors.placeholder}
                value={motDePasse}
                onChangeText={setMotDePasse}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Bouton Sombre Principal */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textWhite} />
              ) : (
                <Text style={styles.primaryButtonText}>Se connecter</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Raccourcis Connexion Directe en 1 Clic */}
          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>⚡ Accès direct en 1 Clic (Cliquez pour entrer) :</Text>

            {/* 1. ESPACE ENSEIGNANT (Amine) */}
            <TouchableOpacity
              style={[styles.demoRow, { backgroundColor: theme.colors.mintBg }]}
              onPress={() =>
                handleInstantQuickLogin('prof@upf.ac.ma', '123456', {
                  id: 2,
                  email: 'prof@upf.ac.ma',
                  nom: 'EL HASSANI',
                  prenom: 'Mohammed',
                  role: 'ENSEIGNANT',
                  enseignantId: 1,
                  departement: 'Informatique',
                  token: 'session_prof',
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.demoLeft}>
                <Text style={styles.demoIcon}>👨‍🏫</Text>
                <View>
                  <Text style={[styles.demoTag, { color: theme.colors.mintText }]}>
                    Espace Enseignant
                  </Text>
                  <Text style={styles.demoSub}>Prof. EL HASSANI (Appel & Gestion)</Text>
                </View>
              </View>
              <Text style={[styles.enterArrow, { color: theme.colors.mintText }]}>Entrer ›</Text>
            </TouchableOpacity>

            {/* 2. ESPACE ÉTUDIANT (Amine NAHLI) */}
            <TouchableOpacity
              style={[styles.demoRow, { backgroundColor: theme.colors.blueBg }]}
              onPress={() =>
                handleInstantQuickLogin('etudiant@upf.ac.ma', '123456', {
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
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.demoLeft}>
                <Text style={styles.demoIcon}>👨‍🎓</Text>
                <View>
                  <Text style={[styles.demoTag, { color: theme.colors.blueText }]}>
                    Espace Étudiant (Amine)
                  </Text>
                  <Text style={styles.demoSub}>Classe GI4-A • Suivi de mes absences</Text>
                </View>
              </View>
              <Text style={[styles.enterArrow, { color: theme.colors.blueText }]}>Entrer ›</Text>
            </TouchableOpacity>

            {/* 3. ESPACE ÉTUDIANTE (Aya BOUHSINI) */}
            <TouchableOpacity
              style={[styles.demoRow, { backgroundColor: theme.colors.amberBg }]}
              onPress={() =>
                handleInstantQuickLogin('aya@upf.ac.ma', '123456', {
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
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.demoLeft}>
                <Text style={styles.demoIcon}>👩‍🎓</Text>
                <View>
                  <Text style={[styles.demoTag, { color: theme.colors.amberText }]}>
                    Espace Étudiante (Aya)
                  </Text>
                  <Text style={styles.demoSub}>Classe GI4-A • Dépôt de justificatif</Text>
                </View>
              </View>
              <Text style={[styles.enterArrow, { color: theme.colors.amberText }]}>Entrer ›</Text>
            </TouchableOpacity>

            {/* 4. ESPACE ADMINISTRATION */}
            <TouchableOpacity
              style={[styles.demoRow, { backgroundColor: '#F1F5F9' }]}
              onPress={() =>
                handleInstantQuickLogin('admin@upf.ac.ma', 'admin123', {
                  id: 1,
                  email: 'admin@upf.ac.ma',
                  nom: 'ADMIN',
                  prenom: 'Principal',
                  role: 'ADMIN',
                  token: 'session_admin',
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.demoLeft}>
                <Text style={styles.demoIcon}>👨‍💼</Text>
                <View>
                  <Text style={[styles.demoTag, { color: '#334155' }]}>
                    Espace Administration
                  </Text>
                  <Text style={styles.demoSub}>Pilotage & Statistiques globales</Text>
                </View>
              </View>
              <Text style={[styles.enterArrow, { color: '#334155' }]}>Entrer ›</Text>
            </TouchableOpacity>
          </View>

          {/* Pied de page Serveur */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Backend connecté : <Text style={styles.footerUrl}>{API_BASE_URL}</Text>
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
    paddingVertical: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandLetter: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: 20,
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
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 16,
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
  errorBox: {
    backgroundColor: theme.colors.roseBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: theme.colors.roseText,
    fontSize: 13,
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
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  togglePassword: {
    fontSize: 12,
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FAFAFC',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.textMain,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    ...theme.shadows.soft,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: theme.colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  demoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    marginBottom: 8,
  },
  demoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demoIcon: {
    fontSize: 22,
  },
  demoTag: {
    fontSize: 13,
    fontWeight: '800',
  },
  demoSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  enterArrow: {
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  footerUrl: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});
