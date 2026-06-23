import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { verifyAddress } from '../../store/slices/authSlice';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList, 'AddressVerification'>;

export default function AddressVerificationScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, user } = useSelector((s: RootState) => s.auth);
  const [address, setAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleUseLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to verify your address.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const [geo] = await Location.reverseGeocodeAsync(location.coords);
      if (geo) {
        const formatted = [geo.streetNumber, geo.street, geo.city, geo.region, geo.postalCode]
          .filter(Boolean)
          .join(', ');
        setAddress(formatted);
        setCoords({ lat: location.coords.latitude, lng: location.coords.longitude });
      }
    } catch {
      Alert.alert('Error', 'Could not get your location. Please enter your address manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleVerify = async () => {
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter or detect your home address');
      return;
    }
    if (!coords) {
      Alert.alert('Location Required', 'Please use "Use My Location" or enter an address with coordinates');
      return;
    }
    const result = await dispatch(verifyAddress({ address: address.trim(), lat: coords.lat, lng: coords.lng }));
    if (verifyAddress.fulfilled.match(result)) {
      navigation.navigate('OtpVerification', { email: user?.email || '' });
    } else {
      Alert.alert('Verification Failed', result.payload as string);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Your Address</Text>
        <Text style={styles.headerSubtitle}>
          We verify your home address to connect you with the right neighborhood
        </Text>
      </LinearGradient>
      <View style={styles.formCard}>
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>Your exact address is never shared publicly. Only your neighborhood is visible to others.</Text>
        </View>
        <TouchableOpacity style={styles.locationButton} onPress={handleUseLocation} disabled={isGettingLocation}>
          {isGettingLocation ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Ionicons name="location" size={20} color={COLORS.primary} />
          )}
          <Text style={styles.locationButtonText}>
            {isGettingLocation ? 'Detecting location...' : 'Use My Current Location'}
          </Text>
        </TouchableOpacity>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or enter manually</Text>
          <View style={styles.dividerLine} />
        </View>
        <Text style={styles.label}>Home Address</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="home-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="123 Main St, City, State, ZIP"
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>
        <Text style={styles.addressNote}>
          This address will be used to determine your neighborhood. Enter your full address including ZIP code.
        </Text>
        <TouchableOpacity
          style={[styles.button, (isLoading || !address) && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isLoading || !address}
        >
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>{isLoading ? 'Verifying...' : 'Verify Address'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backButton: { marginBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 8, lineHeight: 20 },
  formCard: { margin: 20, padding: 20, backgroundColor: COLORS.surface, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 14, marginBottom: 20 },
  infoText: { flex: 1, marginLeft: 12, fontSize: 13, color: COLORS.primaryDark, lineHeight: 19 },
  locationButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primaryLight, borderRadius: 12, paddingVertical: 14,
    borderWidth: 1.5, borderColor: COLORS.primary, marginBottom: 20,
  },
  locationButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 15, marginLeft: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 10, color: COLORS.textSecondary, fontSize: 13 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  inputWrapper: {
    backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1.5,
    borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12,
  },
  inputIcon: { marginRight: 10, marginTop: 2 },
  input: { flex: 1, fontSize: 15, color: COLORS.text, minHeight: 60 },
  addressNote: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 24, lineHeight: 18 },
  button: { borderRadius: 14, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.5 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
