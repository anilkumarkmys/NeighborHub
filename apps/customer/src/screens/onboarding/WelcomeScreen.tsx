import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@nextdoor-clone/shared';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;
const { width } = Dimensions.get('window');

const steps = [
  { icon: '🏘️', title: 'Your Neighborhood', desc: 'Connect with people who live near you and build a stronger community.' },
  { icon: '🛡️', title: 'Stay Safe', desc: 'Share safety alerts and stay informed about what\'s happening nearby.' },
  { icon: '🎉', title: 'Local Events', desc: 'Discover and join events happening right in your neighborhood.' },
  { icon: '🛒', title: 'Buy & Sell Locally', desc: 'Buy and sell items with your neighbors — no shipping needed.' },
];

export default function WelcomeScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🏘️</Text>
        <Text style={styles.heroTitle}>Welcome to NeighborHub</Text>
        <Text style={styles.heroSubtitle}>The neighborhood app trusted by millions</Text>
      </View>
      <View style={styles.stepsContainer}>
        {steps.map((step, i) => (
          <View key={i} style={styles.step}>
            <Text style={styles.stepIcon}>{step.icon}</Text>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddressVerification')}
      >
        <Text style={styles.buttonText}>Get Started →</Text>
      </TouchableOpacity>
      <Text style={styles.disclaimer}>
        Address verification required to ensure neighborhood accuracy
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  hero: { alignItems: 'center', marginBottom: 40 },
  heroIcon: { fontSize: 56, marginBottom: 16 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 8, textAlign: 'center' },
  stepsContainer: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 20, marginBottom: 32 },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepIcon: { fontSize: 32, marginRight: 16, width: 40 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  stepDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2, lineHeight: 18 },
  button: {
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  buttonText: { fontSize: 17, fontWeight: '700', color: COLORS.primary },
  disclaimer: { textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 16 },
});
