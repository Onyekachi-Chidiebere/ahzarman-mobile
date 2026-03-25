import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;

type FieldRow = { key: string; label: string; val: string; editable: boolean };

export function PersonalInfoScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [fields, setFields] = useState<FieldRow[]>([
    { key: 'name', label: 'Full Name', val: 'Mercy Okafor', editable: true },
    { key: 'email', label: 'Email Address', val: 'mercy@example.com', editable: true },
    { key: 'phone', label: 'Phone Number', val: '0801 234 5678', editable: false },
    { key: 'dob', label: 'Date of Birth', val: '15 March 1995', editable: true },
    { key: 'state', label: 'State', val: 'FCT, Abuja', editable: true },
  ]);
  const [editVal, setEditVal] = useState('');
  const [saved, setSaved] = useState(false);

  const startEdit = (i: number) => {
    setEditing(i);
    setEditVal(fields[i].val);
  };

  const saveEdit = () => {
    if (editing === null) return;
    const upd = [...fields];
    upd[editing] = { ...upd[editing], val: editVal };
    setFields(upd);
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Personal Info" onBack={() => goTo('profile')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {saved ? (
          <View style={styles.savedBanner}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke={C.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.savedTxt}>Changes saved!</Text>
          </View>
        ) : null}
        <View style={styles.card}>
          {fields.map((f, i) => (
            <View key={f.key} style={[styles.row, i < fields.length - 1 ? styles.rowBorder : null]}>
              {editing === i ? (
                <View>
                  <Text style={styles.editLabel}>{f.label}</Text>
                  <TextInput
                    value={editVal}
                    onChangeText={setEditVal}
                    style={styles.input}
                    autoFocus
                  />
                  <View style={styles.editActions}>
                    <Pressable onPress={saveEdit} style={styles.saveBtn}>
                      <Text style={styles.saveBtnTxt}>Save</Text>
                    </Pressable>
                    <Pressable onPress={() => setEditing(null)} style={styles.cancelBtn}>
                      <Text style={styles.cancelBtnTxt}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.rowInner}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>{f.label}</Text>
                    <Text style={styles.fieldVal}>{f.val}</Text>
                  </View>
                  {f.editable ? (
                    <Pressable onPress={() => startEdit(i)} hitSlop={8}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                          stroke={grey}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <Path
                          d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                          stroke={grey}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </Pressable>
                  ) : null}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.successBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.successBorder,
  },
  savedTxt: { fontSize: 13, fontWeight: '500', color: C.success },
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  row: { paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  rowInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: { fontSize: 12, color: grey, marginBottom: 2 },
  fieldVal: { fontSize: 15, fontWeight: '500', color: C.ink },
  editLabel: { fontSize: 12, color: C.primary, marginBottom: 6 },
  input: {
    width: '100%',
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.primary,
    paddingHorizontal: 12,
    fontSize: 15,
    color: C.ink,
    backgroundColor: C.white,
  },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  saveBtn: {
    flex: 1,
    height: 36,
    backgroundColor: C.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnTxt: { fontSize: 13, fontWeight: '600', color: C.ink },
  cancelBtn: {
    flex: 1,
    height: 36,
    backgroundColor: C.disabled,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnTxt: { fontSize: 13, fontWeight: '600', color: grey },
});
