import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';

export default function ProfileSetupScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((s: RootState) => s.auth);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const result = await dispatch(updateProfile({ bio, avatar: avatar || undefined }));
    if (updateProfile.rejected.match(result)) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
        <Text style={styles.headerTitle}>Set Up Your Profile</Text>
        <Text style={styles.headerSubtitle}>Help your neighbors recognize you</Text>
      </LinearGradient>
      <View style={styles.formCard}>
        <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.userNeighborhood}>
          <Ionicons name="location" size={14} color={COLORS.primary} /> {user?.neighborhood}
        </Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio (optional)</Text>
          <TextInput
            style={styles.bioInput}
            placeholder="Tell your neighbors a bit about yourself..."
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={200}
          />
          <Text style={styles.charCount}>{bio.length}/200</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Complete Setup'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSave}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  header: { paddingTop: 80, paddingBottom: 40, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
  formCard: { margin: 20, padding: 24, backgroundColor: COLORS.surface, borderRadius: 20, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 },
  avatarPicker: { position: 'relative', marginBottom: 16, marginTop: -48 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: '#fff' },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff',
  },
  avatarInitials: { fontSize: 32, fontWeight: '800', color: '#fff' },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0, width: 30, height: 30,
    borderRadius: 15, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  userName: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  userNeighborhood: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  inputGroup: { width: '100%', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  bioInput: {
    backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    padding: 14, fontSize: 15, color: COLORS.text, minHeight: 100, textAlignVertical: 'top',
  },
  charCount: { alignSelf: 'flex-end', fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  button: { width: '100%', borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  buttonDisabled: { opacity: 0.7 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  skipButton: { paddingVertical: 8 },
  skipText: { color: COLORS.textSecondary, fontSize: 15 },
});
