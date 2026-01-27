// Components/StoreScreen.js
// Экран магазина и библиотеки

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import { PngButton } from './GameComponents';
import { FISH_CATALOG, COLORS, FONT_FAMILY, SCREEN_WIDTH, SCREEN_HEIGHT } from '../Constants/gameConstants';

export default function StoreScreen({ onClose, coins, ownedFish, onBuy }) {
  return (
    <View style={styles.storeContainer}>
      <View style={styles.storeHeader}>
        <Text style={styles.storeTitle}>Store</Text>
        <View style={styles.coinDisplay}>
          <Text style={styles.coinText}>{coins} coins</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.storeScroll} contentContainerStyle={styles.storeContent}>
        <ShopTab coins={coins} ownedFish={ownedFish} onBuy={onBuy} />
      </ScrollView>
    </View>
  );
}

function ShopTab({ coins, ownedFish, onBuy }) {
  const [selectedFish, setSelectedFish] = useState(null);

  return (
    <View>
      <Modal 
        isVisible={!!selectedFish} 
        onBackdropPress={() => setSelectedFish(null)}
        style={styles.fullScreenModal}
      >
        <View style={styles.fullScreenModalContent}>
          {selectedFish && <FishInfo fish={selectedFish} onClose={() => setSelectedFish(null)} />}
        </View>
      </Modal>

      <View style={styles.shopGrid}>
        {FISH_CATALOG.map((fish) => {
          const isOwned = ownedFish[fish.id];
          const canAfford = coins >= fish.basePrice;
          return (
            <TouchableOpacity
              key={fish.id}
              style={styles.fishCard}
              onPress={() => isOwned && setSelectedFish(fish)}
              activeOpacity={isOwned ? 0.8 : 1}
              disabled={!isOwned}
            >
              <View style={styles.fishCardTop}>
                <View style={styles.fishCardImageContainer}>
                  <Image source={fish.image} style={styles.fishCardImage} resizeMode="contain" />
                  {isOwned && (
                    <View style={styles.ownedBadge}>
                      <Text style={styles.ownedBadgeText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.fishCardName}>{fish.name}</Text>
                <Text style={styles.fishCardPrice}>{fish.basePrice} coins</Text>
                <Text style={styles.fishCardDescription}>{fish.habitat}</Text>
              </View>
              <View style={styles.fishCardBottom}>
                <PngButton
                  title={isOwned ? 'Owned' : canAfford ? 'Buy' : 'Locked'}
                  onPress={() => !isOwned && canAfford && onBuy(fish.id)}
                  disabled={isOwned || !canAfford}
                  w={SCREEN_WIDTH - 64}
                  h={80}
                  scale={2}
                  textStyle={{ fontSize: 22 }}
                  top={-5}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}


function FishInfo({ fish, onClose }) {
  return (
    <SafeAreaView style={styles.fishInfoContainer} edges={['top', 'bottom']}>
      <View style={styles.fishInfoHeader}>
        <Text style={styles.fishInfoTitle}>{fish.name}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.fishInfoScroll} contentContainerStyle={styles.fishInfoScrollContent}>
        <Image source={fish.image} style={styles.fishInfoImage} resizeMode="contain" />

        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>{fish.basePrice} coins</Text>
        </View>

        <InfoRow label="Habitat" value={fish.habitat} />
        <InfoRow label="Depth Range" value={fish.depth} />
        <InfoRow label="Size Range" value={fish.size} />
        <InfoRow label="Weight Range" value={fish.weight} />
        <InfoRow label="Preferred Temperature" value={fish.temperature} />
        <InfoRow label="Best Season" value={fish.season} />
        <InfoRow label="Difficulty Level" value={fish.difficulty} />
        <InfoRow label="Behavior & Activity" value={fish.behavior} />
        <InfoRow label="Recommended Bait" value={fish.bestBait} />
        <InfoRow label="Fishing Tips" value={fish.tips} />
        <InfoRow label="Diet" value={fish.diet} />
        <InfoRow label="Lifespan" value={fish.lifespan} />
        <InfoRow label="Interesting Fact" value={fish.funFact} />
      </ScrollView>

      <View style={styles.fishInfoFooter}>
        <PngButton title="Close" onPress={onClose} w={SCREEN_WIDTH - 64} h={80} scale={2} textStyle={{ fontSize: 22 }} top={-5} />
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  storeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E6EEF6',
    overflow: 'hidden',
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  storeTitle: {
    color: '#0B1A2A',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    flex: 1,
  },
  coinDisplay: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(124,255,204,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124,255,204,0.25)',
    marginRight: 12,
  },
  coinText: {
    color: '#0B1A2A',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F6F8FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  closeBtnText: {
    color: '#0B1A2A',
    fontSize: 20,
    fontWeight: '900',
  },
  storeTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  storeTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F6F8FC',
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  storeTabActive: {
    backgroundColor: 'rgba(77,214,255,0.15)',
    borderColor: 'rgba(77,214,255,0.35)',
  },
  storeTabText: {
    color: '#516273',
    fontSize: 14,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  storeTabTextActive: {
    color: '#0B1A2A',
  },
  storeScroll: { flex: 1 },
  storeContent: { padding: 16 },

  // Shop
  shopGrid: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
  },
  fishCard: {
    width: SCREEN_WIDTH - 32,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(77,214,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.3)',
    alignItems: 'center',
    minHeight: 280,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fishCardTop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  fishCardBottom: {
    width: '100%',
    marginTop: 4,
  },
  fishCardImageContainer: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  fishCardImage: {
    width: 170,
    height: 170,
  },
  ownedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(124,255,204,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(124,255,204,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownedBadgeText: {
    color: '#0B1A2A',
    fontSize: 14,
    fontWeight: '900',
  },
  fishCardName: {
    color: '#0B1A2A',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    marginBottom: 6,
    textAlign: 'center',
  },
  fishCardPrice: {
    color: '#516273',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
    marginBottom: 8,
    textAlign: 'center',
  },
  fishCardDescription: {
    color: '#516273',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 16,
  },
  fishCardButton: {
    width: '100%',
    minHeight: 60,
  },

  // Fish Info Modal
  fullScreenModal: {
    margin: 0,
  },
  fullScreenModalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fishInfoModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  fishInfoContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fishInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  fishInfoTitle: {
    color: '#0B1A2A',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  fishInfoScroll: {
    flex: 1,
  },
  fishInfoScrollContent: {
    paddingBottom: 20,
  },
  fishInfoImage: {
    width: '100%',
    height: 180,
    marginBottom: 20,
  },
  priceSection: {
    backgroundColor: 'rgba(77,214,255,0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#0B1A2A',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  priceValue: {
    color: '#4DD6FF',
    fontSize: 20,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  infoRow: {
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  infoLabel: {
    color: '#0B1A2A',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    marginBottom: 8,
  },
  infoValue: {
    color: '#516273',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: FONT_FAMILY,
  },
  fishInfoFooter: {
    marginTop: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
  },
});
