import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  // A card-like container with border, radius, and background color
  card: {
    borderWidth: 2,
    borderColor: '#ECEFF1',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  // For centering content
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // For row layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Main container
  container: {
    flex: 1,
  },
  // ScrollView content container
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 60,
  },
});