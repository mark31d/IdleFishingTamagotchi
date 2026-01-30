// Components/ProfileScreen.js
// Profile screen with real statistics, photo selection, and settings

import React, { useMemo, useState, useEffect } from 'react';
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
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const BG = require('../assets/onb_bg.png');
const BUTTON_BG = require('../assets/button.png');
const ICON_BACK = require('../assets/back.png');

const FONT_FAMILY = 'TitanOne-Regular';

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
  danger: '#EF4444',
  overlay: 'rgba(0,0,0,0.40)',
  bg: '#07121B',
};

const GRAD = {
  primary: ['#4DD6FF', '#7CFFCC'],
  navy: ['#2D4765', '#1B2E45'],
  danger: ['#FF4D6D', '#FF9A5A'],
};

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    name: 'Idle Fish Care',
    photo: null,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({ name: profile.name });
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

  // Load profile data from AsyncStorage
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedName = await AsyncStorage.getItem('profile_name');
      const savedPhoto = await AsyncStorage.getItem('profile_photo');
      const savedNotifications = await AsyncStorage.getItem('profile_notifications');
      if (savedName) setProfile(p => ({ ...p, name: savedName }));
      if (savedPhoto) setProfile(p => ({ ...p, photo: savedPhoto }));
      if (savedNotifications !== null) setNotificationsEnabled(savedNotifications === 'true');
    } catch (e) {
      console.log('Error loading profile:', e);
    }
  };

  // Real statistics from all screens
  const stats = useMemo(() => {
    // This will be loaded from AsyncStorage
    return {
      catches: 0,
      bestScore: 0,
      coins: 0,
      tripsPlanned: 0,
      tripsDone: 0,
    };
  }, []);

  const [realStats, setRealStats] = useState({
    catches: 0,
    bestScore: 0,
    coins: 0,
    tripsPlanned: 0,
    tripsDone: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load from LogbookScreen - entries are stored in component state, not AsyncStorage
      // We'll need to add AsyncStorage persistence to LogbookScreen later
      const logbookEntries = await AsyncStorage.getItem('logbook_entries');
      const catches = logbookEntries ? JSON.parse(logbookEntries).length : 0;

      // Load from GameScreen
      const gameCoins = await AsyncStorage.getItem('game_coins');
      const gameBestScore = await AsyncStorage.getItem('game_best_score');
      const coins = gameCoins ? parseInt(gameCoins, 10) : 0;
      const bestScore = gameBestScore ? parseInt(gameBestScore, 10) : 0;

      // Load from TripsHomeScreen - trips are stored in component state
      // We'll need to add AsyncStorage persistence to TripsHomeScreen later
      const tripsData = await AsyncStorage.getItem('trips_data');
      let tripsPlanned = 0;
      let tripsDone = 0;
      if (tripsData) {
        try {
          const trips = JSON.parse(tripsData);
          tripsPlanned = trips.length;
          tripsDone = trips.filter(t => t.status === 'completed' || t.status === 'past').length;
        } catch (e) {
          console.log('Error parsing trips data:', e);
        }
      }

      setRealStats({
        catches,
        bestScore,
        coins,
        tripsPlanned,
        tripsDone,
      });
    } catch (e) {
      console.log('Error loading stats:', e);
    }
  };

  const handlePhotoPicker = () => {
    Alert.alert(
      'Select Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.assets && response.assets[0]) {
        const photoUri = response.assets[0].uri;
        setProfile(p => ({ ...p, photo: photoUri }));
        AsyncStorage.setItem('profile_photo', photoUri);
      }
    });
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.assets && response.assets[0]) {
        const photoUri = response.assets[0].uri;
        setProfile(p => ({ ...p, photo: photoUri }));
        AsyncStorage.setItem('profile_photo', photoUri);
      }
    });
  };

  const openEdit = () => {
    setDraft({ name: profile.name });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!draft.name.trim()) return Alert.alert('Name required', 'Enter a name.');
    setProfile(p => ({ ...p, name: draft.name.trim() }));
    await AsyncStorage.setItem('profile_name', draft.name.trim());
    setEditOpen(false);
  };

  const handleNotificationsToggle = async (value) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('profile_notifications', String(value));
  };

  const handleRating = (stars) => {
    setSelectedRating(stars);
    if (stars >= 4) {
      Alert.alert('Thank you!', 'Your rating helps us improve the app.');
    } else {
      Alert.alert('Thank you for feedback!', 'We appreciate your input.');
    }
    setRatingModalOpen(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to reset all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setProfile({ name: 'Idle Fish Care', photo: null });
              setNotificationsEnabled(true);
              setRealStats({
                catches: 0,
                bestScore: 0,
                coins: 0,
                tripsPlanned: 0,
                tripsDone: 0,
              });
              Alert.alert('Success', 'All data has been reset.');
            } catch (e) {
              Alert.alert('Error', 'Failed to reset data.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.hTitle}>Profile</Text>
              <Text style={styles.hSub}>Your ice season overview.</Text>
            </View>
            <TouchableOpacity onPress={openEdit} activeOpacity={0.9} style={styles.primaryBtn}>
              <Image source={BUTTON_BG} style={styles.primaryBtnBg} resizeMode="contain" />
              <Text style={styles.primaryTxt}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Section */}
          <View style={styles.profileCard}>
            <TouchableOpacity onPress={handlePhotoPicker} activeOpacity={0.9} style={styles.photoContainer}>
              {profile.photo ? (
                <Image source={{ uri: profile.photo }} style={styles.profilePhoto} resizeMode="cover" />
              ) : (
                <View style={styles.profilePhotoPlaceholder}>
                  <Text style={styles.profilePhotoPlaceholderText}>
                    {profile.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.photoEditBadge}>
                <Text style={styles.photoEditText}>✎</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={openEdit} activeOpacity={0.8} style={styles.nameContainer}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <View style={styles.nameEditIcon}>
                <Text style={styles.nameEditIconText}>✎</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Statistics */}
          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Catches</Text>
                <Text style={styles.statValue}>{realStats.catches}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Best Score</Text>
                <Text style={styles.statValue}>{realStats.bestScore}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Coins</Text>
                <Text style={styles.statValue}>{realStats.coins}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Trips</Text>
                <Text style={styles.statValue}>{realStats.tripsDone}/{realStats.tripsPlanned}</Text>
              </View>
            </View>
          </View>

          {/* Settings */}
          <View style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Settings</Text>

            {/* Notifications Switch */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingSub}>Receive game and trip reminders</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: '#E6EEF6', true: COLORS.cyan }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            {/* Rate App */}
            <TouchableOpacity
              onPress={() => setRatingModalOpen(true)}
              activeOpacity={0.85}
              style={styles.settingRow}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingTitle}>Rate App</Text>
                <Text style={styles.settingSub}>Share your feedback</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            {/* Reset Data */}
            <TouchableOpacity
              onPress={handleReset}
              activeOpacity={0.85}
              style={[styles.settingRow, styles.settingRowDanger]}
            >
              <View style={styles.settingLeft}>
                <Text style={[styles.settingTitle, styles.settingTitleDanger]}>Reset All Data</Text>
                <Text style={styles.settingSub}>Clear all your data</Text>
              </View>
              <Text style={[styles.settingArrow, styles.settingArrowDanger]}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Edit Modal */}
        <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalTop}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setEditOpen(false)} activeOpacity={0.85}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={draft.name}
                onChangeText={(v) => setDraft(s => ({ ...s, name: v }))}
                placeholder="Display name"
                placeholderTextColor={COLORS.text3}
                style={styles.input}
                maxLength={40}
              />

              <View style={styles.modalSaveBtnContainer}>
                <TouchableOpacity onPress={saveEdit} activeOpacity={0.9} style={styles.modalSaveBtn}>
                  <LinearGradient
                    colors={GRAD.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalSaveBtnGradient}
                  >
                    <Text style={styles.modalSaveBtnTxt}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Rating Modal */}
        <Modal
          visible={ratingModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setRatingModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalTop}>
                <Text style={styles.modalTitle}>Rate App</Text>
                <TouchableOpacity onPress={() => setRatingModalOpen(false)} activeOpacity={0.85}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.ratingText}>How would you rate Idle Fish Care?</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRating(star)}
                    activeOpacity={0.8}
                    style={styles.starButton}
                  >
                    <Text style={[
                      styles.star,
                      selectedRating >= star && styles.starSelected
                    ]}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  scroll: { paddingTop: Platform.OS === 'android' ? 44 : 10, paddingHorizontal: 16, paddingBottom: 100 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  hTitle: {
    color: COLORS.headerText,
    fontSize: 32,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    letterSpacing: 0.5,
  },
  hSub: {
    color: COLORS.headerSub,
    fontSize: 14,
    marginTop: 4,
    fontFamily: FONT_FAMILY,
  },
  primaryBtn: {
    width: 128,
    height: 98,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50,
    marginBottom: -100,
  },
  primaryBtnBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  primaryTxt: {
    color: COLORS.headerText,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    marginTop: -10,
  },

  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.border,
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 3,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoPlaceholderText: {
    fontSize: 48,
    fontFamily: FONT_FAMILY,
    color: COLORS.text2,
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cyan,
    borderWidth: 3,
    borderColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEditText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  profileName: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: FONT_FAMILY,
    fontWeight: '900',
    marginRight: 8,
  },
  nameEditIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameEditIconText: {
    color: COLORS.text2,
    fontSize: 14,
    fontWeight: '900',
  },

  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: FONT_FAMILY,
    fontWeight: '900',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.cardSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  statLabel: {
    color: COLORS.text2,
    fontSize: 12,
    fontFamily: FONT_FAMILY,
    fontWeight: '900',
    marginBottom: 8,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: FONT_FAMILY,
    fontWeight: '900',
  },

  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  settingRowDanger: {
    borderTopColor: COLORS.border,
  },
  settingLeft: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: '900',
    marginBottom: 4,
  },
  settingTitleDanger: {
    color: COLORS.danger,
  },
  settingSub: {
    color: COLORS.text2,
    fontSize: 13,
    fontFamily: FONT_FAMILY,
  },
  settingArrow: {
    color: COLORS.text2,
    fontSize: 24,
    fontWeight: '900',
  },
  settingArrowDanger: {
    color: COLORS.danger,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: FONT_FAMILY,
    fontWeight: '900',
  },
  modalClose: {
    color: COLORS.text2,
    fontSize: 24,
    fontWeight: '900',
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    marginBottom: 20,
  },
  modalSaveBtnContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalSaveBtn: {
    width: 140,
    height: 46,
    borderRadius: 16,
  },
  modalSaveBtnGradient: {
    flex: 1,
    borderRadius: 16,
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
  modalSaveBtnTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: '900',
  },
  ratingText: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    textAlign: 'center',
    marginBottom: 24,
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 40,
    color: COLORS.border,
  },
  starSelected: {
    color: '#FFD700',
  },
});
