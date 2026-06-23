import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post, COLORS, formatRelativeTime, getInitials } from '@nextdoor-clone/shared';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { thankPost } from '../../store/slices/feedSlice';
import CategoryBadge from '../common/CategoryBadge';

interface PostCardProps {
  post: Post;
  onPress: () => void;
}

export default function PostCard({ post, onPress }: PostCardProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleThank = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    dispatch(thankPost(post.id));
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      {post.isPinnedByAdmin && (
        <View style={styles.pinnedBanner}>
          <Ionicons name="pin" size={12} color={COLORS.primary} />
          <Text style={styles.pinnedText}>Pinned by Admin</Text>
        </View>
      )}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          {post.author.avatar ? (
            <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(post.author.displayName)}</Text>
            </View>
          )}
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.author.displayName}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.neighborhood}>{post.author.neighborhood}</Text>
              <Text style={styles.dot}> · </Text>
              <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
            </View>
          </View>
        </View>
        <CategoryBadge category={post.category} />
      </View>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content} numberOfLines={3}>{post.content}</Text>
      {post.images && post.images.length > 0 && (
        <View style={styles.imageContainer}>
          {post.images.slice(0, 3).map((img, i) => (
            <Image key={i} source={{ uri: img }} style={[styles.image, post.images!.length === 1 && styles.imageSingle]} />
          ))}
          {post.images.length > 3 && (
            <View style={styles.moreImages}>
              <Text style={styles.moreImagesText}>+{post.images.length - 3}</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.action} onPress={handleThank}>
          <Ionicons
            name={post.isThankedByMe ? 'heart' : 'heart-outline'}
            size={18}
            color={post.isThankedByMe ? '#E53E3E' : COLORS.textSecondary}
          />
          <Text style={[styles.actionText, post.isThankedByMe && styles.actionTextActive]}>
            {post.thankCount > 0 ? `Thank (${post.thankCount})` : 'Thank'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Ionicons name="chatbubble-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>
            {post.replyCount > 0 ? `${post.replyCount} ${post.replyCount === 1 ? 'Reply' : 'Replies'}` : 'Reply'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Ionicons name="share-social-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8,
  },
  pinnedBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 10, alignSelf: 'flex-start',
  },
  pinnedText: { color: COLORS.primary, fontSize: 11, fontWeight: '600', marginLeft: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 10 },
  avatarPlaceholder: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarInitials: { color: '#fff', fontWeight: '700', fontSize: 14 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  neighborhood: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 2 },
  dot: { color: COLORS.textSecondary, fontSize: 12 },
  time: { fontSize: 12, color: COLORS.textSecondary },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  content: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 12 },
  imageContainer: { flexDirection: 'row', gap: 4, marginBottom: 12, borderRadius: 10, overflow: 'hidden' },
  image: { flex: 1, height: 160, borderRadius: 8 },
  imageSingle: { height: 220 },
  moreImages: {
    position: 'absolute', right: 0, bottom: 0, width: 80, height: 160,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderRadius: 8,
  },
  moreImagesText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  footer: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: 12, gap: 4 },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  actionTextActive: { color: '#E53E3E' },
});
