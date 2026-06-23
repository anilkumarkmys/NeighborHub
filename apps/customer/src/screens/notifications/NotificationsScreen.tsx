import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, Notification, formatRelativeTime } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchNotifications, markAllRead } from '../../store/slices/notificationsSlice';

const NOTIFICATION_ICONS: Record<string, { icon: string; color: string }> = {
  reply: { icon: 'chatbubble', color: COLORS.primary },
  thank: { icon: 'heart', color: '#E53E3E' },
  mention: { icon: 'at', color: COLORS.info },
  event: { icon: 'calendar', color: COLORS.event },
  safety_alert: { icon: 'shield', color: COLORS.safety },
  system: { icon: 'information-circle', color: COLORS.textSecondary },
  message: { icon: 'mail', color: COLORS.primary },
};

export default function NotificationsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, isLoading, unreadCount } = useSelector((s: RootState) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, []);

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllRead} onPress={() => dispatch(markAllRead())}>
          <Text style={styles.markAllReadText}>Mark all as read ({unreadCount})</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchNotifications())} tintColor={COLORS.primary} />}
        renderItem={({ item }) => {
          const config = NOTIFICATION_ICONS[item.type] || NOTIFICATION_ICONS.system;
          return (
            <TouchableOpacity style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}>
              <View style={[styles.notifIcon, { backgroundColor: `${config.color}15` }]}>
                <Ionicons name={config.icon as never} size={22} color={config.color} />
              </View>
              <View style={styles.notifContent}>
                <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>{item.title}</Text>
                <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.notifTime}>{formatRelativeTime(item.createdAt)}</Text>
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyText}>You're all caught up!</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  markAllRead: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'flex-end' },
  markAllReadText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', padding: 16 },
  notifItemUnread: { backgroundColor: COLORS.primaryLight },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, color: COLORS.text, marginBottom: 3 },
  notifTitleUnread: { fontWeight: '700' },
  notifBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 12, color: COLORS.textSecondary },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginTop: 4, marginLeft: 8 },
  separator: { height: 1, backgroundColor: COLORS.divider },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
});
