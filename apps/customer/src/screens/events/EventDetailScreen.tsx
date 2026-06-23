import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, Event } from '@nextdoor-clone/shared';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { rsvpEvent } from '../../store/slices/eventsSlice';
import { EventsStackParamList } from '../../navigation/MainNavigator';
import apiClient from '../../services/api';

type RoutePropType = RouteProp<EventsStackParamList, 'EventDetail'>;

export default function EventDetailScreen() {
  const route = useRoute<RoutePropType>();
  const dispatch = useDispatch<AppDispatch>();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    apiClient.get(`/events/${route.params.eventId}`)
      .then((res) => setEvent(res.data.data))
      .catch(() => Alert.alert('Error', 'Failed to load event'));
  }, [route.params.eventId]);

  if (!event) return null;

  return (
    <ScrollView style={styles.container}>
      {event.coverImage ? (
        <Image source={{ uri: event.coverImage }} style={styles.cover} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.coverIcon}>🎉</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.hostRow}>
          <View style={styles.hostAvatar}>
            <Text style={styles.hostAvatarText}>{event.host.displayName[0]}</Text>
          </View>
          <Text style={styles.hostText}>Hosted by <Text style={styles.hostName}>{event.host.displayName}</Text></Text>
        </View>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}><Ionicons name="calendar" size={20} color={COLORS.primary} /></View>
            <View>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{new Date(event.startDate).toLocaleString()}</Text>
              {event.endDate && <Text style={styles.detailSubValue}>Until {new Date(event.endDate).toLocaleTimeString()}</Text>}
            </View>
          </View>
          <View style={[styles.detailRow, styles.detailRowBorder]}>
            <View style={styles.detailIcon}><Ionicons name="location" size={20} color={COLORS.primary} /></View>
            <View>
              <Text style={styles.detailLabel}>{event.isOnline ? 'Online Event' : 'Location'}</Text>
              <Text style={styles.detailValue}>{event.location.address || 'Address TBD'}</Text>
            </View>
          </View>
          <View style={[styles.detailRow, styles.detailRowBorder]}>
            <View style={styles.detailIcon}><Ionicons name="people" size={20} color={COLORS.primary} /></View>
            <View>
              <Text style={styles.detailLabel}>Attendees</Text>
              <Text style={styles.detailValue}>
                {event.rsvpCount} going{event.maxAttendees ? ` · ${event.maxAttendees} max` : ''}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{event.description}</Text>
        {event.status === 'upcoming' && (
          <TouchableOpacity
            style={[styles.rsvpButton, event.isRsvpedByMe && styles.rsvpButtonActive]}
            onPress={() => dispatch(rsvpEvent(event.id))}
          >
            <Ionicons name={event.isRsvpedByMe ? 'checkmark-circle' : 'calendar'} size={22} color={event.isRsvpedByMe ? COLORS.primary : '#fff'} />
            <Text style={[styles.rsvpButtonText, event.isRsvpedByMe && styles.rsvpButtonTextActive]}>
              {event.isRsvpedByMe ? "You're Going!" : 'RSVP to this Event'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  cover: { width: '100%', height: 240 },
  coverPlaceholder: { width: '100%', height: 180, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  coverIcon: { fontSize: 64 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  hostAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  hostAvatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  hostText: { fontSize: 14, color: COLORS.textSecondary },
  hostName: { color: COLORS.text, fontWeight: '700' },
  detailsCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, gap: 14 },
  detailRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.divider },
  detailIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  detailSubValue: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  description: { fontSize: 15, color: COLORS.text, lineHeight: 24, marginBottom: 24 },
  rsvpButton: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  rsvpButtonActive: { backgroundColor: COLORS.primaryLight, borderWidth: 1.5, borderColor: COLORS.primary },
  rsvpButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  rsvpButtonTextActive: { color: COLORS.primary },
});
