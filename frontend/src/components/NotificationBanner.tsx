import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NotificationItem } from '../types/academic';
import { theme } from '../theme/theme';

interface NotificationBannerProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
  onPress?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
  onPress,
}) => {
  const slideAnim = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (notification) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        handleClose();
      }, 7000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [notification]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  if (!notification) return null;

  const isRetard = notification.type === 'RETARD';

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.contentCard,
          isRetard ? styles.cardWarning : styles.cardDanger,
        ]}
        activeOpacity={0.9}
        onPress={onPress || handleClose}
      >
        <View style={styles.iconCircle}>
          <Feather
            name={isRetard ? 'clock' : 'alert-circle'}
            size={20}
            color={isRetard ? '#D97706' : '#DC2626'}
          />
        </View>

        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText} numberOfLines={1}>
              {notification.titre}
            </Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>EN DIRECT</Text>
            </View>
          </View>
          <Text style={styles.messageText} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={18} color="#64748B" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
  },
  cardDanger: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  cardWarning: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  liveBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});
