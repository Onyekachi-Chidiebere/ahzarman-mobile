import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C } from '../constants';

export type PayMethod = 'card' | 'points';

export function PayMethodToggle({
  value,
  onChange,
  pointsBalance,
  pointsNeeded,
}: {
  value: PayMethod;
  onChange: (m: PayMethod) => void;
  pointsBalance: number;
  pointsNeeded: number;
}) {
  const enough = pointsBalance >= pointsNeeded && pointsNeeded > 0;
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>PAY WITH</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => onChange('card')}
          style={[styles.chip, value === 'card' && styles.chipOn]}
        >
          <Text style={[styles.chipTxt, value === 'card' && styles.chipTxtOn]}>Card</Text>
        </Pressable>
        <Pressable
          onPress={() => onChange('points')}
          style={[styles.chip, value === 'points' && styles.chipOn]}
        >
          <Text style={[styles.chipTxt, value === 'points' && styles.chipTxtOn]}>Points</Text>
        </Pressable>
      </View>
      {value === 'points' ? (
        <Text style={[styles.hint, !enough && styles.hintBad]}>
          {pointsNeeded.toLocaleString()} pts required · you have {pointsBalance.toLocaleString()} pts
          {!enough ? ' — not enough' : ' · 1 pt = ₦1 · no bonus earn'}
        </Text>
      ) : (
        <Text style={styles.hint}>Card payments earn loyalty points (1 pt / ₦20)</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12, marginBottom: 4 },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: C.muted,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  chipOn: { borderColor: C.primary, backgroundColor: C.primFaint },
  chipTxt: { fontSize: 14, fontWeight: '600', color: C.muted },
  chipTxtOn: { color: C.ink, fontWeight: '700' },
  hint: { fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 16 },
  hintBad: { color: C.error },
});
