import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { EnseignantHomeScreen } from './src/screens/EnseignantHomeScreen';
import { EtudiantHomeScreen } from './src/screens/EtudiantHomeScreen';
import { AdminHomeScreen } from './src/screens/AdminHomeScreen';
import { UserSession } from './src/types/auth';

export default function App() {
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = '7ader';
    }
  }, []);

  const handleLogout = () => {
    console.log('[App] Déconnexion utilisateur');
    setCurrentSession(null);
  };

  const handleLoginSuccess = (session: UserSession) => {
    console.log(`[App] Session active: ${session.email} | Rôle: ${session.role}`);
    setCurrentSession(session);
  };

  // 1. Utilisateur non connecté : afficher l'écran de Login
  if (!currentSession) {
    return (
      <>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        <StatusBar style="dark" />
      </>
    );
  }

  // Normalisation du rôle : majuscules strictes sans espaces
  const role = currentSession.role
    ? String(currentSession.role).trim().toUpperCase()
    : '';

  // 2. Si Enseignant connecté (Espace Amine : Feuille d'émargement & Appel)
  if (role === 'ENSEIGNANT' || role === 'PROF' || role === 'PROFESSEUR') {
    return (
      <>
        <EnseignantHomeScreen session={currentSession} onLogout={handleLogout} />
        <StatusBar style="dark" />
      </>
    );
  }

  // 3. Si Étudiant(e) connecté (Espace Aya / Amine : Suivi personnel & Justificatifs)
  if (role === 'ETUDIANT' || role === 'ETUDIANTE' || role === 'STUDENT') {
    return (
      <>
        <EtudiantHomeScreen session={currentSession} onLogout={handleLogout} />
        <StatusBar style="dark" />
      </>
    );
  }

  // 4. Si Administrateur connecté (Espace Scolarité / Direction UPF)
  if (role === 'ADMIN' || role === 'ADMINISTRATEUR') {
    return (
      <>
        <AdminHomeScreen session={currentSession} onLogout={handleLogout} />
        <StatusBar style="dark" />
      </>
    );
  }

  // 5. Cas de secours si le rôle est inconnu (ne JAMAIS rediriger vers Admin par défaut)
  return (
    <View style={fallbackStyles.center}>
      <Text style={fallbackStyles.title}>Profil non reconnu</Text>
      <Text style={fallbackStyles.sub}>
        Rôle détecté : "{String(currentSession.role)}" pour {currentSession.email}
      </Text>
      <TouchableOpacity style={fallbackStyles.button} onPress={handleLogout}>
        <Text style={fallbackStyles.buttonText}>Retour à la connexion</Text>
      </TouchableOpacity>
      <StatusBar style="dark" />
    </View>
  );
}

const fallbackStyles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#192138',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
