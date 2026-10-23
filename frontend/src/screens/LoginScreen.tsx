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

  const fillQuickAccount = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setMotDePasse(quickPass);
    setErrorMessage(null);
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
            <Text style={styles.screenSubtitle}>Gestion des Absences • UPF</Text>
          </View>

          {/* Carte Principale de Saisie */}
          <View style={styles.card}>
            
            {/* Boîte d'information pastel bleue (style Deel / VacationTracker) */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Connectez-vous avec vos identifiants pour accéder à votre espace de gestion.
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

            {/* Bouton Sombre Principal (Style Midnight Navy) */}
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

          {/* Raccourcis de Test Démo (avec pastilles de couleur comme sur la capture) */}
          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>Comptes de démonstration (1 clic) :</Text>

            <TouchableOpacity
              style={[styles.demoRow, { backgroundColor: theme.colors.mintBg }]}
              onPress={() => fillQuickAccount('prof@upf.ac.ma', '123456')}
              activeOpacity={0.7}
            >
              <Text style={[styles.demoTag, { color: theme.colors.mintText }]}>Enseignant</Text>
              <Text style={styles.demoEmail}>prof@upf.ac.ma</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoRow, { backgroundColor: theme.colors.blueBg }]}
              onPress={() => fillQuickAccount('etudiant@upf.ac.ma', '123456')}
              activeOpacity={0.7}
            >
              <Text style={[styles.demoTag, { color: theme.colors.blueText }]}>Étudiant (Amine)</Text>
              <Text style={styles.demoEmail}>etudiant@upf.ac.ma</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoRow, { backgroundColor: theme.colors.amberBg }]}
              onPress={() => fillQuickAccount('aya@upf.ac.ma', '123456')}
              activeOpacity={0.7}
            >
              <Text style={[styles.demoTag, { color: theme.colors.amberText }]}>Étudiante (Aya)</Text>
              <Text style={styles.demoEmail}>aya@upf.ac.ma</Text>
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
    paddingVertical: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
    padding: 22,
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
    borderRadius: theme.radius.md,
    padding: 12,
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
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
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
    paddingVertical: 13,
    fontSize: 15,
    color: theme.colors.textMain,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
    ...theme.shadows.soft,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: theme.colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  demoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 18,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    marginBottom: 8,
  },
  demoTag: {
    fontSize: 12,
    fontWeight: '800',
  },
  demoEmail: {
    fontSize: 13,
    color: theme.colors.textMain,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 8,
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
