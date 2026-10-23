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

interface EtudiantHomeScreenProps {
  session: UserSession;
  onLogout: () => void;
}

export const EtudiantHomeScreen: React.FC<EtudiantHomeScreenProps> = ({
  session,
  onLogout,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Barre de navigation haute (Exacte reproduction du screenshot) */}
      <HeaderBar
        title="UPF Absence"
        userInitial={session.prenom ? session.prenom[0] : 'E'}
        onLogout={onLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Section Profil Centré (comme sur l'écran droit du screenshot) */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {session.prenom ? session.prenom[0] : 'E'}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {session.prenom} {session.nom}
          </Text>
          <Text style={styles.profileRole}>
            Étudiant {session.groupeCode || 'GI4-A'} • Matricule : {session.matricule || 'ETU-001'}
          </Text>
        </View>

        {/* Carte d'Absence Principale (Design Carte du Screenshot) */}
        <View style={styles.card}>
          
          {/* Ligne 1 : Date & Pastille type */}
          <View style={styles.cardRowBetween}>
            <Text style={styles.label}>Date(s) et heure(s)</Text>
            <View style={styles.mintBadge}>
              <Text style={styles.mintBadgeText}>Séance TP</Text>
            </View>
          </View>

          <Text style={styles.dateValue}>Aujourd'hui • 08:30 - 10:15</Text>

          <View style={styles.divider} />

          {/* Ligne 2 : Matière & Prof */}
          <Text style={styles.label}>Matière & Enseignant</Text>
          <Text style={styles.courseValue}>Génie Logiciel & Méthodes Agiles</Text>
          <Text style={styles.subDetail}>Prof. EL HASSANI • Salle Labo 3</Text>

          <View style={styles.divider} />

          {/* Ligne 3 : Durée */}
          <View style={styles.cardRowBetween}>
            <Text style={styles.label}>Durée</Text>
            <Text style={styles.valueBold}>1h 45min (90 min)</Text>
          </View>

          <View style={styles.divider} />

          {/* Ligne 4 : Statut général avec pastille */}
          <View style={styles.cardRowBetween}>
            <Text style={styles.label}>Statut général</Text>
            <View style={styles.statusRow}>
              <View style={styles.amberDot} />
              <Text style={styles.statusText}>Non justifiée</Text>
            </View>
          </View>
        </View>

        {/* Boîte d'information pastel bleue (style du screenshot) */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Vous avez jusqu'à 48h après la séance pour déposer un certificat médical ou justificatif officiel (max 5 Mo).
          </Text>
        </View>

        {/* Section Collègues / Groupe (comme sur le screenshot) */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Situation du groupe GI4-A</Text>
          <Text style={styles.cardSectionSub}>
            Taux d'assiduité global de la promotion : <Text style={styles.boldText}>94%</Text>
          </Text>

          <View style={styles.tableRow}>
            <Text style={styles.tableCellLabel}>Statut d'assiduité</Text>
            <Text style={styles.tableCellVal}>En règle</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCellLabel}>Justificatif déposé</Text>
            <Text style={[styles.tableCellVal, { color: theme.colors.textMuted }]}>Aucun fichier</Text>
          </View>
        </View>

        {/* Boutons d'Action Inférieurs (Exacte reproduction du screenshot) */}
        <View style={styles.actionButtonGroup}>
          {/* Bouton Sombre Midnight Navy (Demander / Approuver) */}
          <TouchableOpacity
            style={styles.primaryDarkButton}
            onPress={() => alert('Ouverture du sélecteur de justificatif (US06 - PDF/Photo max 5 Mo)')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryDarkButtonText}>Déposer un justificatif</Text>
          </TouchableOpacity>

          {/* Boutons Secondaires (Annuler / Refuser) */}
          <View style={styles.secondaryButtonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => alert('Affichage de l\'emploi du temps complet (US12)')}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Mon Emploi du temps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, styles.buttonDangerOutline]}
              onPress={onLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonDangerText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 18,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...theme.shadows.soft,
  },
  avatarLargeText: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textMain,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.3,
  },
  profileRole: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
    marginBottom: 16,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  mintBadge: {
    backgroundColor: theme.colors.mintBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  mintBadgeText: {
    color: theme.colors.mintText,
    fontSize: 12,
    fontWeight: '700',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textMain,
    marginTop: 6,
  },
  courseValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginTop: 4,
  },
  subDetail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  valueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.roseText,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.roseText,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.cardBorderSubtle,
    marginVertical: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.infoBoxBg,
    borderWidth: 1,
    borderColor: theme.colors.infoBoxBorder,
    borderRadius: theme.radius.md,
    padding: 14,
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
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  cardSectionSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '700',
    color: theme.colors.textMain,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorderSubtle,
  },
  tableCellLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  tableCellVal: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMain,
  },
  actionButtonGroup: {
    marginTop: 6,
    gap: 10,
  },
  primaryDarkButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  primaryDarkButtonText: {
    color: theme.colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.secondaryButton,
    borderWidth: 1,
    borderColor: theme.colors.secondaryButtonBorder,
    borderRadius: theme.radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.textMain,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonDangerOutline: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  buttonDangerText: {
    color: theme.colors.roseText,
    fontSize: 13,
    fontWeight: '700',
  },
});
