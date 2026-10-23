import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { LoginScreen } from './src/screens/LoginScreen';
import { EnseignantHomeScreen } from './src/screens/EnseignantHomeScreen';
import { EtudiantHomeScreen } from './src/screens/EtudiantHomeScreen';
import { AdminHomeScreen } from './src/screens/AdminHomeScreen';
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

  // 4. Si Administrateur connecté (Espace Admin)
  return (
    <>
      <AdminHomeScreen session={currentSession} onLogout={handleLogout} />
      <StatusBar style="dark" />
    </>
  );
}
