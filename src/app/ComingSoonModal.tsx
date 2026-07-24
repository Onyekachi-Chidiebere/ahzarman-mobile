import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ServiceIcon, type ServiceItemKey } from './assets/icons';
import { C } from './constants';

type Props = {
  visible: boolean;
  label: string;
  serviceKey?: ServiceItemKey;
  color?: string;
  onClose: () => void;
};

export function ComingSoonModal({ visible, label, serviceKey, color, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <View style={[styles.iconWrap, { backgroundColor: color || C.primXlt }]}>
            {serviceKey ? (
              <ServiceIcon name={serviceKey} size={28} />
            ) : (
              <Text style={styles.iconFallback}>✨</Text>
            )}
          </View>
          <Text style={styles.title}>Coming soon</Text>
          <Text style={styles.body}>
            <Text style={styles.bodyEm}>{label}</Text> isn’t available yet. We’re finishing it up —
            you’ll be able to use it here soon.
          </Text>
          <Pressable onPress={onClose} style={styles.btn} accessibilityRole="button">
            <Text style={styles.btnTxt}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 2, 2, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconFallback: { fontSize: 28 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: C.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: C.muted,
    textAlign: 'center',
    marginBottom: 22,
  },
  bodyEm: { fontWeight: '600', color: C.ink },
  btn: {
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { fontSize: 15, fontWeight: '800', color: C.ink },
});
