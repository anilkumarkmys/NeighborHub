import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, User, getInitials, formatRelativeTime } from '@nextdoor-clone/shared';
import { FeedStackParamList } from '../../navigation/MainNavigator';
import apiClient from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type RoutePropType = RouteProp<FeedStackParamList, 'NeighborProfile'>;

export default function NeighborProfileScreen() {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation();
  const { user: currentUser } = useSelector((s: RootState) => s.auth);
  const [neighbor, setNeighbor] = useState<User | null>(null);

  useEffect(() => {
    apiClient.get(`/users/${route.params.userId}`)
      .then((res) => setNeighbor(res.data.data))
      .catch(() => Alert.alert('Error', 'Failed to load profile'));
  }, [route.params.userId]);

  if (!neighbor) return null;
  const isOwn = neighbor.id === currentUser?.id;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
        {neighbor.avatar ? (
          <Image source={{ uri: neighbor.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{getInitials(neighbor.displayName)}</Text>
          </View>
        )}
        <Text style={styles.name}>{neighbor.displayName}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.location}>{neighbor.neighborhood}</Text>
        </View>
        {neighbor.bio && <Text style={styles.bio}>{neighbor.bio}</Text>}
      </LinearGradient>
      <View style={styles.statsCard}>
        <View style={styles.stat}><Text style={styles.statValue}>{neighbor.postCount}</Text><Text style={styles.statLabel}>Posts</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statValue}>{neighbor.thankCount}</Text><Text style={styles.statLabel}>Thanks</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statValue}>{new Date(neighbor.joinedAt).getFullYear()}</Text><Text style={styles.statLabel}>Joined</Text></View>
      </View>
      {!isOwn && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.messageButton}>
            <Ionicons name="chatbubble" size={18} color="#fff" />
            <Text style={styles.messageButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 80, paddingBottom: 32, alignItems: 'center', paddingHorizontal: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 4, borderColor: '#fff', marginBottom: 14 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', marginBottom: 14 },
  avatarInitials: { fontSize: 30, fontWeight: '800', color: '#fff' },
  name: { fontSize: 24, fontWeight: '800', color: '#fff' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  location: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  bio: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 10, lineHeight: 20 },
  statsCard: { flexDirection: 'row', backgroundColor: COLORS.surface, margin: 16, borderRadius: 16, padding: 20 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  actions: { paddingHorizontal: 16 },
  messageButton: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  messageButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
