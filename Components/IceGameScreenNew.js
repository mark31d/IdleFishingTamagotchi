// Components/IceGameScreenNew.js — Idle Fishing Tamagotchi: Fish Catch
// Главный компонент с меню и роутингом

import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PngButton } from './GameComponents';
import GameScreen from './GameScreen';
import RulesScreen from './RulesScreen';
import StoreScreen from './StoreScreen';
import { BG, FISH_CATALOG, COLORS, FONT_FAMILY, SPEED_INCREASE } from '../Constants/gameConstants';

// ============================================
// MAIN COMPONENT
// ============================================

export default function IceGameScreenNew() {
  const [screen, setScreen] = useState('menu'); // menu | game | rules | store
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [ownedFish, setOwnedFish] = useState({}); // { [fishId]: true }
  const [speed, setSpeed] = useState(1);

  // Load saved data
  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const savedCoins = await AsyncStorage.getItem('game_coins');
      const savedOwned = await AsyncStorage.getItem('game_owned_fish');
      if (savedCoins) setCoins(parseInt(savedCoins, 10));
      if (savedOwned) setOwnedFish(JSON.parse(savedOwned));
    } catch (e) {
      console.log('Error loading game data:', e);
    }
  };

  const saveGameData = async (newCoins, newOwned) => {
    try {
      await AsyncStorage.setItem('game_coins', String(newCoins));
      await AsyncStorage.setItem('game_owned_fish', JSON.stringify(newOwned));
    } catch (e) {
      console.log('Error saving game data:', e);
    }
  };

  const onCatch = useCallback((fishId) => {
    setScore(prev => prev + 1);
    setCoins(prev => {
      const fish = FISH_CATALOG.find(f => f.id === fishId);
      const newCoins = prev + (fish?.basePrice || 0);
      saveGameData(newCoins, ownedFish);
      return newCoins;
    });
    setSpeed(prev => Math.min(prev + SPEED_INCREASE, 1.5));
  }, [ownedFish]);

  const buyFish = (fishId) => {
    const fish = FISH_CATALOG.find(f => f.id === fishId);
    if (!fish) return;
    if (coins < fish.basePrice) {
      Alert.alert('Not enough coins', `You need ${fish.basePrice} coins to unlock this fish.`);
      return;
    }
    const newCoins = coins - fish.basePrice;
    const newOwned = { ...ownedFish, [fishId]: true };
    setCoins(newCoins);
    setOwnedFish(newOwned);
    saveGameData(newCoins, newOwned);
  };

  const handleCoinsChange = useCallback((newCoins) => {
    setCoins(newCoins);
    saveGameData(newCoins, ownedFish);
  }, [ownedFish]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
        {screen === 'menu' && (
          <MainMenu
            onStart={() => {
              console.log('Start pressed');
              setScreen('game');
            }}
            onRules={() => {
              console.log('Rules pressed');
              setScreen('rules');
            }}
            onStore={() => {
              console.log('Store pressed');
              setScreen('store');
            }}
            score={score}
            coins={coins}
          />
        )}
        {screen === 'game' && (
          <GameScreen
            onBack={() => setScreen('menu')}
            onCatch={onCatch}
            speed={speed}
            onSpeedChange={setSpeed}
            coins={coins}
            ownedFish={ownedFish}
            onBuyFish={buyFish}
            onCoinsChange={handleCoinsChange}
          />
        )}
        {screen === 'rules' && (
          <RulesScreen onClose={() => setScreen('menu')} />
        )}
        {screen === 'store' && (
          <StoreScreen
            onClose={() => setScreen('menu')}
            coins={coins}
            ownedFish={ownedFish}
            onBuy={buyFish}
          />
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

// ============================================
// MAIN MENU
// ============================================

function MainMenu({ onStart, onRules, onStore, score, coins }) {
  return (
    <View style={styles.menuContainer}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuTitle}>Game</Text>
        <Text style={styles.menuSubtitle}>Ice Fishing Challenge</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Coins</Text>
          <Text style={styles.statValue}>{coins}</Text>
        </View>
      </View>

      <View style={styles.menuButtons}>
        <PngButton title="Start" onPress={onStart} w={332} h={117} scale={3} textStyle={{ fontSize: 28 }} top={-30}  />
        <PngButton title="Rules" onPress={onRules} w={332} h={117} scale={3} textStyle={{ fontSize: 28 }} top={-30} />
        <PngButton title="Store" onPress={onStore} w={332} h={117} scale={3} textStyle={{ fontSize: 28 }} top={-30} />
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  root: { flex: 1 },
  bg: { flex: 1 },
  bgImage: { width: '120%', height: '120%', left: '-10%', top: '-10%' },

  // Menu
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  menuHeader: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  menuTitle: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    letterSpacing: 1,
  },
  menuSubtitle: {
    color: COLORS.muted,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  statPill: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EEF6',
    minWidth: 100,
    alignItems: 'center',
  },
  statLabel: {
    color: '#516273',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  statValue: {
    color: '#0B1A2A',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    marginTop: 4,
  },
  menuButtons: {
    
    gap: 20,
    alignItems: 'center',
    zIndex: 1,
    marginTop: 30,
  },
});
