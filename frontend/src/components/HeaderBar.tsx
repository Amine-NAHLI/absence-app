import React from 'react';
import { Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  title = '7ader',
  subtitle,
  userInitial = 'U',
  onLogout,
  showNotificationDot = true,
}) => {
  return (
    <View style={styles.headerWrapper}>
      
      {/* 1. Ligne Supérieure : Logo Officiel UPF & 7ader & Badge Rôle */}
      <View style={styles.topBrandingRow}>
        <View style={styles.universityBadge}>
          <Image 
            source={require('../../assets/upf_logo.png')} 
            style={styles.headerLogoImage} 
            resizeMode="contain" 
          />
          <View style={styles.brandDivider} />
          <View style={styles.brandRow}>
            <Text style={styles.brandTitleText}>7ader</Text>
            <View style={styles.brandDot} />
          </View>
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
    borderBottomColor: '#F4F4F5',
    paddingTop: ANDROID_STATUSBAR + 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
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
  },
  headerLogoImage: {
    width: 76,
    height: 24,
  },
  brandDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E4E4E7',
    marginHorizontal: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitleText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.4,
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  roleChip: {
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#18181B',
    letterSpacing: 0.2,
  },
  mainNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleColumn: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCircleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadgeDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  avatarPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111111',
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
