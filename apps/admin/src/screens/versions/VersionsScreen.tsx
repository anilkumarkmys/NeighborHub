import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Alert, Switch, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppVersion } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchVersions, releaseVersion, setForceUpdate } from '../../store/slices/versionsSlice';

const COLORS = { bg: '#F7FAFC', card: '#fff', primary: '#2D3748', accent: '#48BB78', border: '#E2E8F0', subtext: '#718096', danger: '#E53E3E', warning: '#DD6B20', purple: '#805AD5' };

const STATUS_COLORS: Record<string, string> = { draft: COLORS.subtext, released: COLORS.accent, deprecated: COLORS.warning };

function VersionCard({ version, onRelease, onForceUpdate }: { version: AppVersion; onRelease: () => void; onForceUpdate: (val: boolean) => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.versionInfo}>
          <Text style={styles.versionNumber}>v{version.version}</Text>
          <Text style={styles.buildNumber}>Build #{version.buildNumber}</Text>
        </View>
        <View style={styles.badges}>
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[version.status]}18` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[version.status] }]}>{version.status.toUpperCase()}</Text>
          </View>
          <View style={[styles.platformBadge, { backgroundColor: version.appType === 'admin' ? `${COLORS.purple}18` : `${COLORS.accent}18` }]}>
            <Ionicons name={version.appType === 'admin' ? 'shield' : 'people'} size={12} color={version.appType === 'admin' ? COLORS.purple : COLORS.accent} />
            <Text style={[styles.platformText, { color: version.appType === 'admin' ? COLORS.purple : COLORS.accent }]}>{version.appType.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <View style={styles.platformRow}>
        <Ionicons name={version.platform === 'ios' ? 'logo-apple' : version.platform === 'android' ? 'logo-android' : 'phone-portrait'} size={16} color={COLORS.subtext} />
        <Text style={styles.platformLabel}>{version.platform === 'both' ? 'iOS & Android' : version.platform}</Text>
      </View>
      {version.releaseNotes && <Text style={styles.releaseNotes} numberOfLines={2}>{version.releaseNotes}</Text>}
      <View style={styles.forceUpdateRow}>
        <View>
          <Text style={styles.forceUpdateLabel}>Force Update</Text>
          <Text style={styles.forceUpdateSubtext}>Require all users to update</Text>
        </View>
        <Switch
          value={version.isForceUpdate}
          onValueChange={onForceUpdate}
          trackColor={{ true: COLORS.danger }}
          disabled={version.status !== 'released'}
        />
      </View>
      {version.status === 'draft' && (
        <TouchableOpacity style={styles.releaseButton} onPress={onRelease}>
          <Ionicons name="rocket" size={16} color="#fff" />
          <Text style={styles.releaseButtonText}>Release This Version</Text>
        </TouchableOpacity>
      )}
      {version.status === 'released' && (
        <View style={styles.releasedInfo}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
          <Text style={styles.releasedText}>Released {new Date(version.releasedAt).toLocaleDateString()}</Text>
        </View>
      )}
    </View>
  );
}

export default function VersionsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { versions, isLoading } = useSelector((s: RootState) => s.versions);

  useEffect(() => { dispatch(fetchVersions()); }, []);

  const handleRelease = (versionId: string, version: string) => {
    Alert.alert('Release Version', `Release v${version} to all users?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Release', onPress: () => dispatch(releaseVersion(versionId)) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.headerInfo}>
          <Ionicons name="layers" size={20} color={COLORS.purple} />
          <Text style={styles.headerText}>{versions.length} version{versions.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={() => (navigation as never).navigate('CreateVersion')}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>New Version</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={versions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VersionCard
            version={item}
            onRelease={() => handleRelease(item.id, item.version)}
            onForceUpdate={(val) => dispatch(setForceUpdate({ versionId: item.id, isForceUpdate: val }))}
          />
        )}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchVersions())} tintColor={COLORS.accent} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="layers-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No Versions Yet</Text>
            <Text style={styles.emptyText}>Create a new version to get started</Text>
          </View>
        ) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.card },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerText: { fontSize: 15, fontWeight: '600', color: COLORS.subtext },
  createButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.purple, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  createButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  versionInfo: {},
  versionNumber: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  buildNumber: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  badges: { flexDirection: 'row', gap: 6 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  platformBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  platformText: { fontSize: 10, fontWeight: '700' },
  platformRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  platformLabel: { fontSize: 14, color: COLORS.subtext, textTransform: 'capitalize' },
  releaseNotes: { fontSize: 13, color: COLORS.subtext, lineHeight: 18, marginBottom: 14 },
  forceUpdateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14, marginBottom: 14 },
  forceUpdateLabel: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  forceUpdateSubtext: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  releaseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.purple, borderRadius: 12, paddingVertical: 12 },
  releaseButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  releasedInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FFF4', borderRadius: 10, padding: 10 },
  releasedText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.primary, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.subtext, marginTop: 8 },
});
