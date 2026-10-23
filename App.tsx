import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AhzarmanApp } from './src/AhzarmanApp';
import { C } from './src/app/constants';

function App() {
  // App chrome is always light — keep status-bar icons dark even if the OS is in dark mode.
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} translucent={false} />
      <AhzarmanApp />
    </SafeAreaProvider>
  );
}

export default App;
