// Components/IceGameHistoryScreen.js — Idle Fish Care
// Simple history screen for mini-games: sessions list + filters + details modal.
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
  StatusBar,
  Platform,
  Modal,
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

const pad2 = n => (n < 10 ? `0${n}` : `${n}`);
const fmtDateTime = (iso) => {
  try {
    const d = new Date(iso);
    const DD = pad2(d.getDate());
    const MM = pad2(d.getMonth() + 1);
    const YYYY = d.getFullYear();
    const HH = pad2(d.getHours());
    const mm = pad2(d.getMinutes());
    return `${DD}.${MM}.${YYYY} • ${HH}:${mm}`;
  } catch {
    return iso;
  }
};

// Demo seed (replace with real storage later)
const SEED = [
  {
    id: 's1',
    game: 'Hook Target',
    score: 420,
    streakBest: 7,
    durationSec: 30,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    meta: { difficulty: 'Normal', taps: 18, misses: 4 },
  },
  {
    id: 's2',
    game: 'Hook Target',
    score: 930,
    streakBest: 10,
    durationSec: 30,
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    meta: { difficulty: 'Normal', taps: 26, misses: 2 },
  },
  {
    id: 's3',
    game: 'Ice Memory',
    score: 1200,
    streakBest: 0,
    durationSec: 25,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    meta: { pairs: 8, mistakes: 3 },
  },
];

