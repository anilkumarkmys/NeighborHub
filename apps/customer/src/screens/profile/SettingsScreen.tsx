import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, APP_CONFIG } from '@nextdoor-clone/shared';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    safetyAlerts: true,
    eventsNearby: true,
    directMessages: true,
    marketplaceAlerts: false,
    shareLocation: true,
    showProfile: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logoutUser()) },
    ]);
  };

  const sections = [
    {
      title: 'Notifications',
      items: [
        { key: 'pushNotifications', label: 'Push Notifications', icon: 'notifications-outline' },
        { key: 'emailNotifications', label: 'Email Digest', icon: 'mail-outline' },
        { key: 'safetyAlerts', label: 'Safety Alerts', icon: 'shield-outline' },
        { key: 'eventsNearby', label: 'Events Nearby', icon: 'calendar-outline' },
        { key: 'directMessages', label: 'Direct Messages', icon: 'chatbubble-outline' },
        { key: 'marketplaceAlerts', label: 'Marketplace Matches', icon: 'pricetag-outline' },
      ],
    },
    {
      title: 'Privacy',
      items: [
        { key: 'shareLocation', label: 'Share Approximate Location', icon: 'location-outline' },
        { key: 'showProfile', label: 'Show Profile to Neighbors', icon: 'person-outline' },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, i) => (
              <View key={item.key} style={[styles.settingRow, i < section.items.length - 1 && styles.settingRowBorder]}>
                <View style={styles.settingIcon}>
                  <Ionicons name={item.icon as never} size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Switch
                  value={settings[item.key as keyof typeof settings]}
                  onValueChange={() => toggle(item.key as keyof typeof settings)}
                  trackColor={{ true: COLORS.primary }}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder]}>
            <View style={styles.settingIcon}><Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} /></View>
            <Text style={styles.settingLabel}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder]}>
            <View style={styles.settingIcon}><Ionicons name="shield-outline" size={20} color={COLORS.primary} /></View>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIcon}><Ionicons name="document-text-outline" size={20} color={COLORS.primary} /></View>
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.version}>NeighborHub v1.0.0 · {APP_CONFIG.supportEmail}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  section: { margin: 16, marginBottom: 0 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4 },
  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 14, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  settingIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFF5F5', borderRadius: 14, paddingVertical: 16, borderWidth: 1.5, borderColor: '#FED7D7' },
  logoutText: { fontSize: 16, fontWeight: '700', color: COLORS.error },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textSecondary, paddingVertical: 24 },
});
