import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  userInitial?: string;
  onLogout?: () => void;
  showNotificationDot?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title = 'UPF Absence',
  subtitle,
  userInitial = 'U',
  onLogout,
  showNotificationDot = true,
}) => {
  return (
    <View style={styles.headerWrapper}>
      
      {/* 1. Ligne Supérieure : Marque Institutionnelle UPF & Date / Badge */}
      <View style={styles.topBrandingRow}>
        <View style={styles.universityBadge}>
          <View style={styles.universityDot} />
          <Text style={styles.universityBadgeText}>UNIVERSITÉ PRIVÉE DE FÈS</Text>
        </View>
        {subtitle && (
          <View style={styles.roleChip}>
            <Text style={styles.roleChipText} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        )}
      </View>

      {/* 2. Ligne Principale : Titre & Actions Tactiles Aérées */}
      <View style={styles.mainNavRow}>
        {/* Titre de l'espace */}
        <View style={styles.titleColumn}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {title}
          </Text>
        </View>

        {/* Boutons d'action Apple FinTech */}
        <View style={styles.actionsRow}>
          {/* Recherche */}
          <TouchableOpacity 
            style={styles.actionCircleButton} 
            activeOpacity={0.7}
            accessibilityLabel="Rechercher"
          >
            <Feather name="search" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Notifications avec pastille */}
          <TouchableOpacity 
            style={styles.actionCircleButton} 
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Feather name="bell" size={16} color={theme.colors.textSecondary} />
            {showNotificationDot && <View style={styles.notificationBadgeDot} />}
          </TouchableOpacity>

          {/* Déconnexion directe */}
          {onLogout && (
            <TouchableOpacity
              style={styles.actionCircleButton}
              onPress={onLogout}
              activeOpacity={0.7}
              accessibilityLabel="Déconnexion"
            >
              <Feather name="log-out" size={15} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Avatar Utilisateur FinTech */}
          <View style={styles.avatarPill}>
            <Text style={styles.avatarLetter}>{userInitial.toUpperCase()}</Text>
          </View>
        </View>
      </View>

    </View>
  );
};

const ANDROID_STATUSBAR = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
    paddingTop: ANDROID_STATUSBAR + 10,
    paddingBottom: 12,
    paddingHorizontal: 18,
    ...theme.shadows.subtle,
  },
  topBrandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  universityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  universityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primaryAccent,
  },
  universityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
  },
  roleChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.2,
  },
  mainNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleColumn: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  actionCircleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  avatarPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  avatarLetter: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
