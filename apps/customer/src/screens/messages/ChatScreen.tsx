import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, Message, formatRelativeTime, getInitials } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchMessages, sendMessage } from '../../store/slices/messagesSlice';
import { MessagesStackParamList } from '../../navigation/MainNavigator';

type RoutePropType = RouteProp<MessagesStackParamList, 'ChatScreen'>;

export default function ChatScreen() {
  const route = useRoute<RoutePropType>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const { messages } = useSelector((s: RootState) => s.messages);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList>(null);
  const convId = route.params.conversationId;
  const convMessages = messages[convId] || [];

  useEffect(() => {
    dispatch(fetchMessages(convId));
  }, [convId]);

  useEffect(() => {
    if (convMessages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [convMessages.length]);

  const handleSend = async () => {
    if (!text.trim() || isSending) return;
    const msgText = text.trim();
    setText('');
    setIsSending(true);
    await dispatch(sendMessage({ conversationId: convId, content: msgText }));
    setIsSending(false);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === user?.id;
    const showTime = index === 0 || new Date(item.createdAt).getTime() - new Date(convMessages[index - 1].createdAt).getTime() > 5 * 60 * 1000;

    return (
      <View>
        {showTime && <Text style={styles.timestamp}>{formatRelativeTime(item.createdAt)}</Text>}
        <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
          {!isMe && (
            <View style={styles.msgAvatar}>
              <Text style={styles.msgAvatarText}>{getInitials(route.params.recipientName)}</Text>
            </View>
          )}
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.content}</Text>
            {item.images?.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.messageImage} />
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <FlatList
        ref={listRef}
        data={convMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="image-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || isSending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || isSending}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  messagesList: { padding: 16, paddingBottom: 8 },
  timestamp: { textAlign: 'center', fontSize: 11, color: COLORS.textSecondary, marginVertical: 12 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 6 },
  messageRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  msgAvatarText: { color: COLORS.primary, fontWeight: '700', fontSize: 11 },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4, marginLeft: 40 },
  bubbleThem: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: COLORS.text, lineHeight: 21 },
  bubbleTextMe: { color: '#fff' },
  messageImage: { width: 200, height: 150, borderRadius: 10, marginTop: 6 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 10, paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8,
  },
  attachButton: { padding: 4, paddingBottom: 8 },
  input: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: 22, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 15, color: COLORS.text, maxHeight: 100,
  },
  sendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: COLORS.border },
});
