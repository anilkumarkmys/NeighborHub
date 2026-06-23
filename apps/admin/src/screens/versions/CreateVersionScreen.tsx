import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createVersion } from '../../store/slices/versionsSlice';
import { useNavigation } from '@react-navigation/native';

const COLORS = { bg: '#F7FAFC', card: '#fff', primary: '#2D3748', accent: '#48BB78', border: '#E2E8F0', subtext: '#718096', purple: '#805AD5' };

export default function CreateVersionScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [version, setVersion] = useState('');
  const [buildNumber, setBuildNumber] = useState('');
  const [platform, setPlatform] = useState<'android' | 'ios' | 'both'>('both');
  const [appType, setAppType] = useState<'customer' | 'admin'>('customer');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const [minSupportedVersion, setMinSupportedVersion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!version || !buildNumber) { Alert.alert('Missing Fields', 'Version and build number are required'); return; }
    if (!/^\d+\.\d+\.\d+$/.test(version)) { Alert.alert('Invalid Version', 'Use semantic versioning format: X.Y.Z'); return; }
    setIsSubmitting(true);
    const result = await dispatch(createVersion({
      version,
      buildNumber: parseInt(buildNumber),
      platform,
      appType,
      releaseNotes,
      isForceUpdate,
      minSupportedVersion: minSupportedVersion || undefined,
      status: 'draft',
    }));
    setIsSubmitting(false);
    if (createVersion.fulfilled.match(result)) {
      Alert.alert('Created!', `Version v${version} created as draft. You can release it from the versions list.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to create version');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Version Number *</Text>
        <TextInput style={styles.input} placeholder="e.g. 1.2.0" value={version} onChangeText={setVersion} />
        <Text style={styles.hint}>Use semantic versioning (major.minor.patch)</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Build Number *</Text>
        <TextInput style={styles.input} placeholder="e.g. 120" value={buildNumber} onChangeText={setBuildNumber} keyboardType="number-pad" />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>App Type</Text>
        <View style={styles.segmentRow}>
          {(['customer', 'admin'] as const).map((type) => (
            <TouchableOpacity key={type} style={[styles.segment, appType === type && styles.segmentSelected]} onPress={() => setAppType(type)}>
              <Ionicons name={type === 'admin' ? 'shield' : 'people'} size={16} color={appType === type ? '#fff' : COLORS.subtext} />
              <Text style={[styles.segmentText, appType === type && styles.segmentTextSelected]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Platform</Text>
        <View style={styles.segmentRow}>
          {(['android', 'ios', 'both'] as const).map((p) => (
            <TouchableOpacity key={p} style={[styles.segment, platform === p && styles.segmentSelected]} onPress={() => setPlatform(p)}>
              <Ionicons name={p === 'ios' ? 'logo-apple' : p === 'android' ? 'logo-android' : 'phone-portrait'} size={16} color={platform === p ? '#fff' : COLORS.subtext} />
              <Text style={[styles.segmentText, platform === p && styles.segmentTextSelected]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Release Notes</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="What's new in this version?" value={releaseNotes} onChangeText={setReleaseNotes} multiline />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Min Supported Version (optional)</Text>
        <TextInput style={styles.input} placeholder="e.g. 1.0.0" value={minSupportedVersion} onChangeText={setMinSupportedVersion} />
        <Text style={styles.hint}>Older versions below this will be force-updated</Text>
      </View>
      <View style={styles.toggleSection}>
        <View>
          <Text style={styles.toggleLabel}>Force Update</Text>
          <Text style={styles.toggleSubtext}>Require users to update before using the app</Text>
        </View>
        <Switch value={isForceUpdate} onValueChange={setIsForceUpdate} trackColor={{ true: COLORS.purple }} />
      </View>
      {isForceUpdate && (
        <View style={styles.forceUpdateWarning}>
          <Ionicons name="warning" size={18} color='#DD6B20' />
          <Text style={styles.forceUpdateWarningText}>Force update will prevent older versions from accessing the app. Use with caution.</Text>
        </View>
      )}
      <TouchableOpacity style={[styles.createButton, isSubmitting && { opacity: 0.6 }]} onPress={handleCreate} disabled={isSubmitting}>
        <Ionicons name="layers" size={20} color="#fff" />
        <Text style={styles.createButtonText}>{isSubmitting ? 'Creating...' : 'Create Version'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  section: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginBottom: 10 },
  input: { fontSize: 15, color: COLORS.primary, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  hint: { fontSize: 12, color: COLORS.subtext, marginTop: 6 },
  segmentRow: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: COLORS.border },
  segmentSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  segmentText: { fontSize: 13, fontWeight: '600', color: COLORS.subtext },
  segmentTextSelected: { color: '#fff' },
  toggleSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  toggleSubtext: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  forceUpdateWarning: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFFAF0', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#F6AD55' },
  forceUpdateWarningText: { flex: 1, fontSize: 13, color: '#7B341E', lineHeight: 18 },
  createButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.purple, borderRadius: 14, paddingVertical: 16, marginTop: 8 },
  createButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
