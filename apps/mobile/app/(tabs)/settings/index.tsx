import {
  CoHero,
  CoHeroImage,
  CoHeroText,
  CoText,
} from "@/components/";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/contexts";
import { router } from "expo-router";
import { Palette } from "@/styles/pallete";
import { getLayoutInfo } from "@/util";

const { isWide } = getLayoutInfo();


type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface SettingItemProps {
  iconName: IconName;
  title: string;
  onPress: () => void;
  color?: string;
  background?: string;
}

function ActionItem({
  iconName,
  title,
  onPress,
  background = Palette.backgroundSecondary,
  color = "white",
}: SettingItemProps) {
  return (
    <TouchableOpacity style={[styles.actionContainer, { backgroundColor: background }]} onPress={onPress}>
      <View style={styles.leftContent}>
        <Ionicons name={iconName} size={24} color={color} style={styles.icon} />
        <CoText white style={styles.title}>
          {title}
        </CoText>
      </View>

      <View style={styles.rightContent}>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="white"
          style={{ marginLeft: 5 }}
        />
      </View>
    </TouchableOpacity>
  );
}

const SettingsTab = () => {
  const auth = useAuth();
  async function handleSignOut() {
    await auth.signOut();
    router.replace("/auth");
  }
  return (
    <>
      <CoHero>
        <CoHeroText>
          <CoText asTitle white>
            Settings
          </CoText>
          <CoText white>Manage your account settings</CoText>
          <CoText />
        </CoHeroText>
        <CoHeroImage
          source={require("../../../assets/images/white_gear.png")}
        />
      </CoHero>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Account</Text>
        <ActionItem background={Palette.danger} iconName={"exit"} title="Log out" onPress={handleSignOut} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.almostWhite,
    borderRadius: 20,
    top: -19,
    padding: 20,
    paddingHorizontal: isWide ? "25%" : 20
  },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#6b6b6bff",
  },
  actionContainer: {
    padding: 12,
    borderRadius: 10,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
  },
  icon: {
    marginRight: 15,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default SettingsTab;
