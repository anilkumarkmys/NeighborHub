import React, { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, MarketplaceListing, formatCurrency } from '@nextdoor-clone/shared';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchListings } from '../../store/slices/marketplaceSlice';
import { MarketplaceStackParamList } from '../../navigation/MainNavigator';

type NavProp = NativeStackNavigationProp<MarketplaceStackParamList, 'MarketplaceScreen'>;

function ListingCard({ listing, onPress }: { listing: MarketplaceListing; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      {listing.images?.[0] ? (
        <Image source={{ uri: listing.images[0] }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}><Ionicons name="image-outline" size={40} color={COLORS.border} /></View>
      )}
      {listing.isFree && <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>FREE</Text></View>}
      {listing.status === 'sold' && (
        <View style={styles.soldOverlay}><Text style={styles.soldText}>SOLD</Text></View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.listingTitle} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.price}>
          {listing.isFree ? 'Free' : formatCurrency(listing.price)}
        </Text>
        <View style={styles.cardMeta}>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{listing.condition.replace('_', ' ')}</Text>
          </View>
          <Text style={styles.location} numberOfLines={1}>
            <Ionicons name="location-outline" size={11} color={COLORS.textSecondary} />
            {listing.seller.neighborhood}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MarketplaceScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavProp>();
  const { listings, isLoading, hasMore, page } = useSelector((s: RootState) => s.marketplace);

  useEffect(() => { dispatch(fetchListings({ page: 1 })); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>For Sale & Free</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateListing')}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })} />
        )}
        refreshControl={<RefreshControl refreshing={isLoading && page === 1} onRefresh={() => dispatch(fetchListings({ page: 1 }))} tintColor={COLORS.primary} />}
        onEndReached={() => { if (!isLoading && hasMore) dispatch(fetchListings({ page: page + 1 })); }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isLoading && page > 1 ? <ActivityIndicator color={COLORS.primary} style={{ padding: 20 }} /> : null}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Nothing for sale yet</Text>
            <Text style={styles.emptyText}>Be the first to list something in your neighborhood!</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('CreateListing')}>
              <Text style={styles.emptyButtonText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  createButton: { backgroundColor: COLORS.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 12, paddingBottom: 20 },
  columnWrapper: { gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6 },
  image: { width: '100%', height: 140 },
  imagePlaceholder: { width: '100%', height: 140, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  freeBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: COLORS.success, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  freeBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  soldOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 140, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  soldText: { color: '#fff', fontWeight: '800', fontSize: 22, letterSpacing: 1 },
  cardContent: { padding: 10 },
  listingTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  conditionBadge: { backgroundColor: COLORS.background, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  conditionText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'capitalize' },
  location: { fontSize: 11, color: COLORS.textSecondary, flex: 1, textAlign: 'right' },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  emptyButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  emptyButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
