// AuthScreen.tsx
import { useUser } from '@/app/context/UserContext';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

const AuthScreen = () => {
  const navigation = useNavigation();
  const { role, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    if (role === 'agent') {
      navigation.reset({ index: 0, routes: [{ name: 'Agent' as never }] });
    } else if (role === 'user') {
      navigation.reset({ index: 0, routes: [{ name: 'Home' as never }] });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
    }
  }, [role, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default AuthScreen;
