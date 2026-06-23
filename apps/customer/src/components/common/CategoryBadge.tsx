import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostCategory, COLORS, POST_CATEGORIES } from '@nextdoor-clone/shared';

const CATEGORY_COLORS: Record<string, string> = {
  general: COLORS.general,
  safety: COLORS.safety,
  events: COLORS.event,
  marketplace: COLORS.marketplace,
  recommendations: COLORS.recommendations,
  lost_found: COLORS.lost_found,
  help_request: COLORS.help_request,
  announcement: COLORS.announcement,
};

interface Props {
  category: PostCategory;
}

export default function CategoryBadge({ category }: Props) {
  const cat = POST_CATEGORIES.find((c) => c.key === category);
  const color = CATEGORY_COLORS[category] || COLORS.textSecondary;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
      <Ionicons name={(cat?.icon || 'home') as never} size={12} color={color} />
      <Text style={[styles.label, { color }]}>{cat?.label || category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  label: { fontSize: 11, fontWeight: '700' },
});
