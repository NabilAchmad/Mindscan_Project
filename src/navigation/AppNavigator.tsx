import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import SplashScreen from '../views/screens/SplashScreen';
import OnboardingScreen from '../views/screens/OnboardingScreen';
import LoginScreen from '../views/screens/LoginScreen';
import RegisterScreen from '../views/screens/RegisterScreen';
import DashboardScreen from '../views/screens/DashboardScreen';
import ChatbotScreen from '../views/screens/ChatbotScreen';
import PsychologistDashboardScreen from '../views/screens/PsychologistDashboardScreen';
import ConsultationChatScreen from '../views/screens/ConsultationChatScreen';
import { useAuthStore } from '../viewmodels/useAuthStore';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user?.role === 'psikolog' ? (
          // Psychologist Stack
          <>
            <Stack.Screen name="PsychologistDashboard" component={PsychologistDashboardScreen} />
            <Stack.Screen name="ConsultationChat" component={ConsultationChatScreen} />
          </>
        ) : (
          // Main App Stack (Mahasiswa)
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Chatbot" component={ChatbotScreen} />
            <Stack.Screen name="ConsultationChat" component={ConsultationChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
