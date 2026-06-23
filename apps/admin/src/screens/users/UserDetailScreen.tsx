import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getInitials, formatRelativeTime } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchUserById, suspendUser, banUser, reactivateUser } from '../../store/slices/usersSlice';

const COLORS = { bg: '#F7FAFC', card: '#fff', primary: '#2D3748', accent: '#48BB78', border: '#E2E8F0', subtext: '#718096', danger: '#E53E3E', warning: '#DD6B20' };

export default function UserDetailScreen() {
  const route = useRoute<RouteProp<{ UserDetail: { userId: string } }, 'UserDetail'>>();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser } = useSelector((s: RootState) => s.users);

  useEffect(() => { dispatch(fetchUserById(route.params.userId)); }, [route.params.userId]);

  const handleSuspend = () => {
    Alert.prompt('Suspend User', 'Enter reason for suspension:', (reason) => {
      if (reason) dispatch(suspendUser({ userId: route.params.userId, reason }));
    });
  };

  const handleBan = () => {
    Alert.alert('Ban User', 'Are you sure you want to permanently ban this user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Ban', style: 'destructive', onPress: () => {
        Alert.prompt('Ban Reason', 'Enter reason:', (reason) => {
          if (reason) dispatch(banUser({ userId: route.params.userId, reason }));
        });
      }},
    ]);
  };

  const handleReactivate = () => {
    Alert.alert('Reactivate', 'Reactivate this user account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reactivate', onPress: () => dispatch(reactivateUser(route.params.userId)) },
    ]);
  };

  if (!selectedUser) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatarSection}>
          {selectedUser.avatar ? (
            <Image source={{ uri: selectedUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(selectedUser.displayName)}</Text>
            </View>
          )}
          <View style={[styles.statusIndicator, { backgroundColor: selectedUser.isActive ? COLORS.accent : COLORS.danger }]} />
        </View>
        <Text style={styles.name}>{selectedUser.displayName}</Text>
        <Text style={styles.email}>{selectedUser.email}</Text>
        <View style={styles.badges}>
          <View style={styles.roleBadge}><Text style={styles.roleText}>{selectedUser.role.toUpperCase()}</Text></View>
          {selectedUser.isVerified && <View style={styles.verifiedBadge}><Ionicons name="checkmark-circle" size={14} color={COLORS.accent} /><Text style={styles.verifiedText}>Verified</Text></View>}
          {!selectedUser.isActive && <View style={styles.suspendedBadge}><Text style={styles.suspendedText}>INACTIVE</Text></View>}
        </View>
      </View>
      <View style={styles.infoCard}>
        {[
          { label: 'Neighborhood', value: selectedUser.neighborhood, icon: 'location-outline' },
          { label: 'Phone', value: selectedUser.phone || 'Not provided', icon: 'call-outline' },
          { label: 'Joined', value: new Date(selectedUser.joinedAt).toLocaleDateString(), icon: 'calendar-outline' },
          { label: 'Last Active', value: formatRelativeTime(selectedUser.lastActiveAt), icon: 'time-outline' },
          { label: 'Posts', value: String(selectedUser.postCount), icon: 'newspaper-outline' },
          { label: 'Replies', value: String(selectedUser.replyCount), icon: 'chatbubble-outline' },
          { label: 'Thanks', value: String(selectedUser.thankCount), icon: 'heart-outline' },
        ].map((item, i) => (
          <View key={i} style={[styles.infoRow, i < 6 && styles.infoRowBorder]}>
            <Ionicons name={item.icon as never} size={18} color={COLORS.subtext} />
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Admin Actions</Text>
        {selectedUser.isActive ? (
          <>
            <TouchableOpacity style={styles.warnButton} onPress={handleSuspend}>
              <Ionicons name="ban-outline" size={18} color={COLORS.warning} />
              <Text style={styles.warnButtonText}>Suspend User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerButton} onPress={handleBan}>
              <Ionicons name="skull-outline" size={18} color={COLORS.danger} />
              <Text style={styles.dangerButtonText}>Permanently Ban</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.successButton} onPress={handleReactivate}>
            <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.accent} />
            <Text style={styles.successButtonText}>Reactivate Account</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  profileCard: { backgroundColor: COLORS.card, padding: 24, alignItems: 'center', marginBottom: 12 },
  avatarSection: { position: 'relative', marginBottom: 16 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#4299E1', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontWeight: '800', fontSize: 30 },
  statusIndicator: { position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.card },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  email: { fontSize: 14, color: COLORS.subtext, marginTop: 4 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 12 },
  roleBadge: { backgroundColor: '#EBF8FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  roleText: { fontSize: 11, color: '#2B6CB0', fontWeight: '700' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FFF4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  verifiedText: { fontSize: 11, color: COLORS.accent, fontWeight: '700' },
  suspendedBadge: { backgroundColor: '#FFF5F5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  suspendedText: { fontSize: 11, color: COLORS.danger, fontWeight: '700' },
  infoCard: { backgroundColor: COLORS.card, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { flex: 1, fontSize: 14, color: COLORS.subtext },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  actionsCard: { backgroundColor: COLORS.card, marginHorizontal: 16, borderRadius: 14, padding: 16, marginBottom: 24 },
  actionsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 14 },
  warnButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFAF0', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#F6AD55', marginBottom: 10 },
  warnButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.warning },
  dangerButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF5F5', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#FC8181' },
  dangerButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.danger },
  successButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F0FFF4', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#9AE6B4' },
  successButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.accent },
});
