import { Ai } from "@commercium/core";
import { ScrollView, StyleSheet, View } from "react-native";
import { CoText } from "../CoText";
import { CoCard } from "../CoCard";
import CoButton from "../CoButton";
import { LinearGradient } from "expo-linear-gradient";
import { useStoreActions } from "@/hooks/useStoreActions";
import { useLocalSearchParams } from "expo-router";
import { Palette } from "@/styles/pallete";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect } from "react";
import { getLayoutInfo } from "@/util";
const { isWide } = getLayoutInfo();

export default function AiTab({
  aiData,
  afterRequest,
  onTabLockToggle,
}: {
  aiData: Ai.AiGeneratedData | null | undefined;
  afterRequest: (data: Ai.AiGeneratedData | null) => void;
  onTabLockToggle: (locked: boolean) => void;
}) {
  const params = useLocalSearchParams();
  const storeId = params.storeId.toString();

  const { fetchAiSuggestions, isActionLoading } = useStoreActions(storeId);
  const handleAIRequest = async (
    type: "generate" | "get",
    showToast = true
  ) => {
    try {
      let data = await fetchAiSuggestions(type);
      if (type === "generate") afterRequest(data);
      else if (type === "get") {
        if (!data) {
          if (showToast)
            Toast.show({
              text1: "No previous AI suggestions found",
              type: "error",
            });
        } else afterRequest(data);
      }
    } catch (error) {
      if (showToast)
        Toast.show({
          text1: "Failed to fetch AI suggestions",
          text2: `${error}`,
          type: "error",
        });
      afterRequest(null);
    }
  };

  useEffect(() => {
    if (aiData === undefined) handleAIRequest("get", false).catch(() => {}); // initial load
  }, []);

  const capitalize = (t: string) =>
    t[0].toUpperCase() + t.slice(1, t.length).toLowerCase();

  const colorsBySeverity = {
    high: Palette.danger,
    medium: Palette.warning,
    low: Palette.success,
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        width: isWide ? "50%" : "100%",
        gap: 10,
        alignSelf: "center",
        paddingBottom: 80,
      }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#4c9b49ff", "#42722cff", "#285719ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiHeader}
      >
        <CoText white asTitle>
          Smart Assistant
        </CoText>
        <CoText white>
          Boost your productivity with AI-driven descriptions and insights for
          your store.
        </CoText>
        <CoButton
          type="blank"
          text={
            !aiData
              ? "generate suggestions"
              : "refresh ai generated suggestions"
          }
          onPress={() => {
            onTabLockToggle(true);
            handleAIRequest("generate")
              .then(() => onTabLockToggle(false))
              .catch(() => onTabLockToggle(false));
          }}
          isLoading={isActionLoading}
          icon="sparkles"
        />
      </LinearGradient>
      {aiData && (
        <>
          <CoCard>
            <CoText asTitle style={{ color: Palette.success }}>
              AI Performance Summary
            </CoText>
            <CoText>{aiData.response.summary}</CoText>
          </CoCard>
          <View style={{ marginTop: 20, gap: 10 }}>
            <CoText asTitle style={styles.carrouselTitle}>
              Revenue Growth Actions
            </CoText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carrouselContainer}
            >
              {aiData.response.revenueGrowthActions.map((action, index) => (
                <CoCard
                  style={[styles.carrouselCard, styles[action.priority]]}
                  key={"RgR" + index}
                >
                  <CoText style={styles.mediumTitle}>{action.title}</CoText>
                  <CoText style={styles.actionText}>
                    {action.description}
                  </CoText>
                  <View style={styles.carrouselCardFooter}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colorsBySeverity[action.priority] },
                      ]}
                    >
                      <CoText style={styles.badgeText}>
                        {capitalize(action.priority)}
                      </CoText>
                    </View>
                    <Ionicons
                      name="stats-chart-outline"
                      size={18}
                      color={"white"}
                      style={[
                        styles.footerIcon,
                        { backgroundColor: colorsBySeverity[action.priority] },
                      ]}
                    />
                  </View>
                </CoCard>
              ))}
            </ScrollView>
          </View>
          <View style={{ gap: 10 }}>
            <CoText asTitle style={styles.carrouselTitle}>
              Product Optimization Actions
            </CoText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carrouselContainer}
            >
              {aiData.response.productOptimizationActions.map(
                (action, index) => (
                  <CoCard
                    style={[styles.carrouselCard, styles[action.priority]]}
                    key={"PrO" + index}
                  >
                    <CoText style={styles.mediumTitle}>{action.title}</CoText>
                    <CoText style={styles.actionText}>
                      {action.description}
                    </CoText>
                    <View style={styles.carrouselCardFooter}>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: colorsBySeverity[action.priority],
                          },
                        ]}
                      >
                        <CoText style={styles.badgeText}>
                          {capitalize(action.priority)}
                        </CoText>
                      </View>
                      <Ionicons
                        name="stats-chart-outline"
                        size={18}
                        color={"white"}
                        style={[
                          styles.footerIcon,
                          {
                            backgroundColor: colorsBySeverity[action.priority],
                          },
                        ]}
                      />
                    </View>
                  </CoCard>
                )
              )}
            </ScrollView>
          </View>
          <CoText asTitle style={styles.carrouselTitle}>
            Quick Wins
          </CoText>
          {aiData.response.quickWins.map((item, index) => (
            <CoCard key={"Qui" + index} style={styles.quickWinsCard}>
              <Ionicons
                name="checkbox"
                style={{ alignSelf: "center" }}
                size={16}
                color="gray"
              />
              <CoText style={[{ flex: 1 }, styles.actionText]}>{item}</CoText>
            </CoCard>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  aiHeader: {
    backgroundColor: Palette.backgroundSecondary,
    padding: 20,
    borderRadius: 10,
    gap: 10,
  },
  carrouselContainer: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 10,
    justifyContent: "center",
    margin: isWide ? "auto" : 0,
  },
  carrouselTitle: {
    margin: isWide ? "auto" : 0,
  },
  carrouselCard: {
    width: 280,
    borderRadius: 25,
  },
  mediumTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  actionText: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  quickWinsCard: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  badgeText: { color: Palette.textWhite, fontSize: 16, fontWeight: "600" },
  carrouselCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 10,
  },
  footerIcon: {
    padding: 5,
    borderRadius: 50,
  },
  high: {
    borderColor: Palette.danger,
    borderWidth: 2,
  },
  medium: {
    borderColor: Palette.warning,
    borderWidth: 2,
  },
  low: {
    borderColor: Palette.success,
    borderWidth: 2,
  },
});
