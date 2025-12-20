import { Palette } from "@/styles/pallete";
import React from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";

interface CoInputProps extends TextInputProps {
  error?: string;
  label?: string;
  prefix?: string;
}

export default function CoInput({
  error,
  style,
  label,
  prefix,
  ...props
}: CoInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}

      <View style={[styles.inputWrapper]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput style={[styles.input, style]} {...props} />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    gap: 4,
    marginBottom: 9,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    height: 44,
    paddingHorizontal: 12,
  },
  prefix: {
    fontSize: 16,
    marginRight: 6,
    color: "#555",
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  error: {
    color: Palette.danger,
    fontSize: 12,
  },
});

export { CoInput };
