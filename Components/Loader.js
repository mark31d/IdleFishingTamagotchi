// Components/Loader.js
/* From Uiverse.io by ahmedyasserdev */
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, ImageBackground, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const BG = require('../assets/onb_bg.png');
const LOGO = require('../assets/logo.png');
const TEXT = '#0B1A2A'; // Темно-синий цвет

const Cube = ({ delay = 0 }) => {
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.6);

  useEffect(() => {
    // Start animation after delay
    const timer = setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, {
            duration: 800,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: 800,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );

      shadowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 800,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.7, {
            duration: 800,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: shadowOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.cube, animatedStyle]}>
      <LinearGradient
        colors={['#00e4ff', '#006aff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cubeGradient}
      />
    </Animated.View>
  );
};

export default function Loader() {
  const rotation = useSharedValue(45);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(405, {
        duration: 2000,
        easing: Easing.bezier(0.6, 0.2, 0.1, 1),
      }),
      -1,
      false
    );
  }, []);

  const loaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <Text style={styles.brand}>Idle Fishing Tamagotchi</Text>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>

          <Animated.View style={[styles.loader, loaderStyle]}>
            <Cube delay={0} />
            <Cube delay={0.2} />
            <Cube delay={0.4} />
            <Cube delay={0.6} />
          </Animated.View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  topSection: {
    alignItems: 'center',
    marginTop: -150,
    gap: 16,
  },
  brand: {
    fontFamily: 'System',
    fontWeight: '800',
    fontSize: 32,
    color: TEXT,
    letterSpacing: 0.3,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  loader: {
    width: 80,
    height: 80,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 50,
  },
  cube: {
    width: 35,
    height: 35,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00e4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  cubeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});
