import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[styles.toggleTrack, value ? styles.toggleOn : null]}
    >
      <View style={[styles.toggleKnob, value ? { marginLeft: 18 } : { marginLeft: 0 }]} />
    </Pressable>
  );
}

export function PaymentSettingsScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [autoRetry, setAutoRetry] = useState(true);
  const [emailRec, setEmailRec] = useState(true);
  const [smsRec, setSmsRec] = useState(false);
  const [saved, setSaved] = useState(false);

  const methods = [
    { label: 'Bank Transfer', sub: 'NUBAN payment', active: true },
    { label: 'Card', sub: 'Debit/credit', active: false },
  ];

  const toggles = [
    { icon: '🔄', label: 'Auto-retry Failed', sub: 'Retry once automatically', val: autoRetry, set: setAutoRetry },
    { icon: '📧', label: 'Email Receipts', sub: 'After each transaction', val: emailRec, set: setEmailRec },
    { icon: '📱', label: 'SMS Receipts', sub: 'Text after each transaction', val: smsRec, set: setSmsRec },
  ];

  return (
    <View style={styles.page}>
      <ScreenHeader title="Payment Settings" onBack={() => goTo('profile')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {methods.map((m, i) => (
            <View
              key={m.label}
              style={[styles.methodRow, i < methods.length - 1 ? styles.rowBorder : null]}
            >
              <View
                style={[
                  styles.radioOuter,
                  m.active ? { borderColor: C.primary } : { borderColor: C.border },
                ]}
              >
                {m.active ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodLabel, m.active ? { fontWeight: '600' } : null]}>{m.label}</Text>
                <Text style={styles.methodSub}>{m.sub}</Text>
              </View>
              {m.active ? (
                <View style={styles.defaultPill}>
                  <Text style={styles.defaultPillTxt}>DEFAULT</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          {toggles.map((r, i) => (
            <View
              key={r.label}
              style={[styles.toggleRow, i < toggles.length - 1 ? styles.rowBorder : null]}
            >
              <View style={styles.toggleIcon}>
                <Text style={{ fontSize: 18 }}>{r.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>{r.label}</Text>
                <Text style={styles.toggleSub}>{r.sub}</Text>
              </View>
              <Toggle value={r.val} onChange={r.set} />
            </View>
          ))}
        </View>

        {saved ? (
          <View style={styles.savedBanner}>
            <Text style={styles.savedTxt}>✓ Settings saved!</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
          style={styles.saveBtn}
        >
          <Text style={styles.saveBtnTxt}>Save Settings</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 16 },
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },
  methodLabel: { fontSize: 14, color: C.ink },
  methodSub: { fontSize: 11, color: grey, marginTop: 2 },
  defaultPill: {
    backgroundColor: C.primXlt,
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  defaultPillTxt: { fontSize: 10, fontWeight: '700', color: C.olive },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: C.ink },
  toggleSub: { fontSize: 11, color: grey, marginTop: 2 },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D0D0D0',
    paddingHorizontal: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleOn: { backgroundColor: C.primary },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  savedBanner: {
    backgroundColor: C.successBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.successBorder,
  },
  savedTxt: { fontSize: 13, fontWeight: '500', color: C.success },
  saveBtn: {
    height: 50,
    backgroundColor: C.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnTxt: { fontSize: 16, fontWeight: '700', color: C.ink },
});
