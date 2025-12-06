import { CoCard, CoCardTitle, CoSafeContainer, CoText } from '@/components';
import { useAuth } from '@/contexts';
import { Palette } from '@/styles/pallete';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeTab() {
  const { currentUser } = useAuth();
  return (
    <CoSafeContainer>
      <View style={{ gap: 20 }}>
        <CoCard style={styles.infoCard}>
          <CoCardTitle white>Welcome {currentUser?.firstName}</CoCardTitle>
          <CoText white>Check how your stores are performing easily!</CoText>
        </CoCard>
        <View>
          <CoCardTitle style={{ marginBottom: 10 }}>My Stores</CoCardTitle>

          <View style={styles.storesGrid}>
            {currentUser?.stores.map((store, index) => (
              <CoCard touchable key={index} style={[styles.storeCard]}>
                <CoCardTitle>{store.name}</CoCardTitle>
              </CoCard>
            ))}
            <CoCard touchable style={[styles.storeCard, styles.addCard]}>
              <Ionicons name='add' size={40}/>
            </CoCard>
          </View>
        </View>
      </View>

    </CoSafeContainer>
  );
}

const styles = StyleSheet.create({
  storesGrid: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  infoCard: { backgroundColor: Palette.backgroundPrimary },
  storeCard: {
    backgroundColor: Palette.yellow,
    width: '48%', 
    height: '48%',
    aspectRatio: 3/2, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  addCard: {
    backgroundColor: Palette.gray,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center'
  }
})