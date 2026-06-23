import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchAnalytics } from '../../store/slices/analyticsSlice';
import { fetchReports } from '../../store/slices/reportsSlice';
import { fetchFlaggedContent } from '../../store/slices/contentSlice';
import { fetchVersions } from '../../store/slices/versionsSlice';

const COLORS = { bg: '#F7FAFC', card: '#fff', primary: '#2D3748', accent: '#48BB78', border: '#E2E8F0', subtext: '#718096' };

function StatCard({ label, value, icon, color, trend }: { label: string; value: number | string; icon: string; color: string; trend?: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <View style={[styles.statIconWrapper, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon as never} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && <Text style={styles.statTrend}>{trend}</Text>}
    </View>
  );
}

export default function DashboardScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { summary, isLoading } = useSelector((s: RootState) => s.analytics);
  const { admin } = useSelector((s: RootState) => s.auth);
  const pendingReports = useSelector((s: RootState) => s.reports.reports.filter((r) => r.status === 'pending').length);
  const flaggedContent = useSelector((s: RootState) => s.content.flaggedPosts.length);
  const latestVersion = useSelector((s: RootState) => s.versions.versions[0]);

  const loadAll = () => {
    dispatch(fetchAnalytics());
    dispatch(fetchReports({ page: 1, status: 'pending' }));
    dispatch(fetchFlaggedContent({ page: 1 }));
    dispatch(fetchVersions());
  };

  useEffect(() => { loadAll(); }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAll} tintColor={COLORS.accent} />}
    >
      <LinearGradient colors={['#1A202C', '#2D3748']} style={styles.header}>
        <Text style={styles.greeting}>Good morning, {admin?.firstName} 👋</Text>
        <Text style={styles.headerSubtitle}>NeighborHub Admin Console</Text>
        {latestVersion && (
          <View style={styles.versionBadge}>
            <Ionicons name="layers-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.versionText}>v{latestVersion.version} · {latestVersion.status}</Text>
          </View>
        )}
      </LinearGradient>
      {(pendingReports > 0 || flaggedContent > 0) && (
        <View style={styles.alertsSection}>
          <Text style={styles.alertsTitle}>⚠️ Action Required</Text>
          {pendingReports > 0 && (
            <View style={styles.alertItem}>
              <Ionicons name="flag" size={16} color="#E53E3E" />
              <Text style={styles.alertText}>{pendingReports} pending report{pendingReports !== 1 ? 's' : ''} need review</Text>
            </View>
          )}
          {flaggedContent > 0 && (
            <View style={styles.alertItem}>
              <Ionicons name="shield" size={16} color="#DD6B20" />
              <Text style={styles.alertText}>{flaggedContent} flagged post{flaggedContent !== 1 ? 's' : ''} need moderation</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.statsGrid}>
        <StatCard label="Total Users" value={summary?.totalUsers || 0} icon="people" color="#4299E1" trend="+12% this week" />
        <StatCard label="Active Today" value={summary?.activeUsersToday || 0} icon="person-outline" color="#48BB78" />
        <StatCard label="Total Posts" value={summary?.totalPosts || 0} icon="newspaper" color="#805AD5" trend="+5% this week" />
        <StatCard label="Posts Today" value={summary?.postsToday || 0} icon="create-outline" color="#ED8936" />
        <StatCard label="Neighborhoods" value={summary?.totalNeighborhoods || 0} icon="map" color="#38B2AC" />
        <StatCard label="Events" value={summary?.totalEvents || 0} icon="calendar" color="#E53E3E" />
        <StatCard label="Listings" value={summary?.totalListings || 0} icon="pricetag" color="#D69E2E" />
        <StatCard label="Pending Reports" value={summary?.pendingReports || 0} icon="flag" color={summary?.pendingReports ? '#E53E3E' : '#48BB78'} />
      </View>
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {[
          { icon: 'flag', label: `Review Reports (${pendingReports})`, color: '#E53E3E' },
          { icon: 'shield', label: `Moderate Content (${flaggedContent})`, color: '#DD6B20' },
          { icon: 'layers', label: 'Manage App Versions', color: '#805AD5' },
          { icon: 'notifications', label: 'Send Push Notification', color: '#4299E1' },
        ].map((action, i) => (
          <TouchableOpacity key={i} style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}18` }]}>
              <Ionicons name={action.icon as never} size={22} color={action.color} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 20 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  versionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  versionText: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  alertsSection: { backgroundColor: '#FFF5F5', margin: 16, borderRadius: 14, padding: 14, borderLeftWidth: 4, borderLeftColor: '#E53E3E' },
  alertsTitle: { fontSize: 15, fontWeight: '700', color: '#C53030', marginBottom: 10 },
  alertItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  alertText: { fontSize: 14, color: '#7B341E' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  statCard: { width: '46%', flex: 0, backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderTopWidth: 3, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  statIconWrapper: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  statTrend: { fontSize: 11, color: '#48BB78', fontWeight: '600', marginTop: 4 },
  quickActions: { margin: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  quickAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 },
  quickActionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  quickActionLabel: { flex: 1, fontSize: 15, color: COLORS.primary, fontWeight: '500' },
});
