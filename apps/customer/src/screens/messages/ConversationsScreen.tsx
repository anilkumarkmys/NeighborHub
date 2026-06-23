import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, Conversation, formatRelativeTime, getInitials } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchConversations, markRead } from '../../store/slices/messagesSlice';
import { MessagesStackParamList } from '../../navigation/MainNavigator';

type NavProp = NativeStackNavigationProp<MessagesStackParamList, 'ConversationsScreen'>;

function ConversationItem({ conv, currentUserId, onPress }: { conv: Conversation; currentUserId: string; onPress: () => void }) {
  const other = conv.participants.find((p) => p.id !== currentUserId) || conv.participants[0];
  const isUnread = conv.unreadCount > 0;

  return (
    <TouchableOpacity style={styles.convItem} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.avatarContainer}>
        {other.avatar ? (
          <Image source={{ uri: other.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{getInitials(other.displayName)}</Text>
          </View>
        )}
        {isUnread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.convContent}>
        <View style={styles.convHeader}>
          <Text style={[styles.convName, isUnread && styles.convNameBold]}>{other.displayName}</Text>
          <Text style={styles.convTime}>{conv.lastMessage ? formatRelativeTime(conv.lastMessage.createdAt) : ''}</Text>
        </View>
        <Text style={[styles.convLastMsg, isUnread && styles.convLastMsgBold]} numberOfLines={1}>
          {conv.lastMessage?.content || 'No messages yet'}
        </Text>
      </View>
      {isUnread && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{conv.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ConversationsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavProp>();
  const { conversations, isLoading } = useSelector((s: RootState) => s.messages);
  const { user } = useSelector((s: RootState) => s.auth);

  useEffect(() => { dispatch(fetchConversations()); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conv={item}
            currentUserId={user?.id || ''}
            onPress={() => {
              dispatch(markRead(item.id));
              const other = item.participants.find((p) => p.id !== user?.id) || item.participants[0];
              navigation.navigate('ChatScreen', { conversationId: item.id, recipientName: other.displayName });
            }}
          />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchConversations())} tintColor={COLORS.primary} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptyText}>Start a conversation with your neighbors!</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  convItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatarContainer: { position: 'relative', marginRight: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontWeight: '700', fontSize: 17 },
  unreadDot: { position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.primary, borderWidth: 2, borderColor: '#fff' },
  convContent: { flex: 1 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { fontSize: 16, color: COLORS.text },
  convNameBold: { fontWeight: '700' },
  convTime: { fontSize: 12, color: COLORS.textSecondary },
  convLastMsg: { fontSize: 14, color: COLORS.textSecondary },
  convLastMsgBold: { color: COLORS.text, fontWeight: '500' },
  unreadBadge: { backgroundColor: COLORS.primary, borderRadius: 12, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginLeft: 8 },
  unreadBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  separator: { height: 1, backgroundColor: COLORS.divider, marginLeft: 82 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
});
