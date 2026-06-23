import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../services/api';

const COLORS = { bg: '#F7FAFC', card: '#fff', primary: '#2D3748', accent: '#48BB78', border: '#E2E8F0', subtext: '#718096', purple: '#805AD5', warning: '#DD6B20' };

export default function AdminNotificationsScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'all' | 'customers' | 'admins'>('all');
  const [neighborhoods, setNeighborhoods] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title || !body) { Alert.alert('Missing Fields', 'Title and body are required'); return; }
    Alert.alert('Send Notification', `Send to ${target === 'all' ? 'all users' : target}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send', onPress: async () => {
        setIsSending(true);
        try {
          await apiClient.post('/admin/notifications/send', { title, body, target, neighborhoods: neighborhoods.split(',').map((n) => n.trim()).filter(Boolean), isUrgent });
          Alert.alert('Sent!', 'Notification sent successfully');
          setTitle('');
          setBody('');
          setNeighborhoods('');
          setIsUrgent(false);
        } catch {
          Alert.alert('Error', 'Failed to send notification');
        } finally {
          setIsSending(false);
        }
      }},
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.infoCard}>
        <Ionicons name="notifications" size={24} color={COLORS.purple} />
        <Text style={styles.infoText}>Send push notifications directly to users' devices. Use responsibly — excessive notifications reduce user engagement.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Notification Title *</Text>
        <TextInput style={styles.input} placeholder="e.g. Important Neighborhood Update" value={title} onChangeText={setTitle} maxLength={100} />
        <Text style={styles.charCount}>{title.length}/100</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Message Body *</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Enter your notification message..." value={body} onChangeText={setBody} multiline maxLength={300} />
        <Text style={styles.charCount}>{body.length}/300</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Target Audience</Text>
        <View style={styles.segmentRow}>
          {(['all', 'customers', 'admins'] as const).map((t) => (
            <TouchableOpacity key={t} style={[styles.segment, target === t && styles.segmentSelected]} onPress={() => setTarget(t)}>
              <Text style={[styles.segmentText, target === t && styles.segmentTextSelected]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Filter by Neighborhood (optional)</Text>
        <TextInput style={styles.input} placeholder="Sunset Hills, Downtown, Oak Park..." value={neighborhoods} onChangeText={setNeighborhoods} />
        <Text style={styles.hint}>Comma-separated neighborhood names. Leave empty to target all.</Text>
      </View>
      <View style={styles.toggleSection}>
        <View>
          <Text style={styles.toggleLabel}>Urgent Notification</Text>
          <Text style={styles.toggleSubtext}>Bypasses Do Not Disturb settings</Text>
        </View>
        <Switch value={isUrgent} onValueChange={setIsUrgent} trackColor={{ true: COLORS.warning }} />
      </View>
      <View style={styles.preview}>
        <Text style={styles.previewTitle}>Preview</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Ionicons name="home" size={16} color={COLORS.accent} />
            <Text style={styles.previewApp}>NeighborHub</Text>
            {isUrgent && <View style={styles.urgentBadge}><Text style={styles.urgentText}>URGENT</Text></View>}
          </View>
          <Text style={styles.previewNotifTitle}>{title || 'Notification Title'}</Text>
          <Text style={styles.previewBody}>{body || 'Notification message will appear here...'}</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.sendButton, isSending && { opacity: 0.6 }]} onPress={handleSend} disabled={isSending}>
        <Ionicons name="send" size={20} color="#fff" />
        <Text style={styles.sendButtonText}>{isSending ? 'Sending...' : 'Send Notification'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FAF5FF', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E9D8FD' },
  infoText: { flex: 1, fontSize: 13, color: COLORS.primary, lineHeight: 18 },
  section: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginBottom: 10 },
  input: { fontSize: 15, color: COLORS.primary, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  charCount: { alignSelf: 'flex-end', fontSize: 12, color: COLORS.subtext, marginTop: 4 },
  hint: { fontSize: 12, color: COLORS.subtext, marginTop: 6 },
  segmentRow: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  segmentSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  segmentText: { fontSize: 13, fontWeight: '600', color: COLORS.subtext },
  segmentTextSelected: { color: '#fff' },
  toggleSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  toggleSubtext: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  preview: { marginBottom: 16 },
  previewTitle: { fontSize: 13, fontWeight: '700', color: COLORS.subtext, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  previewCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  previewApp: { fontSize: 12, fontWeight: '700', color: COLORS.subtext, flex: 1 },
  urgentBadge: { backgroundColor: `${COLORS.warning}18`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  urgentText: { fontSize: 10, fontWeight: '700', color: COLORS.warning },
  previewNotifTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  previewBody: { fontSize: 13, color: COLORS.subtext, lineHeight: 18 },
  sendButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.purple, borderRadius: 14, paddingVertical: 16 },
  sendButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
