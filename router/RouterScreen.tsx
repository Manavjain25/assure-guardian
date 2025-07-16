import { UserProvider } from '@/app/context/UserContext';
import AgentScreen from '@/app/screens/AgentScreen';
import AuthScreen from '@/app/screens/AuthScreen';
import DashboardScreen from '@/app/screens/DashboardScreen';
import HomeScreen from '@/app/screens/HomeScreen';
import LoginScreen from '@/app/screens/LoginScreen';
import SettingsScreen from '@/app/screens/SettingsScreen';
import SignupScreen from '@/app/screens/SignupScreen';
import UploadScreen from '@/app/screens/UploadScreen';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  Settings: undefined;
  Dashboard: undefined;
  Upload: undefined;
  Agent: undefined; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Dashboard':
              iconName = 'grid';
              break;
            case 'Upload':
              iconName = 'cloud-upload';
              break;
            default:
              iconName = 'home';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AgentTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Dashboard':
              iconName = 'grid';
              break;
            case 'Upload':
              iconName = 'cloud-upload';
              break;
            default:
              iconName = 'home';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={AgentScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const RouterScreen = () => {
  return (
    <PaperProvider>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Home" component={TabNavigator} />
            <Stack.Screen name="Agent" component= {AgentTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </PaperProvider>
  );
};

export default RouterScreen;
