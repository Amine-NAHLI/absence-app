import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { EnseignantHomeScreen } from './src/screens/EnseignantHomeScreen';
import { EtudiantHomeScreen } from './src/screens/EtudiantHomeScreen';
import { UserSession } from './src/types/auth';

export default function App() {
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);

  const handleLogout = () => {
    setCurrentSession(null);
  };

  // 1. Utilisateur non connecté : afficher l'écran de Login
  if (!currentSession) {
    return (
      <>
        <LoginScreen onLoginSuccess={setCurrentSession} />
        <StatusBar style="dark" />
      </>
    );
  }

  // 2. Si Enseignant connecté (Espace Amine)
  if (currentSession.role === 'ENSEIGNANT') {
    return (
      <>
        <EnseignantHomeScreen session={currentSession} onLogout={handleLogout} />
        <StatusBar style="dark" />
      </>
    );
  }

  // 3. Si Étudiant connecté (Espace Aya)
  if (currentSession.role === 'ETUDIANT') {
    return (
      <>
        <EtudiantHomeScreen session={currentSession} onLogout={handleLogout} />
        <StatusBar style="dark" />
      </>
    );
  }

  // 4. Si Administrateur connecté
  return (
    <SafeAreaView style={styles.adminContainer}>
      <View style={styles.adminCard}>
        <Text style={styles.adminTitle}>👨‍💼 Espace Administration</Text>
        <Text style={styles.adminSub}>Connecté en tant que : {currentSession.email}</Text>
        <Text style={styles.adminText}>
          Gestion globale des étudiants, groupes, enseignants et statistiques d'absentéisme.
        </Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  adminContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  adminCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  adminTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  adminSub: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 12,
  },
  adminText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  logoutBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
