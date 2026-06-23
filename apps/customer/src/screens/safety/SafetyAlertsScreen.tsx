import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, Post, formatRelativeTime } from '@nextdoor-clone/shared';
import apiClient from '../../services/api';
import { FeedStackParamList } from '../../navigation/MainNavigator';

type NavProp = NativeStackNavigationProp<FeedStackParamList, 'SafetyAlerts'>;

export default function SafetyAlertsScreen() {
  const navigation = useNavigation<NavProp>();
  const [alerts, setAlerts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/posts', { params: { category: 'safety', limit: 50 } });
      setAlerts(res.data.data.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAlerts(); }, []);

  const getSeverity = (post: Post) => {
    const text = (post.title + post.content).toLowerCase();
    if (text.includes('emergency') || text.includes('911') || text.includes('fire') || text.includes('danger')) return 'high';
    if (text.includes('warning') || text.includes('caution') || text.includes('suspicious')) return 'medium';
    return 'low';
  };

  const severityColors = { high: COLORS.error, medium: COLORS.warning, low: COLORS.info };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Ionicons name="shield-checkmark" size={24} color="#fff" />
        <Text style={styles.bannerText}>Stay informed. Stay safe.</Text>
      </View>
      <TouchableOpacity style={styles.emergencyButton}>
        <Ionicons name="call" size={24} color="#fff" />
        <View>
          <Text style={styles.emergencyTitle}>Call 911</Text>
          <Text style={styles.emergencySubtitle}>For life-threatening emergencies</Text>
        </View>
      </TouchableOpacity>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAlerts} tintColor={COLORS.error} />}
        renderItem={({ item }) => {
          const severity = getSeverity(item);
          const color = severityColors[severity];
          return (
            <TouchableOpacity
              style={[styles.alertCard, { borderLeftColor: color }]}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            >
              <View style={styles.alertHeader}>
                <View style={[styles.severityDot, { backgroundColor: color }]} />
                <Text style={[styles.severityText, { color }]}>{severity.toUpperCase()} ALERT</Text>
                <Text style={styles.alertTime}>{formatRelativeTime(item.createdAt)}</Text>
              </View>
              <Text style={styles.alertTitle}>{item.title}</Text>
              <Text style={styles.alertContent} numberOfLines={2}>{item.content}</Text>
              <Text style={styles.alertAuthor}>Posted by {item.author.displayName}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyTitle}>All Clear!</Text>
              <Text style={styles.emptyText}>No safety alerts in your neighborhood right now.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.error, padding: 14, margin: 16, borderRadius: 14,
  },
  bannerText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emergencyButton: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.error, marginHorizontal: 16, marginBottom: 16,
    borderRadius: 14, padding: 16, elevation: 4, shadowColor: COLORS.error, shadowOpacity: 0.4, shadowRadius: 8,
  },
  emergencyTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  emergencySubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  alertCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 12, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  severityText: { fontWeight: '700', fontSize: 11, letterSpacing: 0.5 },
  alertTime: { color: COLORS.textSecondary, fontSize: 12, marginLeft: 'auto' },
  alertTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  alertContent: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 8 },
  alertAuthor: { fontSize: 12, color: COLORS.textSecondary },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
});
