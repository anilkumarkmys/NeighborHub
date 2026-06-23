import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { verifyOtp } from '../../store/slices/authSlice';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import apiClient from '../../services/api';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList, 'OtpVerification'>;
type RoutePropType = RouteProp<OnboardingStackParamList, 'OtpVerification'>;

export default function OtpVerificationScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((s: RootState) => s.auth);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const { email } = route.params;

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { setCanResend(true); clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== '')) handleVerify(newOtp.join(''));
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) { Alert.alert('Error', 'Please enter the 6-digit code'); return; }
    const result = await dispatch(verifyOtp({ otp: otpCode, email }));
    if (verifyOtp.rejected.match(result)) {
      Alert.alert('Invalid OTP', result.payload as string);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await apiClient.post('/auth/resend-otp', { email });
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      Alert.alert('OTP Sent', 'A new verification code has been sent to your email');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Your Email</Text>
        <Text style={styles.headerSubtitle}>Enter the 6-digit code sent to {email}</Text>
      </LinearGradient>
      <View style={styles.content}>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputs.current[index] = ref; }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(text) => handleChange(text.slice(-1), index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>
        <TouchableOpacity
          style={[styles.button, (isLoading || otp.some((d) => !d)) && styles.buttonDisabled]}
          onPress={() => handleVerify()}
          disabled={isLoading || otp.some((d) => !d)}
        >
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>{isLoading ? 'Verifying...' : 'Verify'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.countdownText}>Resend code in {countdown}s</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backButton: { marginBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
  content: { flex: 1, padding: 32, paddingTop: 48 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 36 },
  otpInput: {
    width: 48, height: 60, borderRadius: 14, borderWidth: 2, borderColor: COLORS.border,
    textAlign: 'center', fontSize: 24, fontWeight: '700', backgroundColor: COLORS.surface, color: COLORS.text,
  },
  otpInputFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  button: { borderRadius: 14, overflow: 'hidden', marginBottom: 24 },
  buttonDisabled: { opacity: 0.5 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resendContainer: { alignItems: 'center' },
  resendText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  countdownText: { color: COLORS.textSecondary, fontSize: 14 },
});
