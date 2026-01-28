// Components/SavedSpotsScreen.js — Idle Fishing Tamagotchi
// Saved fishing spots (offline list) + add/edit + quick filters.
// No extra deps.
//
// Expects assets:
// assets/onb_bg.png
// assets/back.png

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
  Modal,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';

const BG = require('../assets/onb_bg.png');
const ICON_BACK = require('../assets/back.png');
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

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const initialSpots = [
  {
    id: uid(),
    name: 'Pine Bay Edge',
    type: 'Lake',
    ice: 'Medium',
    depth: '3–5 m',
    note: 'Shelter friendly. Early bite at dawn.',
    pinned: true,
  },
  {
    id: uid(),
    name: 'North Shore Drop',
    type: 'Lake',
    ice: 'Thick',
    depth: '6–9 m',
    note: 'Check wind. Great for jigging.',
    pinned: false,
  },
  {
    id: uid(),
    name: 'River Backwater',
    type: 'River',
    ice: 'Thin',
    depth: '2–3 m',
    note: 'Be careful near current.',
    pinned: false,
  },
];

export default function SavedSpotsScreen({ navigation }) {
  const [spots, setSpots] = useState(initialSpots);
  const [filter, setFilter] = useState('All'); // All | Lake | River
  const [query, setQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'Lake',
    ice: 'Medium',
    depth: '',
    note: '',
    pinned: false,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', type: 'Lake', ice: 'Medium', depth: '', note: '', pinned: false });
    setModalOpen(true);
  };

  const openEdit = (spot) => {
    setEditingId(spot.id);
    setForm({
      name: spot.name,
      type: spot.type,
      ice: spot.ice,
      depth: spot.depth,
      note: spot.note,
      pinned: !!spot.pinned,
    });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return Alert.alert('Name required', 'Spot needs a name.');

    const payload = {
      id: editingId || uid(),
      name: form.name.trim(),
      type: form.type,
      ice: form.ice,
      depth: (form.depth || '').trim() || '—',
      note: (form.note || '').trim(),
      pinned: !!form.pinned,
    };

    setSpots(prev => {
      if (!editingId) return [payload, ...prev];
      return prev.map(s => (s.id === editingId ? payload : s));
    });

    setModalOpen(false);
  };

  const remove = (id) => {
    Alert.alert('Remove spot?', 'This will delete the saved spot.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setSpots(prev => prev.filter(s => s.id !== id)) },
    ]);
  };

  const togglePin = (id) => {
    setSpots(prev => prev.map(s => (s.id === id ? { ...s, pinned: !s.pinned } : s)));
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spots
      .filter(s => (filter === 'All' ? true : s.type === filter))
      .filter(s => (!q ? true : `${s.name} ${s.note}`.toLowerCase().includes(q)))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [spots, filter, query]);

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
              <Text style={styles.hTitle}>Saved Spots</Text>
              <Text style={styles.hSub}>Keep your best ice locations.</Text>
            </View>

            <TouchableOpacity onPress={openCreate} activeOpacity={0.9}>
              <ImageBackground source={BUTTON_BG} style={styles.primaryBtn} resizeMode="contain">
                <Text style={styles.primaryTxt}>+ Add</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchCard}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search spots…"
              placeholderTextColor="rgba(232,236,241,0.45)"
              style={styles.searchInput}
            />
          </View>

          {/* Filter chips */}
          <View style={styles.chipsRow}>
            {['All', 'Lake', 'River'].map(k => {
              const active = filter === k;
              return (
                <TouchableOpacity
                  key={k}
                  onPress={() => setFilter(k)}
                  activeOpacity={0.9}
                  style={[styles.chip, active && styles.chipOn]}
                >
                  <Text style={[styles.chipTxt, active && styles.chipTxtOn]}>{k}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* List */}
          {list.length ? (
            list.map(spot => (
              <View key={spot.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {spot.name}
                      {spot.pinned ? <Text style={styles.pin}>  •  PINNED</Text> : null}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {spot.type} • Ice: {spot.ice} • Depth: {spot.depth}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => togglePin(spot.id)}
                    activeOpacity={0.85}
                    style={[styles.smallBtn, spot.pinned && styles.smallBtnOn]}
                  >
                    <Text style={styles.smallBtnTxt}>{spot.pinned ? 'Unpin' : 'Pin'}</Text>
                  </TouchableOpacity>
                </View>

                {!!spot.note && <Text style={styles.note} numberOfLines={3}>{spot.note}</Text>}

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => openEdit(spot)}
                    activeOpacity={0.9}
                    style={styles.secondaryBtn}
                  >
                    <Text style={styles.secondaryTxt}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => remove(spot.id)}
                    activeOpacity={0.9}
                    style={[styles.secondaryBtn, styles.dangerBtn]}
                  >
                    <Text style={styles.secondaryTxt}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyTitle}>No spots yet</Text>
              <Text style={styles.emptySub}>Tap “+ Add” and save your first location.</Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Modal */}
        <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalTop}>
                <Text style={styles.modalTitle}>{editingId ? 'Edit Spot' : 'New Spot'}</Text>
                <TouchableOpacity onPress={() => setModalOpen(false)} activeOpacity={0.85}>
                  <Text style={styles.modalClose}>Close</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={form.name}
                onChangeText={(v) => setForm(s => ({ ...s, name: v }))}
                placeholder="Spot name"
                placeholderTextColor="rgba(232,236,241,0.45)"
                style={styles.input}
                maxLength={48}
              />

              {/* Type */}
              <Text style={styles.modalLabel}>Type</Text>
              <View style={styles.chipsRowModal}>
                {['Lake', 'River'].map(k => {
                  const active = form.type === k;
                  return (
                    <TouchableOpacity
                      key={k}
                      onPress={() => setForm(s => ({ ...s, type: k }))}
                      activeOpacity={0.9}
                      style={[styles.chip, active && styles.chipOn]}
                    >
                      <Text style={[styles.chipTxt, active && styles.chipTxtOn]}>{k}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Ice */}
              <Text style={styles.modalLabel}>Ice</Text>
              <View style={styles.chipsRowModal}>
                {['Thin', 'Medium', 'Thick'].map(k => {
                  const active = form.ice === k;
                  return (
                    <TouchableOpacity
                      key={k}
                      onPress={() => setForm(s => ({ ...s, ice: k }))}
                      activeOpacity={0.9}
                      style={[styles.chip, active && styles.chipOn]}
                    >
                      <Text style={[styles.chipTxt, active && styles.chipTxtOn]}>{k}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                value={form.depth}
                onChangeText={(v) => setForm(s => ({ ...s, depth: v }))}
                placeholder="Depth (optional) e.g., 4–6 m"
                placeholderTextColor="rgba(232,236,241,0.45)"
                style={styles.input}
                maxLength={20}
              />

              <TextInput
                value={form.note}
                onChangeText={(v) => setForm(s => ({ ...s, note: v }))}
                placeholder="Note (optional)"
                placeholderTextColor="rgba(232,236,241,0.45)"
                style={[styles.input, styles.inputArea]}
                multiline
                maxLength={220}
              />

              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => setForm(s => ({ ...s, pinned: !s.pinned }))}
                  activeOpacity={0.9}
                  style={[styles.pinToggle, form.pinned && styles.pinToggleOn]}
                >
                  <Text style={styles.pinToggleTxt}>{form.pinned ? 'Pinned ✓' : 'Pin this spot'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={save} activeOpacity={0.9} style={styles.modalPrimary}>
                  <Text style={styles.modalPrimaryTxt}>Save</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalHint}>Keep it readable—short notes work best.</Text>
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

  hTitle: { color: COLORS.text, fontSize: 22, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },
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

  searchCard: {
    padding: 12,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  searchInput: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.16)',
    backgroundColor: 'rgba(7,18,27,0.45)',
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700', fontFamily: FONT_FAMILY },

  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  chipsRowModal: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(77,214,255,0.06)',
    borderWidth: 1,
    borderColor: '#2A4A6A',
  },
  chipOn: { backgroundColor: 'rgba(124,255,204,0.12)', borderColor: 'rgba(124,255,204,0.22)' },
  chipTxt: { color: 'rgba(232,236,241,0.82)', fontWeight: '900', fontSize: 12.5, fontFamily: FONT_FAMILY },
  chipTxtOn: { color: '#E8ECF1' },

  card: {
    marginTop: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: '#1A2F4A',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  emptyCard: { paddingVertical: 18 },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardTitle: { color: COLORS.text, fontWeight: '900', fontSize: 15.5, fontFamily: FONT_FAMILY },
  pin: { color: 'rgba(124,255,204,0.86)', fontSize: 12.2, fontWeight: '900', fontFamily: FONT_FAMILY },
  cardMeta: { color: COLORS.muted, marginTop: 6, fontSize: 12.8, fontFamily: FONT_FAMILY },

  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(77,214,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.22)',
  },
  smallBtnOn: { backgroundColor: 'rgba(124,255,204,0.12)', borderColor: 'rgba(124,255,204,0.22)' },
  smallBtnTxt: { color: COLORS.text, fontWeight: '900', fontSize: 12.5, fontFamily: FONT_FAMILY },

  note: { marginTop: 10, color: 'rgba(232,236,241,0.76)', lineHeight: 20, fontSize: 13.2, fontFamily: FONT_FAMILY },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(77,214,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.20)',
  },
  dangerBtn: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.18)',
  },
  secondaryTxt: { color: COLORS.text, fontWeight: '900', fontSize: 13, fontFamily: FONT_FAMILY },

  // modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', paddingHorizontal: 16 },
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

  modalLabel: { color: COLORS.muted, fontWeight: '900', fontSize: 12.5, marginTop: 10, fontFamily: FONT_FAMILY },

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
  inputArea: { minHeight: 90, textAlignVertical: 'top' },

  row: { flexDirection: 'row', gap: 10, marginTop: 12, alignItems: 'center' },
  pinToggle: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(77,214,255,0.06)',
    borderWidth: 1,
    borderColor: '#2A4A6A',
  },
  pinToggleOn: { backgroundColor: 'rgba(124,255,204,0.10)', borderColor: 'rgba(124,255,204,0.22)' },
  pinToggleTxt: { color: COLORS.text, fontWeight: '900', fontSize: 13, fontFamily: FONT_FAMILY },

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

  emptyTitle: { color: COLORS.text, fontWeight: '900', fontSize: 16, fontFamily: FONT_FAMILY },
  emptySub: { marginTop: 6, color: COLORS.muted, fontSize: 13.2, lineHeight: 18, fontFamily: FONT_FAMILY },
});
