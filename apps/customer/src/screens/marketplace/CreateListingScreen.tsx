import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, MARKETPLACE_CATEGORIES, ITEM_CONDITIONS } from '@nextdoor-clone/shared';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createListing } from '../../store/slices/marketplaceSlice';
import { useNavigation } from '@react-navigation/native';

export default function CreateListingScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [category, setCategory] = useState(MARKETPLACE_CATEGORIES[0]);
  const [condition, setCondition] = useState(ITEM_CONDITIONS[0].key);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled) setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 8));
  };

  const handleCreate = async () => {
    if (!title || !description || (!isFree && !price)) { Alert.alert('Missing Fields', 'Please fill in all required fields'); return; }
    setIsSubmitting(true);
    const result = await dispatch(createListing({ title, description, price: parseFloat(price) || 0, isFree, category, condition: condition as never, images, status: 'available' }));
    setIsSubmitting(false);
    if (createListing.fulfilled.match(result)) navigation.goBack();
    else Alert.alert('Error', 'Failed to create listing');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.label}>Photos (up to 8)</Text>
        <View style={styles.imageGrid}>
          {images.map((img, i) => (
            <View key={i} style={styles.imageWrapper}>
              <Image source={{ uri: img }} style={styles.image} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => setImages((p) => p.filter((_, idx) => idx !== i))}>
                <Ionicons name="close-circle" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 8 && (
            <TouchableOpacity style={styles.addImage} onPress={pickImages}>
              <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
              <Text style={styles.addImageText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} placeholder="What are you selling?" value={title} onChangeText={setTitle} />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Describe the item, include condition, size, etc." value={description} onChangeText={setDescription} multiline />
      </View>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Free Item</Text>
          <Switch value={isFree} onValueChange={setIsFree} trackColor={{ true: COLORS.primary }} />
        </View>
        {!isFree && (
          <View style={styles.priceRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput style={[styles.input, styles.priceInput]} placeholder="0.00" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          </View>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipSelected]} onPress={() => setCategory(cat)}>
              <Text style={[styles.chipText, category === cat && styles.chipTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Condition</Text>
        <View style={styles.conditionGrid}>
          {ITEM_CONDITIONS.map((c) => (
            <TouchableOpacity key={c.key} style={[styles.conditionChip, condition === c.key && styles.conditionChipSelected]} onPress={() => setCondition(c.key)}>
              <Text style={[styles.conditionText, condition === c.key && styles.conditionTextSelected]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} onPress={handleCreate} disabled={isSubmitting}>
        <Text style={styles.submitButtonText}>{isSubmitting ? 'Creating...' : 'List for Sale'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  section: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  input: { fontSize: 15, color: COLORS.text, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  currencySymbol: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  priceInput: { flex: 1 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageWrapper: { position: 'relative' },
  image: { width: 90, height: 90, borderRadius: 10 },
  removeBtn: { position: 'absolute', top: -6, right: -6 },
  addImage: { width: 90, height: 90, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  addImageText: { fontSize: 11, color: COLORS.primary, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8 },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  chipTextSelected: { color: '#fff' },
  conditionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conditionChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border },
  conditionChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  conditionText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  conditionTextSelected: { color: '#fff' },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
