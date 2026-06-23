import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, POST_CATEGORIES, PostCategory } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createPost } from '../../store/slices/feedSlice';

export default function CreatePostScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { user } = useSelector((s: RootState) => s.auth);
  const [category, setCategory] = useState<PostCategory>('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const newImages = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Please add a title'); return; }
    if (!content.trim()) { Alert.alert('Error', 'Please add some content'); return; }
    setIsPosting(true);
    const result = await dispatch(createPost({ category, title: title.trim(), content: content.trim(), images }));
    setIsPosting(false);
    if (createPost.fulfilled.match(result)) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.postButton, (!title || !content || isPosting) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={!title || !content || isPosting}
        >
          {isPosting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.authorInfo}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarInitials}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{user?.displayName}</Text>
            <Text style={styles.neighborhood}>
              <Ionicons name="location" size={12} color={COLORS.primary} /> {user?.neighborhood}
            </Text>
          </View>
        </View>
        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {POST_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, category === cat.key && styles.categoryChipSelected]}
              onPress={() => setCategory(cat.key as PostCategory)}
            >
              <Ionicons
                name={cat.icon as never}
                size={14}
                color={category === cat.key ? '#fff' : COLORS.textSecondary}
              />
              <Text style={[styles.categoryChipText, category === cat.key && styles.categoryChipTextSelected]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.sectionLabel}>Title</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="What's happening in your neighborhood?"
          value={title}
          onChangeText={setTitle}
          maxLength={120}
        />
        <Text style={styles.sectionLabel}>Details</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="Share more details..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />
        <Text style={styles.charCount}>{content.length}/2000</Text>
        {images.length > 0 && (
          <View style={styles.imageGrid}>
            {images.map((img, i) => (
              <View key={i} style={styles.imageWrapper}>
                <Image source={{ uri: img }} style={styles.image} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(i)}>
                  <Ionicons name="close-circle" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarButton} onPress={pickImages} disabled={images.length >= 5}>
            <Ionicons name="image-outline" size={24} color={images.length >= 5 ? COLORS.border : COLORS.primary} />
            <Text style={[styles.toolbarText, images.length >= 5 && styles.toolbarTextDisabled]}>
              Photo ({images.length}/5)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="location-outline" size={24} color={COLORS.primary} />
            <Text style={styles.toolbarText}>Location</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  cancelButton: { paddingHorizontal: 4, paddingVertical: 6 },
  cancelText: { fontSize: 16, color: COLORS.textSecondary },
  postButton: { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  postButtonDisabled: { backgroundColor: COLORS.border },
  postButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  content: { padding: 16 },
  authorInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  avatarSmall: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { color: '#fff', fontWeight: '700', fontSize: 15 },
  authorName: { fontWeight: '700', fontSize: 16, color: COLORS.text },
  neighborhood: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  categoryScroll: { marginBottom: 20 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginRight: 8,
    backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
  },
  categoryChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  categoryChipTextSelected: { color: '#fff' },
  titleInput: {
    fontSize: 18, fontWeight: '600', color: COLORS.text, borderBottomWidth: 1.5,
    borderBottomColor: COLORS.border, paddingBottom: 12, marginBottom: 20,
  },
  contentInput: {
    fontSize: 15, color: COLORS.text, minHeight: 120, lineHeight: 22, marginBottom: 4,
  },
  charCount: { alignSelf: 'flex-end', fontSize: 12, color: COLORS.textSecondary, marginBottom: 16 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  imageWrapper: { position: 'relative' },
  image: { width: 100, height: 100, borderRadius: 10 },
  removeImageBtn: { position: 'absolute', top: -8, right: -8 },
  toolbar: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingTop: 14, gap: 20,
  },
  toolbarButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toolbarText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  toolbarTextDisabled: { color: COLORS.border },
});
