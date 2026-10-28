/**
 * Design System — Mobile Luxe & Neo-Minimaliste
 * Inspiré du design Figma Mobile Clothing & Luxury Store :
 * - Noir Onyx d'exception (#111111) et Blanc pur (#FFFFFF)
 * - Fond gris perle ultra-doux (#F9FAFB)
 * - Formes « Pilule » (Pill shapes : borderRadius 9999) pour tous les boutons & filtres
 * - Cartes généreusement arrondies (borderRadius 24 - 30)
 * - Ombres douces et diffuses à faible opacité (Soft Ambient Shadows)
 * - Typographie contrastée haute fidélité
 */

import { Platform, StatusBar } from 'react-native';

export const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

export const theme = {
  colors: {
    // Fond & Surfaces
    background: '#F9FAFB',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    cardBorder: '#E5E7EB',
    cardBorderSubtle: '#F3F4F6',
    divider: '#F4F4F5',

    // Identité Luxe / Minimaliste (Onyx Black & Contrôles)
    primaryDark: '#111111',         // Noir Onyx Figma
    primaryDarkHover: '#27272A',
    primaryAccent: '#18181B',
    primaryAccentBg: '#F4F4F5',

    // Boutons & Surfaces Secondaires
    secondaryButtonBg: '#F4F4F5',
    secondaryButtonBorder: '#E4E4E7',
    secondaryButtonText: '#18181B',

    // Typographie Haute Lisibilité
    textMain: '#111111',
    textSecondary: '#52525B',
    textMuted: '#71717A',
    textLight: '#A1A1AA',
    textWhite: '#FFFFFF',

    // Indicateurs Sémantiques (Touches douces)
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
    neutralBadgeBg: '#F4F4F5',
    neutralBadgeBorder: '#E4E4E7',
    neutralBadgeText: '#27272A',

    // Boîte d'information & Alertes
    infoBoxBg: '#F0F9FF',
    infoBoxBorder: '#BAE6FD',
    infoBoxText: '#0369A1',

    // Formulaires & Inputs
    inputBg: '#F9FAFB',
    inputBorder: '#E4E4E7',
    inputBorderFocused: '#111111',
    placeholder: '#A1A1AA',

    // Rétrocompatibilité
    mintBg: '#ECFDF5',
    mintText: '#065F46',
    blueBg: '#F4F4F5',
    blueText: '#18181B',
    amberBg: '#FFFBEB',
    amberText: '#92400E',
    roseBg: '#FEF2F2',
    roseText: '#991B1B',
    secondaryButton: '#FFFFFF',
  },

  radius: {
    xs: 8,
    sm: 12,
    md: 18,
    lg: 24,       // Cartes Figma
    xl: 30,       // Grands conteneurs
    pill: 9999,   // Boutons et chips pleins
  },

  shadows: {
    none: {},
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 1,
    },
    soft: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 18,
      elevation: 3,
    },
  },
};

export default theme;
