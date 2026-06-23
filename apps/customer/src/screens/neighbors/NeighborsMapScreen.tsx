import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getInitials } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchNeighbors } from '../../store/slices/neighborsSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FeedStackParamList } from '../../navigation/MainNavigator';

type NavProp = NativeStackNavigationProp<FeedStackParamList, 'SafetyAlerts'>;

export default function NeighborsMapScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavProp>();
  const { neighbors, isLoading } = useSelector((s: RootState) => s.neighbors);
  const { user } = useSelector((s: RootState) => s.auth);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    dispatch(fetchNeighbors());
    getLocation();
  }, []);

  const getLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setMyLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } finally {
      setIsLocating(false);
    }
  };

  if (!myLocation && isLocating) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  const mapRegion = myLocation ? {
    latitude: myLocation.latitude,
    longitude: myLocation.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  } : undefined;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {neighbors.map((neighbor) => (
          neighbor.location?.latitude && neighbor.location?.longitude ? (
            <Marker
              key={neighbor.id}
              coordinate={{ latitude: neighbor.location.latitude, longitude: neighbor.location.longitude }}
              onPress={() => (navigation as never).navigate('NeighborProfile', { userId: neighbor.id })}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerAvatar}>
                  <Text style={styles.markerInitials}>{getInitials(neighbor.displayName)}</Text>
                </View>
                <View style={styles.markerTail} />
              </View>
            </Marker>
          ) : null
        ))}
      </MapView>
      <View style={styles.overlay}>
        <View style={styles.neighborCount}>
          <Ionicons name="people" size={18} color={COLORS.primary} />
          <Text style={styles.neighborCountText}>{neighbors.length} neighbors nearby</Text>
        </View>
        <TouchableOpacity style={styles.myLocationButton} onPress={getLocation}>
          <Ionicons name="locate" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textSecondary, marginTop: 12 },
  overlay: { position: 'absolute', bottom: 24, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  neighborCount: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8 },
  neighborCountText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  myLocationButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8 },
  markerContainer: { alignItems: 'center' },
  markerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  markerInitials: { color: '#fff', fontWeight: '700', fontSize: 13 },
  markerTail: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: COLORS.primary },
});
