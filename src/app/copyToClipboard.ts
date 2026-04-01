import { Alert, Share, TurboModuleRegistry } from 'react-native';

type RNCClipboardModule = { setString: (text: string) => void };

function getRNCClipboard(): RNCClipboardModule | null {
  const mod = TurboModuleRegistry.get('RNCClipboard') as RNCClipboardModule | null;
  return mod?.setString ? mod : null;
}

/**
 * Copies text without importing `@react-native-clipboard/clipboard` (that package calls
 * `getEnforcing` at load time and crashes if the native module is missing).
 * After a full native rebuild, `RNCClipboard` is present and copy works.
 * Otherwise falls back to Share / Alert.
 */
export function copyToClipboard(text: string): boolean {
  const mod = getRNCClipboard();
  if (mod) {
    try {
      mod.setString(text);
      return true;
    } catch {
      // fall through
    }
  }
  void Share.share({ message: text }).catch(() => {
    Alert.alert('Referral code', text);
  });
  return false;
}
