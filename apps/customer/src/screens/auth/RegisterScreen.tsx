import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, validateEmail, validatePassword } from '@nextdoor-clone/shared';
import { AppDispatch, RootState } from '../../store';
import { registerUser } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavProp>();
  const { isLoading } = useSelector((s: RootState) => s.auth);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const updateForm = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (!validateEmail(form.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    const { valid, errors } = validatePassword(form.password);
    if (!valid) {
      Alert.alert('Weak Password', `Password must include:\n• ${errors.join('\n• ')}`);
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    const result = await dispatch(registerUser({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email.toLowerCase(),
      password: form.password,
      phone: form.phone,
      address: '',
    }));
    if (registerUser.rejected.match(result)) {
      Alert.alert('Registration Failed', result.payload as string);
    }
  };

  const fields: Array<{ key: keyof typeof form; label: string; placeholder: string; icon: string; type?: string; secure?: boolean }> = [
    { key: 'firstName', label: 'First Name', placeholder: 'John', icon: 'person-outline' },
    { key: 'lastName', label: 'Last Name', placeholder: 'Doe', icon: 'person-outline' },
    { key: 'email', label: 'Email', placeholder: 'john@example.com', icon: 'mail-outline', type: 'email-address' },
    { key: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', icon: 'call-outline', type: 'phone-pad' },
    { key: 'password', label: 'Password', placeholder: 'Create a strong password', icon: 'lock-closed-outline', secure: true },
    { key: 'confirmPassword', label: 'Confirm Password', placeholder: 'Repeat your password', icon: 'lock-closed-outline', secure: true },
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSubtitle}>Join your neighborhood community</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {fields.map((field) => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name={field.icon as never} size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChangeText={updateForm(field.key)}
                keyboardType={(field.type as never) || 'default'}
                secureTextEntry={field.secure && !showPassword}
                autoCapitalize={field.key === 'email' ? 'none' : 'words'}
              />
              {field.secure && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
        <Text style={styles.termsText}>
          By signing up, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLinkText}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backButton: { marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  form: { padding: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1.5,
    borderColor: COLORS.border, paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: COLORS.text },
  eyeIcon: { position: 'absolute', right: 14 },
  termsText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  termsLink: { color: COLORS.primary, fontWeight: '600' },
  button: { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  buttonDisabled: { opacity: 0.7 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  loginLink: { alignItems: 'center' },
  loginText: { fontSize: 15, color: COLORS.textSecondary },
  loginLinkText: { color: COLORS.primary, fontWeight: '700' },
});
