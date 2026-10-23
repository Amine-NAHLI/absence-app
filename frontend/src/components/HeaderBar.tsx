import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme/theme';

interface HeaderBarProps {
  title?: string;
  userInitial?: string;
  onLogout?: () => void;
  showNotificationDot?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title = 'UPF Absence',
  userInitial = 'U',
  onLogout,
  showNotificationDot = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Côté Gauche : Icône Menu Hamburger */}
      <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
        <View style={styles.hamburger}>
          <View style={styles.hamburgerLine} />
          <View style={[styles.hamburgerLine, { width: 14 }]} />
          <View style={styles.hamburgerLine} />
        </View>
      </TouchableOpacity>

      {/* Centre : Titre / Marque */}
      <Text style={styles.title}>{title}</Text>

      {/* Côté Droit : Recherche, Cloche Notifications & Avatar */}
      <View style={styles.rightGroup}>
        {/* Loupe recherche */}
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Text style={styles.symbolIcon}>🔍</Text>
        </TouchableOpacity>

        {/* Cloche avec pastille */}
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Text style={styles.symbolIcon}>🔔</Text>
          {showNotificationDot && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        {/* Avatar Utilisateur */}
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>{userInitial.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
  },
  hamburger: {
    gap: 4,
    justifyContent: 'center',
  },
  hamburgerLine: {
    width: 18,
    height: 2.2,
    backgroundColor: theme.colors.textMain,
    borderRadius: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textMain,
    letterSpacing: -0.3,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    padding: 6,
    position: 'relative',
  },
  symbolIcon: {
    fontSize: 16,
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.roseText,
    borderWidth: 1.5,
    borderColor: theme.colors.background,
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3730A3',
  },
});
