// Components/LogbookScreen.js — Idle Fish Care
// Catch logbook: list + add catch (species, size, weight, spot, notes) + simple stats.
// No extra deps.
//
// Expects assets:
// assets/onb_bg.png
// assets/calendar.png
// assets/clock.png

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
  TextInput,
  Modal,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { FISH_CATALOG } from '../Constants/gameConstants';

const BG = require('../assets/onb_bg.png');
const ICON_CAL = require('../assets/calendar.png');
const ICON_CLOCK = require('../assets/clock.png');
const BUTTON_BG = require('../assets/button.png');

// Import fish images
const FISH_IMAGES = {
  Perch: require('../assets/Perch.png'),
  Pike: require('../assets/Pike.png'),
  Trout: require('../assets/Trout.png'),
  Zander: require('../assets/Zander.png'),
  Whitefish: require('../assets/Whitefish.png'),
  Burbot: require('../assets/Burbot.png'),
  Roach: require('../assets/Roach.png'),
  Carp: require('../assets/Carp.png'),
  Salmon: require('../assets/Salmon.png'),
  Grayling: require('../assets/Grayling.png'),
};

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
  // For header (dark theme)
  bg: '#07121B',
};

const GRAD = {
  primary: ['#4DD6FF', '#7CFFCC'],
  navy: ['#2D4765', '#1B2E45'],
  danger: ['#FF4D6D', '#FF9A5A'],
};

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const pad2 = n => (n < 10 ? `0${n}` : `${n}`);

const nowYMD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const nowHM = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const formatDate = (dStr) => {
  if (!dStr) return '—';
  const [y, m, d] = (dStr || '').split('-').map(Number);
  if (!y || !m || !d) return dStr;
  return `${pad2(d)}.${pad2(m)}.${y}`;
};
const formatTime = (tStr) => {
  if (!tStr) return '—';
  const [h, m] = (tStr || '').split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return tStr;
  return `${pad2(h)}:${pad2(m)}`;
};

const SPECIES = ['Perch', 'Trout', 'Pike', 'Zander', 'Other'];

