import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, EVENT_CATEGORIES } from '@nextdoor-clone/shared';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createEvent } from '../../store/slices/eventsSlice';
import { useNavigation } from '@react-navigation/native';

export default function CreateEventScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(false);
  const [category, setCategory] = useState(EVENT_CATEGORIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title || !description || (!isOnline && !location)) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    const result = await dispatch(createEvent({
      title,
      description,
      startDate: startDate.toISOString(),
      isOnline,
      location: { latitude: 0, longitude: 0, address: location },
      category,
    }));
    setIsSubmitting(false);
    if (createEvent.fulfilled.match(result)) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to create event');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.label}>Event Title *</Text>
        <TextInput style={styles.input} placeholder="What's the event?" value={title} onChangeText={setTitle} />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Describe your event..." value={description} onChangeText={setDescription} multiline />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {EVENT_CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.categoryChip, category === cat && styles.categoryChipSelected]} onPress={() => setCategory(cat)}>
              <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Online Event</Text>
          <Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ true: COLORS.primary }} />
        </View>
      </View>
      {!isOnline && (
        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
            <TextInput style={[styles.input, styles.inputFlex]} placeholder="Enter location" value={location} onChangeText={setLocation} />
          </View>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.label}>Start Date & Time</Text>
        <DateTimePicker value={startDate} mode="datetime" onChange={(_, date) => date && setStartDate(date)} minimumDate={new Date()} />
      </View>
      <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} onPress={handleCreate} disabled={isSubmitting}>
        <Text style={styles.submitButtonText}>{isSubmitting ? 'Creating...' : 'Create Event'}</Text>
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
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputFlex: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8 },
  categoryChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  categoryChipTextSelected: { color: '#fff' },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
