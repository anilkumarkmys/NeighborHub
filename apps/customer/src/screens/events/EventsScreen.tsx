import React, { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, Event, formatRelativeTime } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchEvents, rsvpEvent } from '../../store/slices/eventsSlice';
import { EventsStackParamList } from '../../navigation/MainNavigator';

type NavProp = NativeStackNavigationProp<EventsStackParamList, 'EventsScreen'>;

function EventCard({ event, onPress, onRsvp }: { event: Event; onPress: () => void; onRsvp: () => void }) {
  const statusColors = { upcoming: COLORS.primary, ongoing: COLORS.success, past: COLORS.textSecondary, cancelled: COLORS.error };
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      {event.coverImage ? (
        <Image source={{ uri: event.coverImage }} style={styles.coverImage} />
      ) : (
        <View style={[styles.coverImagePlaceholder]}>
          <Text style={styles.coverImageIcon}>🎉</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColors[event.status]}18` }]}>
            <Text style={[styles.statusText, { color: statusColors[event.status] }]}>
              {event.status.toUpperCase()}
            </Text>
          </View>
          {event.isOnline && (
            <View style={styles.onlineBadge}>
              <Ionicons name="videocam" size={12} color={COLORS.info} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>{event.location.address || 'Location TBD'}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.rsvpCount}>
            <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.rsvpCountText}>{event.rsvpCount} going</Text>
          </View>
          {event.status === 'upcoming' && (
            <TouchableOpacity
              style={[styles.rsvpButton, event.isRsvpedByMe && styles.rsvpButtonActive]}
              onPress={onRsvp}
            >
              <Text style={[styles.rsvpButtonText, event.isRsvpedByMe && styles.rsvpButtonTextActive]}>
                {event.isRsvpedByMe ? '✓ Going' : 'RSVP'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function EventsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavProp>();
  const { events, isLoading, hasMore, page } = useSelector((s: RootState) => s.events);

  useEffect(() => { dispatch(fetchEvents({ page: 1, refresh: true })); }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) dispatch(fetchEvents({ page: page + 1 }));
  }, [isLoading, hasMore, page]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateEvent')}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
            onRsvp={() => dispatch(rsvpEvent(item.id))}
          />
        )}
        refreshControl={<RefreshControl refreshing={isLoading && page === 1} onRefresh={() => dispatch(fetchEvents({ page: 1, refresh: true }))} tintColor={COLORS.primary} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isLoading && page > 1 ? <ActivityIndicator color={COLORS.primary} style={{ padding: 20 }} /> : null}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No Events Yet</Text>
            <Text style={styles.emptyText}>Be the first to host an event in your neighborhood!</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('CreateEvent')}>
              <Text style={styles.emptyButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  createButton: { backgroundColor: COLORS.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10 },
  coverImage: { width: '100%', height: 160 },
  coverImagePlaceholder: { width: '100%', height: 120, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  coverImageIcon: { fontSize: 48 },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${COLORS.info}18`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  onlineText: { fontSize: 11, fontWeight: '700', color: COLORS.info },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  detailText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  rsvpCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rsvpCountText: { fontSize: 13, color: COLORS.textSecondary },
  rsvpButton: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 },
  rsvpButtonActive: { backgroundColor: COLORS.primaryLight, borderWidth: 1.5, borderColor: COLORS.primary },
  rsvpButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rsvpButtonTextActive: { color: COLORS.primary },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  emptyButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  emptyButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
