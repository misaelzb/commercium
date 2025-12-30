import { ScrollView, StyleSheet, View } from "react-native";
import { CoText } from "../CoText";
import CoInput from "../CoInput";
import { Store } from "@commercium/core";
import { useState } from "react";
import CoButton from "../CoButton";
import { CoSeparator } from "../CoSeparator";
import { CoModal } from "../CoModal";
import { Dimensions } from "react-native";
const windowWidth = Dimensions.get("window").width;
const isWide = windowWidth >= 600;

export default function ConfigTab({
  store,
  onEdit,
  isActionLoading,
  onDelete,
}: {
  store: Store.StoreType;
  onEdit: (data: Store.StoreCreateType) => void;
  isActionLoading: boolean;
  onDelete: () => void;
}) {
  const [data, setData] = useState(store);
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <ScrollView
        style={{
          width: isWide ? "50%" : "100%",
          alignSelf: "center",
        }}
      >
        <CoModal visible={isOpen} onClose={() => setOpen(false)}>
          <CoText asTitle>Delete store</CoText>
          <CoText>Are you sure you want to delete '{store.name}'?</CoText>
          <CoButton
            type="danger"
            onPress={() => {
              onDelete(); // this must do router.back
            }}
            text="Yes, delete this store"
            isLoading={isActionLoading}
          />
          <CoButton
            type="secondary"
            text="Cancel"
            disabled={isActionLoading}
            onPress={() => setOpen(false)}
          />
        </CoModal>
        <View style={{ flex: 1, gap: 20 }}>
          <View>
            <CoText asTitle>Store settings</CoText>
            <CoSeparator />
            <CoInput
              label="Name"
              value={data.name}
              onChangeText={(v) => setData({ ...data, name: v })}
              maxLength={35}
            />
            <CoInput
              label="Description"
              value={data.description || ""}
              onChangeText={(v) => setData({ ...data, description: v })}
              maxLength={100} 
            />
          </View>
          <View>
            <CoText asTitle>Danger zone</CoText>
            <CoSeparator />
            <CoButton
              type="danger"
              text="Delete store"
              style={{ marginTop: 10 }}
              onPress={() => setOpen(true)}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <CoButton
          text="Save changes"
          onPress={() =>
            onEdit({
              name: data.name,
              description: data.description,
            })
          }
          isLoading={isActionLoading}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    width: isWide ? "50%" : "100%",
    marginTop: isWide ? 20: 0,
    alignSelf: "center",
  },
});
