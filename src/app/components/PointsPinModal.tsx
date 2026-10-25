import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '../constants';
import { NumPad } from '../NumPad';

/** PIN sheet for paying with points. */
export function PointsPinModal({
  visible,
  pointsNeeded,
  label,
  submitting,
  error,
  pin,
  onChangePin,
  onSubmit,
  onClose,
}: {
  visible: boolean;
  pointsNeeded: number;
  label: string;
  submitting: boolean;
  error: string;
  pin: string;
  onChangePin: (p: string) => void;
  onSubmit: (pin: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!submitting) onClose();
      }}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => {
          if (!submitting) onClose();
        }}
      >
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.grabber} />
          <Text style={styles.title}>Confirm with PIN</Text>
          <Text style={styles.sub}>
            Pay <Text style={{ color: C.olive, fontWeight: '700' }}>{pointsNeeded.toLocaleString()} pts</Text> for{' '}
            {label}
          </Text>
          <View style={styles.dots}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: pin.length > i ? (error ? C.error : C.primary) : C.border },
                ]}
              />
            ))}
          </View>
          {submitting ? <ActivityIndicator color={C.primary} style={{ marginBottom: 8 }} /> : null}
          {error ? (
            <View style={styles.errBox}>
              <Text style={styles.errTxt}>{error}</Text>
            </View>
          ) : null}
          <NumPad
            onDigit={d => {
              if (submitting || pin.length >= 4) return;
              const next = pin + d;
              onChangePin(next);
              if (next.length === 4) onSubmit(next);
            }}
            onDelete={() => {
              if (!submitting) onChangePin(pin.slice(0, -1));
            }}
          />
          <Pressable
            onPress={() => {
              if (!submitting) onClose();
            }}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelTxt}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: '700', color: C.ink, textAlign: 'center' },
  sub: { fontSize: 13, color: C.muted, textAlign: 'center', marginTop: 6, marginBottom: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  errBox: { backgroundColor: C.errorBg, borderRadius: 8, padding: 10, marginBottom: 8 },
  errTxt: { fontSize: 13, color: C.error, textAlign: 'center' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelTxt: { fontSize: 14, fontWeight: '500', color: C.muted },
});