export default function LogbookScreen({ navigation }) {
  const [entries, setEntries] = useState(() => ([
    {
      id: uid(),
      species: 'Perch',
      date: '2026-01-03',
      time: '08:05',
      lengthCm: '27',
      weightKg: '0.32',
      spot: 'Pine Bay',
      lure: 'Small jig',
      notes: 'Slow lift worked best.',
    },
    {
      id: uid(),
      species: 'Trout',
      date: '2026-01-01',
      time: '07:20',
      lengthCm: '34',
      weightKg: '0.62',
      spot: 'North Shore',
      lure: 'Spoon',
      notes: '',
    },
  ]));

  const [filter, setFilter] = useState('All'); // All or species
  const [query, setQuery] = useState(''); // Search query
  const [showAddScreen, setShowAddScreen] = useState(false);
  const [editingId, setEditingId] = useState(null); // ID of entry being edited
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [photo, setPhoto] = useState(null);
  const [selectedFishImage, setSelectedFishImage] = useState(null); // Selected fish image instead of photo
  const [showFishImagePicker, setShowFishImagePicker] = useState(false); // Modal for fish image selection

  const [form, setForm] = useState({
    species: 'Perch',
    date: nowYMD(),
    time: nowHM(),
    lengthCm: '',
    weightKg: '',
    spot: '',
    lure: '',
    notes: '',
  });

  // Initialize date and time pickers
  useEffect(() => {
    const dateParts = form.date.split('-');
    if (dateParts.length === 3) {
      const d = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
      }
    }
    const timeParts = form.time.split(':');
    if (timeParts.length === 2) {
      const t = new Date();
      t.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
      setSelectedTime(t);
    }
  }, [form.date, form.time]);

  const onDateChange = (event, selected) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selected) {
      setSelectedDate(selected);
      const year = selected.getFullYear();
      const month = pad2(selected.getMonth() + 1);
      const day = pad2(selected.getDate());
      setForm(s => ({ ...s, date: `${year}-${month}-${day}` }));
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
      setForm(s => ({ ...s, time: `${hours}:${minutes}` }));
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
          setSelectedFishImage(null); // Clear fish image if photo is selected
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
          setSelectedFishImage(null); // Clear fish image if photo is selected
        }
      }
    );
  };

  const openAdd = () => {
    setEditingId(null);
    setPhoto(null);
    setSelectedFishImage(null);
    setShowDatePicker(false);
    setShowTimePicker(false);
    const today = new Date();
    setSelectedDate(today);
    setSelectedTime(today);
    setForm({
      species: 'Perch',
      date: nowYMD(),
      time: nowHM(),
      lengthCm: '',
      weightKg: '',
      spot: '',
      lure: '',
      notes: '',
    });
    setShowAddScreen(true);
  };

  const openEdit = (entry) => {
    setEditingId(entry.id);
    setPhoto(entry.photo || null);
    setSelectedFishImage(entry.fishImage || null);
    setShowDatePicker(false);
    setShowTimePicker(false);
    // Parse date and time from entry
    const dateParts = entry.date.split('-');
    if (dateParts.length === 3) {
      const d = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
      }
    }
    const timeParts = entry.time.split(':');
    if (timeParts.length === 2) {
      const t = new Date();
      t.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
      setSelectedTime(t);
    }
    setForm({
      species: entry.species,
      date: entry.date,
      time: entry.time,
      lengthCm: entry.lengthCm || '',
      weightKg: entry.weightKg || '',
      spot: entry.spot || '',
      lure: entry.lure || '',
      notes: entry.notes || '',
    });
    setShowAddScreen(true);
  };

  const save = () => {
    const spot = form.spot.trim();
    const len = form.lengthCm.trim();
    const w = form.weightKg.trim();

    if (!form.species) return Alert.alert('Species required', 'Pick a fish type.');
    if (!form.date.trim()) return Alert.alert('Date required', 'Add a date.');
    if (!form.time.trim()) return Alert.alert('Time required', 'Add a time.');

    if (len && Number.isNaN(Number(len))) return Alert.alert('Length invalid', 'Use a number (cm).');
    if (w && Number.isNaN(Number(w))) return Alert.alert('Weight invalid', 'Use a number (kg).');

    const payload = {
      id: editingId || uid(),
      species: form.species,
      date: form.date.trim(),
      time: form.time.trim(),
      lengthCm: len,
      weightKg: w,
      spot: spot || '—',
      lure: form.lure.trim() || '—',
      notes: form.notes.trim(),
      photo: photo || null,
      fishImage: selectedFishImage || null,
    };

    setEntries(prev => {
      if (editingId) {
        return prev.map(e => e.id === editingId ? payload : e);
      } else {
        return [payload, ...prev];
      }
    });
    setShowAddScreen(false);
    setEditingId(null);
  };

  const remove = (id) => {
    Alert.alert('Remove entry?', 'This will delete the logbook record.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setEntries(prev => prev.filter(e => e.id !== id)) },
    ]);
  };

  const list = useMemo(() => {
    let base = entries.slice().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    
    // Apply species filter
    if (filter !== 'All') {
      base = base.filter(e => e.species === filter);
    }
    
    // Apply search query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      base = base.filter(e => 
        e.species.toLowerCase().includes(q) ||
        e.spot.toLowerCase().includes(q) ||
        e.lure.toLowerCase().includes(q) ||
        e.notes.toLowerCase().includes(q) ||
        e.date.includes(q) ||
        e.time.includes(q)
      );
    }
    
    return base;
  }, [entries, filter, query]);

  const stats = useMemo(() => {
    const all = entries.length;
    const bestLen = Math.max(
      0,
      ...entries.map(e => (e.lengthCm ? Number(e.lengthCm) : 0)).filter(n => !Number.isNaN(n))
    );
    const bestW = Math.max(
      0,
      ...entries.map(e => (e.weightKg ? Number(e.weightKg) : 0)).filter(n => !Number.isNaN(n))
    );
    const uniq = new Set(entries.map(e => e.species)).size;
    return { all, bestLen, bestW, uniq };
  }, [entries]);

  // Full screen add/edit form
  if (showAddScreen) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <ImageBackground source={BG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.addScreenHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowAddScreen(false);
                  setEditingId(null);
                }}
                activeOpacity={0.85}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.addScreenTitle}>{editingId ? 'Edit catch' : 'Add catch'}</Text>
              <View style={{ width: 80 }} />
            </View>

            {/* Form */}
            <View style={styles.addScreenCard}>
              <Text style={styles.modalLabel}>Species</Text>
              <View style={styles.chipsRowModal}>
                {SPECIES.map(k => {
                  const active = form.species === k;
                  return (
                    <TouchableOpacity
                      key={k}
                      onPress={() => {
                        setForm(s => ({ ...s, species: k }));
                        // Auto-select fish image when species changes
                        if (FISH_IMAGES[k]) {
                          setSelectedFishImage(k);
                          setPhoto(null);
                        }
                      }}
                      activeOpacity={0.9}
                      style={[styles.chip, active && styles.chipOn]}
                    >
                      <Text style={[styles.chipTxt, active && styles.chipTxtOn]}>{k}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Date and Time Pickers */}
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.8}
                    style={styles.inputIconWrap}
                  >
                    <Image source={ICON_CAL} style={styles.inputIcon} resizeMode="contain" />
                    <View style={[styles.input, styles.inputWithIcon, styles.pickerInput]}>
                      <Text style={styles.pickerText}>{form.date}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Time</Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    activeOpacity={0.8}
                    style={styles.inputIconWrap}
                  >
                    <Image source={ICON_CLOCK} style={styles.inputIcon} resizeMode="contain" />
                    <View style={[styles.input, styles.inputWithIcon, styles.pickerInput]}>
                      <Text style={styles.pickerText}>{form.time}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Photo or Fish Image Selection */}
              <Text style={styles.modalLabel}>Photo or Fish Image</Text>
              <View style={styles.photoSelectionContainer}>
                <TouchableOpacity
                  onPress={handlePhotoPicker}
                  activeOpacity={0.9}
                  style={[styles.photoOption, photo && styles.photoOptionActive]}
                >
                  <Text style={styles.photoOptionText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowFishImagePicker(true);
                  }}
                  activeOpacity={0.9}
                  style={[styles.photoOption, selectedFishImage && styles.photoOptionActive]}
                >
                  <Text style={styles.photoOptionText}>Fish Image</Text>
                </TouchableOpacity>
              </View>

              {/* Display selected photo or fish image */}
              {(photo || selectedFishImage) && (
                <View style={styles.imagePreviewContainer}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.imagePreview} resizeMode="cover" />
                  ) : selectedFishImage && FISH_IMAGES[selectedFishImage] ? (
                    <Image source={FISH_IMAGES[selectedFishImage]} style={styles.imagePreview} resizeMode="contain" />
                  ) : null}
                  <TouchableOpacity
                    onPress={() => {
                      setPhoto(null);
                      setSelectedFishImage(null);
                    }}
                    style={styles.removeImageBtn}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.row2}>
                <TextInput
                  value={form.lengthCm}
                  onChangeText={(v) => setForm(s => ({ ...s, lengthCm: v }))}
                  placeholder="Length (cm)"
                  placeholderTextColor={COLORS.text3}
                  style={[styles.input, styles.inputHalf]}
                  keyboardType="decimal-pad"
                />
                <TextInput
                  value={form.weightKg}
                  onChangeText={(v) => setForm(s => ({ ...s, weightKg: v }))}
                  placeholder="Weight (kg)"
                  placeholderTextColor={COLORS.text3}
                  style={[styles.input, styles.inputHalf]}
                  keyboardType="decimal-pad"
                />
              </View>

              <TextInput
                value={form.spot}
                onChangeText={(v) => setForm(s => ({ ...s, spot: v }))}
                placeholder="Spot (optional)"
                placeholderTextColor={COLORS.text3}
                style={styles.input}
                maxLength={42}
              />
              <TextInput
                value={form.lure}
                onChangeText={(v) => setForm(s => ({ ...s, lure: v }))}
                placeholder="Lure / bait (optional)"
                placeholderTextColor={COLORS.text3}
                style={styles.input}
                maxLength={42}
              />
              <TextInput
                value={form.notes}
                onChangeText={(v) => setForm(s => ({ ...s, notes: v }))}
                placeholder="Notes (optional)"
                placeholderTextColor={COLORS.text3}
                style={[styles.input, styles.inputArea]}
                multiline
                maxLength={220}
              />

              <TouchableOpacity onPress={save} activeOpacity={0.9} style={styles.modalSaveBtn}>
                <ImageBackground source={BUTTON_BG} style={styles.modalSaveBtnBg} resizeMode="contain">
                  <Text style={styles.modalSaveBtnTxt}>{editingId ? 'Update entry' : 'Save entry'}</Text>
                </ImageBackground>
              </TouchableOpacity>

              <Text style={styles.modalHint}>Minimal & fast—perfect for the ice.</Text>
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

        {/* Fish Image Picker Modal */}
        <Modal
          visible={showFishImagePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFishImagePicker(false)}
        >
          <SafeAreaView style={styles.fishPickerModalRoot}>
            <View style={styles.fishPickerModalContainer}>
              <View style={styles.fishPickerModalHeader}>
                <Text style={styles.fishPickerModalTitle}>Select Fish Image</Text>
                <TouchableOpacity onPress={() => setShowFishImagePicker(false)}>
                  <Text style={styles.fishPickerModalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                contentContainerStyle={styles.fishPickerGrid}
                showsVerticalScrollIndicator={false}
              >
                {FISH_CATALOG.map((fish) => {
                  // Convert fish name to match FISH_IMAGES keys (capitalize first letter)
                  const fishKey = fish.name;
                  const isSelected = selectedFishImage === fishKey;
                  
                  return (
                    <TouchableOpacity
                      key={fish.id}
                      onPress={() => {
                        setSelectedFishImage(fishKey);
                        setPhoto(null);
                        setShowFishImagePicker(false);
                      }}
                      activeOpacity={0.8}
                      style={[
                        styles.fishPickerItem,
                        isSelected && styles.fishPickerItemSelected
                      ]}
                    >
                      <Image 
                        source={fish.image} 
                        style={styles.fishPickerImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.fishPickerName}>{fish.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.hTitle}>Logbook</Text>
              <Text style={styles.hSub}>Record catches and track your best fish.</Text>
            </View>

            <TouchableOpacity onPress={openAdd} activeOpacity={0.9}>
              <ImageBackground source={BUTTON_BG} style={styles.primaryBtn} resizeMode="contain">
                <View style={styles.primaryBtnInner}>
                  <Text style={styles.primaryTxt}>Add</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search entries..."
              placeholderTextColor={COLORS.text3}
              style={styles.searchInput}
            />
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statK}>Entries</Text>
              <Text style={styles.statV}>{stats.all}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statK}>Species</Text>
              <Text style={styles.statV}>{stats.uniq}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statK}>Best cm</Text>
              <Text style={styles.statV}>{stats.bestLen ? `${stats.bestLen}` : '—'}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statK}>Best kg</Text>
              <Text style={styles.statV}>{stats.bestW ? `${stats.bestW}` : '—'}</Text>
            </View>
          </View>

          {/* Filter */}
          <View style={styles.chipsRow}>
            {['All', ...SPECIES].map(k => {
              const active = filter === k;
              return (
                <TouchableOpacity
                  key={k}
                  onPress={() => setFilter(k)}
                  activeOpacity={0.9}
                  style={[styles.chip, active && styles.chipOn]}
                >
                  <Text style={[styles.chipTxt, active && styles.chipTxtOn]}>{k}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* List */}
          {list.length ? (
            list.map(e => (
              <TouchableOpacity key={e.id} style={styles.card} onPress={() => openEdit(e)} activeOpacity={0.9}>
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{e.species}</Text>
                    <Text style={styles.cardDate}>{formatDate(e.date)} • {formatTime(e.time)}</Text>
                    <Text style={styles.cardText} numberOfLines={2}>
                      {e.spot !== '—' && `Spot: ${e.spot}`}
                      {e.spot !== '—' && e.lure !== '—' && ' • '}
                      {e.lure !== '—' && `Lure: ${e.lure}`}
                      {((e.lengthCm && e.lengthCm.trim()) || (e.weightKg && e.weightKg.trim())) && ' • '}
                      {e.lengthCm && e.lengthCm.trim() && `${e.lengthCm} cm`}
                      {e.lengthCm && e.lengthCm.trim() && e.weightKg && e.weightKg.trim() && ' • '}
                      {e.weightKg && e.weightKg.trim() && `${e.weightKg} kg`}
                      {!e.spot && e.spot === '—' && !e.lure && e.lure === '—' && !e.lengthCm && !e.weightKg && 'No details'}
                    </Text>
                    {!!e.notes && <Text style={styles.notes} numberOfLines={2}>{e.notes}</Text>}
                  </View>
                </View>
                <View style={styles.removeBtnContainer}>
                  <TouchableOpacity 
                    onPress={(ev) => { ev.stopPropagation(); remove(e.id); }} 
                    activeOpacity={0.9}
                    style={styles.removeBtn}
                  >
                    <LinearGradient
                      colors={GRAD.danger}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.removeBtnGradient}
                    >
                      <Text style={styles.removeBtnTxt}>Remove</Text>
                    </LinearGradient>
                  </TouchableOpacity>
              </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyTitle}>No entries</Text>
              <Text style={styles.emptySub}>Tap “+ Add” to log your first catch.</Text>
            </View>
          )}

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
  scroll: { paddingTop: Platform.OS === 'android' ? 44 : 10, paddingHorizontal: 16, paddingBottom: 100 },

  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    gap: 14, 
    marginTop: 6,
    marginBottom: 14,
  },
  headerLeft: { flex: 1 },
  hTitle: { 
    color: COLORS.headerText, 
    fontSize: 34, 
    fontWeight: '900', 
    fontFamily: FONT_FAMILY,
  },
  hSub: { 
    color: COLORS.headerSub, 
    marginTop: 6, 
    fontSize: 14, 
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },

  primaryBtn: {
    width: 160,
    height: 180,
    top:-50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    marginBottom:-100,
  },
  primaryBtnInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    top: 5,
  },
  primaryTxt: { 
    color: '#FFFFFF', 
    fontWeight: '900', 
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    top: -10,
  },

  statsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 14,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flexGrow: 1,
    minWidth: 120,
    padding: 12,
    borderRadius: 18,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statK: { color: COLORS.text2, fontSize: 12.3, fontWeight: '900', fontFamily: FONT_FAMILY },
  statV: { color: COLORS.text, marginTop: 6, fontSize: 18, fontWeight: '900', fontFamily: FONT_FAMILY },

  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  chipsRowModal: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipOn: { backgroundColor: 'rgba(77,214,255,0.1)', borderColor: 'rgba(77,214,255,0.3)' },
  chipTxt: { color: COLORS.text2, fontWeight: '900', fontSize: 12.5, fontFamily: FONT_FAMILY },
  chipTxtOn: { color: COLORS.text },

  card: {
    marginTop: 12,
    width: '100%',
    padding: 14,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyCard: { paddingVertical: 18 },

  cardContent: { 
    width: '100%',
  },
  cardLeft: { width: '100%' },
  cardTitle: { color: COLORS.text, fontWeight: '900', fontSize: 15.5, fontFamily: FONT_FAMILY },
  cardDate: { 
    marginTop: 4, 
    color: '#8FA0B0', 
    fontSize: 12.5, 
    fontWeight: '800', 
    fontFamily: FONT_FAMILY 
  },
  cardText: { 
    marginTop: 6, 
    color: COLORS.text2, 
    fontSize: 12.8, 
    fontWeight: '650', 
    fontFamily: FONT_FAMILY,
    lineHeight: 18,
  },
  removeBtnContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  removeBtn: {
    width: 116,
    height: 44,
  },
  removeBtnGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.3)',
  },
  removeBtnTxt: { 
    color: '#FFFFFF', 
    fontWeight: '900', 
    fontSize: 13, 
    fontFamily: FONT_FAMILY,
  },

  notes: { marginTop: 8, color: COLORS.text3, fontSize: 12.8, lineHeight: 18, fontWeight: '600', fontFamily: FONT_FAMILY },

  emptyTitle: { color: COLORS.text, fontWeight: '900', fontSize: 16, fontFamily: FONT_FAMILY },
  emptySub: { marginTop: 6, color: COLORS.text2, fontSize: 13.2, lineHeight: 18, fontFamily: FONT_FAMILY },

  // Search
  searchContainer: {
    marginTop: 12,
    marginBottom: 10,
  },
  searchInput: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONT_FAMILY,
  },

  // modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', paddingHorizontal: 16 },
  modalCard: {
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: COLORS.text, fontSize: 16.5, fontWeight: '900', fontFamily: FONT_FAMILY },
  modalClose: { color: COLORS.text2, fontWeight: '800', fontFamily: FONT_FAMILY },

  modalLabel: { color: COLORS.text2, fontWeight: '900', fontSize: 12.5, marginTop: 6, fontFamily: FONT_FAMILY },

  row2: { flexDirection: 'row', gap: 10 },
  input: {
    marginTop: 10,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONT_FAMILY,
  },
  inputHalf: { flex: 1 },
  inputArea: { minHeight: 90, textAlignVertical: 'top' },

  modalSaveBtn: {
    marginTop: -40,
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    marginBottom:-60,
  },
  modalSaveBtnBg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnTxt: { 
    color: '#FFFFFF', 
    fontWeight: '900', 
    fontSize: 20,
    letterSpacing: 0.2, 
    fontFamily: FONT_FAMILY,
    top: -10,
  },
  modalHint: { marginTop: 10, color: COLORS.text3, fontSize: 12.2, lineHeight: 16, fontFamily: FONT_FAMILY },
  
  // Date/Time Picker
  inputIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: COLORS.text2,
  },
  inputWithIcon: {
    flex: 1,
    marginTop: 0,
  },
  pickerInput: {
    justifyContent: 'center',
  },
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
    borderBottomColor: COLORS.border,
    marginBottom: 16,
  },
  pickerModalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  pickerModalButton: {
    color: COLORS.text2,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
  },
  pickerModalPicker: {
    height: Platform.OS === 'ios' ? 200 : 'auto',
    width: '100%',
  },
  
  // Photo/Fish Image Selection
  photoSelectionContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  photoOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOptionActive: {
    backgroundColor: 'rgba(77,214,255,0.1)',
    borderColor: 'rgba(77,214,255,0.3)',
  },
  photoOptionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
  },
  imagePreviewContainer: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239,68,68,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  
  // Add screen
  addScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: COLORS.headerText,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FONT_FAMILY,
  },
  addScreenTitle: {
    color: COLORS.headerText,
    fontSize: 24,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  addScreenScroll: {
    paddingTop: Platform.OS === 'android' ? 44 : 10,
    paddingBottom: 100,
    paddingHorizontal: 4,
  },
  addScreenCard: {
    marginTop: 10,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    marginBottom: 20,
    width: '100%',
  },
  // Fish Image Picker Modal
  fishPickerModalRoot: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  fishPickerModalContainer: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 60,
    paddingTop: 20,
    paddingBottom: 40,
  },
  fishPickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fishPickerModalTitle: {
    fontSize: 22,
    fontFamily: FONT_FAMILY,
    color: COLORS.text,
  },
  fishPickerModalClose: {
    fontSize: 28,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  fishPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 16,
    paddingBottom: 40,
  },
  fishPickerItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.cardSoft,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishPickerItemSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(77,214,255,0.15)',
  },
  fishPickerImage: {
    width: '80%',
    height: '70%',
    marginBottom: 8,
  },
  fishPickerName: {
    fontSize: 12,
    fontFamily: FONT_FAMILY,
    color: COLORS.text,
    textAlign: 'center',
  },
});
