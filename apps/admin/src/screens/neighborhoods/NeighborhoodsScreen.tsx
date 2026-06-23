import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Neighborhood } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchNeighborhoods, toggleNeighborhood } from '../../store/slices/neighborhoodsSlice';

const COLORS = { bg: '#F7FAFC', card: '#fff', primary: '#2D3748', accent: '#48BB78', border: '#E2E8F0', subtext: '#718096', danger: '#E53E3E' };

function NeighborhoodCard({ n, onToggle }: { n: Neighborhood; onToggle: (val: boolean) => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameRow}>
          <Ionicons name="map" size={18} color={COLORS.accent} />
          <Text style={styles.name}>{n.name}</Text>
        </View>
        <Switch value={n.isActive} onValueChange={onToggle} trackColor={{ true: COLORS.accent }} />
      </View>
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color={COLORS.subtext} />
          <Text style={styles.detailText}>{n.city}, {n.state}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={14} color={COLORS.subtext} />
          <Text style={styles.detailText}>{n.memberCount.toLocaleString()} members</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="mail-outline" size={14} color={COLORS.subtext} />
          <Text style={styles.detailText}>ZIP: {n.zip}</Text>
        </View>
      </View>
      {!n.isActive && (
        <View style={styles.inactiveBanner}>
          <Ionicons name="ban" size={14} color={COLORS.danger} />
          <Text style={styles.inactiveText}>Neighborhood is inactive</Text>
        </View>
      )}
    </View>
  );
}

export default function NeighborhoodsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { neighborhoods, isLoading } = useSelector((s: RootState) => s.neighborhoods);

  useEffect(() => { dispatch(fetchNeighborhoods()); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.statsBar}>
        <Ionicons name="map" size={18} color={COLORS.accent} />
        <Text style={styles.statsText}>{neighborhoods.length} neighborhoods · {neighborhoods.filter((n) => n.isActive).length} active</Text>
      </View>
      <FlatList
        data={neighborhoods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NeighborhoodCard
            n={item}
            onToggle={(val) => dispatch(toggleNeighborhood({ id: item.id, isActive: val }))}
          />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchNeighborhoods())} tintColor={COLORS.accent} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No Neighborhoods</Text>
          </View>
        ) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  statsBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statsText: { fontSize: 14, fontWeight: '600', color: COLORS.subtext },
  list: { padding: 16 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 17, fontWeight: '700', color: COLORS.primary },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 13, color: COLORS.subtext },
  inactiveBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF5F5', borderRadius: 8, padding: 10, marginTop: 12 },
  inactiveText: { fontSize: 13, color: COLORS.danger, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginTop: 16 },
});
