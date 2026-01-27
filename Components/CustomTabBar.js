// Components/CustomTabBar.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// paths: assets/<name>.png
const ICONS = {
  Training: require('../assets/tab_trips.png'),
  Leaderboard: require('../assets/tab_logbook.png'),
  Timer: require('../assets/tab_games.png'),
  Profile: require('../assets/tab_profile.png'),
};

// Подложка таббара в стиле "обледеневшей кнопки"
const TABBAR_BG = require('../assets/tabbar_bg.png');
const CIRCLE_BG = require('../assets/circle.png');

const FONT_FAMILY = 'TitanOne-Regular';

const DEFAULT_COLORS = {
  bg: '#07121B',
  card: '#0A1926',
  primary: '#4DD6FF',
  success: '#7CFFCC',
  danger: '#FF4D8C',
  text: '#E8ECF1',
  dim: '#8A96B2',
};

export default function CustomTabBar({ state, descriptors, navigation, colors = {} }) {
  const insets = useSafeAreaInsets();
  const C = { ...DEFAULT_COLORS, ...colors };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <ImageBackground
        source={TABBAR_BG}
        resizeMode="stretch"
        style={styles.bar}
        imageStyle={styles.barImage}
      >
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key] || {};
            const isFocused = state.index === index;

            const label =
              options?.tabBarLabel ??
              options?.title ??
              (route.name === 'Training'
                ? 'Trips'
                : route.name === 'Leaderboard'
                ? 'Logbook'
                : route.name === 'Timer'
                ? 'Games'
                : 'Profile');

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            };

            const onLongPress = () =>
              navigation.emit({ type: 'tabLongPress', target: route.key });

            const iconSource = ICONS[route.name];
            // Темно-синий цвет для иконок
            const tintColor = '#1E3A5F';

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options?.tabBarAccessibilityLabel}
                testID={options?.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                activeOpacity={0.85}
                style={styles.item}
              >
                <View style={styles.pill}>
                  {isFocused && (
                    <Image
                      source={CIRCLE_BG}
                      style={styles.circleBg}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.iconContainer}>
                    <Image
                      source={iconSource}
                      style={[styles.icon, { tintColor }]}
                      resizeMode="contain"
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.label,
                        { color: '#1E3A5F' },
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },

  bar: {

    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.28,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 10,
      },
    }),
  },

  barImage: {
    resizeMode:'contain',
    width: '119%',
    height: '400%',
    left: -40,
    marginTop: -110,
    marginBottom: -20,
  },

  row: {
    flexDirection: 'row',
    padding: 8,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },

  pill: {
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 50,
  },
  circleBg: {
    position: 'absolute',
    width: 80,
    height: 80,
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -36,
    zIndex: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    position: 'relative',
  },

  icon: {
    width: 36,
    height: 36,
    marginBottom: 4,
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    fontFamily: FONT_FAMILY,
  },
});
