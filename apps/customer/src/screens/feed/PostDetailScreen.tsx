import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, formatRelativeTime, getInitials, Reply } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchPostById, thankPost, reportPost } from '../../store/slices/feedSlice';
import { FeedStackParamList } from '../../navigation/MainNavigator';
import CategoryBadge from '../../components/common/CategoryBadge';
import apiClient from '../../services/api';

type RoutePropType = RouteProp<FeedStackParamList, 'PostDetail'>;

export default function PostDetailScreen() {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPost } = useSelector((s: RootState) => s.feed);
  const { user } = useSelector((s: RootState) => s.auth);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchPostById(route.params.postId));
    loadReplies();
  }, [route.params.postId]);

  const loadReplies = async () => {
    try {
      const res = await apiClient.get(`/posts/${route.params.postId}/replies`);
      setReplies(res.data.data);
    } catch {
      // replies will remain empty
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.post(`/posts/${route.params.postId}/replies`, { content: replyText.trim() });
      setReplies((prev) => [...prev, res.data.data]);
      setReplyText('');
    } catch {
      Alert.alert('Error', 'Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = () => {
    Alert.alert('Report Post', 'Why are you reporting this post?', [
      { text: 'Spam', onPress: () => dispatch(reportPost({ postId: route.params.postId, reason: 'spam' })) },
      { text: 'Misinformation', onPress: () => dispatch(reportPost({ postId: route.params.postId, reason: 'misinformation' })) },
      { text: 'Inappropriate', onPress: () => dispatch(reportPost({ postId: route.params.postId, reason: 'inappropriate' })) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (!selectedPost) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.postHeader}>
          <View style={styles.authorRow}>
            <TouchableOpacity onPress={() => (navigation as never).navigate('NeighborProfile', { userId: selectedPost.authorId })}>
              {selectedPost.author.avatar ? (
                <Image source={{ uri: selectedPost.author.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{getInitials(selectedPost.author.displayName)}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{selectedPost.author.displayName}</Text>
              <Text style={styles.meta}>
                {selectedPost.author.neighborhood} · {formatRelativeTime(selectedPost.createdAt)}
              </Text>
            </View>
            <TouchableOpacity onPress={handleReport}>
              <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <CategoryBadge category={selectedPost.category} />
          <Text style={styles.title}>{selectedPost.title}</Text>
          <Text style={styles.postContent}>{selectedPost.content}</Text>
          {selectedPost.images && selectedPost.images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.images}>
              {selectedPost.images.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.image} />
              ))}
            </ScrollView>
          )}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => dispatch(thankPost(selectedPost.id))}
            >
              <Ionicons
                name={selectedPost.isThankedByMe ? 'heart' : 'heart-outline'}
                size={20}
                color={selectedPost.isThankedByMe ? '#E53E3E' : COLORS.textSecondary}
              />
              <Text style={styles.actionText}>Thank ({selectedPost.thankCount})</Text>
            </TouchableOpacity>
            <View style={styles.viewCount}>
              <Ionicons name="eye-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.viewCountText}>{selectedPost.viewCount} views</Text>
            </View>
          </View>
        </View>
        <View style={styles.repliesSection}>
          <Text style={styles.repliesHeader}>
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </Text>
          {replies.map((reply) => (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.replyAuthorRow}>
                <View style={styles.replyAvatar}>
                  <Text style={styles.replyAvatarText}>{getInitials(reply.author.displayName)}</Text>
                </View>
                <View style={styles.replyMeta}>
                  <Text style={styles.replyAuthorName}>{reply.author.displayName}</Text>
                  <Text style={styles.replyTime}>{formatRelativeTime(reply.createdAt)}</Text>
                </View>
              </View>
              <Text style={styles.replyContent}>{reply.content}</Text>
              <TouchableOpacity style={styles.thankReply}>
                <Ionicons name="heart-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.thankReplyText}>Thank{reply.thankCount > 0 ? ` (${reply.thankCount})` : ''}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.replyBar}>
        <View style={styles.replyAvatarSmall}>
          <Text style={styles.replyAvatarInitials}>{getInitials(user?.displayName || 'U')}</Text>
        </View>
        <TextInput
          style={styles.replyInput}
          placeholder="Write a reply..."
          value={replyText}
          onChangeText={setReplyText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!replyText.trim() || isSubmitting) && styles.sendButtonDisabled]}
          onPress={handleReply}
          disabled={!replyText.trim() || isSubmitting}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 20 },
  postHeader: { backgroundColor: COLORS.surface, padding: 16, marginBottom: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarInitials: { color: '#fff', fontWeight: '700', fontSize: 16 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 14, marginBottom: 10 },
  postContent: { fontSize: 16, color: COLORS.text, lineHeight: 24, marginBottom: 14 },
  images: { marginBottom: 14 },
  image: { width: 260, height: 180, borderRadius: 12, marginRight: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  viewCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewCountText: { fontSize: 13, color: COLORS.textSecondary },
  repliesSection: { backgroundColor: COLORS.surface, padding: 16 },
  repliesHeader: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  replyCard: { borderBottomWidth: 1, borderBottomColor: COLORS.divider, paddingBottom: 14, marginBottom: 14 },
  replyAuthorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  replyAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  replyAvatarText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  replyMeta: {},
  replyAuthorName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  replyTime: { fontSize: 12, color: COLORS.textSecondary },
  replyContent: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginBottom: 8 },
  thankReply: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  thankReplyText: { fontSize: 12, color: COLORS.textSecondary },
  replyBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10,
  },
  replyAvatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  replyAvatarInitials: { color: '#fff', fontWeight: '700', fontSize: 13 },
  replyInput: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: COLORS.text, maxHeight: 100,
  },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: COLORS.border },
});
