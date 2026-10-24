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
  const initial = session.prenom?.[0] || session.nom?.[0] || 'A';

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderBar
        title="Espace Administration"
        subtitle="Direction des Études"
        userInitial={initial}
        onLogout={onLogout}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Titre & Sous-titre institutionnel */}
        <View style={styles.sectionHeading}>
          <Text style={styles.adminTitle}>Tableau de bord de scolarité</Text>
          <Text style={styles.adminSubtitle}>
            Pilotage institutionnel, gestion des cohortes et assiduité
          </Text>
        </View>

        {/* Bannière de supervision */}
        <View style={styles.supervisionBanner}>
          <Feather name="info" size={15} color={theme.colors.infoBoxText} />
          <Text style={styles.supervisionText}>
            Supervision académique UPF : gestion centralisée des promotions, comptes et assiduité en temps réel.
          </Text>
        </View>

        {/* 1. Métriques Institutionnelles Apple FinTech (Grille 2 Colonnes) */}
        <View style={styles.kpiContainer}>
          
          {/* Ligne 1 : Étudiants & Professeurs côte à côte */}
          <View style={styles.dualKpiRow}>
            {/* Étudiants */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiCardHeader}>
                <Feather name="users" size={15} color={theme.colors.primaryAccent} />
                <Text style={styles.kpiCardLabel}>ÉTUDIANTS</Text>
              </View>
              <Text style={styles.kpiMainNumber}>5</Text>
              <Text style={styles.kpiSubLabel}>Inscrits en GI4</Text>
            </View>

            {/* Corps Professoral */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiCardHeader}>
                <Feather name="briefcase" size={15} color={theme.colors.textSecondary} />
                <Text style={styles.kpiCardLabel}>ENSEIGNANTS</Text>
              </View>
              <Text style={styles.kpiMainNumber}>1</Text>
              <Text style={styles.kpiSubLabel}>Enseignant actif</Text>
            </View>
          </View>

          {/* Ligne 2 : Assiduité Globale Pleine Largeur */}
          <View style={styles.attendanceSummaryCard}>
            <View style={styles.attendanceHeader}>
              <View style={styles.attendanceTitleGroup}>
                <Feather name="trending-up" size={16} color="#10B981" />
                <Text style={styles.attendanceLabel}>ASSIDUITÉ GLOBALE</Text>
              </View>
              <View style={styles.targetBadge}>
                <Text style={styles.targetBadgeText}>Objectif ≥ 90%</Text>
              </View>
            </View>

            <View style={styles.attendanceScoreRow}>
              <Text style={styles.attendanceBigScore}>93.4%</Text>
              <Text style={styles.attendanceComment}>Taux conforme au contrat pédagogique</Text>
            </View>

            {/* Barre de progression continue */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '93.4%' }]} />
            </View>
          </View>

        </View>

        {/* 2. Gestion Pédagogique */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>GESTION PÉDAGOGIQUE</Text>
        </View>

        <View style={styles.actionCardsGroup}>
          
          {/* Action 1 : Enregistrer étudiant (US13) */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => alert('Ouverture du formulaire d\'enregistrement étudiant (US13)')}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="user-plus" size={18} color="#2563EB" />
            </View>
            <View style={styles.actionTextContent}>
              <Text style={styles.actionCardTitle}>Enregistrer un étudiant (US13)</Text>
              <Text style={styles.actionCardSub}>
                Création d'accès avec matricule, CNE et affectation de classe
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Action 2 : Affecter enseignant (US15) */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => alert('Attribution des modules académiques (US15)')}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="briefcase" size={18} color="#059669" />
            </View>
            <View style={styles.actionTextContent}>
              <Text style={styles.actionCardTitle}>Affecter un enseignant (US15)</Text>
              <Text style={styles.actionCardSub}>
                Attribution des modules académiques et départements
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Action 3 : Structure promotions & groupes (US16) */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => alert('Gestion des effectifs et groupes (US16)')}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#F1F5F9' }]}>
              <Feather name="layers" size={18} color="#334155" />
            </View>
            <View style={styles.actionTextContent}>
              <Text style={styles.actionCardTitle}>Structure des promotions & groupes (US16)</Text>
              <Text style={styles.actionCardSub}>
                Répartition des effectifs GI4-A et suivi des capacités de salle
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>

        </View>

        {/* 3. Taux d'Assiduité par Groupe (US17) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>TAUX D'ASSIDUITÉ PAR GROUPE (US17)</Text>
        </View>

        <View style={styles.cohortCard}>
          {/* Groupe GI4-A */}
          <View style={styles.cohortRow}>
            <View style={styles.cohortInfoTop}>
              <View style={styles.cohortTag}>
                <Text style={styles.cohortTagText}>GI4-A</Text>
              </View>
              <Text style={styles.cohortName}>Génie Informatique 4A</Text>
              <Text style={styles.cohortPercent}>93% assiduité</Text>
            </View>
            <View style={styles.cohortBarTrack}>
              <View style={[styles.cohortBarFill, { width: '93%', backgroundColor: '#10B981' }]} />
            </View>
          </View>

          {/* Groupe GI4-B */}
          <View style={[styles.cohortRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
            <View style={styles.cohortInfoTop}>
              <View style={styles.cohortTag}>
                <Text style={styles.cohortTagText}>GI4-B</Text>
              </View>
              <Text style={styles.cohortName}>Génie Informatique 4B</Text>
              <Text style={styles.cohortPercent}>97% assiduité</Text>
            </View>
            <View style={styles.cohortBarTrack}>
              <View style={[styles.cohortBarFill, { width: '97%', backgroundColor: '#2563EB' }]} />
            </View>
          </View>
        </View>

        {/* 4. Bouton de Déconnexion Net (Zéro coupure de texte) */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.75}
          >
            <Feather name="log-out" size={15} color={theme.colors.textSecondary} />
            <Text style={styles.logoutButtonText}>Fermer la session</Text>
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
    paddingVertical: 16,
    paddingBottom: 40,
  },
  sectionHeading: {
    marginBottom: 12,
  },
  adminTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.3,
  },
  adminSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  supervisionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.infoBoxBg,
    borderWidth: 1,
    borderColor: theme.colors.infoBoxBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  supervisionText: {
    flex: 1,
    fontSize: 11.5,
    color: theme.colors.infoBoxText,
    lineHeight: 16,
    fontWeight: '500',
  },
  kpiContainer: {
    marginBottom: 18,
    gap: 10,
  },
  dualKpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  kpiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  kpiCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  kpiMainNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.textMain,
    marginVertical: 2,
  },
  kpiSubLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  attendanceSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attendanceTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attendanceLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
  },
  targetBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  targetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  attendanceScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
  },
  attendanceBigScore: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  attendanceComment: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
  },
  actionCardsGroup: {
    gap: 10,
    marginBottom: 18,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 12,
    ...theme.shadows.subtle,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  actionCardSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  cohortCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 18,
    ...theme.shadows.card,
  },
  cohortRow: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cohortInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cohortTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
    marginRight: 8,
  },
  cohortTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  cohortName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  cohortPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  cohortBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  cohortBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  bottomActions: {
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    ...theme.shadows.subtle,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
});
