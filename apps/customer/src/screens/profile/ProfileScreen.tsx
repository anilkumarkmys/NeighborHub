import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, getInitials, formatRelativeTime } from '@nextdoor-clone/shared';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ProfileStackParamList } from '../../navigation/MainNavigator';

type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileScreen'>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useSelector((s: RootState) => s.auth);
  const unreadNotifications = useSelector((s: RootState) => s.notifications.unreadCount);

  if (!user) return null;

  const menuItems = [
    { icon: 'notifications-outline', label: 'Notifications', badge: unreadNotifications, onPress: () => navigation.navigate('Notifications') },
    { icon: 'people-outline', label: 'My Neighbors Map', badge: 0, onPress: () => navigation.navigate('NeighborsMap') },
    { icon: 'settings-outline', label: 'Settings', badge: 0, onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
        <View style={styles.avatarSection}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(user.displayName)}</Text>
            </View>
          )}
          {user.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            </View>
          )}
        </View>
        <Text style={styles.name}>{user.displayName}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.neighborhood}>{user.neighborhood}</Text>
        </View>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
        <Text style={styles.memberSince}>Neighbor since {new Date(user.joinedAt).getFullYear()}</Text>
      </LinearGradient>
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.postCount}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.replyCount}</Text>
          <Text style={styles.statLabel}>Replies</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.thankCount}</Text>
          <Text style={styles.statLabel}>Thanks</Text>
        </View>
      </View>
      <View style={styles.menuCard}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]} onPress={item.onPress}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name={item.icon as never} size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.badge > 0 && (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>{item.badge}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} style={styles.menuArrow} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center' },
  avatarSection: { position: 'relative', marginBottom: 14 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: '#fff' },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' },
  avatarInitials: { fontSize: 30, fontWeight: '800', color: '#fff' },
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#fff', borderRadius: 12 },
  name: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  neighborhood: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  bio: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 8, lineHeight: 20 },
  memberSince: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  statsCard: { flexDirection: 'row', backgroundColor: COLORS.surface, margin: 16, borderRadius: 16, padding: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  menuCard: { backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  menuIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 16, color: COLORS.text },
  menuBadge: { backgroundColor: COLORS.error, borderRadius: 12, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginRight: 8 },
  menuBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  menuArrow: {},
});
