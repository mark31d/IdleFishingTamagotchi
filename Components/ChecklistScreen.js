// Components/ChecklistScreen.js — Idle Fishing Tamagotchi
// Simple trip checklist with categories, toggle items, add custom items.
// No extra deps. (Optional: wire AsyncStorage later)
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

const DEFAULT_GROUPS = [
  {
    key: 'safety',
    title: 'Safety',
    items: [
      'Ice picks / spikes',
      'Throw rope',
      'Life vest (optional)',
      'First aid kit',
      'Headlamp / lantern',
    ],
  },
  {
    key: 'gear',
    title: 'Gear',
    items: [
      'Ice auger',
      'Rod + spare line',
      'Tackle box',
      'Skimmer',
      'Bait / lures',
    ],
  },
  {
    key: 'warmth',
    title: 'Warmth',
    items: [
      'Shelter / windbreak',
      'Heater fuel',
      'Thermos (hot drink)',
      'Extra gloves',
      'Hand warmers',
    ],
  },
  {
    key: 'trip',
    title: 'Trip',
    items: [
      'Route / parking plan',
      'Weather check',
      'Sunrise time',
      'Phone power bank',
      'Trash bag (leave no trace)',
    ],
  },
];

function buildInitialState() {
  return DEFAULT_GROUPS.map(g => ({
    key: g.key,
    title: g.title,
    items: g.items.map(label => ({
      id: uid(),
      label,
      done: false,
      builtin: true,
    })),
  }));
}

