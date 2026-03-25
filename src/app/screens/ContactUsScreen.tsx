import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ScreenHeader } from '../components';
import { C } from '../constants';
import type { AppScreen } from '../types';

const grey = C.muted;
const WA = 'https://wa.me/2348039930607';
const EMAIL = 'mailto:Ahzarmanltd@gmail.com';
const PHONE = 'tel:08039930607';

const CHANNELS = [
  { icon: '💬', label: 'WhatsApp', sub: 'Typically replies in 5 min', badge: 'Fastest', url: WA },
  { icon: '✉️', label: 'Email', sub: 'Ahzarmanltd@gmail.com', badge: null as string | null, url: EMAIL },
  { icon: '📞', label: 'Phone', sub: '08039930607 · Mon–Fri 8am–6pm', badge: null, url: PHONE },
];

export function ContactUsScreen({ goTo }: { goTo: (s: AppScreen) => void }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    }, 1600);
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Contact Us" onBack={() => goTo('profile')} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke={C.primary}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{"We're here to help"}</Text>
            <Text style={styles.heroSub}>Avg: 5 min WhatsApp · 2hr email</Text>
          </View>
        </View>

        <View style={styles.card}>
          {CHANNELS.map((ch, i) => (
            <Pressable
              key={ch.label}
              onPress={() => Linking.openURL(ch.url).catch(() => {})}
              style={[styles.channelRow, i < CHANNELS.length - 1 ? styles.rowBorder : null]}
            >
              <View style={styles.chIcon}>
                <Text style={{ fontSize: 20 }}>{ch.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.chTitleRow}>
                  <Text style={styles.chLabel}>{ch.label}</Text>
                  {ch.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeTxt}>{ch.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.chSub}>{ch.sub}</Text>
              </View>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18l6-6-6-6" stroke={grey} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          ))}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Send a message</Text>
          <Text style={styles.fieldLabel}>Subject</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="What is this about?"
            placeholderTextColor={C.placeholder}
            style={styles.input}
          />
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="How can we help?"
            placeholderTextColor={C.placeholder}
            style={[styles.input, styles.inputMulti]}
            multiline
            textAlignVertical="top"
          />
          {sent ? (
            <View style={styles.sentBanner}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M20 6L9 17l-5-5" stroke={C.success} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.sentTxt}>Sent!</Text>
            </View>
          ) : null}
          <Pressable
            onPress={handleSend}
            disabled={!subject.trim() || !message.trim() || sending}
            style={[
              styles.sendBtn,
              (!subject.trim() || !message.trim() || sending) && styles.sendBtnDisabled,
            ]}
          >
            {sending ? (
              <ActivityIndicator color={C.disabledTxt} />
            ) : (
              <Text style={styles.sendBtnTxt}>Send Message</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 16 },
  hero: {
    backgroundColor: C.ink,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${C.primary}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 16, fontWeight: '700', color: C.white, marginBottom: 4 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,.5)' },
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  chIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.primFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chLabel: { fontSize: 14, fontWeight: '600', color: C.ink },
  badge: { backgroundColor: '#25D36618', borderRadius: 5, paddingVertical: 1, paddingHorizontal: 7 },
  badgeTxt: { fontSize: 10, fontWeight: '700', color: '#25D366' },
  chSub: { fontSize: 12, color: grey, marginTop: 2 },
  formCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  formTitle: { fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 14 },
  fieldLabel: { fontSize: 12, color: grey, marginBottom: 6 },
  input: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: C.ink,
  },
  inputMulti: { height: 100, paddingTop: 12 },
  sentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.successBg,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.successBorder,
  },
  sentTxt: { fontSize: 13, fontWeight: '500', color: C.success },
  sendBtn: {
    height: 50,
    backgroundColor: C.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  sendBtnDisabled: { backgroundColor: C.disabled, opacity: 0.9 },
  sendBtnTxt: { fontSize: 16, fontWeight: '700', color: C.ink },
});
