// /auth

import { CoButton, CoCard, CoInput, CoText, CoCardTitle, CoSafeContainer } from "@/components";
import { useAuth } from "@/contexts";
import { Palette } from "@/styles/pallete";
import { router } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        backgroundColor: Palette.danger,
        marginBottom: 10,
    },
    errorText: {
        fontSize: 15,
        color: Palette.textWhite,
    }
});

export default function AuthScreen() {
    const auth = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    async function handleAuth() {
        setIsLoading(true);
        setError(null);
        if (isRegistering) {
            if (confirmPassword !== password) {
                setError("Passwords don't match")
                setIsLoading(false)
                return;
            }
            try {
                let response = await auth.signUp({
                    username,
                    password,
                    firstName,
                    lastName
                });
                if (response.error) setError(response.error);
                else {
                    auth.signIn({ username, password })
                        .then(() => router.push("/(tabs)"))
                        .catch(() => setError("Something went wrong. Try again later"))
                }
            } catch (error) {
                setError(`${error}`);
            } finally {
                setIsLoading(false);
            }
        } else {
            try {
                let response = await auth.signIn({ username, password });
                if (response.error) setError(response.error);
                else {
                    router.push("/(tabs)");
                }
            } catch (error) {
                setError(`${error}`);
            } finally {
                setIsLoading(false);
            }
        }
    }


    return <CoSafeContainer style={{ flex: 1, justifyContent: "center", marginLeft: 15, marginRight: 15 }}>
        {error && <CoCard style={[styles.errorContainer]}>
            <Text style={styles.errorText}>{error}</Text>
        </CoCard>}
        <CoCard>
            {!isRegistering ? <>
                <CoCardTitle>Access to your account</CoCardTitle>
                <CoText>Welcome! Insert your credentials to access</CoText>
                <View style={{ marginTop: 10 }} />
                <View>
                    <CoInput
                        editable={!isLoading}
                        onChangeText={setUsername}
                        placeholder="Username"
                        value={username} />
                    <CoInput
                        editable={!isLoading}
                        textContentType="password"
                        onChangeText={setPassword}
                        secureTextEntry={true}
                        autoCapitalize="none"
                        placeholder="Password"
                        value={password} />
                    <CoButton title="Sign In" onPress={handleAuth} />
                </View>
            </> : <>
                <CoCardTitle>Account creation</CoCardTitle>
                <CoText>Fill the form to create an account</CoText>
                <View style={{ marginTop: 10 }} />
                <View>
                    <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>Personal information</Text>
                    <CoInput
                        editable={!isLoading}
                        onChangeText={setFirstName}
                        placeholder="First Name"
                        value={firstName} />
                    <CoInput
                        editable={!isLoading}
                        onChangeText={setLastName}
                        placeholder="Last Name"
                        value={lastName} />
                    <View style={{ marginTop: 10 }} />
                    <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>Access Credentials</Text>
                    <CoInput
                        editable={!isLoading}
                        onChangeText={setUsername}
                        placeholder="Username"
                        value={username} />
                    <CoInput
                        editable={!isLoading}
                        textContentType="password"
                        onChangeText={setPassword}
                        placeholder="Password"
                        secureTextEntry={true}
                        autoCapitalize="none"
                        value={password} />
                    <CoInput
                        editable={!isLoading}
                        textContentType="password"
                        onChangeText={setConfirmPassword}
                        secureTextEntry={true}
                        autoCapitalize="none"
                        placeholder="Repeat your password"
                        value={confirmPassword} />
                    <CoButton title="Create account" onPress={handleAuth} />
                </View>
            </>}
            <CoButton title={isRegistering ? "Already have one? Sign in" : "Don't have an account? Sign up"} type="secondary" onPress={() => {
                setIsRegistering(!isRegistering)
                setError(null);
            }} />
        </CoCard>
    </CoSafeContainer>
}