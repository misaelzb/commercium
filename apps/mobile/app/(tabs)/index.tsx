import { CoButton, CoCard, CoCardTitle, CoInput, CoSafeContainer, CoText } from '@/components';
import { useAuth } from '@/contexts';
import { Palette } from '@/styles/pallete';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { View, Text, StyleSheet, Modal, Alert, Pressable, ScrollView } from 'react-native';
import { BlurView } from "expo-blur"
import { client } from '@/services';
import { router } from 'expo-router';
import { Store } from '@commercium/core';

export default function HomeTab() {
  const { currentUser, authHeader } = useAuth();
  const [localStores, setLocalStores] = useState<Store.StoreType[]>(currentUser!.stores);

  const [createStoreModalVisible, setCSModalVisible] = useState(false);
  const [deleteStoreModalVisible, setDSModalVisible] = useState(false);
  const [storePressedId, setStorePressedId] = useState(0);
  const [storePressedName, setStorePressedName] = useState('');

  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleShowModal = () => {
    setError('');
    setCSModalVisible(!createStoreModalVisible)
  };
  const toggleShowDeleteModal = () => {
    setError('');
    setDSModalVisible(!deleteStoreModalVisible)
  };

  const handleCreateStore = async () => {
    setLoading(true);
    let response = await client.api.stores.create.$post({
      json: {
        name: storeName,
        description: (storeDescription.trim().length > 0 ? storeDescription : null)
      }
    }, {
      headers: authHeader
    });
    let d = await response.json();
    console.log(d)
    if (d.error) setError(d.error);
    else {
      setLocalStores(prevState => [...prevState, d.data]);
      setStoreName('');
      setStoreDescription('');
      toggleShowModal();
    }
    setLoading(false);
  }

  const handleDeleteStore = async () => {
    setLoading(true);
    let response = await client.api.stores[':id'].$delete({
      param: { id: storePressedId.toString()}
    }, {
      headers: authHeader
    });
    let d = await response.json();
    if (d.error) setError(d.error);
    else {
      setLocalStores(prevState => prevState.filter((s) => s.id !== storePressedId));
      toggleShowDeleteModal();
    }
    setLoading(false);
  }

  return (
    <CoSafeContainer>
      {createStoreModalVisible ?
        <Modal
          animationType="fade"
          transparent={true}
          visible={createStoreModalVisible}
          onRequestClose={toggleShowModal}>
          <BlurView intensity={100} tint="dark" style={styles.absoluteFull}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <CoText asTitle>Add your store</CoText>
                {!error ? <CoText>Start taking control of your business with commercium</CoText>
                  : <CoText style={{ color: Palette.danger }}>{error}</CoText>}
                <View>
                  <CoInput
                    placeholder='Your store name'
                    value={storeName}
                    onChangeText={setStoreName}
                  />
                  <CoInput
                    placeholder='Description of your store (optional)'
                    value={storeDescription}
                    onChangeText={setStoreDescription}
                  />
                </View>
                <View style={{ gap: 5 }}>
                  <CoButton
                    type='primary'
                    text="Create"
                    isLoading={isLoading}
                    onPress={handleCreateStore} />
                  <CoButton
                    type='secondary'
                    text="Cancel"
                    disabled={isLoading}
                    onPress={toggleShowModal} />
                </View>
              </View>
            </View>
          </BlurView>

        </Modal>
        : null}
      
      {deleteStoreModalVisible ? <Modal
          animationType="fade"
          transparent={true}
          visible={deleteStoreModalVisible}
          onRequestClose={toggleShowModal}>
          <BlurView intensity={100} tint="dark" style={styles.absoluteFull}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <CoText asTitle>Delete store</CoText>
                {!error ? <CoText>Do you want to delete '{storePressedName}'?</CoText>
                  : <CoText style={{ color: Palette.danger }}>{error}</CoText>}
                <View style={{ gap: 5 }}>
                  <CoButton
                    type='danger'
                    text="Yes, delete this store"
                    isLoading={isLoading}
                    onPress={handleDeleteStore} />
                  <CoButton
                    type='secondary'
                    text="Cancel"
                    disabled={isLoading}
                    onPress={toggleShowDeleteModal} />
                </View>
              </View>
            </View>
          </BlurView>

        </Modal>
        : null}

      <ScrollView>
        <CoCard style={styles.infoCard}>
          <CoCardTitle white>Welcome {currentUser?.firstName}</CoCardTitle>
          <CoText white>Check how your stores are performing easily with commercium!</CoText>
        </CoCard>
        <View>
          <CoCardTitle style={{ margin: 10 }}>Your Stores</CoCardTitle>

          <View style={styles.storesGrid}>
            {localStores.map((store, arrIndex) => (
              <CoCard touchable onLongPress={() => {
                setStorePressedId(store.id);
                setStorePressedName(store.name);
                toggleShowDeleteModal();
              }} key={arrIndex} style={[styles.storeCard]}>
                <CoCardTitle white>{store.name}</CoCardTitle>
                <CoText white style={{ textAlign: 'center' }}>{store.description}</CoText>
              </CoCard>
            ))}
            <CoCard touchable onPress={toggleShowModal} style={[styles.storeCard, styles.addCard]}>
              <Ionicons name='add' size={40} />
            </CoCard>
          </View>
        </View>
      </ScrollView>

    </CoSafeContainer>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    gap: 10,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 20,
  },
  absoluteFull: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  storesGrid: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  infoCard: { backgroundColor: Palette.backgroundPrimary },
  storeCard: {
    backgroundColor: Palette.backgroundSecondary,
    width: '48%',
    height: '48%',
    aspectRatio: 3 / 2,
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