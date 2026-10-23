import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { API_BASE_URL } from './src/config/api';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Absence App — UPF</Text>
      <Text style={styles.subtitle}>Gestion des Absences Étudiants</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌐 Connexion Backend Automatique</Text>
        <Text style={styles.cardValue}>{API_BASE_URL}</Text>
        <Text style={styles.cardHelp}>
          L'adresse IP de votre PC est détectée automatiquement par Expo, même si vous changez de réseau Wi-Fi !
        </Text>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardHelp: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
});
