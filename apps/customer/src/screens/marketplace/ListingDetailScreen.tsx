import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, MarketplaceListing, formatCurrency, formatRelativeTime, getInitials } from '@nextdoor-clone/shared';
import { MarketplaceStackParamList } from '../../navigation/MainNavigator';
import apiClient from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type RoutePropType = RouteProp<MarketplaceStackParamList, 'ListingDetail'>;

export default function ListingDetailScreen() {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation();
  const { user } = useSelector((s: RootState) => s.auth);
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    apiClient.get(`/marketplace/${route.params.listingId}`)
      .then((res) => setListing(res.data.data))
      .catch(() => Alert.alert('Error', 'Failed to load listing'));
  }, [route.params.listingId]);

  if (!listing) return null;
  const isOwn = listing.sellerId === user?.id;

  return (
    <ScrollView style={styles.container}>
      {listing.images?.length > 0 ? (
        <View>
          <Image source={{ uri: listing.images[activeImage] }} style={styles.mainImage} />
          {listing.images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnails}>
              {listing.images.map((img, i) => (
                <TouchableOpacity key={i} onPress={() => setActiveImage(i)}>
                  <Image source={{ uri: img }} style={[styles.thumbnail, activeImage === i && styles.thumbnailActive]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      ) : (
        <View style={styles.imagePlaceholder}><Ionicons name="image-outline" size={64} color={COLORS.border} /></View>
      )}
      <View style={styles.content}>
        {listing.status === 'sold' && (
          <View style={styles.soldBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.soldBannerText}>This item has been sold</Text>
          </View>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{listing.isFree ? 'FREE' : formatCurrency(listing.price)}</Text>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{listing.condition.replace('_', ' ')}</Text>
          </View>
        </View>
        <Text style={styles.title}>{listing.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{listing.seller.neighborhood} · {formatRelativeTime(listing.createdAt)}</Text>
        </View>
        <View style={styles.sellerCard}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>{getInitials(listing.seller.displayName)}</Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{listing.seller.displayName}</Text>
            <Text style={styles.sellerLocation}>{listing.seller.neighborhood}</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{listing.description}</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{listing.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Condition</Text>
            <Text style={styles.detailValue}>{listing.condition.replace('_', ' ')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, { color: listing.status === 'available' ? COLORS.success : COLORS.textSecondary }]}>
              {listing.status}
            </Text>
          </View>
        </View>
        {!isOwn && listing.status === 'available' && (
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="chatbubble" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Message Seller</Text>
          </TouchableOpacity>
        )}
        {isOwn && (
          <View style={styles.ownerActions}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Listing</Text>
            </TouchableOpacity>
            {listing.status === 'available' && (
              <TouchableOpacity style={styles.markSoldButton}>
                <Text style={styles.markSoldButtonText}>Mark as Sold</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mainImage: { width: '100%', height: 300 },
  thumbnails: { padding: 8 },
  thumbnail: { width: 72, height: 72, borderRadius: 8, marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  thumbnailActive: { borderColor: COLORS.primary },
  imagePlaceholder: { height: 240, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  soldBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.textSecondary, borderRadius: 10, padding: 12, marginBottom: 16 },
  soldBannerText: { color: '#fff', fontWeight: '700' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  price: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  conditionBadge: { backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  conditionText: { color: COLORS.primary, fontWeight: '700', fontSize: 13, textTransform: 'capitalize' },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  metaText: { fontSize: 13, color: COLORS.textSecondary },
  sellerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 20 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sellerAvatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sellerInfo: {},
  sellerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  sellerLocation: { fontSize: 13, color: COLORS.textSecondary },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  description: { fontSize: 15, color: COLORS.text, lineHeight: 23, marginBottom: 20 },
  detailsCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  detailLabel: { fontSize: 14, color: COLORS.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '600', color: COLORS.text, textTransform: 'capitalize' },
  contactButton: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  contactButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  ownerActions: { gap: 12 },
  editButton: { backgroundColor: COLORS.primaryLight, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  editButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  markSoldButton: { backgroundColor: COLORS.textSecondary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  markSoldButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
