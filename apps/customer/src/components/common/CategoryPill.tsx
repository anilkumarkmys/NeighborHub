import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@nextdoor-clone/shared';

interface Props {
  label: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
}

export default function CategoryPill({ label, icon, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.pill, selected && styles.pillSelected]}
      onPress={onPress}
    >
      <Ionicons name={icon as never} size={14} color={selected ? '#fff' : COLORS.textSecondary} />
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
  },
  pillSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  labelSelected: { color: '#fff' },
});
