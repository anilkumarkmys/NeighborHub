import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppDispatch, RootState } from '../../store';
import { loginAdmin } from '../../store/slices/authSlice';

const COLORS = { primary: '#2D3748', accent: '#48BB78', text: '#1A202C', subtext: '#718096', bg: '#F7FAFC', border: '#E2E8F0' };

export default function AdminLoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((s: RootState) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please enter your credentials'); return; }
    const result = await dispatch(loginAdmin({ email: email.toLowerCase(), password }));
    if (loginAdmin.rejected.match(result)) Alert.alert('Access Denied', result.payload as string);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#1A202C', '#2D3748']} style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🛡️</Text>
        </View>
        <Text style={styles.title}>Admin Portal</Text>
        <Text style={styles.subtitle}>NeighborHub Management Console</Text>
      </LinearGradient>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Admin Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={COLORS.subtext} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="admin@neighborhub.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.subtext} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { paddingRight: 40 }]}
              placeholder="Enter admin password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.subtext} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <LinearGradient colors={['#48BB78', '#2F855A']} style={styles.loginButtonGradient}>
            <Ionicons name="shield-checkmark" size={20} color="#fff" />
            <Text style={styles.loginButtonText}>{isLoading ? 'Authenticating...' : 'Sign In to Admin'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={14} color={COLORS.subtext} />
          <Text style={styles.securityNoteText}>Secured admin access only. All actions are logged.</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 80, paddingBottom: 40, paddingHorizontal: 24, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  logoContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoIcon: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  form: { padding: 24, paddingTop: 32 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.text },
  eyeIcon: { position: 'absolute', right: 14 },
  loginButton: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  loginButtonGradient: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  loginButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  securityNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, justifyContent: 'center' },
  securityNoteText: { fontSize: 12, color: COLORS.subtext },
});
