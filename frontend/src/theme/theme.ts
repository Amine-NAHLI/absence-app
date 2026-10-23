/**
 * Design System — Linear & Vercel Minimalist (Light Edition)
 * Inspiré des grandes applications professionnelles (Linear, Vercel, Stripe) :
 * - Fond gris technique clair et reposant (#F8FAFC)
 * - Cartes en blanc pur (#FFFFFF) avec bordures ultra-fines (#E2E8F0)
 * - Typographie contrastée ardoise (#0F172A) et gris neutre (#64748B)
 * - Indicateurs d'état nets (Émeraude, Ambre, Crimson) sans fioritures
 * - Zéro emoji : utilisation exclusive de micro-indicateurs et d'icônes vectorielles
 */

export const theme = {
  colors: {
    // Surfaces & Fonds
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    cardBorder: '#E2E8F0',
    cardBorderSubtle: '#F1F5F9',
    divider: '#EDF2F7',

    // Teinte Primaire & Actions
    primaryDark: '#0F172A',         // Slate 900
    primaryDarkHover: '#1E293B',    // Slate 800
    primaryAccent: '#2563EB',       // Corporate Blue
    primaryAccentBg: '#EFF6FF',

    // Boutons Secondaires
    secondaryButtonBg: '#F8FAFC',
    secondaryButtonBorder: '#E2E8F0',
    secondaryButtonText: '#334155',

    // Typographie
    textMain: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textLight: '#94A3B8',
    textWhite: '#FFFFFF',

    // Indicateurs Sémantiques (Présences, Absences, Retards)
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

    // Badges neutres
    neutralBadgeBg: '#F1F5F9',
    neutralBadgeBorder: '#E2E8F0',
    neutralBadgeText: '#334155',

    // Boîte d'information & Alertes
    infoBoxBg: '#F0F9FF',
    infoBoxBorder: '#BAE6FD',
    infoBoxText: '#0369A1',

    // Champs de Saisie
    inputBg: '#FFFFFF',
    inputBorder: '#CBD5E1',
    inputBorderFocused: '#0F172A',
    placeholder: '#94A3B8',

    // Alias pour rétro-compatibilité
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
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 999,
  },

  shadows: {
    none: {},
    subtle: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    soft: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
  },
};

export default theme;
