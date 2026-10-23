import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
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
        subtitle="Administration"
        userInitial="A"
        onLogout={onLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Titre et Contexte Scolarité */}
        <View style={styles.sectionHeader}>
          <Text style={styles.screenHeading}>Tableau de bord de scolarité</Text>
          <Text style={styles.screenSubheading}>
            Direction des Études • Pilotage institutionnel et assiduité
          </Text>
        </View>

        {/* Boîte d'information */}
        <View style={styles.infoBox}>
          <Feather name="info" size={14} color={theme.colors.infoBoxText} />
          <Text style={styles.infoText}>
            Supervision académique UPF : gestion centralisée des promotions, comptes et assiduité en temps réel.
          </Text>
        </View>

        {/* 3 Cartes KPI Institutionnelles (US17) */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={styles.statTop}>
              <Feather name="users" size={14} color={theme.colors.textMuted} />
              <Text style={styles.statLabel}>Étudiants</Text>
            </View>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statSub}>Inscrits en GI4</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statTop}>
              <Feather name="user-check" size={14} color={theme.colors.textMuted} />
              <Text style={styles.statLabel}>Corps professoral</Text>
            </View>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statSub}>Enseignant actif</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statTop}>
              <Feather name="trending-up" size={14} color="#059669" />
              <Text style={styles.statLabel}>Assiduité globale</Text>
            </View>
            <Text style={[styles.statNumber, { color: '#059669' }]}>93.4%</Text>
            <Text style={styles.statSub}>Objectif ≥ 90%</Text>
          </View>
        </View>

        {/* Section 1 : Actions Rapides de Scolarité (US13, US15, US16) */}
        <Text style={styles.sectionTitle}>Gestion Pédagogique</Text>

        {/* Carte Ajouter Étudiant (US13) */}
        <TouchableOpacity
          style={styles.cardAction}
          onPress={() => alert('Ajout d\'étudiant (US13 - Aya BOUHSINI)')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Feather name="user-plus" size={16} color="#2563EB" />
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardActionTitle}>Enregistrer un étudiant (US13)</Text>
            <Text style={styles.cardActionSub}>Création d'accès avec matricule, CNE et affectation de groupe</Text>
          </View>
          <Feather name="chevron-right" size={16} color={theme.colors.textLight} />
        </TouchableOpacity>

        {/* Carte Ajouter Enseignant (US15) */}
        <TouchableOpacity
          style={styles.cardAction}
          onPress={() => alert('Ajout d\'enseignant (US15 - Aya BOUHSINI)')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Feather name="briefcase" size={16} color="#059669" />
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardActionTitle}>Affecter un enseignant (US15)</Text>
            <Text style={styles.cardActionSub}>Attribution des modules académiques et départements</Text>
          </View>
          <Feather name="chevron-right" size={16} color={theme.colors.textLight} />
        </TouchableOpacity>

        {/* Carte Gérer les Groupes (US16) */}
        <TouchableOpacity
          style={styles.cardAction}
          onPress={() => alert('Gestion des groupes GI4-A, GI4-B (US16 - Amine NAHLI)')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
            <Feather name="layers" size={16} color="#475569" />
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardActionTitle}>Structure des promotions & groupes (US16)</Text>
            <Text style={styles.cardActionSub}>Répartition des effectifs GI4-A et suivi des capacités de salle</Text>
          </View>
          <Feather name="chevron-right" size={16} color={theme.colors.textLight} />
        </TouchableOpacity>

        {/* Section 2 : Taux d'Assiduité par Groupe (US17) */}
        <Text style={styles.sectionTitle}>Taux d'assiduité par groupe (US17)</Text>

        <View style={styles.cardStats}>
          {/* Ligne GI4-A */}
          <View style={styles.progressRow}>
            <View style={styles.progressHeader}>
              <View style={styles.groupInfoRow}>
                <View style={styles.codeTag}>
                  <Text style={styles.codeTagText}>GI4-A</Text>
                </View>
                <Text style={styles.groupName}>Génie Informatique A</Text>
              </View>
              <Text style={styles.percentText}>93% assiduité</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '93%', backgroundColor: '#059669' }]} />
            </View>
          </View>

          {/* Ligne GI4-B */}
          <View style={[styles.progressRow, { marginTop: 14 }]}>
            <View style={styles.progressHeader}>
              <View style={styles.groupInfoRow}>
                <View style={styles.codeTag}>
                  <Text style={styles.codeTagText}>GI4-B</Text>
                </View>
                <Text style={styles.groupName}>Génie Informatique B</Text>
              </View>
              <Text style={styles.percentText}>97% assiduité</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '97%', backgroundColor: '#2563EB' }]} />
            </View>
          </View>
        </View>

        {/* Déconnexion Administrative */}
        <View style={styles.actionButtonGroup}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.logoutButtonText}>Fermer la session administrative</Text>
          </TouchableOpacity>
        </View>

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
    paddingHorizontal: 18,
    paddingVertical: 18,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.3,
  },
  screenSubheading: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
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
    marginBottom: 14,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.infoBoxText,
    lineHeight: 16,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.textMain,
  },
  statSub: {
    fontSize: 10,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 8,
    gap: 12,
    ...theme.shadows.subtle,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContent: {
    flex: 1,
  },
  cardActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  cardActionSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  cardStats: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.subtle,
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
  groupInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.xs,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  groupName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionButtonGroup: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingVertical: 11,
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
