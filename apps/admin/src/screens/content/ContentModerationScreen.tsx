import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post, formatRelativeTime } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchFlaggedContent, approveContent, removeContent, pinContent } from '../../store/slices/contentSlice';

const COLORS = { bg: '#F7FAFC', card: '#fff', primary: '#2D3748', accent: '#48BB78', border: '#E2E8F0', subtext: '#718096', danger: '#E53E3E', warning: '#DD6B20' };

function ContentCard({ post, onApprove, onRemove, onPin }: { post: Post; onApprove: () => void; onRemove: () => void; onPin: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.flaggedBadge}>
          <Ionicons name="flag" size={12} color={COLORS.danger} />
          <Text style={styles.flaggedText}>FLAGGED</Text>
        </View>
        <Text style={styles.cardTime}>{formatRelativeTime(post.createdAt)}</Text>
      </View>
      <Text style={styles.cardTitle}>{post.title}</Text>
      <Text style={styles.cardContent} numberOfLines={3}>{post.content}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.cardAuthor}>by {post.author.displayName} · {post.author.neighborhood}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.approveButton} onPress={onApprove}>
          <Ionicons name="checkmark" size={16} color={COLORS.accent} />
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pinButton} onPress={onPin}>
          <Ionicons name="pin-outline" size={16} color='#805AD5' />
          <Text style={styles.pinButtonText}>Pin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ContentModerationScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { flaggedPosts, isLoading } = useSelector((s: RootState) => s.content);

  useEffect(() => { dispatch(fetchFlaggedContent({ page: 1 })); }, []);

  const handleRemove = (postId: string) => {
    Alert.alert('Remove Content', 'Enter removal reason:', [
      { text: 'Spam', onPress: () => dispatch(removeContent({ postId, reason: 'spam' })) },
      { text: 'Inappropriate', onPress: () => dispatch(removeContent({ postId, reason: 'inappropriate' })) },
      { text: 'Misinformation', onPress: () => dispatch(removeContent({ postId, reason: 'misinformation' })) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsBar}>
        <Ionicons name="shield" size={18} color={COLORS.warning} />
        <Text style={styles.statsText}>{flaggedPosts.length} item{flaggedPosts.length !== 1 ? 's' : ''} pending review</Text>
      </View>
      <FlatList
        data={flaggedPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContentCard
            post={item}
            onApprove={() => dispatch(approveContent(item.id))}
            onRemove={() => handleRemove(item.id)}
            onPin={() => dispatch(pinContent(item.id))}
          />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchFlaggedContent({ page: 1 }))} tintColor={COLORS.accent} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark" size={64} color={COLORS.accent} />
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptyText}>No flagged content to review.</Text>
          </View>
        ) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  statsBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFAF0', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statsText: { fontSize: 14, fontWeight: '600', color: COLORS.warning },
  list: { padding: 16 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: COLORS.danger, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  flaggedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF5F5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  flaggedText: { fontSize: 10, fontWeight: '700', color: COLORS.danger },
  cardTime: { fontSize: 12, color: COLORS.subtext },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  cardContent: { fontSize: 14, color: COLORS.subtext, lineHeight: 20, marginBottom: 8 },
  cardMeta: { marginBottom: 14 },
  cardAuthor: { fontSize: 12, color: COLORS.subtext },
  actions: { flexDirection: 'row', gap: 8 },
  approveButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#F0FFF4', borderRadius: 10, paddingVertical: 10, borderWidth: 1.5, borderColor: COLORS.accent },
  approveButtonText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  pinButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#FAF5FF', borderRadius: 10, paddingVertical: 10, borderWidth: 1.5, borderColor: '#805AD5' },
  pinButtonText: { color: '#805AD5', fontWeight: '700', fontSize: 13 },
  removeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#FFF5F5', borderRadius: 10, paddingVertical: 10, borderWidth: 1.5, borderColor: COLORS.danger },
  removeButtonText: { color: COLORS.danger, fontWeight: '700', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primary, marginTop: 16 },
  emptyText: { fontSize: 15, color: COLORS.subtext, marginTop: 8 },
});
