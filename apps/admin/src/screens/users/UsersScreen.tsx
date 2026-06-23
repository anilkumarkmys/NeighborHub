import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { User, getInitials, formatRelativeTime } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchUsers } from '../../store/slices/usersSlice';

const COLORS = { bg: '#F7FAFC', card: '#fff', primary: '#2D3748', accent: '#48BB78', border: '#E2E8F0', subtext: '#718096', danger: '#E53E3E' };

function UserRow({ user, onPress }: { user: User; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.userRow} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.avatarContainer}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{getInitials(user.displayName)}</Text>
          </View>
        )}
        {!user.isActive && <View style={styles.suspendedDot} />}
        {user.isVerified && <View style={styles.verifiedDot}><Ionicons name="checkmark" size={8} color="#fff" /></View>}
      </View>
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName}>{user.displayName}</Text>
          <View style={[styles.roleBadge, user.role === 'admin' && styles.roleBadgeAdmin]}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.userMeta}>
          <Ionicons name="location-outline" size={12} color={COLORS.subtext} />
          <Text style={styles.userMetaText}>{user.neighborhood}</Text>
          <Text style={styles.dot}> · </Text>
          <Text style={styles.userMetaText}>Active {formatRelativeTime(user.lastActiveAt)}</Text>
        </View>
      </View>
      {!user.isActive && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>Inactive</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
    </TouchableOpacity>
  );
}

export default function UsersScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { users, isLoading, hasMore, page, search } = useSelector((s: RootState) => s.users);
  const [searchText, setSearchText] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1 }));
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => dispatch(fetchUsers({ page: 1, search: text })), 400));
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) dispatch(fetchUsers({ page: page + 1, search: searchText }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={COLORS.subtext} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name or email..."
          value={searchText}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchText(''); dispatch(fetchUsers({ page: 1 })); }}>
            <Ionicons name="close-circle" size={18} color={COLORS.subtext} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.filterRow}>
        <Text style={styles.totalCount}>{users.length} users</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserRow user={item} onPress={() => (navigation as never).navigate('UserDetail', { userId: item.id })} />
        )}
        refreshControl={<RefreshControl refreshing={isLoading && page === 1} onRefresh={() => dispatch(fetchUsers({ page: 1 }))} tintColor={COLORS.accent} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isLoading && page > 1 ? <ActivityIndicator color={COLORS.accent} style={{ padding: 20 }} /> : null}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, margin: 16, borderRadius: 12, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: COLORS.border },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.primary },
  filterRow: { paddingHorizontal: 16, marginBottom: 8 },
  totalCount: { fontSize: 13, color: COLORS.subtext },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, paddingHorizontal: 16, paddingVertical: 14 },
  avatarContainer: { position: 'relative', marginRight: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4299E1', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontWeight: '700', fontSize: 16 },
  suspendedDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.danger, borderWidth: 2, borderColor: COLORS.card },
  verifiedDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.accent, borderWidth: 2, borderColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  userName: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  roleBadge: { backgroundColor: '#EBF8FF', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  roleBadgeAdmin: { backgroundColor: '#FAF5FF' },
  roleText: { fontSize: 10, fontWeight: '700', color: '#2B6CB0', textTransform: 'uppercase' },
  userEmail: { fontSize: 13, color: COLORS.subtext, marginBottom: 3 },
  userMeta: { flexDirection: 'row', alignItems: 'center' },
  userMetaText: { fontSize: 12, color: COLORS.subtext },
  dot: { color: COLORS.subtext },
  statusBadge: { backgroundColor: '#FFF5F5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 },
  statusBadgeText: { fontSize: 11, color: COLORS.danger, fontWeight: '700' },
  separator: { height: 1, backgroundColor: COLORS.border },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: COLORS.subtext, marginTop: 12 },
});
