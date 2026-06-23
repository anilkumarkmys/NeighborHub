import React, { useEffect, useCallback, useState } from 'react';
import {
  View, FlatList, StyleSheet, Text, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, POST_CATEGORIES, PostCategory } from '@nextdoor-clone/shared';
import { AppDispatch, RootState } from '../../store';
import { fetchPosts, setCategory } from '../../store/slices/feedSlice';
import { FeedStackParamList } from '../../navigation/MainNavigator';
import PostCard from '../../components/feed/PostCard';
import CategoryPill from '../../components/common/CategoryPill';

type NavProp = NativeStackNavigationProp<FeedStackParamList, 'FeedScreen'>;

export default function FeedScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavProp>();
  const { posts, isLoading, isRefreshing, hasMore, category, page } = useSelector(
    (s: RootState) => s.feed
  );
  const { user } = useSelector((s: RootState) => s.auth);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchPosts({ page: 1, category, refresh: true }));
  }, [category]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchPosts({ page: 1, category, refresh: true }));
  }, [category]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      dispatch(fetchPosts({ page: page + 1, category }));
    }
  }, [isLoading, hasMore, page, category]);

  const filteredPosts = searchQuery
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning! 👋</Text>
          <Text style={styles.neighborhood}>
            <Ionicons name="location" size={14} color={COLORS.primary} /> {user?.neighborhood}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('SafetyAlerts')} style={styles.headerIcon}>
            <Ionicons name="shield-outline" size={24} color={COLORS.safety} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CreatePost')} style={styles.createButton}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.categories}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ key: 'all', label: 'All', icon: 'apps' }, ...POST_CATEGORIES]}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <CategoryPill
              label={item.label}
              icon={item.icon}
              selected={category === item.key}
              onPress={() => dispatch(setCategory(item.key as PostCategory | 'all'))}
            />
          )}
        />
      </View>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onPress={() => navigation.navigate('PostDetail', { postId: item.id })} />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoading && !isRefreshing ? (
            <ActivityIndicator color={COLORS.primary} style={{ padding: 20 }} />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>Be the first to post something in your neighborhood!</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('CreatePost')}>
                <Text style={styles.emptyButtonText}>Create a Post</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  greeting: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  neighborhood: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { padding: 6 },
  createButton: {
    backgroundColor: COLORS.primary, width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginVertical: 10,
    borderRadius: 12, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  categories: { height: 48 },
  categoriesList: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  listContent: { paddingBottom: 20 },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  emptyButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
