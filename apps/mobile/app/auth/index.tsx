// /auth

import {
  CoButton,
  CoCard,
  CoInput,
  CoText,
  CoCardTitle,
  CoSafeContainer,
} from "@/components";
import { useAuth } from "@/contexts";
import { Palette } from "@/styles/pallete";
import { getLayoutInfo } from "@/util";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

const { isWide } = getLayoutInfo();


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: isWide ? "40%" : "95%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
  },
  errorContainer: {
    backgroundColor: Palette.danger,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 15,
    color: Palette.textWhite,
  },
});

export default function AuthScreen() {
  const auth = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  async function handleAuth() {
    setIsLoading(true);

    const cleanedData = Object.keys(data).reduce((acc, key) => {
      const value = data[key as keyof typeof data];
      //@ts-ignore
      acc[key] =
        typeof value === "string" && !["password", "confirmPassword"].includes(key)
          ? value.trim()
          : value;
      return acc;
    }, {} as typeof data);

    setData(cleanedData);

    try {
      if (isRegistering) {
        if (Object.values(cleanedData).some((field) => field === "")) {
          return notifyError("All fields are required");
        }

        if (cleanedData.confirmPassword !== cleanedData.password) {
          return notifyError("Passwords don't match");
        }

        const signUpRes = await auth.signUp(cleanedData);
        if (signUpRes.error) return notifyError(signUpRes.error);

        const signInRes = await auth.signIn(cleanedData);
        if (signInRes.error)
          return notifyError("Account created, but login failed.");

        router.replace("/(tabs)");
      } else {
        if (!cleanedData.username || !cleanedData.password) {
          return notifyError("All fields are required");
        }

        const response = await auth.signIn(cleanedData);
        if (response.error) return notifyError(response.error);

        router.replace("/(tabs)");
      }
    } catch (error) {
      notifyError("An unexpected error occurred", `${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  const notifyError = (text1: string, text2?: string) => {
    Toast.show({
      text1,
      text2,
      type: "error",
    });
    setIsLoading(false);
    return;
  };

  return (
    <CoSafeContainer style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CoCard style={styles.formContainer}>
        {!isRegistering ? (
          <>
            <CoCardTitle>Access to your account</CoCardTitle>
            <CoText>
              Welcome to commercium! Type your credentials to access
            </CoText>
            <View style={{ marginTop: 10 }} />
            <View>
              <CoInput
                editable={!isLoading}
                onChangeText={(text) => setData({ ...data, username: text })}
                placeholder="Username"
                value={data.username}
                maxLength={25}
              />
              <CoInput
                style={{ color: "#000000" }}
                editable={!isLoading}
                textContentType="password"
                onChangeText={(text) => setData({ ...data, password: text })}
                secureTextEntry={true}
                autoCapitalize="none"
                placeholder="Password"
                value={data.password}
              />
              <CoButton
                isLoading={isLoading}
                text="Sign In"
                onPress={handleAuth}
              />
            </View>
          </>
        ) : (
          <>
            <CoCardTitle>Account creation</CoCardTitle>
            <CoText>Fill the form to create an account</CoText>
            <View style={{ marginTop: 10 }} />
            <View>
              <Text style={{ marginBottom: 5, fontWeight: "bold" }}>
                Personal information
              </Text>
              <CoInput
                editable={!isLoading}
                onChangeText={(text) => setData({ ...data, firstName: text })}
                placeholder="First Name"
                maxLength={25}
                value={data.firstName}
              />
              <CoInput
                editable={!isLoading}
                onChangeText={(text) => setData({ ...data, lastName: text })}
                placeholder="Last Name"
                value={data.lastName}
                maxLength={25}
              />
              <View style={{ marginTop: 10 }} />
              <Text style={{ marginBottom: 5, fontWeight: "bold" }}>
                Access Credentials
              </Text>
              <CoInput
                editable={!isLoading}
                onChangeText={(text) => setData({ ...data, username: text })}
                placeholder="Username"
                value={data.username}
                maxLength={25}
              />
              <CoInput
                editable={!isLoading}
                style={{ color: "#000000" }}
                textContentType="password"
                onChangeText={(text) => setData({ ...data, password: text })}
                placeholder="Password"
                secureTextEntry={true}
                autoCapitalize="none"
                value={data.password}
              />
              <CoInput
                editable={!isLoading}
                style={{ color: "#000000" }}
                textContentType="password"
                onChangeText={(text) =>
                  setData({ ...data, confirmPassword: text })
                }
                secureTextEntry={true}
                autoCapitalize="none"
                placeholder="Repeat your password"
                value={data.confirmPassword}
              />
              <CoButton
                isLoading={isLoading}
                text="Create account"
                onPress={handleAuth}
              />
            </View>
          </>
        )}
        <CoButton
          text={
            isRegistering
              ? "Already have one? Sign in"
              : "Don't have an account? Sign up"
          }
          type="secondary"
          onPress={() => {
            setIsRegistering(!isRegistering);
          }}
        />
      </CoCard>
    </CoSafeContainer>
  );
}
