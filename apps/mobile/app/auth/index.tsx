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
import { router, Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dimensions } from "react-native";
import Toast from "react-native-toast-message";
const windowWidth = Dimensions.get("window").width;
const isWide = windowWidth >= 600;

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAuth() {
    setIsLoading(true);
    let fields = [firstName, lastName, username, password, confirmPassword];
    if (isRegistering) {
      if (fields.some((field) => field === "")) {
        Toast.show({
          text1: "All fields are required",
          type: "error",
        });
        setIsLoading(false);
        return;
      }
      if (confirmPassword !== password) {
        Toast.show({
          text1: "Passwords don't match",
          type: "error",
        });
        setIsLoading(false);
        return;
      }
      try {
        let response = await auth.signUp({
          username,
          password,
          firstName,
          lastName,
        });
        if (response.error)
          Toast.show({
            text1: response.error,
            type: "error",
          });
        else {
          await auth
            .signIn({ username, password })
            .then(() => router.push("/(tabs)"))
            .catch(() =>
              Toast.show({
                text1: "Something went wrong. Try again later",
                type: "error",
              })
            );
        }
      } catch (error) {
        Toast.show({
          text1: `${error}`,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        fields = [username, password];
        if (fields.some((field) => field.trim() === "")) {
          Toast.show({
            text1: "All fields are required",
            type: "error",
          });
					return;
        }
        let response = await auth.signIn({ username, password });
        if (response.error)
          Toast.show({
            text1: response.error,
            type: "error",
          });
        else {
          router.replace("/(tabs)");
        }
      } catch (error) {
        Toast.show({
          text1: `Something went wrong. Try again later`,
          text2: `${error}`,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }

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
                onChangeText={setUsername}
                placeholder="Username"
                value={username}
              />
              <CoInput
                editable={!isLoading}
                textContentType="password"
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                placeholder="Password"
                value={password}
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
                onChangeText={setFirstName}
                placeholder="First Name"
                value={firstName}
              />
              <CoInput
                editable={!isLoading}
                onChangeText={setLastName}
                placeholder="Last Name"
                value={lastName}
              />
              <View style={{ marginTop: 10 }} />
              <Text style={{ marginBottom: 5, fontWeight: "bold" }}>
                Access Credentials
              </Text>
              <CoInput
                editable={!isLoading}
                onChangeText={setUsername}
                placeholder="Username"
                value={username}
              />
              <CoInput
                editable={!isLoading}
                textContentType="password"
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={true}
                autoCapitalize="none"
                value={password}
              />
              <CoInput
                editable={!isLoading}
                textContentType="password"
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                placeholder="Repeat your password"
                value={confirmPassword}
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
