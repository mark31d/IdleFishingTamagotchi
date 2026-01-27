// Components/RulesScreen.js
// Экран правил игры

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Image } from 'react-native';
import { GradientButton } from './GameComponents';
import { COLORS, FONT_FAMILY, SCREEN_HEIGHT } from '../Constants/gameConstants';

const ROD_ICON = require('../assets/add_catch.png');
const FISH_ICON = require('../assets/pin.png');
const STORE_ICON = require('../assets/gear.png');
const TIPS_ICON = require('../assets/checklist.png');
const CLOSE_ICON = require('../assets/back.png');
const STATS_ICON = require('../assets/gear.png');
const ACTION_ICON = require('../assets/add_catch.png');
const HEALTH_ICON = require('../assets/plus.png');
const MOOD_ICON = require('../assets/hook.png');
const COINS_ICON = require('../assets/back.png');
const AUTO_ICON = require('../assets/clock.png');

export default function RulesScreen({ onClose }) {
  return (
    <View style={styles.rulesContainer}>
      <View style={styles.rulesHeader}>
        <Text style={styles.rulesTitle}>How to Play</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Image source={CLOSE_ICON} style={styles.closeIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.rulesScroll} contentContainerStyle={styles.rulesContent}>
        <View style={styles.ruleSection}>
          <View style={styles.ruleSectionTitleRow}>
            <Image source={FISH_ICON} style={styles.ruleIcon} resizeMode="contain" />
            <Text style={styles.ruleSectionTitle}>Fish Tamagotchi</Text>
          </View>
          <Text style={styles.ruleText}>
            • Stats drop over time (Hunger/Clean/Energy/Happiness).{'\n'}
            • Tap actions to raise stats and earn coins.{'\n'}
            • If stats are too low — Health drops.{'\n'}
            • Sleep restores Energy faster, but Hunger still drops.{'\n'}
            • Keep Health above 0 so the fish doesn't become Critical.{'\n'}
            • Feed increases Hunger and Happiness.{'\n'}
            • Play increases Happiness but decreases Energy.{'\n'}
            • Clean increases Cleanliness and Happiness.{'\n'}
            • Each action gives you 1 coin.
          </Text>
        </View>

        <View style={styles.ruleSection}>
          <View style={styles.ruleSectionTitleRow}>
            <Image source={STATS_ICON} style={styles.ruleIcon} resizeMode="contain" />
            <Text style={styles.ruleSectionTitle}>Stats System</Text>
          </View>
          <Text style={styles.ruleText}>
            • Your fish has 5 main stats (all values from 0 to 100%).{'\n'}
            • Hunger starts at 78% and drops over time.{'\n'}
            • Happiness starts at 72% and decreases gradually.{'\n'}
            • Cleanliness starts at 70% and needs regular maintenance.{'\n'}
            • Energy starts at 75% and depletes with activity.{'\n'}
            • Health starts at 90% and is affected by other stats.{'\n'}
            • Sleeping is a toggle state (sleeping/awake).{'\n'}
            • All stats change automatically every second.
          </Text>
        </View>

        <View style={styles.ruleSection}>
          <View style={styles.ruleSectionTitleRow}>
            <Image source={AUTO_ICON} style={styles.ruleIcon} resizeMode="contain" />
            <Text style={styles.ruleSectionTitle}>Automatic Changes</Text>
          </View>
          <Text style={styles.ruleText}>
            When fish is sleeping:{'\n'}
            • Energy increases by 6.5 units per minute.{'\n'}
            • Happiness increases by 1.2 units per minute.{'\n'}
            • Hunger decreases by 4.5 units per minute.{'\n'}
            • Cleanliness decreases by 2.0 units per minute.{'\n'}
            • Auto-wake: Fish wakes up when Energy reaches 96%.{'\n\n'}
            When fish is awake:{'\n'}
            • Hunger decreases by 5.0 units per minute.{'\n'}
            • Cleanliness decreases by 3.2 units per minute.{'\n'}
            • Energy decreases by 4.0 units per minute.{'\n'}
            • Happiness decreases by 1.8 units per minute.{'\n'}
            • Happiness drops faster if other stats are low.
          </Text>
        </View>

        <View style={styles.ruleSection}>
          <View style={styles.ruleSectionTitleRow}>
            <Image source={ACTION_ICON} style={styles.ruleIcon} resizeMode="contain" />
            <Text style={styles.ruleSectionTitle}>Actions</Text>
          </View>
          <Text style={styles.ruleText}>
            Feed:{'\n'}
            • Increases Hunger by +26 units.{'\n'}
            • Increases Happiness by +5 units.{'\n'}
            • Increases Health by +2 units.{'\n'}
            • Does not work when fish is sleeping.{'\n'}
            • Gives 1 coin per action.{'\n\n'}
            Play:{'\n'}
            • Increases Happiness by +20 units.{'\n'}
            • Decreases Energy by -10 units.{'\n'}
            • Decreases Hunger by -6 units.{'\n'}
            • Does not work when fish is sleeping.{'\n'}
            • Gives 1 coin per action.{'\n\n'}
            Clean:{'\n'}
            • Increases Cleanliness by +30 units.{'\n'}
            • Increases Happiness by +4 units.{'\n'}
            • Does not work when fish is sleeping.{'\n'}
            • Gives 1 coin per action.{'\n\n'}
            Sleep:{'\n'}
            • Toggles sleep state (sleeping/awake).{'\n'}
            • Works anytime, even if fish is already sleeping.{'\n'}
            • Energy restores quickly while sleeping.{'\n'}
            • Hunger continues to drop even while sleeping.
          </Text>
        </View>

        <View style={styles.ruleSection}>
          <View style={styles.ruleSectionTitleRow}>
            <Image source={HEALTH_ICON} style={styles.ruleIcon} resizeMode="contain" />
            <Text style={styles.ruleSectionTitle}>Health System</Text>
          </View>
          <Text style={styles.ruleText}>
            Health drops if:{'\n'}
            • Hunger is below 15% (-6 to -22 units per minute).{'\n'}
            • Cleanliness is below 15% (-6 to -22 units per minute).{'\n'}
            • Energy is below 12% (-6 to -22 units per minute).{'\n'}
            • Happiness is below 10% (-6 to -22 units per minute).{'\n'}
            • More critical stats = faster Health drop.{'\n\n'}
            Health restores if:{'\n'}
            • Hunger is above 55%.{'\n'}
            • Cleanliness is above 55%.{'\n'}
            • Energy is above 55%.{'\n'}
            • Happiness is above 55%.{'\n'}
            • If 3 or more stats are above 55%, Health restores at +2.4 units per minute.
          </Text>
        </View>

        <View style={styles.ruleSection}>
          <View style={styles.ruleSectionTitleRow}>
            <Image source={MOOD_ICON} style={styles.ruleIcon} resizeMode="contain" />
            <Text style={styles.ruleSectionTitle}>Mood States</Text>
          </View>
          <Text style={styles.ruleText}>
            • Critical - Health is 0% or below (dark red).{'\n'}
            • Sleeping - Fish is sleeping (purple).{'\n'}
            • Hungry - Hunger is below 20% (bright orange).{'\n'}
            • Dirty - Cleanliness is below 20% (brown).{'\n'}
            • Tired - Energy is below 20% (pink-magenta).{'\n'}
            • Sick - Health is below 45% (yellow).{'\n'}
            • Happy - All stats are good (green).{'\n'}
            • Okay - Normal state (blue).{'\n\n'}
            Fish movement in aquarium changes based on mood!
          </Text>
        </View>

        <View style={styles.ruleSection}>
          <View style={styles.ruleSectionTitleRow}>
            <Image source={COINS_ICON} style={styles.ruleIcon} resizeMode="contain" />
            <Text style={styles.ruleSectionTitle}>Coins & Rewards</Text>
          </View>
          <Text style={styles.ruleText}>
            • Each action (Feed, Play, Clean) gives you 1 coin.{'\n'}
            • If all stats are good, you earn 0.04 coins every second.{'\n'}
            • There is a cooldown between actions (0.9 seconds).{'\n'}
            • Coins can be used to buy fish information in Store.{'\n'}
            • Regular actions help maintain good stats and earn coins.{'\n'}
            • Keep your fish healthy to maximize coin earnings.
          </Text>
        </View>

        <View style={styles.ruleSection}>
          <View style={styles.ruleSectionTitleRow}>
            <Image source={TIPS_ICON} style={styles.ruleIcon} resizeMode="contain" />
            <Text style={styles.ruleSectionTitle}>Tips</Text>
          </View>
          <Text style={styles.ruleText}>
            • Feed regularly to keep Hunger above 15%.{'\n'}
            • Clean the aquarium to maintain high Cleanliness.{'\n'}
            • Let fish sleep when Energy is low.{'\n'}
            • Play with fish to boost Happiness.{'\n'}
            • Watch Health - if it drops to 0%, fish becomes Critical.{'\n'}
            • Keep all stats above 55% for Health to restore.{'\n'}
            • Remember: every action gives you a coin!{'\n'}
            • Balance all stats for best results.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.rulesFooter}>
        <GradientButton title="Got it!" onPress={onClose} colors={[COLORS.cyan, COLORS.mint]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rulesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E6EEF6',
    overflow: 'hidden',
  },
  rulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  rulesTitle: {
    color: '#0B1A2A',
    fontSize: 24,
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
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: '#0B1A2A',
  },
  rulesScroll: { flex: 1 },
  rulesContent: { padding: 16 },
  ruleSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  ruleSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  ruleSectionTitle: {
    color: '#0B1A2A',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    flex: 1,
  },
  ruleText: {
    color: '#516273',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: FONT_FAMILY,
  },
  rulesFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
});
