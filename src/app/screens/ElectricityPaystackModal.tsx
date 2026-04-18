import { useCallback, useMemo, useRef } from 'react';
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
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import {
  generatePaystackParams,
  handlePaystackMessage,
  paystackHtmlContent,
} from 'react-native-paystack-webview/production/lib/utils';
import type {
  Currency,
  PaystackTransactionResponse,
  PaymentChannels,
} from 'react-native-paystack-webview/production/lib/types';
import { C } from '../constants';

/** Card-only by default so Inline opens on card. Pass `channels` to allow bank, USSD, etc. */
const DEFAULT_CHANNELS: PaymentChannels = ['card'];

export type ElectricityPaystackModalProps = {
  visible: boolean;
  /** Paystack public key (`pk_test_…` / `pk_live_…`). Same idea as legacy `paystackKey`. */
  paystackKey: string;
  /** Amount in major currency units (e.g. Naira); Paystack receives ×100 as kobo. */
  amount: number;
  billingEmail: string;
  reference: string;
  metadata?: Record<string, unknown>;
  currency?: Currency;
  channels?: PaymentChannels;
  debug?: boolean;
  onSuccess: (res: PaystackTransactionResponse) => void;
  onCancel?: (e: { status: string }) => void;
  /** Called when the sheet should close (success, cancel, close button, or hardware back). */
  onRequestClose: () => void;
};

const PAYSTACK_ORIGIN = 'https://checkout.paystack.com';

/**
 * Declarative Paystack Inline checkout in a full-screen modal (same WebView pipeline as `PaystackProvider` v5).
 * `react-native-paystack-webview` does not ship a `<Paystack />` component anymore; this matches that older API shape.
 */
export function ElectricityPaystackModal({
  visible,
  paystackKey,
  amount,
  billingEmail,
  reference,
  metadata,
  currency = 'NGN',
  channels = DEFAULT_CHANNELS,
  debug = __DEV__,
  onSuccess,
  onCancel,
  onRequestClose,
}: ElectricityPaystackModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.round(windowHeight * 0.88);

  const paramsRef = useRef({
    email: billingEmail,
    amount,
    onSuccess: (_data: PaystackTransactionResponse) => {},
    onCancel: () => {},
  });

  paramsRef.current = {
    email: billingEmail,
    amount,
    onSuccess: (data: PaystackTransactionResponse) => {
      onSuccess(data);
    },
    onCancel: () => {
      onCancel?.({ status: 'cancelled' });
    },
  };

  const close = useCallback(() => {
    onRequestClose();
  }, [onRequestClose]);

  const html = useMemo(() => {
    if (!visible) return '';
    const key = paystackKey?.trim();
    const email = billingEmail?.trim();
    const ref = reference?.trim();
    if (!key || !email || !ref || !amount || amount <= 0) return '';
    return paystackHtmlContent(
      generatePaystackParams({
        publicKey: key,
        email,
        amount,
        reference: ref,
        metadata,
        currency,
        channels,
      }),
      'checkout',
    );
  }, [visible, paystackKey, billingEmail, reference, amount, metadata, currency, channels]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      handlePaystackMessage({
        event,
        debug,
        params: paramsRef.current,
        close,
      });
    },
    [close, debug],
  );

  const headerClose = () => {
    onCancel?.({ status: 'closed' });
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={headerClose}>
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
            <Text style={styles.title}>Pay with Paystack</Text>
            <Pressable onPress={headerClose} style={styles.closeBtn} hitSlop={12}>
              <Text style={styles.closeTxt}>Close</Text>
            </Pressable>
          </View>
          <View style={styles.webWrap}>
            {html ? (
              <WebView
                key={reference}
                originWhitelist={['*']}
                source={{ html, baseUrl: PAYSTACK_ORIGIN }}
                onMessage={onMessage}
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
  title: { fontSize: 17, fontWeight: '700', color: C.ink },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  closeTxt: { fontSize: 15, fontWeight: '600', color: C.olive },
  /** Needs explicit flex + bounded parent (`sheet` height) so the WebView is not 0px tall. */
  webWrap: { flex: 1, minHeight: 280 },
  web: { flex: 1, backgroundColor: C.white },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});

/** Same component — use this name if you prefer the classic `<Paystack … />` snippet. */
export const Paystack = ElectricityPaystackModal;
