import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen, Beneficiary } from '../types';

const grey = C.muted;
const NETS = ['MTN', 'Airtel', 'Glo', '9mobile'] as const;

const NET_COL: Record<string, string> = {
  MTN: '#FFCC00',
  Airtel: '#FF0000',
  Glo: '#007B40',
  '9mobile': '#006633',
};
const NET_TXT: Record<string, string> = {
  MTN: '#1A1A1A',
  Airtel: '#FFFFFF',
  Glo: '#FFFFFF',
  '9mobile': '#FFFFFF',
};

export function BeneficiariesScreen({
  goTo,
  beneficiaries,
  onSave,
  onDelete,
}: {
  goTo: (s: AppScreen) => void;
  beneficiaries: Beneficiary[];
  onSave: (b: Beneficiary) => void;
  onDelete: (id: number) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newNet, setNewNet] = useState<string>('MTN');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    if (!newName.trim() || newPhone.length !== 11) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ id: Date.now(), name: newName.trim(), phone: newPhone, network: newNet });
      setNewName('');
      setNewPhone('');
      setNewNet('MTN');
      setShowAdd(false);
      setSaving(false);
    }, 800);
  };

  const addDisabled = !newName.trim() || newPhone.length !== 11 || saving;

  const rightSlot = (
    <Pressable
      onPress={() => setShowAdd(v => !v)}
      style={[styles.headerBtn, showAdd ? { backgroundColor: C.primXlt } : { backgroundColor: C.primary }]}
    >
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        {showAdd ? (
          <Path
            d="M18 6L6 18M6 6l12 12"
            stroke={C.olive}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ) : (
          <Path d="M12 5v14M5 12h14" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
        )}
      </Svg>
    </Pressable>
  );

  return (
    <View style={styles.page}>
      <ScreenHeader title="Beneficiaries" onBack={() => goTo('profile')} rightSlot={rightSlot} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {showAdd ? (
          <View style={styles.addCard}>
            <Text style={styles.addTitle}>Add Beneficiary</Text>
            <View style={styles.netRow}>
              {NETS.map(n => (
                <Pressable
                  key={n}
                  onPress={() => setNewNet(n)}
                  style={[
                    styles.netChip,
                    { backgroundColor: newNet === n ? NET_COL[n] ?? C.primary : C.disabled },
                  ]}
                >
                  <Text
                    style={[
                      styles.netChipTxt,
                      { color: newNet === n ? NET_TXT[n] ?? C.ink : grey, fontWeight: newNet === n ? '700' : '400' },
                    ]}
                  >
                    {n}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Name"
              placeholderTextColor={C.placeholder}
              style={[styles.input, newName ? { borderColor: C.primary } : null]}
            />
            <TextInput
              value={newPhone}
              onChangeText={t => setNewPhone(t.replace(/\D/g, '').slice(0, 11))}
              placeholder="Phone (11 digits)"
              placeholderTextColor={C.placeholder}
              keyboardType="phone-pad"
              style={[
                styles.input,
                { marginTop: 10 },
                newPhone.length === 11 ? { borderColor: '#C8D080' } : null,
              ]}
            />
            <Pressable
              onPress={handleAdd}
              disabled={addDisabled}
              style={[styles.saveBen, addDisabled && { backgroundColor: C.disabled, opacity: 0.9 }]}
            >
              {saving ? (
                <ActivityIndicator color={C.disabledTxt} />
              ) : (
                <Text style={[styles.saveBenTxt, addDisabled && { color: C.disabledTxt }]}>Save Beneficiary</Text>
              )}
            </Pressable>
          </View>
        ) : null}

        {beneficiaries.length > 0 ? (
          <View style={styles.listCard}>
            {beneficiaries.map((b, i) => (
              <View
                key={b.id}
                style={[styles.benRow, i < beneficiaries.length - 1 ? styles.rowBorder : null]}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: NET_COL[b.network] ?? C.primary },
                  ]}
                >
                  <Text style={[styles.avatarTxt, { color: NET_TXT[b.network] ?? C.ink }]}>{b.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.benName}>{b.name}</Text>
                  <Text style={styles.benMeta}>
                    {b.phone} · {b.network}
                  </Text>
                </View>
                <Pressable onPress={() => onDelete(b.id)} style={styles.delBtn}>
                  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                    <Polyline
                      points="3 6 5 6 21 6"
                      stroke="#C0392B"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                    />
                    <Path
                      d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                      stroke="#C0392B"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
              <Path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke={C.olive}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx={9} cy={7} r={4} stroke={C.olive} strokeWidth={2} />
              <Path
                d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                stroke={C.olive}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.emptyTitle}>No saved beneficiaries</Text>
            <Text style={styles.emptySub}>Save a contact to quickly send airtime or data.</Text>
            <Pressable onPress={() => setShowAdd(true)} style={styles.emptyCta}>
              <Text style={styles.emptyCtaTxt}>Add Beneficiary</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 14 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  addTitle: { fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 14 },
  netRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  netChip: {
    flex: 1,
    height: 34,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  netChipTxt: { fontSize: 11 },
  input: {
    width: '100%',
    height: 46,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: C.ink,
  },
  saveBen: {
    height: 44,
    backgroundColor: C.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  saveBenTxt: { fontSize: 14, fontWeight: '700', color: C.ink },
  listCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  benRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontSize: 18, fontWeight: '700' },
  benName: { fontSize: 14, fontWeight: '600', color: C.ink },
  benMeta: { fontSize: 12, color: grey, marginTop: 2 },
  delBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FDF0EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: C.ink, marginTop: 12, textAlign: 'center' },
  emptySub: { fontSize: 13, color: grey, marginTop: 6, textAlign: 'center' },
  emptyCta: {
    marginTop: 16,
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: C.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCtaTxt: { fontSize: 14, fontWeight: '700', color: C.ink },
});
