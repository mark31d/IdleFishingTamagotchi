// Components/CreateTripScreen.js — IdleFishCare
// No extra deps. Pure RN inputs + clean dark UI.
// Expects assets:
// assets/onb_bg.png
// assets/back.png
// assets/calendar.png
// assets/clock.png

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
  Switch,
  Platform,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const BG = require('../assets/onb_bg.png');
const ICON_BACK = require('../assets/back.png');
const ICON_CAL = require('../assets/calendar.png');
const ICON_CLOCK = require('../assets/clock.png');
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

const pad2 = n => (n < 10 ? `0${n}` : `${n}`);

const todayYMD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const defaultTime = () => '06:30';

const isValidYMD = (s) => /^\d{4}-\d{2}-\d{2}$/.test((s || '').trim());
const isValidHM = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test((s || '').trim());

export default function CreateTripScreen({ navigation, route }) {
  // Optional: you can pass onSave from route.params
  const onSave = route?.params?.onSave;
  const tripParam = route?.params?.trip; // For editing existing trip

  const [title, setTitle] = useState(tripParam?.title || '');
  const [place, setPlace] = useState(tripParam?.place === '—' ? '' : (tripParam?.place || ''));
  const [date, setDate] = useState(tripParam?.date || todayYMD());
  const [time, setTime] = useState(tripParam?.time || defaultTime());
  const [fishPerch, setFishPerch] = useState(tripParam?.fish?.perch || false);
  const [fishTrout, setFishTrout] = useState(tripParam?.fish?.trout || false);
  const [fishPike, setFishPike] = useState(tripParam?.fish?.pike || false);
  const [fishZander, setFishZander] = useState(tripParam?.fish?.zander || false);
  const [fishOther, setFishOther] = useState(tripParam?.fish?.other || false);
  const [notes, setNotes] = useState(tripParam?.notes || '');
  const [photo, setPhoto] = useState(tripParam?.photo || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const fishSummary = useMemo(() => {
    const arr = [];
    if (fishPerch) arr.push('Perch');
    if (fishTrout) arr.push('Trout');
    if (fishPike) arr.push('Pike');
    if (fishZander) arr.push('Zander');
    if (fishOther) arr.push('Other');
    return arr.length ? arr.join(' • ') : '—';
  }, [fishPerch, fishTrout, fishPike, fishZander, fishOther]);

  // Initialize date and time from current values
  React.useEffect(() => {
    const dateParts = date.split('-');
    if (dateParts.length === 3) {
      const d = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
      }
    }
    const timeParts = time.split(':');
    if (timeParts.length === 2) {
      const t = new Date();
      t.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
      setSelectedTime(t);
    }
  }, [date, time]);

  const onDateChange = (event, selected) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selected) {
      setSelectedDate(selected);
      const year = selected.getFullYear();
      const month = pad2(selected.getMonth() + 1);
      const day = pad2(selected.getDate());
      setDate(`${year}-${month}-${day}`);
    }
  };

  const onTimeChange = (event, selected) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selected) {
      setSelectedTime(selected);
      const hours = pad2(selected.getHours());
      const minutes = pad2(selected.getMinutes());
      setTime(`${hours}:${minutes}`);
    }
  };

  const handlePhotoPicker = () => {
    Alert.alert(
      'Select Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          setPhoto(response.assets[0].uri);
        }
      }
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          setPhoto(response.assets[0].uri);
        }
      }
    );
  };

  const submit = () => {
    const t = title.trim();
    const p = place.trim();

    if (!t) return Alert.alert('Trip name required', 'Add a short trip name.');
    if (!isValidYMD(date)) return Alert.alert('Invalid date', 'Use format YYYY-MM-DD.');
    if (!isValidHM(time)) return Alert.alert('Invalid time', 'Use format HH:MM.');

    const payload = {
      id: tripParam?.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      title: t,
      place: p || '—',
      date: date.trim(),
      time: time.trim(),
      notes: notes.trim(),
      fish: { perch: fishPerch, trout: fishTrout, pike: fishPike, zander: fishZander, other: fishOther },
      status: tripParam?.status || 'upcoming',
      createdAt: tripParam?.createdAt || new Date().toISOString(),
      photo: photo || null,
    };

    if (typeof onSave === 'function') {
      onSave(payload);
      if (navigation?.canGoBack?.()) {
        navigation.goBack();
      } else if (navigation?.navigate) {
        navigation.navigate('TripsHomeScreen');
      }
      return;
    }

    // fallback behavior if you didn't wire state yet
    Alert.alert('Saved (demo)', 'Wire onSave via route params to store this trip.');
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('TripsHomeScreen');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                if (navigation && navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
              activeOpacity={0.85}
              style={styles.iconBtn}
            >
              <Image source={ICON_BACK} style={styles.icon16} resizeMode="contain" />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            {photo && (
              <TouchableOpacity
                onPress={handlePhotoPicker}
                activeOpacity={0.85}
                style={styles.iconBtn}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Main form */}
          <View style={styles.card}>
            {/* Photo display if exists */}
            {photo && (
              <View style={styles.photoDisplayContainer}>
                <Image source={{ uri: photo }} style={styles.photoDisplay} resizeMode="cover" />
              </View>
            )}

            <Text style={styles.label}>Trip name</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Blue Hour Lake"
              placeholderTextColor="#9AA9B8"
              style={styles.input}
              maxLength={48}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Place</Text>
            <TextInput
              value={place}
              onChangeText={setPlace}
              placeholder="e.g., North Shore"
              placeholderTextColor="#9AA9B8"
              style={styles.input}
              maxLength={48}
            />

            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { marginTop: 12 }]}>Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                  style={styles.inputIconWrap}
                >
                  <Image source={ICON_CAL} style={styles.inputIcon} resizeMode="contain" />
                  <View style={[styles.input, styles.inputWithIcon, styles.pickerInput]}>
                    <Text style={styles.pickerText}>{date}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { marginTop: 12 }]}>Time</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.8}
                  style={styles.inputIconWrap}
                >
                  <Image source={ICON_CLOCK} style={styles.inputIcon} resizeMode="contain" />
                  <View style={[styles.input, styles.inputWithIcon, styles.pickerInput]}>
                    <Text style={styles.pickerText}>{time}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {!photo && (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>Photo</Text>
                <TouchableOpacity
                  onPress={handlePhotoPicker}
                  activeOpacity={0.8}
                  style={styles.photoContainer}
                >
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
            {photo && (
              <TouchableOpacity
                onPress={handlePhotoPicker}
                activeOpacity={0.8}
                style={styles.photoEditContainer}
              >
                <Text style={styles.photoEditText}>Edit Photo</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider} />

            <Text style={styles.label}>Quick fish list</Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchTxt}>Perch</Text>
              <Switch
                value={fishPerch}
                onValueChange={setFishPerch}
                trackColor={{ false: 'rgba(232,236,241,0.18)', true: 'rgba(77,214,255,0.35)' }}
                thumbColor={fishPerch ? COLORS.mint : 'rgba(232,236,241,0.70)'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchTxt}>Trout</Text>
              <Switch
                value={fishTrout}
                onValueChange={setFishTrout}
                trackColor={{ false: 'rgba(232,236,241,0.18)', true: 'rgba(77,214,255,0.35)' }}
                thumbColor={fishTrout ? COLORS.mint : 'rgba(232,236,241,0.70)'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchTxt}>Pike</Text>
              <Switch
                value={fishPike}
                onValueChange={setFishPike}
                trackColor={{ false: 'rgba(232,236,241,0.18)', true: 'rgba(77,214,255,0.35)' }}
                thumbColor={fishPike ? COLORS.mint : 'rgba(232,236,241,0.70)'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchTxt}>Zander</Text>
              <Switch
                value={fishZander}
                onValueChange={setFishZander}
                trackColor={{ false: 'rgba(232,236,241,0.18)', true: 'rgba(77,214,255,0.35)' }}
                thumbColor={fishZander ? COLORS.mint : 'rgba(232,236,241,0.70)'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchTxt}>Other</Text>
              <Switch
                value={fishOther}
                onValueChange={setFishOther}
                trackColor={{ false: 'rgba(232,236,241,0.18)', true: 'rgba(77,214,255,0.35)' }}
                thumbColor={fishOther ? COLORS.mint : 'rgba(232,236,241,0.70)'}
              />
            </View>

            <View style={styles.pillRow}>
              <View style={styles.pill}>
                <Text style={styles.pillK}>Selected</Text>
                <Text style={styles.pillV}>{fishSummary}</Text>
              </View>
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Ice thickness, bait, weather, checklist…"
              placeholderTextColor="#9AA9B8"
              style={[styles.input, styles.inputArea]}
              multiline
              maxLength={260}
            />

            <Text style={styles.hint}>
              Formats: date <Text style={styles.hintStrong}>YYYY-MM-DD</Text> • time{' '}
              <Text style={styles.hintStrong}>HH:MM</Text>
            </Text>

            {/* Save Button */}
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <TouchableOpacity onPress={submit} activeOpacity={0.9} style={styles.saveButton}>
                <ImageBackground source={BUTTON_BG} style={styles.saveButtonBg} resizeMode="contain">
                  <Text style={styles.saveButtonText}>Save</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </ImageBackground>

      {/* DATE PICKER MODAL */}
      <Modal 
        visible={showDatePicker} 
        animationType="fade" 
        transparent 
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerModalHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerModalButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerModalTitle}>Select Date</Text>
              <TouchableOpacity
                onPress={() => {
                  onDateChange(null, selectedDate);
                  setShowDatePicker(false);
                }}
              >
                <Text style={[styles.pickerModalButton, { color: COLORS.cyan, fontWeight: '900' }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                if (Platform.OS === 'android') {
                  setShowDatePicker(false);
                  if (date) onDateChange(event, date);
                } else {
                  if (date) setSelectedDate(date);
                }
              }}
              minimumDate={new Date()}
              style={styles.pickerModalPicker}
            />
          </View>
        </View>
      </Modal>

      {/* TIME PICKER MODAL */}
      <Modal 
        visible={showTimePicker} 
        animationType="fade" 
        transparent 
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerModalHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.pickerModalButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerModalTitle}>Select Time</Text>
              <TouchableOpacity
                onPress={() => {
                  onTimeChange(null, selectedTime);
                  setShowTimePicker(false);
                }}
              >
                <Text style={[styles.pickerModalButton, { color: COLORS.cyan, fontWeight: '900' }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, time) => {
                if (Platform.OS === 'android') {
                  setShowTimePicker(false);
                  if (time) onTimeChange(event, time);
                } else {
                  if (time) setSelectedTime(time);
                }
              }}
              is24Hour={true}
              style={styles.pickerModalPicker}
            />
          </View>
        </View>
      </Modal>
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
  scroll: {
    paddingTop: Platform.OS === 'android' ? 44 : 10,
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
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
  icon16: { width: 18, height: 18, tintColor: '#FFFFFF' },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
  },

  hTitle: { color: COLORS.text, fontSize: 22, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },
  hSub: { color: COLORS.muted, marginTop: 2, fontSize: 13.2, fontFamily: FONT_FAMILY },

  primaryBtn: {
    paddingVertical: 84,
    paddingHorizontal: 120,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primaryTxt: { color: COLORS.text, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },

  card: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },

  label: { color: '#0B1A2A', fontSize: 12.8, fontWeight: '900', letterSpacing: 0.2, fontFamily: FONT_FAMILY },
  input: {
    marginTop: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: 1,
    borderColor: '#E6EEF6',
    backgroundColor: '#F6F8FC',
    color: '#0B1A2A',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONT_FAMILY,
  },

  row2: { flexDirection: 'row', gap: 10 },
  inputIconWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 8 + (Platform.OS === 'ios' ? 12 : 10),
    width: 16,
    height: 16,
    tintColor: '#E8ECF1',
    opacity: 0.9,
  },
  inputWithIcon: { paddingLeft: 38 },

  divider: { height: 1, backgroundColor: '#E6EEF6', marginVertical: 14 },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F6F8FC',
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  switchTxt: { color: '#0B1A2A', fontSize: 13.5, fontWeight: '800', fontFamily: FONT_FAMILY },

  pillRow: { marginTop: 12 },
  pill: {
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pillK: { color: '#516273', fontSize: 12.2, fontWeight: '900', fontFamily: FONT_FAMILY },
  pillV: { color: '#0B1A2A', marginTop: 4, fontSize: 13.2, fontWeight: '900', fontFamily: FONT_FAMILY },

  inputArea: { minHeight: 110, textAlignVertical: 'top' },


  hint: { marginTop: 10, color: '#7A8A9A', fontSize: 12.2, lineHeight: 16, fontFamily: FONT_FAMILY },
  hintStrong: { color: '#516273', fontWeight: '900', fontFamily: FONT_FAMILY },

  pickerInput: { justifyContent: 'center' },
  pickerText: { color: '#0B1A2A', fontSize: 14, fontWeight: '700', fontFamily: FONT_FAMILY },

  photoDisplayContainer: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  photoDisplay: {
    width: '100%',
    height: 250,
  },
  photoContainer: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6EEF6',
    backgroundColor: '#F6F8FC',
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
    fontWeight: '700',
    fontFamily: FONT_FAMILY,
  },
  photoEditContainer: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  photoEditText: {
    color: '#0B1A2A',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
  },
  removePhotoBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  removePhotoText: {
    color: COLORS.danger,
    fontSize: 12.5,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
  },

  iosPickerContainer: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  iosPickerTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  iosPickerButton: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
  },
  iosPicker: {
    height: 200,
  },

  // Picker Modals (centered)
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
    width: '85%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    marginBottom: 16,
  },
  pickerModalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  pickerModalButton: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
  },
  pickerModalPicker: {
    height: Platform.OS === 'ios' ? 200 : 'auto',
    width: '100%',
  },

  // Save Button
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonBg: {
    width: 400,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.2,
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    top:-5,
  },
});
