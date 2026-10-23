/**
 * 🎨 Design System — Absence App
 * Inspiré du design moderne SaaS/RH (style Deel / VacationTracker) :
 * - Cartes blanches épurées sur fond gris perle doux (#F7F8FA)
 * - Boutons principaux en Midnight Navy (#192138)
 * - Pastilles (badges) aux teintes pastel douces (Menthe, Ciel, Ambre, Corail)
 * - Typographie soignée, arrondis généreux (12-16px) et bordures délicates
 */

export const theme = {
  colors: {
    // Fond et Surfaces
    background: '#F7F8FA',
    card: '#FFFFFF',
    cardBorder: '#EAECEF',
    cardBorderSubtle: '#F1F3F5',

    // Boutons d'Action & Teinte Sombre Principale (Comme sur le screenshot)
    primaryDark: '#192138',
    primaryDarkPressed: '#0F1524',
    secondaryButton: '#FFFFFF',
    secondaryButtonBorder: '#D8DCE3',

    // Textes
    textMain: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textWhite: '#FFFFFF',

    // Pastilles & Badges Pastel (Pills)
    mintBg: '#E6F7F2',
    mintText: '#0D9488',

    blueBg: '#EFF6FF',
    blueText: '#2563EB',

    amberBg: '#FEF3C7',
    amberText: '#B45309',

    roseBg: '#FEE2E2',
    roseText: '#DC2626',

    // Boîte d'information pastel bleue (ex: "4 jours seront déduits...")
    infoBoxBg: '#F0F7FF',
    infoBoxBorder: '#D0E4FE',
    infoBoxText: '#1E40AF',

    // Inputs
    inputBg: '#FFFFFF',
    inputBorder: '#E2E8F0',
    inputBorderFocused: '#192138',
    placeholder: '#94A3B8',
  },

  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    pill: 999,
  },

  shadows: {
    soft: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
  },
};

export default theme;
