import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { C } from './constants';
import type { AppScreen } from './types';

export function ScreenHeader({
  title,
  onBack,
  rightSlot,
}: {
  title: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke={C.ink}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      ) : (
        <View style={styles.backBtnPlaceholder} />
      )}
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightSlot}>{rightSlot ?? null}</View>
    </View>
  );
}

function IconHome({ active }: { active: boolean }) {
  const stroke = active ? C.primary : C.muted;
  const fill = active ? C.primXlt : 'none';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5z" stroke={stroke} strokeWidth={2} fill={fill} />
      <Path d="M9 22V12h6v10" stroke={stroke} strokeWidth={2} />
    </Svg>
  );
}

function IconGrid({ active }: { active: boolean }) {
  const stroke = active ? C.primary : C.muted;
  const fill = active ? C.primXlt : 'none';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={7} height={7} rx={1.5} stroke={stroke} strokeWidth={2} fill={fill} />
      <Rect x={14} y={3} width={7} height={7} rx={1.5} stroke={stroke} strokeWidth={2} fill={fill} />
      <Rect x={3} y={14} width={7} height={7} rx={1.5} stroke={stroke} strokeWidth={2} fill={fill} />
      <Rect x={14} y={14} width={7} height={7} rx={1.5} stroke={stroke} strokeWidth={2} fill={fill} />
    </Svg>
  );
}

function IconMedal({ active }: { active: boolean }) {
  const stroke = active ? C.primary : C.muted;
  const fill = active ? C.primXlt : 'none';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={5} stroke={stroke} strokeWidth={2} fill={fill} />
      <Path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke={stroke} strokeWidth={2} />
    </Svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  const stroke = active ? C.primary : C.muted;
  const fill = active ? C.primXlt : 'none';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={stroke} strokeWidth={2} />
      <Circle cx={12} cy={7} r={4} stroke={stroke} strokeWidth={2} fill={fill} />
    </Svg>
  );
}

export function BottomNav({
  active,
  goTo,
}: {
  active: AppScreen;
  goTo: (k: AppScreen) => void;
}) {
  const insets = useSafeAreaInsets();
  const tabs: Array<{ key: AppScreen; label: string; icon: (active: boolean) => ReactNode }> = [
    { key: 'home', label: 'Home', icon: a => <IconHome active={a} /> },
    { key: 'services', label: 'Services', icon: a => <IconGrid active={a} /> },
    { key: 'rewards', label: 'Rewards', icon: a => <IconMedal active={a} /> },
    { key: 'profile', label: 'Profile', icon: a => <IconUser active={a} /> },
  ];

  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom, height: 78 + insets.bottom }]}>
      {tabs.map(t => {
        const isActive = t.key === active;
        return (
          <Pressable key={t.key} onPress={() => goTo(t.key)} style={styles.tabBtn}>
            {isActive ? <View style={styles.activeIndicator} /> : null}
            {t.icon(isActive)}
            <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Lightweight PIN sheet — demo PIN `1234`, matches prototype PinSheet behavior. */
export function PaymentPinModal({
  visible,
  amountLabel,
  onDismiss,
  onConfirm,
}: {
  visible: boolean;
  amountLabel: string;
  onDismiss: () => void;
  onConfirm: () => void;
}) {
  const [pin, setPin] = useState('');
  useEffect(() => {
    if (!visible) setPin('');
  }, [visible]);
  const valid = pin === '1234';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={pinStyles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View style={pinStyles.sheet}>
          <Text style={pinStyles.sheetTitle}>Confirm Payment</Text>
          <Text style={pinStyles.amount}>{amountLabel}</Text>
          <Text style={pinStyles.hint}>Enter 4-digit PIN (demo: 1234)</Text>
          <TextInput
            value={pin}
            onChangeText={t => setPin(t.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            style={pinStyles.input}
            placeholder="••••"
            placeholderTextColor={C.placeholder}
          />
          <View style={pinStyles.actions}>
            <Pressable onPress={onDismiss} style={pinStyles.secondary}>
              <Text style={pinStyles.secondaryTxt}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!valid}
              onPress={() => {
                onConfirm();
                setPin('');
              }}
              style={[pinStyles.primary, !valid ? pinStyles.primaryDisabled : null]}
            >
              <Text style={pinStyles.primaryTxt}>Pay now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const pinStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: C.ink, marginBottom: 6, textAlign: 'center' },
  amount: { fontSize: 22, fontWeight: '700', color: C.olive, textAlign: 'center', marginBottom: 8 },
  hint: { fontSize: 12, color: C.muted, textAlign: 'center', marginBottom: 12 },
  input: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 16,
    fontSize: 18,
    letterSpacing: 8,
    textAlign: 'center',
    color: C.ink,
    marginBottom: 16,
  },
  actions: { flexDirection: 'row', gap: 12 },
  secondary: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTxt: { fontSize: 15, fontWeight: '600', color: C.muted },
  primary: { flex: 1, height: 48, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  primaryDisabled: { opacity: 0.45 },
  primaryTxt: { fontSize: 15, fontWeight: '800', color: C.ink },
});

export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderSub}>This screen is queued for the next migration step.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  backBtnPlaceholder: { width: 44, height: 44 },
  headerTitle: { flex: 1, textAlign: 'center', color: C.ink, fontSize: 17, fontWeight: '600' },
  rightSlot: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBtn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 4 },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    backgroundColor: C.primary,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  tabLabel: { fontSize: 11, color: C.muted, fontWeight: '400' },
  tabLabelActive: { color: C.primary, fontWeight: '600' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  placeholderTitle: { fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 6 },
  placeholderSub: { fontSize: 13, color: C.muted, textAlign: 'center' },
});

