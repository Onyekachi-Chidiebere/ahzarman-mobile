import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { C } from './constants';

const PAD_ROWS: (string | null)[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [null, '0', 'del'],
];

export function NumPad({
  onDigit,
  onDelete,
}: {
  onDigit: (d: string) => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.padWrap}>
      {PAD_ROWS.map((row, ri) => (
        <View key={ri} style={styles.padRow}>
          {row.map((d, di) => {
            if (d === null) return <View key={di} style={styles.padSpacer} />;
            if (d === 'del') {
              return (
                <Pressable key={di} onPress={onDelete} style={styles.padKeyGhost}>
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"
                      stroke={C.ink}
                      strokeWidth={1.8}
                      strokeLinejoin="round"
                    />
                    <Line x1="18" y1="9" x2="12" y2="15" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" />
                    <Line x1="12" y1="9" x2="18" y2="15" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" />
                  </Svg>
                </Pressable>
              );
            }
            return (
              <Pressable key={di} onPress={() => onDigit(d)} style={styles.padKey}>
                <Text style={styles.padKeyTxt}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  padWrap: { gap: 4, paddingHorizontal: 8, width: '100%', maxWidth: 360, alignSelf: 'center' },
  padRow: { flexDirection: 'row', gap: 4 },
  padSpacer: { flex: 1, height: 52 },
  padKey: {
    flex: 1,
    height: 52,
    backgroundColor: '#F8F9F6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padKeyGhost: { flex: 1, height: 52, alignItems: 'center', justifyContent: 'center' },
  padKeyTxt: { fontSize: 22, fontWeight: '600', color: C.ink },
});
