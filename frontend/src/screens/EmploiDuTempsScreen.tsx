import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EmploiDuTemps, SeancePlanning } from '../types/academic';
import { getEmploiDuTempsEtudiant, getEmploiDuTempsGroupe } from '../services/absenceService';
import { theme } from '../theme/theme';

interface EmploiDuTempsScreenProps {
  etudiantId?: number;
  groupeId?: number;
  classeName?: string;
  onBack?: () => void;
}

const JOURS = [
  { key: 'LUNDI', label: 'Lun', fullLabel: 'Lundi' },
  { key: 'MARDI', label: 'Mar', fullLabel: 'Mardi' },
  { key: 'MERCREDI', label: 'Mer', fullLabel: 'Mercredi' },
  { key: 'JEUDI', label: 'Jeu', fullLabel: 'Jeudi' },
  { key: 'VENDREDI', label: 'Ven', fullLabel: 'Vendredi' },
  { key: 'SAMEDI', label: 'Sam', fullLabel: 'Samedi' },
];

export const EmploiDuTempsScreen: React.FC<EmploiDuTempsScreenProps> = ({
  etudiantId,
  groupeId,
  classeName,
  onBack,
}) => {
  const [emploiDuTemps, setEmploiDuTemps] = useState<EmploiDuTemps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Jour sélectionné (Lundi par défaut ou aujourd'hui si semaine)
  const currentDayIndex = new Date().getDay(); // 0 = Dimanche, 1 = Lundi
  const defaultDayKey =
    currentDayIndex >= 1 && currentDayIndex <= 6
      ? JOURS[currentDayIndex - 1].key
      : 'LUNDI';

  const [selectedDay, setSelectedDay] = useState<string>(defaultDayKey);

  useEffect(() => {
    loadEmploiDuTemps();
  }, [etudiantId, groupeId]);

  const loadEmploiDuTemps = async () => {
    setLoading(true);
    try {
      let data: EmploiDuTemps | null = null;
      if (etudiantId) {
        data = await getEmploiDuTempsEtudiant(etudiantId);
      } else if (groupeId) {
        data = await getEmploiDuTempsGroupe(groupeId);
      }
      setEmploiDuTemps(data);
    } catch {
      setEmploiDuTemps(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const seancesDuJour = (emploiDuTemps?.seances || []).filter(
    (s) => s.jourSemaine?.toUpperCase() === selectedDay
  );

  const getTypeBadgeStyle = (type: string) => {
    const t = type.toUpperCase();
    if (t === 'TP') return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' };
    if (t === 'TD') return { bg: '#FDF4FF', border: '#F5D0FE', text: '#A21CAF' };
    return { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D' };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header Minimaliste & Professionnel */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Feather name="arrow-left" size={20} color="#0F172A" />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerTitle}>Emploi du Temps</Text>
            <Text style={styles.headerSubtitle}>
              {emploiDuTemps?.groupeCode || classeName || 'Classe GI4-A'} • Semaine Académique
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={loadEmploiDuTemps}>
          <Feather name="rotate-cw" size={17} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* 2. Barre de Sélection des Jours (Lun à Sam) */}
      <View style={styles.daySelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorContent}
        >
          {JOURS.map((item) => {
            const isSelected = selectedDay === item.key;
            const countForDay = (emploiDuTemps?.seances || []).filter(
              (s) => s.jourSemaine?.toUpperCase() === item.key
            ).length;

            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.dayChip, isSelected && styles.dayChipActive]}
                onPress={() => setSelectedDay(item.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayChipLabel, isSelected && styles.dayChipLabelActive]}>
                  {item.label}
                </Text>
                <Text style={[styles.dayChipSub, isSelected && styles.dayChipSubActive]}>
                  {item.fullLabel}
                </Text>
                {countForDay > 0 && (
                  <View style={[styles.dayCountDot, isSelected && styles.dayCountDotActive]}>
                    <Text style={[styles.dayCountText, isSelected && styles.dayCountTextActive]}>
                      {countForDay}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Contenu : Grille des Séances */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Chargement du planning hebdomadaire...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadEmploiDuTemps();
              }}
              colors={['#2563EB']}
            />
          }
        >
          {seancesDuJour.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Feather name="calendar" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>Aucun cours prévu</Text>
              <Text style={styles.emptySub}>
                Aucune séance programmée pour {JOURS.find((j) => j.key === selectedDay)?.fullLabel}. Profitez-en pour réviser !
              </Text>
            </View>
          ) : (
            seancesDuJour.map((seance, index) => {
              const badgeStyle = getTypeBadgeStyle(seance.typeSeance || 'COURS');

              return (
                <View
                  key={seance.seanceId || index}
                  style={[
                    styles.sessionCard,
                    seance.estEnCours && styles.sessionCardActive,
                  ]}
                >
                  {/* Ruban latéral horaire */}
                  <View style={styles.timeSidebar}>
                    <Text style={styles.timeStart}>{seance.heureDebut?.substring(0, 5)}</Text>
                    <View style={styles.timeDividerLine} />
                    <Text style={styles.timeEnd}>{seance.heureFin?.substring(0, 5)}</Text>
                  </View>

                  {/* Corps de la carte de séance */}
                  <View style={styles.sessionBody}>
                    <View style={styles.sessionHeaderRow}>
                      <View style={[styles.typeBadge, { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }]}>
                        <Text style={[styles.typeBadgeText, { color: badgeStyle.text }]}>
                          {seance.typeSeance || 'COURS'}
                        </Text>
                      </View>

                      {seance.estEnCours && (
                        <View style={styles.liveNowBadge}>
                          <View style={styles.livePulsingDot} />
                          <Text style={styles.liveNowText}>EN COURS</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.matiereTitle}>
                      {seance.matiereNom}
                    </Text>

                    <Text style={styles.profText}>
                      <Feather name="user" size={13} color="#64748B" /> {seance.enseignantNom}
                    </Text>

                    <View style={styles.sessionFooterRow}>
                      <View style={styles.sallePill}>
                        <Feather name="map-pin" size={12} color="#2563EB" />
                        <Text style={styles.sallePillText}>{seance.salle || 'Salle non assignée'}</Text>
                      </View>

                      <View style={styles.moduleCodePill}>
                        <Text style={styles.moduleCodeText}>{seance.matiereCode}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  daySelectorContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    minWidth: 70,
  },
  dayChipActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  dayChipLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  dayChipLabelActive: {
    color: '#FFFFFF',
  },
  dayChipSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  dayChipSubActive: {
    color: '#94A3B8',
  },
  dayCountDot: {
    marginTop: 4,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  dayCountDotActive: {
    backgroundColor: '#334155',
  },
  dayCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  dayCountTextActive: {
    color: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionCardActive: {
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  timeSidebar: {
    width: 76,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  timeStart: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeDividerLine: {
    width: 2,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  timeEnd: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  sessionBody: {
    flex: 1,
    padding: 14,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  livePulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveNowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  matiereTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  profText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  sessionFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sallePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  sallePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  moduleCodePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moduleCodeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
