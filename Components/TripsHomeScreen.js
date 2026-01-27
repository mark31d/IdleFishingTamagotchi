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
  Modal,
  TextInput,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const BG = require('../assets/onb_bg.png');
const ICON_CAL = require('../assets/calendar.png');
const ICON_CLOCK = require('../assets/clock.png');
const ROD = require('../assets/rod.png');
const BUTTON_BG = require('../assets/button.png');

const { width: W } = Dimensions.get('window');

const DISPLAY_FONT = 'TitanOne-Regular';

const COLORS = {
  headerText: '#E8ECF1',
  headerSub: 'rgba(232,236,241,0.75)',

  card: '#FFFFFF',
  cardSoft: '#F6F8FC',
  border: '#E6EEF6',

  text: '#0B1A2A',
  text2: '#516273',
  text3: '#7A8A9A',

  cyan: '#4DD6FF',
  mint: '#7CFFCC',

  overlay: 'rgba(0,0,0,0.40)',
};

const GRAD = {
  primary: ['#4DD6FF', '#7CFFCC'],
  navy: ['#2D4765', '#1B2E45'],
  danger: ['#FF4D6D', '#FF9A5A'],
};

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;
const pad2 = n => (n < 10 ? `0${n}` : `${n}`);

const formatDate = (dStr) => {
  if (!dStr) return '';
  const [y, m, d] = dStr.split('-').map(Number);
  if (!y || !m || !d) return dStr;
  return `${pad2(d)}.${pad2(m)}.${y}`;
};

const formatTime = (tStr) => {
  if (!tStr) return '';
  const [h, m] = tStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return tStr;
  return `${pad2(h)}:${pad2(m)}`;
};

