import { ScrollView, StyleSheet, View } from "react-native";
import { CoText } from "../CoText";
import CoInput from "../CoInput";
import { Store } from "@commercium/core";
import { useState } from "react";
import CoButton from "../CoButton";
import { CoSeparator } from "../CoSeparator";
import { useStoreActions } from "@/hooks/useStoreActions";

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

  return (
    <>
      <View style={{ flex: 1, gap: 20 }}>
        <View>
          <CoText asTitle>Store settings</CoText>
          <CoSeparator />
          <CoInput
            label="Name"
            value={data.name}
            onChangeText={(v) => setData({ ...data, name: v })}
          />
          <CoInput
            label="Description"
            value={data.description || ""}
            onChangeText={(v) => setData({ ...data, description: v })}
          />
        </View>
        <View>
          <CoText asTitle>Danger zone</CoText>
          <CoSeparator />
          <CoButton
            type="danger"
            text="Delete store"
            style={{ marginTop: 10 }}
            onPress={onDelete}
            isLoading={isActionLoading}
          />
        </View>
        <View style={styles.footer}>
          <CoButton
            text="Save"
            onPress={() => onEdit({
              name: data.name,
              description: data.description,
            })}
            isLoading={isActionLoading}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 60,
  },
});