export default function IceGameHistoryScreen({ navigation, route }) {
  // Optionally pass sessions from parent:
  // route.params.sessions = [...]
  const sessions = route?.params?.sessions || SEED;

  const [filter, setFilter] = useState('All'); // All | Hook Target | Ice Memory
  const [selected, setSelected] = useState(null);

  const games = useMemo(() => {
    const set = new Set(sessions.map(s => s.game));
    return ['All', ...Array.from(set)];
  }, [sessions]);

  const list = useMemo(() => {
    const sorted = sessions.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (filter === 'All') return sorted;
    return sorted.filter(s => s.game === filter);
  }, [sessions, filter]);

  const stats = useMemo(() => {
    const filtered = filter === 'All' ? sessions : sessions.filter(s => s.game === filter);
    const total = filtered.length;
    const bestScore = Math.max(0, ...filtered.map(s => s.score || 0));
    const avgScore = total ? Math.round(filtered.reduce((acc, s) => acc + (s.score || 0), 0) / total) : 0;
    return { total, bestScore, avgScore };
  }, [sessions, filter]);

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
              <Text style={styles.hTitle}>Game History</Text>
              <Text style={styles.hSub}>Track your progress and best runs.</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statK}>Sessions</Text>
              <Text style={styles.statV}>{stats.total}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statK}>Best score</Text>
              <Text style={styles.statV}>{stats.bestScore || '—'}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statK}>Avg score</Text>
              <Text style={styles.statV}>{stats.avgScore || '—'}</Text>
            </View>
          </View>

          {/* Filter */}
          <View style={styles.chipsRow}>
            {games.map(g => {
              const active = filter === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setFilter(g)}
                  activeOpacity={0.9}
                  style={[styles.chip, active && styles.chipOn]}
                >
                  <Text style={[styles.chipTxt, active && styles.chipTxtOn]}>{g}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* List */}
          {list.length ? (
            list.map(s => (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.9}
                onPress={() => setSelected(s)}
                style={styles.card}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{s.game}</Text>
                    <Text style={styles.cardSub}>{fmtDateTime(s.createdAt)}</Text>
                  </View>

                  <View style={styles.scorePill}>
                    <Text style={styles.scoreK}>Score</Text>
                    <Text style={styles.scoreV}>{s.score}</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaTxt}>Duration {s.durationSec}s</Text>
                  </View>
                  {typeof s.streakBest === 'number' && s.streakBest > 0 ? (
                    <View style={styles.metaPill}>
                      <Text style={styles.metaTxt}>Best streak {s.streakBest}</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.tapHint}>Tap to view details</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyTitle}>No sessions</Text>
              <Text style={styles.emptySub}>Play a mini-game to populate history.</Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Details modal */}
        <Modal
          visible={!!selected}
          transparent
          animationType="fade"
          onRequestClose={() => setSelected(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalTop}>
                <Text style={styles.modalTitle}>{selected?.game}</Text>
                <TouchableOpacity onPress={() => setSelected(null)} activeOpacity={0.85}>
                  <Text style={styles.modalClose}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalRow}>
                <View style={styles.modalBox}>
                  <Text style={styles.modalK}>Score</Text>
                  <Text style={styles.modalV}>{selected?.score ?? '—'}</Text>
                </View>
                <View style={styles.modalBox}>
                  <Text style={styles.modalK}>Duration</Text>
                  <Text style={styles.modalV}>{selected?.durationSec ? `${selected.durationSec}s` : '—'}</Text>
                </View>
              </View>

              <View style={styles.modalBoxWide}>
                <Text style={styles.modalK}>Played</Text>
                <Text style={styles.modalV2}>{selected?.createdAt ? fmtDateTime(selected.createdAt) : '—'}</Text>
              </View>

              {typeof selected?.streakBest === 'number' ? (
                <View style={styles.modalBoxWide}>
                  <Text style={styles.modalK}>Best streak</Text>
                  <Text style={styles.modalV2}>{selected.streakBest}</Text>
                </View>
              ) : null}

              <View style={styles.modalBoxWide}>
                <Text style={styles.modalK}>Details</Text>
                <Text style={styles.modalV2}>
                  {selected?.meta ? JSON.stringify(selected.meta, null, 0) : '—'}
                </Text>
              </View>

              <Text style={styles.modalHint}>
                (Demo) Replace sessions with AsyncStorage/DB later.
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

  hTitle: { color: COLORS.text, fontSize: 22, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },
  hSub: { color: COLORS.muted, marginTop: 2, fontSize: 13.2, fontFamily: FONT_FAMILY },

  statsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 14,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  statBox: {
    flexGrow: 1,
    minWidth: 120,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(10,25,38,0.55)',
    borderWidth: 1,
    borderColor: COLORS.line2,
  },
  statK: { color: COLORS.muted, fontSize: 12.3, fontWeight: '900', fontFamily: FONT_FAMILY },
  statV: { color: COLORS.text, marginTop: 6, fontSize: 18, fontWeight: '900', fontFamily: FONT_FAMILY },

  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
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
    backgroundColor: 'rgba(10,25,38,0.70)',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  emptyCard: { paddingVertical: 18 },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  cardTitle: { color: COLORS.text, fontWeight: '900', fontSize: 15.5, fontFamily: FONT_FAMILY },
  cardSub: { color: COLORS.muted, marginTop: 6, fontSize: 12.8, fontFamily: FONT_FAMILY },

  scorePill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(124,255,204,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(124,255,204,0.22)',
    alignItems: 'flex-end',
    minWidth: 86,
  },
  scoreK: { color: 'rgba(232,236,241,0.70)', fontSize: 12.0, fontWeight: '900', fontFamily: FONT_FAMILY },
  scoreV: { color: COLORS.text, marginTop: 4, fontSize: 16.5, fontWeight: '900', fontFamily: FONT_FAMILY },

  metaRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  metaPill: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.line2,
  },
  metaTxt: { color: 'rgba(232,236,241,0.86)', fontWeight: '900', fontSize: 12.4, fontFamily: FONT_FAMILY },

  tapHint: { marginTop: 12, color: 'rgba(232,236,241,0.55)', fontWeight: '800', fontSize: 12.2, fontFamily: FONT_FAMILY },

  emptyTitle: { color: COLORS.text, fontWeight: '900', fontSize: 16, fontFamily: FONT_FAMILY },
  emptySub: { marginTop: 6, color: COLORS.muted, fontSize: 13.2, lineHeight: 18, fontFamily: FONT_FAMILY },

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

  modalRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  modalBox: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(7,18,27,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.14)',
  },
  modalBoxWide: {
    marginTop: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(7,18,27,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.14)',
  },
  modalK: { color: COLORS.muted, fontSize: 12.3, fontWeight: '900', fontFamily: FONT_FAMILY },
  modalV: { color: COLORS.text, marginTop: 6, fontSize: 18, fontWeight: '900', fontFamily: FONT_FAMILY },
  modalV2: { color: 'rgba(232,236,241,0.86)', marginTop: 6, fontSize: 13.2, lineHeight: 18, fontFamily: FONT_FAMILY },

  modalHint: { marginTop: 10, color: 'rgba(232,236,241,0.55)', fontSize: 12.2, lineHeight: 16, fontFamily: FONT_FAMILY },
});
