// Components/SpotDetailsScreen.js — IceHook Atlas
// Spot details + quick notes + recommended gear + quick actions.
// No extra deps.
//
// Expects assets:
// assets/onb_bg.png
// assets/back.png
//
// Navigation:
// Pass spot via route.params.spot OR by id via route.params.spotId.
// Example from SavedSpotsScreen:
// navigation.navigate('SpotDetails', { spot })
//
// Optional routes (edit to your actual names):
// - 'CreateTrip' (pre-fill spot name)
// - 'Logbook' (filter spot)

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
  StatusBar,
  Platform,
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

const demoSpots = [
  { id: 'demo1', name: 'Pine Bay Edge', type: 'Lake', ice: 'Medium', depth: '3–5 m', note: 'Shelter friendly.', pinned: true },
  { id: 'demo2', name: 'North Shore Drop', type: 'Lake', ice: 'Thick', depth: '6–9 m', note: 'Great for jigging.', pinned: false },
  { id: 'demo3', name: 'River Backwater', type: 'River', ice: 'Thin', depth: '2–3 m', note: 'Careful near current.', pinned: false },
];

export default function SpotDetailsScreen({ navigation, route }) {
  const passedSpot = route?.params?.spot || null;
  const spotId = route?.params?.spotId || null;

  // If you pass real data: prefer route.params.spot
  const spot = useMemo(() => {
    if (passedSpot) return passedSpot;
    if (spotId) return demoSpots.find(s => s.id === spotId) || null;
    return demoSpots[0];
  }, [passedSpot, spotId]);

  const [note, setNote] = useState(spot?.note || '');
  const [ice, setIce] = useState(spot?.ice || 'Medium');
  const [type, setType] = useState(spot?.type || 'Lake');
  const [depth, setDepth] = useState(spot?.depth || '—');

  const chipsIce = ['Thin', 'Medium', 'Thick'];
  const chipsType = ['Lake', 'River'];

  const recommendation = useMemo(() => {
    // Simple rules for a premium feel (no heavy logic)
    const base = ['Rod + spare line', 'Tackle box', 'Skimmer', 'Thermos', 'Headlamp'];
    const iceExtra =
      ice === 'Thin'
        ? ['Ice picks / spikes', 'Throw rope', 'Stay near shore']
        : ice === 'Medium'
        ? ['Ice auger', 'Shelter (optional)']
        : ['Heater fuel', 'Extra gloves'];
    const typeExtra = type === 'River' ? ['Be cautious near current', 'Avoid pressure ridges'] : ['Check wind direction'];
    return [...base, ...iceExtra, ...typeExtra].slice(0, 8);
  }, [ice, type]);

  const pinState = !!spot?.pinned;

  const saveLocal = () => {
    // No storage here—just demo feedback
    Alert.alert('Saved', 'Spot details updated (demo).');
  };

  const startTripFromSpot = () => {
    const spotName = spot?.name || 'Spot';
    if (!navigation?.navigate) return;
    // change 'CreateTrip' to your actual route
    navigation.navigate('CreateTrip', { presetSpot: spotName });
  };

  const openLogbookFiltered = () => {
    if (!navigation?.navigate) return;
    // change to your route; pass filter if you implement it
    navigation.navigate('Logbook', { spotFilter: spot?.name || '' });
  };

  if (!spot) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.text }}>Spot not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation?.goBack?.()} activeOpacity={0.85} style={styles.iconBtn}>
              <Image source={ICON_BACK} style={styles.icon16} resizeMode="contain" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.hTitle} numberOfLines={1}>{spot.name}</Text>
              <Text style={styles.hSub}>
                {type} • Ice: {ice} • Depth: {depth}{pinState ? ' • Pinned' : ''}
              </Text>
            </View>

            <TouchableOpacity onPress={saveLocal} activeOpacity={0.9}>
              <ImageBackground source={BUTTON_BG} style={styles.primaryBtn} resizeMode="contain">
                <Text style={styles.primaryTxt}>Save</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Quick actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={startTripFromSpot} activeOpacity={0.9}>
              <ImageBackground source={BUTTON_BG} style={styles.actionBtn} resizeMode="contain">
                <Text style={styles.actionTxt}>Plan trip</Text>
                <Text style={styles.actionSub}>prefill spot</Text>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity onPress={openLogbookFiltered} activeOpacity={0.9}>
              <ImageBackground source={BUTTON_BG} style={styles.actionBtn2} resizeMode="contain">
                <Text style={styles.actionTxt}>Logbook</Text>
                <Text style={styles.actionSub}>view catches</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Spot info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Spot info</Text>

            <Text style={styles.label}>Type</Text>
            <View style={styles.chipsRow}>
              {chipsType.map(k => {
                const active = type === k;
                return (
                  <TouchableOpacity
                    key={k}
                    onPress={() => setType(k)}
                    activeOpacity={0.9}
                    style={[styles.chip, active && styles.chipOn]}
                  >
                    <Text style={[styles.chipTxt, active && styles.chipTxtOn]}>{k}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, { marginTop: 10 }]}>Ice</Text>
            <View style={styles.chipsRow}>
              {chipsIce.map(k => {
                const active = ice === k;
                return (
                  <TouchableOpacity
                    key={k}
                    onPress={() => setIce(k)}
                    activeOpacity={0.9}
                    style={[styles.chip, active && styles.chipOn]}
                  >
                    <Text style={[styles.chipTxt, active && styles.chipTxtOn]}>{k}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, { marginTop: 10 }]}>Depth</Text>
            <TextInput
              value={depth}
              onChangeText={setDepth}
              placeholder="e.g., 4–6 m"
              placeholderTextColor="rgba(232,236,241,0.45)"
              style={styles.input}
              maxLength={18}
            />
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Bite time, wind, access, hazards…"
              placeholderTextColor="rgba(232,236,241,0.45)"
              style={[styles.input, styles.inputArea]}
              multiline
              maxLength={240}
            />
            <Text style={styles.hint}>Tip: Keep notes short for quick reading on the ice.</Text>
          </View>

          {/* Recommended pack */}
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>Recommended pack</Text>
              <View style={styles.smallPill}>
                <Text style={styles.smallPillTxt}>{type} / {ice}</Text>
              </View>
            </View>

            {recommendation.map((it, idx) => (
              <View key={`${it}_${idx}`} style={styles.listRow}>
                <View style={styles.bullet} />
                <Text style={styles.listTxt} numberOfLines={2}>{it}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
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

  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#1A2F4A',
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon16: { width: 18, height: 18, tintColor: '#E8ECF1' },

  hTitle: { color: COLORS.text, fontSize: 18.5, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },
  hSub: { color: COLORS.muted, marginTop: 4, fontSize: 12.8, fontFamily: FONT_FAMILY },

  primaryBtn: {
    paddingVertical: 84,
    paddingHorizontal: 120,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primaryTxt: { color: COLORS.text, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },

  actionsRow: { flexDirection: 'row', gap: 20, marginBottom: 20, marginTop: 10 },
  actionBtn: {
    flex: 1,
    padding: 96,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  actionBtn2: {
    flex: 1,
    padding: 96,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  actionTxt: { color: COLORS.text, fontWeight: '900', fontSize: 14.5, fontFamily: FONT_FAMILY },
  actionSub: { marginTop: 6, color: COLORS.muted, fontWeight: '800', fontSize: 12.2, fontFamily: FONT_FAMILY },

  card: {
    marginTop: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(10,25,38,0.70)',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  cardTitle: { color: COLORS.text, fontWeight: '900', fontSize: 15.5, fontFamily: FONT_FAMILY },

  label: { color: COLORS.muted, fontWeight: '900', fontSize: 12.5, marginTop: 10, fontFamily: FONT_FAMILY },

  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(77,214,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.18)',
  },
  chipOn: { backgroundColor: 'rgba(124,255,204,0.12)', borderColor: 'rgba(124,255,204,0.22)' },
  chipTxt: { color: 'rgba(232,236,241,0.82)', fontWeight: '900', fontSize: 12.5, fontFamily: FONT_FAMILY },
  chipTxtOn: { color: '#E8ECF1', fontFamily: FONT_FAMILY },

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
    fontWeight: '700',
    fontFamily: FONT_FAMILY,
  },
  inputArea: { minHeight: 96, textAlignVertical: 'top' },

  hint: { marginTop: 10, color: 'rgba(232,236,241,0.55)', fontSize: 12.2, lineHeight: 16, fontFamily: FONT_FAMILY },

  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallPill: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(124,255,204,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(124,255,204,0.22)',
  },
  smallPillTxt: { color: COLORS.text, fontWeight: '900', fontSize: 12.2, fontFamily: FONT_FAMILY },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(77,214,255,0.10)',
    marginTop: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(77,214,255,0.85)',
  },
  listTxt: { flex: 1, color: 'rgba(232,236,241,0.86)', fontSize: 13.2, fontWeight: '800', fontFamily: FONT_FAMILY },
});
