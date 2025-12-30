import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { CoCard } from "./CoCard";
import { Image } from "react-native";
import { Palette } from "@/styles/pallete";
import { getLayoutInfo } from "@/util";

const { isWide } = getLayoutInfo();

export function CoHero({ children }: { children: React.ReactNode }) {
  return (
    <CoCard style={[styles.heroCard]}>
      <View style={styles.heroContent}>{children}</View>
    </CoCard>
  );
}

export function CoHeroText({ children }: { children: React.ReactNode }) {
  return <View style={styles.heroTextContainer}>{children}</View>;
}

export function CoHeroImage({ source }: { source: ImageSourcePropType }) {
  return <Image source={source} style={styles.heroImage} />;
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: Palette.backgroundPrimary,
    borderRadius: 0,
    
    paddingTop: 100,
    padding: 24,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 15,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: isWide ? "25%" : 0,
  },
  heroImage: {
    width: 65,
    height: 65,
    resizeMode: "contain",
    alignSelf: "flex-start",
  },
});
