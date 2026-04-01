import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import { SERVICE_ITEMS } from '../data';
import { ServiceIcon, type ServiceItemKey } from '../assets/icons';
import type { AppScreen } from '../types';

export function ServicesScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  return (
    <View style={styles.page}>
      <ScreenHeader title="Services" />
      <View style={styles.content}>
        <View style={styles.tagWrap}>
          <Text style={styles.tagText}>Every purchase earns pts</Text>
        </View>
        <View style={styles.list}>
          {SERVICE_ITEMS.map(i => (
            <Pressable key={i.key} onPress={() => goTo(i.key as AppScreen)} style={styles.row}>
              <View style={[styles.icon, { backgroundColor: i.color }]}>
                <ServiceIcon name={i.key as ServiceItemKey} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{i.label}</Text>
                <Text style={styles.sub}>Earns points · instant delivery</Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  tagWrap: { alignSelf: 'flex-end', backgroundColor: C.primXlt, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  tagText: { color: '#919E2D', fontSize: 11, fontWeight: '600' },
  list: { gap: 10 },
  row: { backgroundColor: C.white, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { color: C.ink, fontSize: 14, fontWeight: '600' },
  sub: { color: C.muted, fontSize: 12, marginTop: 2 },
  chev: { color: C.muted, fontSize: 18, fontWeight: '700' },
});

