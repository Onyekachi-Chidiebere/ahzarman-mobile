import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ApiError } from '../api/client';
import type { AuthUser } from '../api/auth';
import {
  formatDobDisplay,
  formatPhoneDisplay,
  getUserById,
  parseDobForApi,
  updateUser,
  type UserProfile,
} from '../api/users';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;

type FieldRow = { key: string; label: string; val: string; editable: boolean };

function profileToFields(user: UserProfile): FieldRow[] {
  return [
    { key: 'name', label: 'Full Name', val: user.name?.trim() || '—', editable: true },
    { key: 'email', label: 'Email Address', val: user.email?.trim() || '—', editable: true },
    {
      key: 'phone',
      label: 'Phone Number',
      val: formatPhoneDisplay(user.phone || ''),
      editable: false,
    },
    // {
    //   key: 'dob',
    //   label: 'Date of Birth',
    //   val: formatDobDisplay(user.date_of_birth),
    //   editable: true,
    // },
    {
      key: 'username',
      label: 'Username',
      val: user.username?.trim() || '—',
      editable: true,
    },
  ];
}

function profileToAuthUser(user: UserProfile): AuthUser {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    username: user.username,
    date_of_birth: user.date_of_birth,
    gender: user.gender,
    wallet_balance: user.wallet_balance,
    profile_image: user.profile_image,
  };
}

function buildUpdateBody(key: string, value: string): Record<string, string | null> | null {
  const v = value.trim();
  switch (key) {
    case 'name':
      if (v.length < 2) return null;
      return { name: v };
    case 'email':
      if (!v.includes('@')) return null;
      return { email: v };
    case 'username':
      return { username: v === '—' ? null : v };
    case 'dob': {
      const iso = parseDobForApi(v);
      if (!iso) return null;
      return { date_of_birth: iso };
    }
    default:
      return null;
  }
}

export function PersonalInfoScreen({
  goTo,
  authUser,
  authToken,
  onUserUpdated,
}: {
  goTo: (s: AppScreen) => void;
  authUser: AuthUser | null;
  authToken: string | null;
  onUserUpdated: (user: AuthUser) => void;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [fields, setFields] = useState<FieldRow[]>([]);
  const [editVal, setEditVal] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const applyProfile = useCallback((user: UserProfile) => {
    setFields(profileToFields(user));
    onUserUpdated(profileToAuthUser(user));
  }, [onUserUpdated]);

  const loadProfile = useCallback(async () => {
    if (!authUser?.id) {
      setLoading(false);
      setLoadError('Sign in to view your profile.');
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const user = await getUserById(authUser.id, authToken);
      applyProfile(user);
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not load profile';
      setLoadError(msg);
      if (authUser) {
        setFields(profileToFields(authUser as UserProfile));
      }
    } finally {
      setLoading(false);
    }
  }, [authUser, authToken, applyProfile]);

  useEffect(() => {
    void loadProfile();
  }, []);

  const startEdit = (i: number) => {
    setEditing(i);
    setEditVal(fields[i].val === '—' ? '' : fields[i].val);
  };

  const saveEdit = async () => {
    if (editing === null || !authUser?.id) return;
    const field = fields[editing];
    const body = buildUpdateBody(field.key, editVal);
    if (!body) {
      Alert.alert(
        'Invalid value',
        field.key === 'dob'
          ? 'Enter a valid date (e.g. 15 March 1995).'
          : 'Please check the value and try again.',
      );
      return;
    }

    setSaving(true);
    try {
      const updated = await updateUser(authUser.id, authToken, body);
      applyProfile(updated);
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not save changes';
      Alert.alert('Save failed', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Personal Info" onBack={() => goTo('profile')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {loadError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorTxt}>{loadError}</Text>
            <Pressable onPress={() => void loadProfile()} style={styles.retryBtn}>
              <Text style={styles.retryTxt}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {saved ? (
          <View style={styles.savedBanner}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke={C.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.savedTxt}>Changes saved!</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.loadingTxt}>Loading your details…</Text>
          </View>
        ) : (
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
                      editable={!saving}
                      keyboardType={f.key === 'email' ? 'email-address' : 'default'}
                      autoCapitalize={f.key === 'email' || f.key === 'username' ? 'none' : 'words'}
                    />
                    <View style={styles.editActions}>
                      <Pressable
                        onPress={() => void saveEdit()}
                        disabled={saving}
                        style={[styles.saveBtn, saving && styles.btnDisabled]}
                      >
                        {saving ? (
                          <ActivityIndicator color={C.ink} size="small" />
                        ) : (
                          <Text style={styles.saveBtnTxt}>Save</Text>
                        )}
                      </Pressable>
                      <Pressable
                        onPress={() => setEditing(null)}
                        disabled={saving}
                        style={[styles.cancelBtn, saving && styles.btnDisabled]}
                      >
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
                      <Pressable onPress={() => startEdit(i)} hitSlop={8} disabled={saving}>
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
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },
  loadingBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingTxt: { fontSize: 14, color: grey },
  errorBanner: {
    backgroundColor: C.errorBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.errorBorder,
    gap: 8,
  },
  errorTxt: { fontSize: 13, color: C.error },
  retryBtn: { alignSelf: 'flex-start' },
  retryTxt: { fontSize: 13, fontWeight: '600', color: C.olive },
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
  btnDisabled: { opacity: 0.6 },
});
