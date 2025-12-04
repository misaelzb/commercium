import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts';

export default function IndexScreen() {
    const { currentUser, isLoading } = useAuth();
    
    if (isLoading) {
        return null; 
    }

    if (currentUser) {
        return <Redirect href="/(tabs)" />;
    } else {
        return <Redirect href="/(auth)" />;
    }
}