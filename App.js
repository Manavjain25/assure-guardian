import { Buffer } from 'buffer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import RouterScreen from './router/RouterScreen';
global.Buffer = Buffer;

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RouterScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
