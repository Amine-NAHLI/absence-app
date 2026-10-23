import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UserSession } from '../types/auth';
import { HeaderBar } from '../components/HeaderBar';
import { theme } from '../theme/theme';

interface AdminHomeScreenProps {
  session: UserSession;
  onLogout: () => void;
}

export const AdminHomeScreen: React.FC<AdminHomeScreenProps> = ({
  session,
  onLogout,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        title="UPF Absence"
        userInitial="A"
        onLogout={onLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Titre Principal */}
        <Text style={styles.screenHeading}>Espace Administration 👨‍💼</Text>

        {/* Boîte d'information pastel bleue */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Pilotage global de l'assiduité, gestion des groupes, comptes étudiants et statistiques de l'UPF.
          </Text>
        </View>

        {/* Compteurs Globaux de l'Université (US17) */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Étudiants</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: theme.colors.mintText }]}>1</Text>
            <Text style={styles.statLabel}>Enseignant</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#2563EB' }]}>93%</Text>
            <Text style={styles.statLabel}>Assiduité</Text>
          </View>
        </View>

        {/* Section 1 : Actions Rapides de Scolarité (US13, US15, US16) */}
        <Text style={styles.sectionTitle}>Gestion Pédagogique (Sprint 1 & 2)</Text>

        {/* Carte Ajouter Étudiant (US13) */}
        <TouchableOpacity
          style={styles.cardAction}
          onPress={() => alert('Ajouter un étudiant (US13 - Développé par Aya)')}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>👨‍🎓</Text>
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardActionTitle}>Ajouter un étudiant (US13)</Text>
            <Text style={styles.cardActionSub}>Création de compte avec CNE, matricule et classe</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Carte Ajouter Enseignant (US15) */}
        <TouchableOpacity
          style={styles.cardAction}
          onPress={() => alert('Ajouter un enseignant (US15 - Développé par Aya)')}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>👨‍🏫</Text>
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardActionTitle}>Ajouter un enseignant (US15)</Text>
            <Text style={styles.cardActionSub}>Affectation département et matières dispensées</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Carte Gérer les Groupes (US16) */}
        <TouchableOpacity
          style={styles.cardAction}
          onPress={() => alert('Gestion des groupes GI4-A, GI4-B (US16 - Développé par Amine)')}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>📚</Text>
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardActionTitle}>Gérer les groupes & promotions (US16)</Text>
            <Text style={styles.cardActionSub}>Affecter les étudiants et enseignants aux classes</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Section 2 : Statistiques d'Absence (US17) */}
        <Text style={styles.sectionTitle}>Taux d'assiduité par groupe (US17)</Text>

        <View style={styles.cardStats}>
          {/* Ligne GI4-A */}
          <View style={styles.progressRow}>
            <View style={styles.progressHeader}>
              <Text style={styles.groupName}>GI4-A (Génie Informatique)</Text>
              <Text style={styles.percentText}>93% assiduité</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '93%', backgroundColor: theme.colors.mintText }]} />
            </View>
          </View>

          {/* Ligne GI4-B */}
          <View style={[styles.progressRow, { marginTop: 14 }]}>
            <View style={styles.progressHeader}>
              <Text style={styles.groupName}>GI4-B (Génie Informatique)</Text>
              <Text style={styles.percentText}>97% assiduité</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '97%', backgroundColor: '#2563EB' }]} />
            </View>
          </View>
        </View>

        {/* Bouton de Déconnexion */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>Se déconnecter de l'administration</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textMain,
    marginVertical: 16,
    letterSpacing: -0.3,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.infoBoxBg,
    borderWidth: 1,
    borderColor: theme.colors.infoBoxBorder,
    borderRadius: theme.radius.md,
    padding: 14,
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.soft,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  cardAction: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.soft,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconEmoji: {
    fontSize: 20,
  },
  cardTextContent: {
    flex: 1,
  },
  cardActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: 2,
  },
  cardActionSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  cardStats: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
    marginBottom: 24,
  },
  progressRow: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  groupName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  logoutButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: theme.colors.roseText,
    fontSize: 13,
    fontWeight: '700',
  },
});
