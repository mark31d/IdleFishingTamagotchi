// Components/Onboarding.js — Idle Fish Care
// No extra deps. Uses a horizontal Animated pager.
// Assets (PNG) expected:
// assets/onb_bg.png        (1080x1920 onboarding background)
// assets/onb_1.png         (foreground object 1, transparent)
// assets/onb_2.png         (foreground object 2, transparent)
// assets/onb_3.png         (foreground object 3, transparent)

import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const FONT_FAMILY = 'TitanOne-Regular';

const BG = require('../assets/onb_bg.png');
const BUTTON_BG = require('../assets/button.png');

const SLIDES = [
  {
    key: 's1',
    title: 'Plan ice trips',
    subtitle: 'Save spots, routes, and notes for each outing.',
    art: require('../assets/onb_1.png'),
  },
  {
    key: 's2',
    title: 'Stay organized',
    subtitle: 'Checklists, timing, and gear planning—everything in one place.',
    art: require('../assets/onb_2.png'),
  },
  {
    key: 's3',
    title: 'Play & progress',
    subtitle: 'Quizzes and mini-games that keep your skills sharp.',
    art: require('../assets/onb_3.png'),
  },
];

export default function Onboarding({ navigation, onDone, onComplete }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) {
      const i = viewableItems[0]?.index ?? 0;
      setIndex(i);
    }
  }).current;

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 60 }),
    []
  );

  const goTo = (i) => {
    const clamped = Math.max(0, Math.min(i, SLIDES.length - 1));
    listRef.current?.scrollToOffset({ offset: clamped * W, animated: true });
  };

  const finish = () => {
    // Проверяем оба варианта пропсов для совместимости
    if (typeof onComplete === 'function') return onComplete();
    if (typeof onDone === 'function') return onDone();
    // fallback navigation behavior
    if (navigation?.replace) return navigation.replace('Main');
    if (navigation?.navigate) return navigation.navigate('Main');
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ImageBackground source={BG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
        {/* top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={finish} activeOpacity={0.85}>
            <Text style={styles.topBtn}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* pager */}
        <Animated.FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(it) => it.key}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width: W }]}>
              <View style={styles.artWrap}>
                <Image
                  source={item.art}
                  style={styles.art}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.textWrap}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
          )}
        />

        {/* dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * W, i * W, (i + 1) * W];
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [1, 1.35, 1],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={`dot-${i}`}
                style={[
                  styles.dot,
                  { transform: [{ scale }], opacity },
                ]}
              />
            );
          })}
        </View>

        {/* bottom controls */}
        <View style={styles.bottomRow}>
          <View style={styles.nextButtonWrapper}>
            <TouchableOpacity
              onPress={() => (isLast ? finish() : goTo(index + 1))}
              activeOpacity={0.9}
              style={styles.nextButton}
            >
              <Image source={BUTTON_BG} style={styles.nextButtonBg} resizeMode="contain" />
              <Text style={styles.nextButtonText}>{isLast ? 'Get Started' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const COLORS = {
  bg1: '#07121B',
  bg2: '#0A1926',
  text: '#0A1926',
  text2: '#0A1926',
  dot: 'rgba(124,255,204,0.95)',
  btn: '#4DD6FF',
};

const styles = StyleSheet.create({
  root: { flex: 1, width: W, height: H },
  bg: { flex: 1, width: '100%', height: '100%' },
  bgImage: {
    width: '120%',
    height: '120%',
    left: '-10%',
    top: '-10%',
  },
  topBar: {
    paddingTop: Platform.OS === 'android' ? 44 : (Platform.OS === 'ios' ? 50 : 10),
    paddingHorizontal: 18,
    alignItems: 'flex-end',
  },
  topBtn: {
    color: COLORS.text2,
    fontSize: 15,
    letterSpacing: 0.2, fontFamily: FONT_FAMILY },

  slide: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingBottom: 34,
  },

  artWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 18,
  },
  art: {
    width: W * 1.5,
    height: Math.min(H * 0.48, 480),
    top:50,
  },

  textWrap: {
    marginTop: 18,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: 0.2, fontFamily: FONT_FAMILY },
  subtitle: {
    marginTop: 10,
    color: COLORS.text2,
    fontSize: 15.5,
    lineHeight: 22,
    maxWidth: 520, fontFamily: FONT_FAMILY },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: -46,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.dot,

  },

  bottomRow: {
    marginTop:-50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    position: 'relative',
  },
  nextButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    marginTop:-20,
    width: 800,
    top:50,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  nextButtonBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  nextButtonText: {
    
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontFamily: FONT_FAMILY,
    zIndex: 1,
    marginTop: -25,
  },
  ghostBtn: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  ghostBtnDisabled: { opacity: 0.35 },
  ghostTxt: {
    color: COLORS.text2,
    fontSize: 15,
    fontWeight: '700', fontFamily: FONT_FAMILY },
  ghostTxtDisabled: { color: COLORS.text2 },

  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(77,214,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.40)',
    borderRadius: 14,
  },
  primaryTxt: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2, fontFamily: FONT_FAMILY },
});
