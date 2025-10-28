import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants';

/**
 * Daily photo selection screen
 * Shows today's randomly selected photo and review options
 * TODO: Implement photo selection and review flow
 */
export default function DailyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Photo</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>No photo selected yet</Text>
        <Text style={styles.placeholderSubtext}>
          A random photo will be selected from your gallery
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  placeholderSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