const monthLabel = (yyyyMm) => {
  const [y, m] = yyyyMm.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[(m || 1) - 1]} ${y}`;
};

// “Иней”
const FROST_SPECKS = [
  { x: 10, y: 18, s: 4, a: 0.28 },
  { x: 22, y: 10, s: 2, a: 0.22 },
  { x: 38, y: 16, s: 3, a: 0.18 },
  { x: 58, y: 12, s: 2, a: 0.18 },
  { x: 72, y: 20, s: 4, a: 0.22 },
  { x: 86, y: 14, s: 2, a: 0.18 },
  { x: 90, y: 28, s: 3, a: 0.16 },
];

function FrostOverlay({ seed = 0 }) {
  const dx = (seed % 7) - 3;
  const dy = ((seed * 3) % 7) - 3;

  return (
    <View pointerEvents="none" style={styles.frostWrap}>
      <View style={styles.frostTopBand} />
      <View style={styles.frostSide} />

      <View style={[styles.crystal, { left: 18 + dx, top: 12 + dy, transform: [{ rotate: '-18deg' }] }]} />
      <View style={[styles.crystal, { left: 44 + dx, top: 8 + dy, height: 10, transform: [{ rotate: '12deg' }] }]} />
      <View style={[styles.crystal, { right: 26 - dx, top: 14 + dy, height: 12, transform: [{ rotate: '-10deg' }] }]} />

      {FROST_SPECKS.map((p, i) => (
        <View
          key={i}
          style={[
            styles.speck,
            {
              left: `${Math.max(0, Math.min(96, p.x + dx))}%`,
              top: `${Math.max(0, Math.min(40, p.y + dy))}%`,
              width: p.s,
              height: p.s,
              opacity: p.a,
            },
          ]}
        />
      ))}
    </View>
  );
}

function Card({ children, style, seed = 0, soft = false }) {
  return (
    <View style={[styles.card, soft && styles.cardSoft, style]}>
      <FrostOverlay seed={seed} />
      {children}
    </View>
  );
}

function Chip({ icon, text, tone = 'cyan', style }) {
  const bg = tone === 'mint' ? '#EAF7F2' : '#EEF4FA';
  return (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      <Image source={icon} style={styles.chipIcon} />
      <Text style={styles.chipTxt}>{text}</Text>
    </View>
  );
}

/**
 * Кнопка на button.png:
 * ВАЖНО: w/h — это “место в верстке”
 * scale — увеличивает только PNG, поэтому позиция и отступы НЕ скачут.
 */
function PngButton({
  title,
  onPress,
  w = 128,
  h = 48,
  scale = 1.0,

  style,
  textStyle,
  hitSlop = { top: 10, bottom: 10, left: 10, right: 10 },
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[{ width: w, height: h }, style]}
      hitSlop={hitSlop}
    >
      <View style={styles.pngBtnInner}>
        <Image source={BUTTON_BG} resizeMode="contain" style={[styles.pngBtnBg, { transform: [{ scale }] }]} />
        <Text style={[styles.pngBtnText, textStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/** Градиентная кнопка (для тех, что НЕ на button.png) */
function GradientButton({
  title,
  onPress,
  colors = GRAD.navy,
  w = 140,
  h = 46,
  radius = 16,
  style,
  textStyle,
  hitSlop = { top: 10, bottom: 10, left: 10, right: 10 },
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[{ width: w, height: h }, style]} hitSlop={hitSlop}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradBtn, { borderRadius: radius }]}
      >
        <Text style={[styles.gradBtnTxt, textStyle]} numberOfLines={1}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function AppModal({ visible, onClose, title, children, footer }) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={styles.modalShellContainer}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalShell}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>{title}</Text>
            </View>

            <View style={styles.modalBody}>
              {children}
            </View>

            {!!footer && <View style={styles.modalFooter}>{footer}</View>}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function TripsHomeScreen({ navigation }) {
  const [trips, setTrips] = useState(() => ([
    { id: uid(), title: 'Blue Hour Lake', place: 'North Shore', date: '2026-01-12', time: '06:30', notes: 'Check ice thickness, pack spikes.', status: 'upcoming' },
    { id: uid(), title: 'Shelter Session', place: 'Pine Bay', date: '2026-01-03', time: '07:10', notes: 'Try new jig pattern.', status: 'past' },
    { id: uid(), title: 'Silent Morning', place: 'Old Pier', date: '2026-01-18', time: '07:40', notes: 'Bring hot tea + headlamp.', status: 'upcoming' },
    { id: uid(), title: 'Ridge Edge', place: 'Snow Point', date: '2026-01-22', time: '08:05', notes: 'Shallow bite, use small jig.', status: 'upcoming' },
  ]));

  const [query, setQuery] = useState('');

  // modals
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoText, setInfoText] = useState({ title: '', msg: '' });

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTripId, setConfirmTripId] = useState(null);

  const showInfo = (title, msg) => {
    setInfoText({ title, msg });
    setInfoOpen(true);
  };

  const upcoming = useMemo(
    () => trips.filter(t => t.status === 'upcoming').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [trips]
  );

  const heroTrip = upcoming[0] || null;
  const upcomingRest = heroTrip ? upcoming.slice(1, 7) : upcoming.slice(0, 7);

  const selectedTrip = useMemo(
    () => trips.find(t => t.id === selectedTripId) || null,
    [trips, selectedTripId]
  );

  const confirmTrip = useMemo(
    () => trips.find(t => t.id === confirmTripId) || null,
    [trips, confirmTripId]
  );

  const recentGrouped = useMemo(() => {
    const past = trips
      .filter(t => t.status === 'past')
      .slice()
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
      .slice(0, 14);

    const map = new Map();
    past.forEach(t => {
      const key = (t.date || '').slice(0, 7) || '—';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    });
    return Array.from(map.entries());
  }, [trips]);

  const filteredPreview = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return trips
      .filter(t => {
        const title = (t.title || '').toLowerCase();
        const place = (t.place || '').toLowerCase();
        const notes = (t.notes || '').toLowerCase();
        return title.includes(q) || place.includes(q) || notes.includes(q);
      })
      .slice()
      .sort((a, b) => {
        const dateA = (a.date || '') + (a.time || '');
        const dateB = (b.date || '') + (b.time || '');
        return dateB.localeCompare(dateA);
      })
      .slice(0, 6);
  }, [trips, query]);

  const hasSearchQuery = query.trim().length > 0;

  const openCreate = () => {
    navigation?.navigate?.('CreateTripScreen', {
      onSave: (trip) => {
        setTrips(prev => [trip, ...prev]);
        navigation?.goBack?.();
      },
    });
  };


  const markDone = (id) => setTrips(prev => prev.map(t => (t.id === id ? { ...t, status: 'past' } : t)));

  const openDetails = (t) => {
    setSelectedTripId(t.id);
    setDetailsOpen(true);
  };

  const askDelete = (id) => {
    setConfirmTripId(id);
    setConfirmOpen(true);
  };

  const doDelete = (id) => {
    if (!id) return;

    // сначала закрываем все модалы
    setConfirmOpen(false);
    setDetailsOpen(false);
    setConfirmTripId(null);
    setSelectedTripId(null);

    // затем обновляем список
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hTitle}>Trips</Text>
              <Text style={styles.hSub}>Plan, track, and replay your ice days.</Text>
            </View>

            {/* кнопка больше — через scale, позиция не прыгает */}
            <PngButton
              title="New"
              onPress={openCreate}
              w={128}
              h={98}
              scale={1.38}

              textStyle={styles.btnTopTxt}
            />
          </View>

          {/* Search */}
          <Card seed={1} style={styles.searchCard} soft>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search trips"
              placeholderTextColor="#8FA0B0"
              style={styles.searchInput}
            />
          </Card>

          {/* HERO */}
          {!hasSearchQuery && (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.sectionTitle}>Next outing</Text>

              <Card seed={2} style={styles.heroCard}>
                {heroTrip ? (
                  <View style={styles.heroTopRow}>
                    <View style={{ flex: 1, paddingRight: 120 }}>
                      <TouchableOpacity activeOpacity={0.9} onPress={() => openDetails(heroTrip)}>
                        <Text style={styles.heroTitle} numberOfLines={1}>{heroTrip.title}</Text>
                        <Text style={styles.heroMeta} numberOfLines={1}>
                          {heroTrip.place} • {formatDate(heroTrip.date)} • {formatTime(heroTrip.time)}
                        </Text>

                        {!!heroTrip.notes && (
                          <Text style={styles.heroNote} numberOfLines={2}>{heroTrip.notes}</Text>
                        )}
                      </TouchableOpacity>

                      <View style={styles.heroChips}>
                        <Chip icon={ICON_CAL} text={formatDate(heroTrip.date)} />
                        <Chip icon={ICON_CLOCK} text={formatTime(heroTrip.time)} tone="mint" />
                      </View>

                      <View style={styles.heroActions}>
                        <PngButton
                          title="Done"
                          onPress={() => markDone(heroTrip.id)}
                          w={116}
                          h={84}

                          scale={1.8}
                          textStyle={styles.btnSmallTxt}
                        />

                        {/* НЕ button.png → градиент как на скрине */}
                        <GradientButton
                          title="Delete"
                          onPress={() => askDelete(heroTrip.id)}
                          colors={GRAD.danger}
                          w={116}
                          h={44}
                          radius={16}
                        />
                      </View>
                    </View>

                    <Image source={ROD} style={styles.heroRod} resizeMode="contain" />
                  </View>
                ) : (
                  <>
                    <Text style={styles.heroTitle}>No upcoming trips</Text>
                    <Text style={styles.heroMeta}>Tap “New” to create one.</Text>
                  </>
                )}
              </Card>
            </View>
          )}

          {/* Upcoming */}
          {!hasSearchQuery && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                <Text style={styles.sectionHint}>{upcoming.length} planned</Text>
              </View>

              {/* Upcoming list */}
              <View style={styles.upcomingList}>
                {upcomingRest.map((t, idx) => (
                  <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.92}
                    onPress={() => openDetails(t)}
                    onLongPress={() => askDelete(t.id)}
                    style={styles.upcomingItem}
                  >
                    <Card seed={10 + idx} style={styles.upcomingCard}>
                      <View style={styles.upcomingContent}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.gTitle} numberOfLines={1}>{t.title}</Text>
                          <Text style={styles.gMeta} numberOfLines={1}>{t.place}</Text>

                          <View style={{ height: 10 }} />

                          <View style={styles.gChipsRow}>
                            <Chip icon={ICON_CAL} text={formatDate(t.date)} style={{ paddingVertical: 7 }} />
                            <Chip icon={ICON_CLOCK} text={formatTime(t.time)} tone="mint" style={{ paddingVertical: 7 }} />
                          </View>
                        </View>

                        <View style={styles.upcomingActions}>
                          <PngButton
                            title="Done"
                            onPress={() => markDone(t.id)}
                            w={116}
                            h={84}
                            scale={1.8}
                            textStyle={styles.btnSmallTxt}
                          />
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Recent */}
          {!hasSearchQuery && (
            <>
              <View style={[styles.sectionRow, { marginTop: 18 }]}>
                <Text style={styles.sectionTitle}>Recent</Text>
                <Text style={styles.sectionHint}>{recentGrouped.length ? '' : '—'}</Text>
              </View>

              {recentGrouped.length ? (
                recentGrouped.map(([ym, list]) => (
                  <View key={ym} style={{ marginBottom: 14 }}>
                    <Text style={styles.monthLabel}>{monthLabel(ym)}</Text>

                    {list.map((t, i) => (
                      <TouchableOpacity
                        key={t.id}
                        activeOpacity={0.92}
                        onPress={() => openDetails(t)}
                        onLongPress={() => askDelete(t.id)}
                        style={{ marginTop: 10 }}
                      >
                        <Card seed={50 + i} style={styles.listCard} soft>
                          <View style={styles.listTop}>
                            <Text style={styles.listTitle} numberOfLines={1}>{t.title}</Text>
                            <Text style={styles.listDate}>{formatDate(t.date)}</Text>
                          </View>
                          <Text style={styles.listMeta} numberOfLines={1}>
                            {t.place} • {formatTime(t.time)}
                          </Text>
                          {!!t.notes && (
                            <Text style={styles.listNote} numberOfLines={2}>{t.notes}</Text>
                          )}
                        </Card>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              ) : (
                <Card seed={90} style={{ padding: 14 }} soft>
                  <Text style={styles.listTitle}>No history yet</Text>
                  <Text style={styles.listMeta}>Mark a trip "Done" to build your recent list.</Text>
                </Card>
              )}
            </>
          )}

          {/* Results */}
          {hasSearchQuery && (
            <>
              {filteredPreview.length > 0 ? (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.sectionTitle}>Results</Text>
                  {filteredPreview.map((t, idx) => (
                    <TouchableOpacity
                      key={t.id}
                      activeOpacity={0.92}
                      onPress={() => openDetails(t)}
                      onLongPress={() => askDelete(t.id)}
                      style={{ marginTop: 10 }}
                    >
                      <Card seed={120 + idx} style={styles.listCard}>
                        <View style={styles.listTop}>
                          <Text style={styles.listTitle} numberOfLines={1}>{t.title}</Text>
                          <Text style={styles.badge}>{t.status === 'upcoming' ? 'UPCOMING' : 'PAST'}</Text>
                        </View>
                        <Text style={styles.listMeta} numberOfLines={1}>
                          {t.place} • {formatDate(t.date)} • {formatTime(t.time)}
                        </Text>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Card seed={200} style={{ padding: 14, marginTop: 10 }} soft>
                  <Text style={styles.listTitle}>No results found</Text>
                  <Text style={styles.listMeta}>Try a different search term.</Text>
                </Card>
              )}
            </>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* DETAILS MODAL (вместо Alert) */}
        <AppModal
          visible={detailsOpen && !!selectedTrip}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedTripId(null);
          }}
          title="Trip details"
          footer={
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <GradientButton
                title="Close"
                onPress={() => {
                  setDetailsOpen(false);
                  setSelectedTripId(null);
                }}
                colors={GRAD.navy}
                w={116}
                h={44}
                radius={16}
              />

              <GradientButton
                title="Edit"
                onPress={() => {
                  if (selectedTrip?.id) {
                    setDetailsOpen(false);
                    navigation?.navigate?.('CreateTripScreen', {
                      trip: selectedTrip,
                      onSave: (updatedTrip) => {
                        setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
                        navigation?.goBack?.();
                      },
                    });
                  }
                }}
                colors={GRAD.primary}
                w={116}
                h={44}
                radius={16}
              />
            </View>
          }
        >
          {selectedTrip ? (
            <View>
              {selectedTrip.photo ? (
                <Image
                  source={{ uri: selectedTrip.photo }}
                  style={styles.dPhoto}
                  resizeMode="cover"
                />
              ) : null}

              <Text style={styles.dTitle}>{selectedTrip.title}</Text>
              <Text style={styles.dMeta}>{selectedTrip.place} • {formatDate(selectedTrip.date)} • {formatTime(selectedTrip.time)}</Text>

              <View style={{ height: 12 }} />

              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <Chip icon={ICON_CAL} text={formatDate(selectedTrip.date)} />
                <Chip icon={ICON_CLOCK} text={formatTime(selectedTrip.time)} tone="mint" />
              </View>

              {!!selectedTrip.notes ? (
                <Text style={styles.dNotes}>{selectedTrip.notes}</Text>
              ) : (
                <Text style={styles.dNotesMuted}>No notes</Text>
              )}
            </View>
          ) : null}
        </AppModal>

        {/* CONFIRM DELETE MODAL */}
        <AppModal
          visible={confirmOpen && !!confirmTrip}
          onClose={() => {
            setConfirmOpen(false);
            setConfirmTripId(null);
          }}
          title="Delete trip?"
          footer={
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <GradientButton
                title="Cancel"
                onPress={() => {
                  setConfirmOpen(false);
                  setConfirmTripId(null);
                }}
                colors={GRAD.navy}
                w={120}
                h={46}
              />
              <GradientButton
                title="Delete"
                onPress={() => {
                  const tripId = confirmTrip?.id || confirmTripId;
                  if (tripId) {
                    doDelete(tripId);
                  }
                }}
                colors={GRAD.danger}
                w={120}
                h={46}
              />
            </View>
          }
        >
          <Text style={styles.confirmTxt}>
            This will remove "{confirmTrip?.title || ''}" permanently.
          </Text>
        </AppModal>

        {/* INFO MODAL (вместо Alert валидации) */}
        <AppModal
          visible={infoOpen}
          onClose={() => setInfoOpen(false)}
          title={infoText.title || 'Info'}
          footer={
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <GradientButton
                title="OK"
                onPress={() => setInfoOpen(false)}
                colors={GRAD.primary}
                w={120}
                h={46}
              />
            </View>
          }
        >
          <Text style={styles.confirmTxt}>{infoText.msg}</Text>
        </AppModal>

      </ImageBackground>
    </SafeAreaView>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 6 },
  default: {},
});

const iceShadow = Platform.select({
  ios: {
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 7 },
  default: {},
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07121B' },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bgImage: {
    width: '120%',
    height: '120%',
    left: '-10%',
    top: '-10%',
  },

  scroll: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10),
    paddingHorizontal: 16,
  },

  headerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: 6 },
  hTitle: { color: COLORS.headerText, fontSize: 34, fontFamily: DISPLAY_FONT },
  hSub: { color: COLORS.headerSub, marginTop: 6, fontSize: 14, fontWeight: '600' },

  // PNG button text
  btnTopTxt: { fontSize: 14, fontWeight: '900', color: '#FFFFFF', top: -5, },
  btnSmallTxt: { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
  btnMidTxt: { fontSize: 13, fontWeight: '900', color: '#FFFFFF' },
  btnTinyTxt: { fontSize: 12.5, fontWeight: '900', color: '#FFFFFF' },

  // PngButton internals
  pngBtnInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    top: 5,
  },
  pngBtnBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  pngBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: -5,
  },

  // Gradient buttons
  gradBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 5 },
      default: {},
    }),
  },
  gradBtnTxt: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },

  // Cards
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...shadow,
    ...iceShadow,
  },
  cardSoft: { backgroundColor: COLORS.cardSoft },

  // Frost overlay
  frostWrap: { ...StyleSheet.absoluteFillObject },
  frostTopBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.32)',
    opacity: 0.55,
  },
  frostSide: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(77,214,255,0.20)',
  },
  crystal: {
    position: 'absolute',
    width: 2,
    height: 12,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.60)',
    opacity: 0.35,
  },
  speck: { position: 'absolute', borderRadius: 99, backgroundColor: '#FFFFFF' },

  // Search
  searchCard: { padding: 14, marginTop: 14 },
  searchInput: {
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '650',
  },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18, marginBottom: 10 },
  sectionTitle: { color: COLORS.headerText, fontSize: 16, fontFamily: DISPLAY_FONT },
  sectionHint: { color: COLORS.headerSub, fontSize: 13, fontWeight: '700' },

  // Hero
  heroCard: { padding: 14, marginTop: 10 },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  heroTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  heroMeta: { color: COLORS.text2, marginTop: 4, fontSize: 13, fontWeight: '650' },
  heroNote: { color: COLORS.text3, marginTop: 10, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  heroChips: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'center', },

  heroRod: {
    position: 'absolute',
    right: -20,
    bottom: -10,
    width: 120,
    height: 120,
    opacity: 0.92,
  },

  // Chips
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipIcon: { width: 16, height: 16, tintColor: '#0B1A2A' },
  chipTxt: { color: COLORS.text, fontWeight: '900', fontSize: 13 },

  // Quick add
  quickAdd: { padding: 14, marginTop: 6 },
  quickTitle: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  quickSub: { marginTop: 6, color: COLORS.text2, fontSize: 13, fontWeight: '650' },

  // Upcoming list (vertical)
  upcomingList: {
    marginTop: 12,
    gap: 12,
  },
  upcomingItem: {
    width: '100%',
  },
  upcomingCard: { padding: 14 },
  upcomingContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  upcomingActions: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },

  gTitle: { color: COLORS.text, fontSize: 15.5, fontWeight: '900' },
  gMeta: { color: COLORS.text2, marginTop: 4, fontSize: 13, fontWeight: '650' },
  gChipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },

  // Recent
  monthLabel: { color: COLORS.headerSub, fontSize: 12.5, fontWeight: '800', marginTop: 6 },
  listCard: { padding: 14 },
  listTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' },
  listTitle: { color: COLORS.text, fontSize: 15, fontWeight: '900', flex: 1 },
  listDate: { color: '#8FA0B0', fontSize: 12.5, fontWeight: '800' },
  listMeta: { marginTop: 6, color: COLORS.text2, fontSize: 12.8, fontWeight: '650' },
  listNote: { marginTop: 8, color: COLORS.text3, fontSize: 12.8, lineHeight: 18, fontWeight: '600' },

  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text2,
    fontSize: 12,
    fontWeight: '900',
  },

  // AppModal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  modalShellContainer: {
    width: '100%',
    maxWidth: 500,
    zIndex: 1000,
  },
  modalShell: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...shadow,
  },
  modalHead: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  modalTitle: { color: COLORS.text, fontSize: 16.5, fontWeight: '900' },
  modalBody: { paddingHorizontal: 14, paddingVertical: 12 },
  modalFooter: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 8 },

  confirmTxt: { color: COLORS.text2, fontWeight: '650', fontSize: 13.5, lineHeight: 18 },

  dPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  dMeta: { marginTop: 6, color: COLORS.text2, fontSize: 13, fontWeight: '650' },
  dNotes: { marginTop: 12, color: COLORS.text3, fontSize: 13.2, lineHeight: 18, fontWeight: '650' },
  dNotesMuted: { marginTop: 12, color: '#9AA9B8', fontSize: 13.2, fontWeight: '700' },

  // Create form modal
  modalCardForm: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...shadow,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    minHeight: 400,
  },
  modalTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalFormTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900', flex: 1, textAlign: 'center' },
  modalClose: { color: COLORS.text2, fontSize: 24, fontWeight: '300', width: 30, textAlign: 'center' },
  modalScroll: {
    maxHeight: 450,
    minHeight: 350,
  },
  modalScrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },

  modalSection: { marginTop: 12, color: '#7A8A9A', fontWeight: '800', fontSize: 12.5 },
  mLabel: { marginTop: 10, color: '#7A8A9A', fontWeight: '800', fontSize: 12.5, marginBottom: 6 },

  mInput: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F6F8FC',
    borderWidth: 1,
    borderColor: COLORS.border,
    color: '#0B1A2A',
    fontSize: 14,
    fontWeight: '650',
    justifyContent: 'center',
  },
  mPickerText: {
    color: '#0B1A2A',
    fontSize: 14,
    fontWeight: '650',
  },
  mRow: { flexDirection: 'row', gap: 10 },
  mHalf: { flex: 1 },
  mArea: { height: 90, paddingTop: 12, textAlignVertical: 'top' },

  photoContainer: {
    marginTop: 10,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F6F8FC',
  },
  photoPreview: {
    width: '100%',
    height: 200,
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F8FC',
  },
  photoPlaceholderText: {
    color: '#9AA9B8',
    fontSize: 14,
    fontWeight: '650',
  },
  removePhotoBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 109, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.2)',
  },
  removePhotoText: {
    color: '#FF4D6D',
    fontSize: 12.5,
    fontWeight: '800',
  },

  iosPickerContainer: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iosPickerTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
  },
  iosPickerButton: {
    color: COLORS.text2,
    fontSize: 14,
    fontWeight: '800',
  },
  iosPicker: {
    height: 200,
  },

  // Picker Modals
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    ...shadow,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerModalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  pickerModalButton: {
    color: COLORS.text2,
    fontSize: 16,
    fontWeight: '800',
  },
  pickerModalPicker: {
    height: Platform.OS === 'ios' ? 200 : 'auto',
    width: '100%',
  },
});
