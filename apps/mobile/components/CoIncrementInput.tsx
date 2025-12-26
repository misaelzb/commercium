
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ViewProps } from "react-native";
import { CoInput } from "./CoInput";
import { CoText } from "./CoText";

export const CoIncrementInput = ({
  number,
  onValueChange,
  style
}: {
  number: number;
  onValueChange: (number: number) => void;
  style: ViewProps['style']
}) => {

  const handleIncrement = () => onValueChange(number + 1);
  const handleDecrement = () => onValueChange(number - 1 < 0 ? 0 : number - 1);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={handleDecrement} style={styles.button}>
        <CoText style={styles.buttonText}>-</CoText>
      </TouchableOpacity>
      <TextInput
        value={number.toString()}
        onChangeText={(text) => onValueChange(text === "" ? 0 : Number(text) || number)}
        onFocus={(e) => e.type}
        keyboardType="numeric"
        style={styles.input}
        textAlign="center"
      />
      <TouchableOpacity onPress={handleIncrement} style={styles.button}>
        <CoText style={styles.buttonText}>+</CoText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d3d3d3ff",
    borderRadius: 8,
    backgroundColor: "#e2e1e1ff"
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  buttonText: { fontSize: 18, fontWeight: "bold" },
  input: { flex: 1, textAlign: "center", width: 50,  borderRadius: 5, fontWeight: "500" },
});