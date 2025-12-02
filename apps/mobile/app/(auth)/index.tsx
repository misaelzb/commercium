// /auth

import { CoButton } from "@/components";
import { Palette } from "@/styles/pallete";
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
    input: {
        height: 40,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderBottomColor: Palette.backgroundPrimary,
        borderBottomWidth: 1,
    },
});

export default function AuthScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);


    return <View style={styles.container}>
        <View style={styles.card}>
            {!isRegistering ? <>
                <Text style={styles.cardTitle}>Access to your account</Text>
                <View style={{ marginTop: 10 }} />
                <TextInput
                    style={styles.input}
                    onChangeText={setUsername}
                    placeholder="Username" 
                    value={username}/>
                <TextInput
                    style={styles.input}
                    textContentType="password"
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    placeholder="Password"
                    value={password} />
                <CoButton title="Sign In" onPress={() => {}} />
            </> : <>
                <Text style={styles.cardTitle}>Account creation</Text>
                <Text style={styles.cardText}>Fill the form to create an account</Text>
                <View style={{ marginTop: 10 }} />
                <TextInput
                    style={styles.input}
                    onChangeText={setUsername}
                    placeholder="Username" />
                <TextInput
                    style={styles.input}
                    textContentType="password"
                    onChangeText={setPassword}
                    placeholder="Password"
                   secureTextEntry={true}
                    autoCapitalize="none"value={password} />
                <TextInput
                    textContentType="password"
                    style={styles.input}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    placeholder="Type your password again"
                    value={confirmPassword} />
                <CoButton title="Create account" onPress={() => {}} />
            </>}
            <View style={{ marginTop: 10 }} />
            <CoButton title={isRegistering ? "Already have one? Sign in" : "Don't have an account? Sign up"} type="secondary" onPress={() => setIsRegistering(!isRegistering)} />
        </View>
    </View>
}