import { Palette } from '@/styles/pallete';
import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';

interface CoInputProps extends TextInputProps {
    error?: string;
}

export default function CoInput({
    error,
    style,
    ...props
}: CoInputProps) {
    return (
        <View style={styles.container}>
            
            <TextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    style,
                ]}
                {...props}
            />

            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 4,
        marginBottom: 9,
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: Palette.danger,
    },
    error: {
        color: Palette.danger,
        fontSize: 12,
    },
});


export { CoInput }