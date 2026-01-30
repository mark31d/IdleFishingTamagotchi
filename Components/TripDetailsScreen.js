// Components/TripDetailsScreen.js — Idle Fish Care
// No extra deps. Clean details + actions.
// Expects assets:
// assets/onb_bg.png
// assets/back.png
// assets/calendar.png
// assets/clock.png
//
// Navigation:
// Pass trip via route.params.trip
// Optionally pass callbacks:
// route.params.onMarkDone(tripId)
// route.params.onDelete(tripId)
// route.params.onUpdate(updatedTrip)

import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';

const BG = require('../assets/onb_bg.png');
const ICON_BACK = require('../assets/back.png');
const ICON_CAL = require('../assets/calendar.png');
const ICON_CLOCK = require('../assets/clock.png');
const BUTTON_BG = require('../assets/button.png');

const FONT_FAMILY = 'TitanOne-Regular';

const COLORS = {
  bg: '#07121B',
  card: 'rgba(10,25,38,0.78)',
  card2: 'rgba(10,25,38,0.62)',
  line: 'rgba(77,214,255,0.16)',
  line2: 'rgba(124,255,204,0.16)',
  text: '#E8ECF1',
  muted: 'rgba(232,236,241,0.70)',
  cyan: '#4DD6FF',
  mint: '#7CFFCC',
  danger: '#EF4444',
};

const pad2 = n => (n < 10 ? `0${n}` : `${n}`);

const formatDate = (dStr) => {
  if (!dStr) return '—';
  const [y, m, d] = (dStr || '').split('-').map(Number);
  if (!y || !m || !d) return dStr;
  return `${pad2(d)}.${pad2(m)}.${y}`;
};

const formatTime = (tStr) => {
  if (!tStr) return '—';
  const [h, m] = (tStr || '').split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return tStr;
  return `${pad2(h)}:${pad2(m)}`;
};

