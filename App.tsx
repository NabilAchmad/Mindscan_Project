import { StatusBar } from 'expo-status-bar';
import './global.css';
import AppNavigator from './src/navigation/AppNavigator';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';

// Fix NativeWind v4 compatibility for custom components
cssInterop(LinearGradient, { className: 'style' });
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });
cssInterop(Animated.ScrollView, { className: 'style' });

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}


