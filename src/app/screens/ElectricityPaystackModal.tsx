import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { C } from '../constants';

export type PaymentCheckoutSuccess = {
  reference: string;
  status?: string;
};

export type ElectricityPaystackModalProps = {
  visible: boolean;
  /** Hosted TransactPay checkout URL from initialize. */
  checkoutUrl: string;
  reference: string;
  /** Optional — kept for call-site compatibility; unused with hosted checkout. */
  paystackKey?: string;
  amount?: number;
  billingEmail?: string;
  metadata?: Record<string, unknown>;
  debug?: boolean;
  onSuccess: (res: PaymentCheckoutSuccess) => void | Promise<void>;
  onCancel?: (e: { status: string }) => void;
  onRequestClose: () => void;
};

function isReturnUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes('/payments/transactpay/return') ||
    u.includes('ahzarmanltd.com/api/payments/transactpay') ||
    u.includes('payment/complete') ||
    u.includes('status=successful') ||
    u.includes('status=success')
  );
}

/**
 * Full-screen hosted checkout (TransactPay payment link).
 * Exported as `Paystack` for existing screen imports.
 */
export function ElectricityPaystackModal({
  visible,
  checkoutUrl,
  reference,
  debug = __DEV__,
  onSuccess,
  onCancel,
  onRequestClose,
}: ElectricityPaystackModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.round(windowHeight * 0.88);
  const handledRef = useRef(false);

  const close = useCallback(() => {
    onRequestClose();
  }, [onRequestClose]);

  const finishSuccess = useCallback(() => {
    if (handledRef.current) return;
    handledRef.current = true;
    void (async () => {
      try {
        await Promise.resolve(onSuccess({ reference, status: 'success' }));
      } finally {
        close();
      }
    })();
  }, [close, onSuccess, reference]);

  const headerClose = () => {
    onCancel?.({ status: 'closed' });
    close();
  };

  const onNav = (nav: WebViewNavigation) => {
    if (!nav?.url) return;
    if (debug) console.log('[TransactPay] nav', nav.url);
    if (isReturnUrl(nav.url)) {
      finishSuccess();
    }
  };

  const uri = checkoutUrl?.trim() || '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onShow={() => {
        handledRef.current = false;
      }}
      onRequestClose={headerClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={headerClose} accessibilityRole="button" />
        <View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              maxHeight: sheetHeight,
              paddingBottom: Math.max(16, insets.bottom + 12),
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Complete payment</Text>
            <View style={styles.headerActions}>
              <Pressable onPress={finishSuccess} style={styles.closeBtn} hitSlop={12}>
                <Text style={styles.doneTxt}>I've paid</Text>
              </Pressable>
              <Pressable onPress={headerClose} style={styles.closeBtn} hitSlop={12}>
                <Text style={styles.closeTxt}>Close</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.webWrap}>
            {uri ? (
              <WebView
                key={reference}
                originWhitelist={['*']}
                source={{ uri }}
                onNavigationStateChange={onNav}
                onShouldStartLoadWithRequest={req => {
                  if (req?.url && isReturnUrl(req.url)) {
                    finishSuccess();
                    return false;
                  }
                  return true;
                }}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                mixedContentMode="always"
                setSupportMultipleWindows={false}
                allowsInlineMediaPlayback
                renderLoading={() => (
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" color={C.primary} />
                  </View>
                )}
                style={styles.web}
              />
            ) : (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={styles.missing}>Missing checkout URL</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  title: { fontSize: 17, fontWeight: '700', color: C.ink },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  closeTxt: { fontSize: 15, fontWeight: '600', color: C.olive },
  doneTxt: { fontSize: 15, fontWeight: '700', color: C.primary },
  webWrap: { flex: 1, minHeight: 280 },
  web: { flex: 1, backgroundColor: C.white },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  missing: { fontSize: 13, color: C.muted },
});

/** Alias kept so existing screens can keep `import { Paystack }`. */
export const Paystack = ElectricityPaystackModal;
