// Components/GameComponents.js
// Общие компоненты для игры

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONT_FAMILY, FISH_IMAGES, FISH_SIZE, BUTTON_BG } from '../Constants/gameConstants';

// PNG Button
export function PngButton({ title, onPress, w = 150, h = 54, scale = 1.25, disabled = false, textStyle, top }) {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePress = () => {
    console.log(`PngButton "${title}" pressed`);
    if (onPress) {
      onPress();
    }
  };

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.pngButton, 
        { 
          width: w, 
          height: h, 
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: isPressed ? 0.95 : 1 }],
        }
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.pngButtonWrapper}>
        <Image
          source={BUTTON_BG}
          style={[styles.pngButtonBg, { transform: [{ scale }] }]}
          resizeMode="contain"
          pointerEvents="none"
        />
        <View style={[styles.pngButtonContent, top !== undefined && { marginTop: top }]} pointerEvents="none">
          <Text style={[styles.pngButtonText, textStyle]}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Gradient Button
export function GradientButton({ 
  title, 
  onPress, 
  colors = [COLORS.cyan, COLORS.mint], 
  disabled = false, 
  w = 140,
  h = 46,
  radius = 16,
  style,
  textStyle,
  hitSlop = { top: 10, bottom: 10, left: 10, right: 10 },
}) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled} 
      activeOpacity={0.9} 
      style={[{ width: w, height: h }, style]}
      hitSlop={hitSlop}
    >
      <LinearGradient
        colors={disabled ? ['#555', '#333'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientButton, { borderRadius: radius }]}
      >
        <Text style={[styles.gradientButtonText, textStyle]} numberOfLines={1}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Animated Fish
export function AnimatedFish({ fish }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: fish.x },
        { translateY: fish.y },
        { scaleX: fish.direction === 1 ? -1 : 1 }, // Отзеркаливаем когда плывет вправо (голова должна быть справа)
      ],
    };
  }, [fish.x, fish.y, fish.direction]);

  return (
    <Animated.View style={[styles.fishContainer, animatedStyle]}>
      <Image
        source={FISH_IMAGES[fish.type]}
        style={styles.fishImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // PNG Button
  pngButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    zIndex: 10,
    elevation: 5,
  },
  pngButtonWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  pngButtonBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  pngButtonContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    position: 'relative',
  },
  pngButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    letterSpacing: 0.5,
    zIndex: 10,
  },

  // Gradient Button
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    zIndex: 10,
    elevation: 5,
  },
  gradientButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    zIndex: 11,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Fish
  fishContainer: {
    position: 'absolute',
    width: FISH_SIZE,
    height: FISH_SIZE,
    zIndex: 6,
  },
  fishImage: {
    width: '100%',
    height: '100%',
  },
});