export default function ChecklistScreen({ navigation }) {
  const [groups, setGroups] = useState(buildInitialState);
  const [addOpen, setAddOpen] = useState(false);
  const [addGroupKey, setAddGroupKey] = useState(DEFAULT_GROUPS[0].key);
  const [addText, setAddText] = useState('');

  const total = useMemo(() => {
    const all = groups.flatMap(g => g.items);
    const done = all.filter(i => i.done).length;
    return { done, all: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
  }, [groups]);

  const toggleItem = (groupKey, itemId) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.key !== groupKey) return g;
        return {
          ...g,
          items: g.items.map(it => (it.id === itemId ? { ...it, done: !it.done } : it)),
        };
      })
    );
  };

  const resetAll = () => {
    Alert.alert('Reset checklist?', 'All items will be unchecked.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () =>
          setGroups(prev =>
            prev.map(g => ({ ...g, items: g.items.map(it => ({ ...it, done: false })) }))
          ),
      },
    ]);
  };

  const openAdd = () => {
    setAddGroupKey(groups[0]?.key || DEFAULT_GROUPS[0].key);
    setAddText('');
    setAddOpen(true);
  };

  const addItem = () => {
    const txt = addText.trim();
    if (!txt) return;
    setGroups(prev =>
      prev.map(g => {
        if (g.key !== addGroupKey) return g;
        return {
          ...g,
          items: [
            ...g.items,
            { id: uid(), label: txt, done: false, builtin: false },
          ],
        };
      })
    );
    setAddOpen(false);
  };

  const removeItem = (groupKey, itemId) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.key !== groupKey) return g;
        return { ...g, items: g.items.filter(it => it.id !== itemId) };
      })
    );
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
              <Text style={styles.hTitle}>Checklist</Text>
              <Text style={styles.hSub}>Pack smart. Stay safe on the ice.</Text>
            </View>

            <TouchableOpacity onPress={resetAll} activeOpacity={0.9} style={styles.ghostBtn}>
              <Text style={styles.ghostTxt}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={styles.progressCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pKicker}>Progress</Text>
              <Text style={styles.pTitle}>
                {total.done}/{total.all} items
              </Text>
              <Text style={styles.pSub}>{total.pct}% ready</Text>
            </View>

            <View style={styles.ring}>
              <Text style={styles.ringTxt}>{total.pct}%</Text>
            </View>
          </View>

          <TouchableOpacity onPress={openAdd} activeOpacity={0.9} style={styles.addBtn}>
            <Text style={styles.addTxt}>+ Add item</Text>
          </TouchableOpacity>

          {/* Groups */}
          {groups.map(group => (
            <View key={group.key} style={styles.groupCard}>
              <View style={styles.groupTop}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <Text style={styles.groupCount}>
                  {group.items.filter(i => i.done).length}/{group.items.length}
                </Text>
              </View>

              {group.items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => toggleItem(group.key, item.id)}
                  style={styles.itemRow}
                >
                  <View style={[styles.check, item.done && styles.checkOn]}>
                    {item.done ? <View style={styles.checkDot} /> : null}
                  </View>

                  <Text style={[styles.itemTxt, item.done && styles.itemDone]} numberOfLines={2}>
                    {item.label}
                  </Text>

                  {!item.builtin && (
                    <TouchableOpacity
                      onPress={() => removeItem(group.key, item.id)}
                      activeOpacity={0.85}
                      style={styles.removeBtn}
                    >
                      <Text style={styles.removeTxt}>✕</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Add Modal */}
        <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalTop}>
                <Text style={styles.modalTitle}>Add item</Text>
                <TouchableOpacity onPress={() => setAddOpen(false)} activeOpacity={0.85}>
                  <Text style={styles.modalClose}>Close</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Category</Text>
              <View style={styles.chipsRow}>
                {groups.map(g => {
                  const active = g.key === addGroupKey;
                  return (
                    <TouchableOpacity
                      key={g.key}
                      onPress={() => setAddGroupKey(g.key)}
                      activeOpacity={0.9}
                      style={[styles.chip, active && styles.chipOn]}
                    >
                      <Text style={[styles.chipTxt, active && styles.chipTxtOn]}>{g.title}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.modalLabel, { marginTop: 10 }]}>Item</Text>
              <TextInput
                value={addText}
                onChangeText={setAddText}
                placeholder="e.g., Extra socks"
                placeholderTextColor="rgba(232,236,241,0.45)"
                style={styles.input}
                maxLength={52}
              />

              <TouchableOpacity onPress={addItem} activeOpacity={0.9} style={styles.modalPrimary}>
                <Text style={styles.modalPrimaryTxt}>Add</Text>
              </TouchableOpacity>

              <Text style={styles.modalHint}>Keep it short—readable on the go.</Text>
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

  ghostBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(77,214,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.20)',
  },
  ghostTxt: { color: COLORS.text, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },

  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  pKicker: { color: COLORS.muted, fontSize: 12.5, fontWeight: '900', fontFamily: FONT_FAMILY },
  pTitle: { color: COLORS.text, marginTop: 6, fontSize: 20, fontWeight: '900', fontFamily: FONT_FAMILY },
  pSub: { color: 'rgba(232,236,241,0.62)', marginTop: 6, fontSize: 13.2, fontFamily: FONT_FAMILY },

  ring: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: 'rgba(124,255,204,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(124,255,204,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTxt: { color: COLORS.text, fontWeight: '900', fontFamily: FONT_FAMILY },

  addBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(77,214,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(124,255,204,0.22)',
  },
  addTxt: { color: COLORS.text, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },

  groupCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(10,25,38,0.70)',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  groupTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  groupTitle: { color: COLORS.text, fontWeight: '900', fontSize: 15.5, fontFamily: FONT_FAMILY },
  groupCount: { color: COLORS.muted, fontWeight: '800', fontSize: 12.5, fontFamily: FONT_FAMILY },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(77,214,255,0.10)',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(232,236,241,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,18,27,0.20)',
  },
  checkOn: {
    borderColor: 'rgba(124,255,204,0.45)',
    backgroundColor: 'rgba(124,255,204,0.12)',
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E8ECF1',
    opacity: 0.95,
  },
  itemTxt: { flex: 1, color: 'rgba(232,236,241,0.86)', fontSize: 13.5, fontWeight: '800', fontFamily: FONT_FAMILY },
  itemDone: { color: 'rgba(232,236,241,0.55)', textDecorationLine: 'line-through' },

  removeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.18)',
  },
  removeTxt: { color: 'rgba(232,236,241,0.90)', fontWeight: '900', fontFamily: FONT_FAMILY },

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

  modalLabel: { color: COLORS.muted, fontWeight: '900', fontSize: 12.5, marginTop: 6, fontFamily: FONT_FAMILY },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(77,214,255,0.06)',
    borderWidth: 1,
    borderColor: '#2A4A6A',
  },
  chipOn: {
    backgroundColor: 'rgba(124,255,204,0.12)',
    borderColor: 'rgba(124,255,204,0.22)',
  },
  chipTxt: { color: 'rgba(232,236,241,0.82)', fontWeight: '900', fontSize: 12.5, fontFamily: FONT_FAMILY },
  chipTxtOn: { color: '#E8ECF1' },

  input: {
    marginTop: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.16)',
    backgroundColor: 'rgba(7,18,27,0.45)',
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700', fontFamily: FONT_FAMILY },

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
