import { useAuth } from '@/contexts';
import { View, Text, StyleSheet } from 'react-native';

export default function Tab() {
  const { currentUser } = useAuth();
  return (
    <View style={styles.container}>
      <Text>Welcome {currentUser?.firstName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});