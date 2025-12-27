import {
  CoButton,
  CoCard,
  CoCardTitle,
  CoHero,
  CoHeroImage,
  CoHeroText,
  CoInput,
  CoSafeContainer,
  CoText,
} from "@/components";
import { useAuth } from "@/contexts";
import { Palette } from "@/styles/pallete";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { client } from "@/services";
import { router, Stack, useFocusEffect } from "expo-router";
import { Store } from "@commercium/core";
import { CoModal } from "@/components/CoModal";

export default function HomeTab() {
  const { currentUser, authHeader, fetchStores } = useAuth();
  const [localStores, setLocalStores] = useState<Store.StoreType[]>(
    currentUser?.stores || []
  );

  const [createStoreModalVisible, setCSModalVisible] = useState(false);
  const [deleteStoreModalVisible, setDSModalVisible] = useState(false);
  const [storePressedId, setStorePressedId] = useState(0);
  const [storePressedName, setStorePressedName] = useState("");

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleShowModal = () => {
    setError("");
    setCSModalVisible(!createStoreModalVisible);
  };
  const toggleShowDeleteModal = () => {
    setError("");
    setDSModalVisible(!deleteStoreModalVisible);
  };

  const handleCreateStore = async () => {
    setLoading(true);
    let response = await client.api.stores.create.$post(
      {
        json: {
          name: storeName,
          description:
            storeDescription.trim().length > 0 ? storeDescription : null,
        },
      },
      {
        headers: authHeader,
      }
    );
    let d = await response.json();
    console.log(d);
    if (d.error) setError(d.error);
    else {
      setLocalStores((prevState) => [...prevState, d.data]);
      setStoreName("");
      setStoreDescription("");
      toggleShowModal();
    }
    setLoading(false);
  };

  const handleDeleteStore = async () => {
    setLoading(true);
    let response = await client.api.stores[":storeId"].$delete(
      {
        param: { storeId: storePressedId.toString() },
      },
      {
        headers: authHeader,
      }
    );
    let d = await response.json();
    if (d.error) setError(d.error);
    else {
      setLocalStores((prevState) =>
        prevState.filter((s) => s.id !== storePressedId)
      );
      toggleShowDeleteModal();
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchStores()
        .then((stores) => {
          setLocalStores(stores);
        })
        .catch(() => {
          router.replace("/auth");
        });
    }, [])
  );

  return (
    <>
      {createStoreModalVisible ? (
        <CoModal visible={createStoreModalVisible} onClose={toggleShowModal}>
          <CoText asTitle>Add your store</CoText>
          {!error ? (
            <CoText>
              Start taking control of your business with commercium
            </CoText>
          ) : (
            <CoText style={{ color: Palette.danger }}>{error}</CoText>
          )}
          <View>
            <CoInput
              placeholder="Your store name"
              value={storeName}
              onChangeText={setStoreName}
            />
            <CoInput
              placeholder="Description of your store (optional)"
              value={storeDescription}
              onChangeText={setStoreDescription}
            />
          </View>
          <View style={{ gap: 5 }}>
            <CoButton
              type="primary"
              text="Create"
              isLoading={isLoading}
              onPress={handleCreateStore}
            />
            <CoButton
              type="secondary"
              text="Cancel"
              disabled={isLoading}
              onPress={toggleShowModal}
            />
          </View>
        </CoModal>
      ) : null}

      {deleteStoreModalVisible ? (
        <CoModal
          visible={deleteStoreModalVisible}
          onClose={toggleShowDeleteModal}
        >
          <CoText asTitle>Delete store</CoText>
          {!error ? (
            <CoText>Do you want to delete '{storePressedName}'?</CoText>
          ) : (
            <CoText style={{ color: Palette.danger }}>{error}</CoText>
          )}
          <View style={{ gap: 5 }}>
            <CoButton
              type="danger"
              text="Yes, delete this store"
              isLoading={isLoading}
              onPress={handleDeleteStore}
            />
            <CoButton
              type="secondary"
              text="Cancel"
              disabled={isLoading}
              onPress={toggleShowDeleteModal}
            />
          </View>
        </CoModal>
      ) : null}

      <ScrollView>
        <CoHero>
          <CoHeroText>
            <CoCardTitle white>Welcome {currentUser?.firstName}</CoCardTitle>
            <CoText white>
              Take total control of your business performance.
            </CoText>
            <CoText />
          </CoHeroText>
          <CoHeroImage
            source={require("../../assets/images/white_chart.png")}
          />
        </CoHero>
        <View style={styles.storesContainer}>
          <CoText asTitle>My Stores</CoText>
          {localStores.map((store, arrIndex) => (
            <CoCard
              touchable
              onLongPress={() => {
                setStorePressedId(store.id);
                setStorePressedName(store.name);
                toggleShowDeleteModal();
              }}
              onPress={() => {
                router.push(`/store/${store.id}`);
              }}
              key={arrIndex}
              style={[styles.storeCard]}
            >
              <View style={styles.storeIcon}>
                <Ionicons name="storefront" color={"white"} size={30} />
              </View>
              <View style={styles.storeName}>
                <CoText numberOfLines={2} white style={styles.storeNameText}>
                  {store.name}
                </CoText>
              </View>
              <View style={styles.storeDescription}>
                <CoText white numberOfLines={2}>
                  {store.description}
                </CoText>
              </View>
            </CoCard>
          ))}
          <CoCard
            touchable
            onPress={toggleShowModal}
            style={[styles.storeCard, styles.addCard]}
          >
            <Ionicons name="add" size={40} />
          </CoCard>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  storesContainer: {
    flex: 1,
    gap: 10,
    backgroundColor: Palette.almostWhite,

    top: -19,
    borderRadius: 20,
    padding: 20,
  },
  storeIcon: {
    flex: 0.15,
    justifyContent: "center",
    alignItems: "center",
  },
  storeName: {
    flex: 0.35,
    fontSize: 18,
  },
  storeNameText: {
    fontWeight: "600",
    fontSize: 18,
  },
  storeDescription: {
    flex: 0.5,
  },
  storeCard: {
    backgroundColor: Palette.backgroundSecondary,
    paddingVertical: 15,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addCard: {
    backgroundColor: Palette.gray,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
});
