import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

export function RouteStubScreen({
  title,
  subtitle,
  backTo,
  goTo,
}: {
  title: string;
  subtitle: string;
  backTo: AppScreen;
  goTo: (s: AppScreen) => void;
}) {
  return (
    <View style={styles.page}>
      <ScreenHeader title={title} onBack={() => goTo(backTo)} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
        <Pressable onPress={() => goTo(backTo)} style={styles.btn}>
          <Text style={styles.btnTxt}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { color: C.ink, fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  sub: { color: C.muted, fontSize: 13, textAlign: 'center', marginBottom: 18 },
  btn: { height: 44, minWidth: 120, paddingHorizontal: 18, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: C.ink, fontSize: 14, fontWeight: '700' },
});

