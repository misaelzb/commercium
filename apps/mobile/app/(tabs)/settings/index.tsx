import { CoSafeContainer } from '@/components/CoSafeContainer';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/contexts';
import { router } from 'expo-router';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Define las props del componente
interface SettingItemProps {
    iconName: IconName; 
    title: string;
    onPress: () => void;
    color?: string; 
}

function ActionItem({ 
    iconName, 
    title, 
    onPress, 
    color = '#333'
}: SettingItemProps) {
    return (
        <TouchableOpacity style={styles.actionContainer} onPress={onPress}>
            <View style={styles.leftContent}>
                <Ionicons name={iconName} size={24} color={color} style={styles.icon} />
                <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.rightContent}>
                <Ionicons 
                    name="chevron-forward"
                    size={20} 
                    color="#A0A0A0" 
                    style={{ marginLeft: 5 }} 
                />
            </View>
        </TouchableOpacity>
    );
}


const SettingsTab = () => {
    const auth = useAuth();
    async function handleSignOut() {
        await auth.signOut();
        router.push('/(auth)');
    }
    return <CoSafeContainer>
        <Text style={styles.sectionTitle}>Account</Text>
        <ActionItem iconName={"exit"} title='Log out' onPress={handleSignOut}/>
    </CoSafeContainer>
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderWidth: 1,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: "#6b6b6bff"
    },
    actionContainer: {
        padding: 12,
        borderRadius: 10,
        elevation: 5,
        backgroundColor: '#fff',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 16,
    },
    icon: {
        marginRight: 15,
    },
    leftContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },
    rightContent: {
        flexDirection: "row",
        alignItems: "center",
    }
});

export default SettingsTab;