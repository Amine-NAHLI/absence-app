import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    <View style={styles.container}>
      {/* Côté Gauche : Icône Menu épurée & Titre institutionnel */}
      <View style={styles.leftGroup}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="menu" size={19} color={theme.colors.textMain} />
        </TouchableOpacity>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {/* Côté Droit : Recherche, Cloche Notifications & Avatar Pro */}
      <View style={styles.rightGroup}>
        {/* Recherche */}
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="search" size={17} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="bell" size={17} color={theme.colors.textSecondary} />
          {showNotificationDot && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        {/* Bouton Déconnexion Direct */}
        {onLogout && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.7}
            accessibilityLabel="Déconnexion"
          >
            <Feather name="log-out" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Avatar Utilisateur Corporate */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitial.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleColumn: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textMain,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  logoutButton: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
