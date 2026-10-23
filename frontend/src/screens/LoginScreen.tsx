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

// Comptes prédéfinis pour la démo (US01 & US02 & US04 & US17)
export const DEMO_ACCOUNTS = [
  {
    key: 'prof',
    label: 'Espace Enseignant',
    sub: 'Prof. EL HASSANI (Feuille d\'appel & Émargement)',
    icon: '👨‍🏫',
    email: 'prof@upf.ac.ma',
    pass: '123456',
    bgColor: theme.colors.mintBg,
    textColor: theme.colors.mintText,
    session: {
      id: 2,
      email: 'prof@upf.ac.ma',
      nom: 'EL HASSANI',
      prenom: 'Mohammed',
      role: 'ENSEIGNANT' as const,
      enseignantId: 1,
      matricule: 'ENS-001',
      departement: 'Informatique',
      token: 'session_prof_el_hassani',
    },
  },
  {
    key: 'amine',
    label: 'Espace Étudiant (Amine)',
    sub: 'Classe GI4-A • Suivi personnel des absences',
    icon: '👨‍🎓',
    email: 'etudiant@upf.ac.ma',
    pass: '123456',
    bgColor: theme.colors.blueBg,
    textColor: theme.colors.blueText,
    session: {
      id: 3,
      email: 'etudiant@upf.ac.ma',
      nom: 'NAHLI',
      prenom: 'Amine',
      role: 'ETUDIANT' as const,
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
    sub: 'Classe GI4-A • Dépôt de justificatif médical',
    icon: '👩‍🎓',
    email: 'aya@upf.ac.ma',
    pass: '123456',
    bgColor: theme.colors.amberBg,
    textColor: theme.colors.amberText,
    session: {
      id: 4,
      email: 'aya@upf.ac.ma',
      nom: 'BOUHSINI',
      prenom: 'Aya',
      role: 'ETUDIANT' as const,
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
    sub: 'Direction UPF • Gestion groupes & Assiduité',
    icon: '👨‍💼',
    email: 'admin@upf.ac.ma',
    pass: 'admin123',
    bgColor: '#F1F5F9',
    textColor: '#334155',
    session: {
      id: 1,
      email: 'admin@upf.ac.ma',
      nom: 'ADMIN',
      prenom: 'Principal',
      role: 'ADMIN' as const,
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

  // Connexion manuelle via le formulaire
  const handleLogin = async () => {
    if (!email.trim() || !motDePasse.trim()) {
      setErrorMessage('Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = motDePasse.trim();

    try {
      // Timeout court (1.5s) : si le téléphone n'accède pas au port 8080 du PC (tunnel/pare-feu)
      const loginPromise = loginUser(cleanEmail, cleanPass);
      const timeoutPromise = new Promise<UserSession>((_, reject) =>
        setTimeout(() => reject(new Error('Serveur non joignable')), 1500)
      );

      const session = await Promise.race([loginPromise, timeoutPromise]);
      console.log(`[Login] Connexion serveur réussie (${session.role}) pour ${cleanEmail}`);
      onLoginSuccess(session);
    } catch (err: any) {
      console.warn('[Login] Tentative fallback locale pour :', cleanEmail);

      // Vérifier si les identifiants saisis correspondent à l'un des 4 comptes officiels UPF
      const matched = DEMO_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === cleanEmail && acc.pass === cleanPass
      );

      if (matched) {
        console.log(`[Login] Accès accordé pour ${matched.label} -> Rôle: ${matched.session.role}`);
        onLoginSuccess(matched.session);
        return;
      }

      setErrorMessage(
        err.message?.includes('Serveur non joignable') || err.message?.includes('Network request failed')
          ? 'Serveur Spring Boot en cours de chargement. Cliquez ci-dessous sur l\'espace souhaité en 1 clic !'
          : err.message || 'Identifiants invalides.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Connexion directe INSTANTANÉE en 1 Clic (0 ms d'attente, navigation immédiate)
  const handleInstantQuickLogin = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(demo.email);
    setMotDePasse(demo.pass);
    setErrorMessage(null);
    console.log(`[QuickLogin ⚡] Accès direct à l'${demo.label} (${demo.session.role})`);
    
    // 1. Navigation immédiate vers l'espace concerné
    onLoginSuccess(demo.session);

    // 2. Synchronisation en arrière-plan sans bloquer l'UI
    loginUser(demo.email, demo.pass).catch(() => {
      // Mode autonome transparent
    });
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
                Connectez-vous ou cliquez sur un des 4 espaces ci-dessous pour entrer instantanément.
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

            {DEMO_ACCOUNTS.map((account) => (
              <TouchableOpacity
                key={account.key}
                style={[styles.demoRow, { backgroundColor: account.bgColor }]}
                onPress={() => handleInstantQuickLogin(account)}
                activeOpacity={0.7}
              >
                <View style={styles.demoLeft}>
                  <Text style={styles.demoIcon}>{account.icon}</Text>
                  <View>
                    <Text style={[styles.demoTag, { color: account.textColor }]}>
                      {account.label}
                    </Text>
                    <Text style={styles.demoSub}>{account.sub}</Text>
                  </View>
                </View>
                <Text style={[styles.enterArrow, { color: account.textColor }]}>Entrer ›</Text>
              </TouchableOpacity>
            ))}
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
