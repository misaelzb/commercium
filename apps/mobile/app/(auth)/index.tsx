// /auth

import { CoButton, CoInput } from "@/components";
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
    card: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    cardText: {
        fontSize: 16,
        marginBottom: 10,
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
            } catch(error) {
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
            } catch(error) {
                setError(`${error}`);
            } finally {
                setIsLoading(false);
            }
        }
    }


    return <View style={styles.container}>
        {error && <View style={[styles.card, styles.errorContainer]}>
            <Text style={styles.errorText}>{error}</Text>
        </View>}
        <View style={[styles.card]}>
            {!isRegistering ? <>
                <Text style={styles.cardTitle}>Access to your account</Text>
                <Text style={styles.cardText}>Welcome! Insert your credentials to access</Text>
                <View style={{ marginTop: 10 }} />
                <CoInput
                    editable={!isLoading}
                    onChangeText={setUsername}
                    placeholder="Username" 
                    value={username}/>
                <CoInput
                    editable={!isLoading}
                    textContentType="password"
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    placeholder="Password"
                    value={password} />
                <CoButton title="Sign In" onPress={handleAuth} />
            </> : <>
                <Text style={styles.cardTitle}>Account creation</Text>
                <Text style={styles.cardText}>Fill the form to create an account</Text>
                <View style={{ marginTop: 10 }} />
                <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>Personal information</Text>
                <CoInput
                    editable={!isLoading}
                    onChangeText={setFirstName}
                    placeholder="First Name"
                    value={firstName}/>
                <CoInput
                    editable={!isLoading}
                    onChangeText={setLastName}
                    placeholder="Last Name"
                    value={lastName}/>
                <View style={{ marginTop: 10 }} />
                <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>Access Credentials</Text>
                <CoInput
                    editable={!isLoading}
                    onChangeText={setUsername}
                    placeholder="Username"
                    value={username}/>
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
            </>}
            <View style={{ marginTop: 10 }} />
            <CoButton title={isRegistering ? "Already have one? Sign in" : "Don't have an account? Sign up"} type="secondary" onPress={() => {
                setIsRegistering(!isRegistering)
                setError(null);
            }} />
        </View>
    </View>
}