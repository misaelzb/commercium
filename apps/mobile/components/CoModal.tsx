import React from 'react';
import { StyleSheet, View, Modal, TouchableWithoutFeedback, Pressable } from "react-native";
import { CoCard } from "./CoCard";

interface CoModalProps {
	children: React.ReactNode;
	visible: boolean;
	onClose: () => void;
}

export const CoModal = ({ children, visible, onClose }: CoModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Pressable style={styles.modalContainer} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}> 
           <View style={styles.centeredView}>
              <CoCard>
                {children}
              </CoCard>
           </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	centeredView: {
		margin: 20,
	},
});