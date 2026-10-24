/**
 * Design System — FinTech Apple Clean (Light Edition)
 * Inspiré d'Apple iOS & Revolut :
 * - Sécurisation Safe Area native anti-collision d'horloge
 * - Fond gris perle reposant (#F8FAFC) et cartes en blanc pur (#FFFFFF)
 * - Typographie contrastée Slate 900 (#0B132B) et Slate 600 (#475569)
 * - Indicateurs sémantiques doux (Émeraude #10B981, Carmin #EF4444, Ambre #F59E0B)
 * - Grilles métriques aérées à 2 colonnes pour éliminer tout tronquage de texte
 * - Zéro émoji : icônes vectorielles Feather et micro-indicateurs professionnels
 */

import { Platform, StatusBar } from 'react-native';

export const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

export const theme = {
  colors: {
    // Fond & Surfaces
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    cardBorder: '#E2E8F0',
    cardBorderSubtle: '#F1F5F9',
    divider: '#EDF2F7',

    // Identité Institutionnelle & Actions
    primaryDark: '#0B132B',         // Deep Navy Apple
    primaryDarkHover: '#1C2541',
    primaryAccent: '#2563EB',       // Blue Apple
    primaryAccentBg: '#EFF6FF',

    // Boutons & Surfaces Secondaires
    secondaryButtonBg: '#F8FAFC',
    secondaryButtonBorder: '#E2E8F0',
    secondaryButtonText: '#334155',

    // Typographie Haute Lisibilité
    textMain: '#0B132B',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textLight: '#94A3B8',
    textWhite: '#FFFFFF',

    // Indicateurs Sémantiques
    presentBg: '#ECFDF5',
    presentBorder: '#A7F3D0',
    presentText: '#065F46',
    presentDot: '#10B981',

    absentBg: '#FEF2F2',
    absentBorder: '#FECACA',
    absentText: '#991B1B',
    absentDot: '#EF4444',

    pendingBg: '#FFFBEB',
    pendingBorder: '#FDE68A',
    pendingText: '#92400E',
    pendingDot: '#F59E0B',

    // Badges Neutres
    neutralBadgeBg: '#F1F5F9',
    neutralBadgeBorder: '#E2E8F0',
    neutralBadgeText: '#334155',

    // Boîte d'information & Alertes
    infoBoxBg: '#F0F9FF',
    infoBoxBorder: '#BAE6FD',
    infoBoxText: '#0369A1',

    // Formulaires & Inputs
    inputBg: '#F8FAFC',
    inputBorder: '#CBD5E1',
    inputBorderFocused: '#0B132B',
    placeholder: '#94A3B8',

    // Rétrocompatibilité
    mintBg: '#ECFDF5',
    mintText: '#065F46',
    blueBg: '#EFF6FF',
    blueText: '#2563EB',
    amberBg: '#FFFBEB',
    amberText: '#92400E',
    roseBg: '#FEF2F2',
    roseText: '#991B1B',
    secondaryButton: '#FFFFFF',
  },

  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999,
  },

  shadows: {
    none: {},
    subtle: {
      shadowColor: '#0B132B',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    soft: {
      shadowColor: '#0B132B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    card: {
      shadowColor: '#0B132B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
    },
  },
};

export default theme;
