import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchAnalytics } from '../../store/slices/analyticsSlice';

const { width } = Dimensions.get('window');
const COLORS = { bg: '#F7FAFC', card: '#fff', primary: '#2D3748', accent: '#48BB78', border: '#E2E8F0', subtext: '#718096' };

function MiniBarChart({ data, color }: { data: Array<{ date: string; count: number }>; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const barWidth = Math.floor((width - 80) / Math.min(data.length, 14));

  return (
    <View style={styles.chartContainer}>
      <View style={styles.bars}>
        {data.slice(-14).map((d, i) => (
          <View key={i} style={[styles.bar, { width: barWidth - 4, height: Math.max((d.count / max) * 80, 2), backgroundColor: color }]} />
        ))}
      </View>
      <View style={styles.chartLabels}>
        {data.length > 0 && <Text style={styles.chartLabel}>{data[0]?.date}</Text>}
        {data.length > 0 && <Text style={styles.chartLabel}>{data[data.length - 1]?.date}</Text>}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { summary, userGrowth, postActivity, categoryDistribution, isLoading } = useSelector((s: RootState) => s.analytics);

  useEffect(() => { dispatch(fetchAnalytics()); }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchAnalytics())} tintColor={COLORS.accent} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Growth (Last 14 Days)</Text>
        <MiniBarChart data={userGrowth} color="#4299E1" />
        <View style={styles.chartStats}>
          <View style={styles.chartStat}>
            <Text style={styles.chartStatValue}>{summary?.totalUsers?.toLocaleString() || 0}</Text>
            <Text style={styles.chartStatLabel}>Total Users</Text>
          </View>
          <View style={styles.chartStat}>
            <Text style={styles.chartStatValue}>{summary?.activeUsersToday?.toLocaleString() || 0}</Text>
            <Text style={styles.chartStatLabel}>Active Today</Text>
          </View>
          <View style={styles.chartStat}>
            <Text style={styles.chartStatValue}>{summary?.activeUsersWeek?.toLocaleString() || 0}</Text>
            <Text style={styles.chartStatLabel}>This Week</Text>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Post Activity (Last 14 Days)</Text>
        <MiniBarChart data={postActivity} color={COLORS.accent} />
        <View style={styles.chartStats}>
          <View style={styles.chartStat}>
            <Text style={styles.chartStatValue}>{summary?.totalPosts?.toLocaleString() || 0}</Text>
            <Text style={styles.chartStatLabel}>Total Posts</Text>
          </View>
          <View style={styles.chartStat}>
            <Text style={styles.chartStatValue}>{summary?.postsToday?.toLocaleString() || 0}</Text>
            <Text style={styles.chartStatLabel}>Today</Text>
          </View>
        </View>
      </View>
      {categoryDistribution.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content by Category</Text>
          {categoryDistribution.map((cat, i) => {
            const total = categoryDistribution.reduce((s, c) => s + c.count, 0);
            const pct = total > 0 ? ((cat.count / total) * 100).toFixed(1) : '0';
            return (
              <View key={i} style={styles.categoryRow}>
                <Text style={styles.categoryLabel}>{cat.category}</Text>
                <View style={styles.categoryBar}>
                  <View style={[styles.categoryBarFill, { width: `${pct}%`, backgroundColor: COLORS.accent }]} />
                </View>
                <Text style={styles.categoryPct}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        {[
          { label: 'Total Neighborhoods', value: summary?.totalNeighborhoods, icon: 'map', color: '#38B2AC' },
          { label: 'Total Events', value: summary?.totalEvents, icon: 'calendar', color: '#805AD5' },
          { label: 'Total Listings', value: summary?.totalListings, icon: 'pricetag', color: '#D69E2E' },
          { label: 'Pending Reports', value: summary?.pendingReports, icon: 'flag', color: '#E53E3E' },
        ].map((item, i) => (
          <View key={i} style={[styles.overviewRow, i < 3 && styles.overviewRowBorder]}>
            <View style={[styles.overviewIcon, { backgroundColor: `${item.color}18` }]}>
              <Ionicons name={item.icon as never} size={20} color={item.color} />
            </View>
            <Text style={styles.overviewLabel}>{item.label}</Text>
            <Text style={styles.overviewValue}>{(item.value || 0).toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  section: { backgroundColor: COLORS.card, margin: 16, marginBottom: 0, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 16 },
  chartContainer: { marginBottom: 16 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 4 },
  bar: { borderRadius: 4, minWidth: 4 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  chartLabel: { fontSize: 11, color: COLORS.subtext },
  chartStats: { flexDirection: 'row' },
  chartStat: { flex: 1, alignItems: 'center' },
  chartStatValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  chartStatLabel: { fontSize: 11, color: COLORS.subtext, marginTop: 2 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  categoryLabel: { width: 120, fontSize: 13, color: COLORS.subtext },
  categoryBar: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  categoryBarFill: { height: '100%', borderRadius: 4 },
  categoryPct: { width: 40, fontSize: 12, fontWeight: '700', color: COLORS.primary, textAlign: 'right' },
  overviewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  overviewRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  overviewIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  overviewLabel: { flex: 1, fontSize: 14, color: COLORS.subtext },
  overviewValue: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
});
