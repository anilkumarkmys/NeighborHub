import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logoutAdmin } from '../../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';

const COLORS = { bg: '#F7FAFC', card: '#fff', primary: '#2D3748', accent: '#48BB78', border: '#E2E8F0', subtext: '#718096', danger: '#E53E3E', purple: '#805AD5' };

export default function AdminSettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { admin } = useSelector((s: RootState) => s.auth);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Sign out of the admin console?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logoutAdmin()) },
    ]);
  };

  const menuSections = [
    {
      title: 'Management',
      items: [
        { icon: 'analytics', label: 'Analytics', color: '#4299E1', onPress: () => (navigation as never).navigate('Analytics') },
        { icon: 'map', label: 'Neighborhoods', color: COLORS.accent, onPress: () => (navigation as never).navigate('Neighborhoods') },
        { icon: 'notifications', label: 'Push Notifications', color: COLORS.purple, onPress: () => (navigation as never).navigate('Notifications') },
        { icon: 'layers', label: 'App Versions', color: '#805AD5', onPress: () => (navigation as never).navigate('Versions') },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: 'lock-closed-outline', label: 'Change Password', color: COLORS.subtext, onPress: () => {} },
        { icon: 'document-text-outline', label: 'Activity Logs', color: COLORS.subtext, onPress: () => {} },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.adminCard}>
        <View style={styles.adminAvatar}>
          <Text style={styles.adminAvatarText}>{admin?.firstName?.[0]}{admin?.lastName?.[0]}</Text>
        </View>
        <View>
          <Text style={styles.adminName}>{admin?.displayName}</Text>
          <Text style={styles.adminEmail}>{admin?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield" size={12} color={COLORS.purple} />
            <Text style={styles.roleText}>{admin?.role?.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      {menuSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, i) => (
              <TouchableOpacity key={i} style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]} onPress={item.onPress}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}18` }]}>
                  <Ionicons name={item.icon as never} size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out of Admin Console</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.version}>NeighborHub Admin v1.0.0 · All actions are logged</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  adminCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: COLORS.card, padding: 20, marginBottom: 12 },
  adminAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.purple, alignItems: 'center', justifyContent: 'center' },
  adminAvatarText: { color: '#fff', fontWeight: '800', fontSize: 22 },
  adminName: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  adminEmail: { fontSize: 13, color: COLORS.subtext, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FAF5FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, alignSelf: 'flex-start' },
  roleText: { fontSize: 11, fontWeight: '700', color: COLORS.purple },
  section: { margin: 16, marginBottom: 0 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4 },
  sectionCard: { backgroundColor: COLORS.card, borderRadius: 14, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.primary },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFF5F5', borderRadius: 14, paddingVertical: 16, borderWidth: 1.5, borderColor: '#FED7D7' },
  logoutText: { fontSize: 16, fontWeight: '700', color: COLORS.danger },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.subtext, paddingVertical: 24 },
});