export default function TripDetailsScreen({ navigation, route }) {
  const tripParam = route?.params?.trip;

  const onMarkDone = route?.params?.onMarkDone;
  const onDelete = route?.params?.onDelete;
  const onUpdate = route?.params?.onUpdate;

  const [trip, setTrip] = useState(() => ({
    id: tripParam?.id ?? 'unknown',
    title: tripParam?.title ?? 'Trip',
    place: tripParam?.place ?? '—',
    date: tripParam?.date ?? '',
    time: tripParam?.time ?? '',
    notes: tripParam?.notes ?? '',
    status: tripParam?.status ?? 'upcoming',
    gear: tripParam?.gear ?? { spikes: false, shelter: false, heater: false },
  }));

  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: trip.title || '',
    place: trip.place === '—' ? '' : trip.place,
    date: trip.date || '',
    time: trip.time || '',
    notes: trip.notes || '',
  });

  const gearSummary = useMemo(() => {
    const g = trip.gear || {};
    const arr = [];
    if (g.spikes) arr.push('Spikes');
    if (g.shelter) arr.push('Shelter');
    if (g.heater) arr.push('Heater');
    return arr.length ? arr.join(' • ') : '—';
  }, [trip.gear]);

  const statusLabel = trip.status === 'past' ? 'Completed' : 'Upcoming';
  const statusTone = trip.status === 'past' ? 'rgba(124,255,204,0.18)' : 'rgba(77,214,255,0.16)';
  const statusBorder = trip.status === 'past' ? 'rgba(124,255,204,0.28)' : 'rgba(77,214,255,0.28)';

  const openEdit = () => {
    setDraft({
      title: trip.title || '',
      place: trip.place === '—' ? '' : trip.place,
      date: trip.date || '',
      time: trip.time || '',
      notes: trip.notes || '',
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!draft.title.trim()) return Alert.alert('Title required', 'Add a trip name.');
    const updated = {
      ...trip,
      title: draft.title.trim(),
      place: (draft.place || '').trim() || '—',
      date: (draft.date || '').trim(),
      time: (draft.time || '').trim(),
      notes: (draft.notes || '').trim(),
    };
    setTrip(updated);
    setEditOpen(false);

    if (typeof onUpdate === 'function') onUpdate(updated);
  };

  const confirmDone = () => {
    if (trip.status === 'past') return;
    Alert.alert('Mark as done?', 'This will move the trip to history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Done',
        style: 'default',
        onPress: () => {
          setTrip(prev => ({ ...prev, status: 'past' }));
          if (typeof onMarkDone === 'function') onMarkDone(trip.id);
        },
      },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert('Delete trip?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (typeof onDelete === 'function') onDelete(trip.id);
          navigation?.goBack?.();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation?.goBack?.()}
              activeOpacity={0.85}
              style={styles.iconBtn}
            >
              <Image source={ICON_BACK} style={styles.icon16} resizeMode="contain" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.hTitle} numberOfLines={1}>{trip.title}</Text>
              <Text style={styles.hSub} numberOfLines={1}>{trip.place}</Text>
            </View>

            <TouchableOpacity onPress={openEdit} activeOpacity={0.9}>
              <ImageBackground source={BUTTON_BG} style={styles.primaryBtn} resizeMode="contain">
                <Text style={styles.primaryTxt}>Edit</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Status + date/time */}
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={[styles.badge, { backgroundColor: statusTone, borderColor: statusBorder }]}>
                <Text style={styles.badgeTxt}>{statusLabel}</Text>
              </View>

              <TouchableOpacity onPress={confirmDone} activeOpacity={0.9} style={styles.doneBtn}>
                <Text style={styles.doneTxt}>{trip.status === 'past' ? 'Done ✓' : 'Mark Done'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.pill}>
                <Image source={ICON_CAL} style={styles.pillIcon} />
                <Text style={styles.pillTxt}>{formatDate(trip.date)}</Text>
              </View>
              <View style={styles.pill}>
                <Image source={ICON_CLOCK} style={styles.pillIcon} />
                <Text style={styles.pillTxt}>{formatTime(trip.time)}</Text>
              </View>
            </View>

            <View style={styles.sectionLine} />

            <Text style={styles.k}>Gear</Text>
            <Text style={styles.v}>{gearSummary}</Text>
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <TouchableOpacity onPress={confirmDelete} activeOpacity={0.85} style={styles.dangerBtn}>
                <Text style={styles.dangerTxt}>Delete</Text>
              </TouchableOpacity>
            </View>

            {trip.notes ? (
              <Text style={styles.notes}>{trip.notes}</Text>
            ) : (
              <Text style={styles.empty}>No notes yet. Tap Edit to add details.</Text>
            )}

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => Alert.alert('Reminder (demo)', 'Hook this to notifications if you want.')}
                activeOpacity={0.9}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryTxt}>Set reminder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert('Share (demo)', 'Hook this to Share API if you want.')}
                activeOpacity={0.9}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryTxt}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Edit modal */}
        <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalTop}>
                <Text style={styles.modalTitle}>Edit Trip</Text>
                <TouchableOpacity onPress={() => setEditOpen(false)} activeOpacity={0.85}>
                  <Text style={styles.modalClose}>Close</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={draft.title}
                onChangeText={(v) => setDraft(s => ({ ...s, title: v }))}
                placeholder="Trip name"
                placeholderTextColor="rgba(232,236,241,0.45)"
                style={styles.input}
                maxLength={48}
              />
              <TextInput
                value={draft.place}
                onChangeText={(v) => setDraft(s => ({ ...s, place: v }))}
                placeholder="Place"
                placeholderTextColor="rgba(232,236,241,0.45)"
                style={styles.input}
                maxLength={48}
              />

              <View style={styles.row2}>
                <TextInput
                  value={draft.date}
                  onChangeText={(v) => setDraft(s => ({ ...s, date: v }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(232,236,241,0.45)"
                  style={[styles.input, styles.inputHalf]}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
                <TextInput
                  value={draft.time}
                  onChangeText={(v) => setDraft(s => ({ ...s, time: v }))}
                  placeholder="HH:MM"
                  placeholderTextColor="rgba(232,236,241,0.45)"
                  style={[styles.input, styles.inputHalf]}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>

              <TextInput
                value={draft.notes}
                onChangeText={(v) => setDraft(s => ({ ...s, notes: v }))}
                placeholder="Notes…"
                placeholderTextColor="rgba(232,236,241,0.45)"
                style={[styles.input, styles.inputArea]}
                multiline
              />

              <TouchableOpacity onPress={saveEdit} activeOpacity={0.9} style={styles.modalPrimary}>
                <Text style={styles.modalPrimaryTxt}>Save changes</Text>
              </TouchableOpacity>

              <Text style={styles.modalHint}>
                Tip: keep notes short—ice, bait, wind, safety.
              </Text>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bg: { flex: 1 },
  bgImage: {
    width: '120%',
    height: '120%',
    left: '-10%',
    top: '-10%',
  },
  scroll: { paddingTop: Platform.OS === 'android' ? 44 : 10, paddingHorizontal: 16 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(10,25,38,0.72)',
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon16: { width: 18, height: 18, tintColor: '#E8ECF1' },

  hTitle: { color: COLORS.text, fontSize: 20, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },
  hSub: { color: COLORS.muted, marginTop: 2, fontSize: 13.2, fontFamily: FONT_FAMILY },

  primaryBtn: {
    paddingVertical: 84,
    paddingHorizontal: 120,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primaryTxt: { color: COLORS.text, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },

  hero: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  badge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeTxt: { color: COLORS.text, fontWeight: '900', fontSize: 12.5, fontFamily: FONT_FAMILY },

  doneBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(124,255,204,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(124,255,204,0.22)',
  },
  doneTxt: { color: COLORS.text, fontWeight: '900', fontSize: 12.5, fontFamily: FONT_FAMILY },

  metaRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.line2,
  },
  pillIcon: { width: 16, height: 16, tintColor: '#E8ECF1' },
  pillTxt: { color: COLORS.text, fontWeight: '900', fontSize: 12.5, fontFamily: FONT_FAMILY },

  sectionLine: { height: 1, backgroundColor: 'rgba(77,214,255,0.12)', marginVertical: 14 },

  k: { color: COLORS.muted, fontSize: 12.5, fontWeight: '900', fontFamily: FONT_FAMILY },
  v: { color: COLORS.text, marginTop: 6, fontSize: 13.2, fontWeight: '900', fontFamily: FONT_FAMILY },

  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#1A2F4A',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  sectionTitle: { color: COLORS.text, fontSize: 15.5, fontWeight: '900', fontFamily: FONT_FAMILY },
  notes: { marginTop: 10, color: 'rgba(232,236,241,0.86)', lineHeight: 20, fontSize: 13.5, fontFamily: FONT_FAMILY },
  empty: { marginTop: 10, color: COLORS.muted, lineHeight: 20, fontSize: 13.5, fontFamily: FONT_FAMILY },

  dangerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.22)',
  },
  dangerTxt: { color: 'rgba(232,236,241,0.92)', fontWeight: '900', fontSize: 12.5, fontFamily: FONT_FAMILY },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(77,214,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.20)',
  },
  secondaryTxt: { color: COLORS.text, fontWeight: '900', fontSize: 13, fontFamily: FONT_FAMILY },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    borderRadius: 22,
    backgroundColor: '#1E3A5F',
    borderWidth: 1,
    borderColor: '#2A4A6A',
    padding: 16,
  },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: COLORS.text, fontSize: 16.5, fontWeight: '900', fontFamily: FONT_FAMILY },
  modalClose: { color: COLORS.muted, fontWeight: '800', fontFamily: FONT_FAMILY },

  input: {
    marginTop: 10,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.16)',
    backgroundColor: 'rgba(7,18,27,0.45)',
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700', fontFamily: FONT_FAMILY },
  row2: { flexDirection: 'row', gap: 10 },
  inputHalf: { flex: 1 },
  inputArea: { minHeight: 110, textAlignVertical: 'top' },

  modalPrimary: {
    marginTop: 20,
    paddingVertical: 84,
    paddingHorizontal: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,255,204,0.22)',
  },
  modalPrimaryTxt: { color: COLORS.text, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },
  modalHint: { marginTop: 10, color: 'rgba(232,236,241,0.55)', fontSize: 12.2, lineHeight: 16, fontFamily: FONT_FAMILY },
});
