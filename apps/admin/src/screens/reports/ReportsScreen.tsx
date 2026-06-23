import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Report, formatRelativeTime } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchReports, resolveReport } from '../../store/slices/reportsSlice';

const COLORS = { bg: '#F7FAFC', card: '#fff', primary: '#2D3748', accent: '#48BB78', border: '#E2E8F0', subtext: '#718096', danger: '#E53E3E', warning: '#DD6B20' };
const REASON_ICONS: Record<string, string> = { spam: 'mail', harassment: 'person-remove', misinformation: 'alert-circle', inappropriate: 'eye-off', other: 'flag' };

function ReportCard({ report, onResolve, onDismiss }: { report: Report; onResolve: () => void; onDismiss: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.reasonBadge}>
          <Ionicons name={(REASON_ICONS[report.reason] || 'flag') as never} size={14} color={COLORS.danger} />
          <Text style={styles.reasonText}>{report.reason.toUpperCase()}</Text>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{report.targetType.toUpperCase()}</Text>
        </View>
        <Text style={styles.cardTime}>{formatRelativeTime(report.createdAt)}</Text>
      </View>
      {report.description && <Text style={styles.description} numberOfLines={2}>{report.description}</Text>}
      <Text style={styles.reporter}>Reported by {report.reporter.displayName}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.resolveButton} onPress={onResolve}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
          <Text style={styles.resolveText}>Resolve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Ionicons name="close-circle" size={16} color={COLORS.subtext} />
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { reports, isLoading } = useSelector((s: RootState) => s.reports);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'reviewed' | 'resolved' | 'dismissed'>('pending');

  useEffect(() => { dispatch(fetchReports({ page: 1, status: statusFilter })); }, [statusFilter]);

  const handleResolve = (reportId: string) => {
    Alert.prompt('Resolve Note (optional)', 'Add admin note:', (note) => {
      dispatch(resolveReport({ reportId, action: 'resolved', adminNote: note || undefined }));
    });
  };

  const handleDismiss = (reportId: string) => {
    Alert.alert('Dismiss Report', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Dismiss', onPress: () => dispatch(resolveReport({ reportId, action: 'dismissed' })) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {(['pending', 'reviewed', 'resolved', 'dismissed'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, statusFilter === status && styles.filterChipSelected]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[styles.filterText, statusFilter === status && styles.filterTextSelected]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            onResolve={() => handleResolve(item.id)}
            onDismiss={() => handleDismiss(item.id)}
          />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchReports({ page: 1, status: statusFilter }))} tintColor={COLORS.accent} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No {statusFilter} reports</Text>
          </View>
        ) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  filterBar: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: COLORS.border },
  filterChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.subtext },
  filterTextSelected: { color: '#fff' },
  list: { padding: 16 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: COLORS.warning, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  reasonBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF5F5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  reasonText: { fontSize: 10, fontWeight: '700', color: COLORS.danger },
  typeBadge: { backgroundColor: '#EBF8FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 10, fontWeight: '700', color: '#2B6CB0' },
  cardTime: { fontSize: 12, color: COLORS.subtext, marginLeft: 'auto' },
  description: { fontSize: 14, color: COLORS.subtext, lineHeight: 20, marginBottom: 8 },
  reporter: { fontSize: 12, color: COLORS.subtext, marginBottom: 14 },
  actions: { flexDirection: 'row', gap: 10 },
  resolveButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#F0FFF4', borderRadius: 10, paddingVertical: 10, borderWidth: 1.5, borderColor: COLORS.accent },
  resolveText: { fontWeight: '700', fontSize: 13, color: COLORS.accent },
  dismissButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.bg, borderRadius: 10, paddingVertical: 10, borderWidth: 1.5, borderColor: COLORS.border },
  dismissText: { fontWeight: '700', fontSize: 13, color: COLORS.subtext },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginTop: 16 },
});
