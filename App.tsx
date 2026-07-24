import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AhzarmanApp } from './src/AhzarmanApp';
import { C } from './src/app/constants';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={C.surface}
        translucent={false}
      />
      <AhzarmanApp />
    </SafeAreaProvider>
  );
}

export default App;
