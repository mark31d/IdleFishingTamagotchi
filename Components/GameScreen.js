// Components/GameScreen.js — Fish Tamagotchi (IceHook Atlas)

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StatusBar,
  Pressable,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BG, BUTTON_BG, FISH_CATALOG, COLORS, FONT_FAMILY } from '../Constants/gameConstants';

const STORAGE_KEY = 'icehook_tamagotchi_v1';

const BLACK = '#000000';
const BTN_H = 240; // Визуальная высота для всех кнопок
const BTN_HIT_H = 120; // Высота области нажатия для всех кнопок
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (min, max) => min + Math.random() * (max - min);
const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const MAX_PETS = 3;
const TICK_MS = 1000;
const MAX_DT_SEC = 20;

const COINS_PER_GOOD_TICK = 0.04;
const ACTION_COIN_BONUS = 1;
const ACTION_COOLDOWN_MS = 900;
const MAX_FEEDS_PER_DAY = 10; // Максимальное количество кормлений в день

const makeStats = () => ({
  hunger: 78,
  happiness: 72,
  cleanliness: 70,
  energy: 75,
  health: 90,
  sleeping: false,
});

const diffFactor = (difficulty = '') => {
  const d = String(difficulty).toLowerCase();
  if (d.includes('very hard')) return 1.4;
  if (d.includes('medium-hard')) return 0.9;
  if (d.includes('hard')) return 1.1;
  if (d.includes('medium')) return 0.7;
  return 0.4;
};

const priceInfo = (fish) => {
  const base = fish?.basePrice ?? 6;
  const f = diffFactor(fish?.difficulty);
  return Math.max(10, Math.round(base * 8 + f * 10));
};

const moodFromStats = (stats) => {
  const s = stats || makeStats();

  if (s.health <= 0) return { label: 'Critical', color: '#DC2626' }; // Темно-красный
  if (s.sleeping) return { label: 'Sleeping', color: '#8B5CF6' }; // Фиолетовый

  if (s.hunger < 20) return { label: 'Hungry', color: '#F97316' }; // Ярко-оранжевый
  if (s.cleanliness < 20) return { label: 'Dirty', color: '#A16207' }; // Коричневый
  if (s.energy < 20) return { label: 'Tired', color: '#BE185D' }; // Розово-малиновый
  if (s.health < 45) return { label: 'Sick', color: '#EAB308' }; // Желтый

  if (s.happiness > 75 && s.hunger > 45 && s.cleanliness > 45 && s.energy > 45 && s.health > 70) {
    return { label: 'Happy', color: '#22C55E' }; // Ярко-зеленый
  }
  return { label: 'Okay', color: '#0EA5E9' }; // Голубой
};

const tickOne = (stats, dtSec) => {
  const s = { ...(stats || makeStats()) };
  const dt = Math.max(0, dtSec);

  if (s.sleeping) {
    s.energy = clamp(s.energy + 6.5 * (dt / 60), 0, 100);
    s.hunger = clamp(s.hunger - 4.5 * (dt / 60), 0, 100);
    s.cleanliness = clamp(s.cleanliness - 2.0 * (dt / 60), 0, 100);
    s.happiness = clamp(s.happiness + 1.2 * (dt / 60), 0, 100);
    if (s.energy >= 96) s.sleeping = false;
  } else {
    s.hunger = clamp(s.hunger - 5.0 * (dt / 60), 0, 100);
    s.cleanliness = clamp(s.cleanliness - 3.2 * (dt / 60), 0, 100);
    s.energy = clamp(s.energy - 4.0 * (dt / 60), 0, 100);

    let hapDrop = 1.8 * (dt / 60);
    if (s.hunger < 35) hapDrop += 2.0 * (dt / 60);
    if (s.cleanliness < 35) hapDrop += 1.7 * (dt / 60);
    if (s.energy < 25) hapDrop += 1.3 * (dt / 60);

    s.happiness = clamp(s.happiness - hapDrop, 0, 100);
  }

  const bad =
    (s.hunger < 15 ? 1 : 0) +
    (s.cleanliness < 15 ? 1 : 0) +
    (s.energy < 12 ? 1 : 0) +
    (s.happiness < 10 ? 1 : 0);

  if (bad > 0) {
    s.health = clamp(s.health - (6 + bad * 4) * (dt / 60), 0, 100);
  } else {
    const good =
      (s.hunger > 55 ? 1 : 0) +
      (s.cleanliness > 55 ? 1 : 0) +
      (s.energy > 55 ? 1 : 0) +
      (s.happiness > 55 ? 1 : 0);

    if (good >= 3) s.health = clamp(s.health + 2.4 * (dt / 60), 0, 100);
  }

  return s;
};

const makeDefaultSave = (ownedFish = {}) => {
  // Находим первую купленную рыбу или первую доступную
  const firstOwnedFish = FISH_CATALOG.find(f => ownedFish[f.id]) || FISH_CATALOG?.[0] || { id: 'perch', name: 'Perch', image: null };
  const petId = uid();
  return {
    coins: 18,
    coinProgress: 0,
    pets: [{ id: petId, fishId: firstOwnedFish.id, nickname: firstOwnedFish.name, stats: makeStats() }],
    activePetId: petId,
    unlockedInfo: [],
    lastTs: Date.now(),
  };
};

function IceCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** ✅ Кнопка PNG без scale (всегда норм зона нажатия) */
function PngButton({ title, onPress, disabled, style }) {
  const handlePress = () => {
    console.log('PngButton handlePress called:', title, 'disabled:', disabled);
    if (onPress && !disabled) {
      console.log('PngButton executing onPress:', title);
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
      style={({ pressed }) => [
        styles.btnPressable,
        style,
        disabled && { opacity: 0.5 },
        pressed && !disabled && { transform: [{ scale: 0.985 }] },
      ]}
    >
      <View style={styles.btnBgWrapper} pointerEvents="none">
        <Image
          source={BUTTON_BG}
          resizeMode="stretch"
          style={styles.btnBgImg}
          pointerEvents="none"
        />
        <View style={styles.btnBgContent} pointerEvents="none">
          <Text style={styles.btnText} numberOfLines={1} pointerEvents="none">
            {title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/** ✅ Кнопка на button.png (такого же размера как PngButton) */
function GradientBtn({ title, onPress, disabled, colors, style }) {
  const handlePress = () => {
    console.log('GradientBtn handlePress called:', title, 'disabled:', disabled);
    if (onPress && !disabled) {
      console.log('GradientBtn executing onPress:', title);
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
      style={({ pressed }) => [
        styles.btnPressableSmall,
        style,
        disabled && { opacity: 0.5 },
        pressed && !disabled && { transform: [{ scale: 0.985 }] },
      ]}
    >
      <View style={styles.btnBgWrapperSmall} pointerEvents="none">
        <Image
          source={BUTTON_BG}
          resizeMode="stretch"
          style={styles.btnBgImg}
          pointerEvents="none"
        />
        <View style={styles.btnBgContent} pointerEvents="none">
          <Text style={styles.btnText} numberOfLines={1} pointerEvents="none">
            {title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function StatTile({ label, value, colors }) {
  return (
    <View style={styles.statTile}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 4 }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

function SmallPetChip({ fish, active, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ marginRight: 10 }}>
      <View style={[styles.petChip, active && styles.petChipActive]}>
        <Image source={fish.image} style={styles.petChipImg} resizeMode="contain" />
        <Text style={styles.petChipTxt} numberOfLines={1}>
          {fish.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function SwimmingAquarium({ fishItems, mood }) {
  const [layout, setLayout] = useState({ w: 0, h: 0 });
  const [swimmers, setSwimmers] = useState([]);
  const tickRef = useRef(null);

  // Определяем параметры движения в зависимости от настроения
  const getMovementParams = (moodLabel) => {
    switch (moodLabel) {
      case 'Critical':
        return { speedMultiplier: 0.3, bobSpeed: 0.3, directionChange: 0.01, yDrift: 0.2 }; // Очень медленно, вяло
      case 'Sick':
        return { speedMultiplier: 0.4, bobSpeed: 0.4, directionChange: 0.008, yDrift: 0.25 }; // Медленно
      case 'Hungry':
        return { speedMultiplier: 0.5, bobSpeed: 0.5, directionChange: 0.01, yDrift: 0.3 }; // Медленно, но активнее
      case 'Tired':
        return { speedMultiplier: 0.35, bobSpeed: 0.35, directionChange: 0.006, yDrift: 0.15 }; // Очень медленно
      case 'Dirty':
        return { speedMultiplier: 0.7, bobSpeed: 0.8, directionChange: 0.015, yDrift: 0.5 }; // Нерегулярно, дергается
      case 'Sleeping':
        return { speedMultiplier: 0.2, bobSpeed: 0.2, directionChange: 0.003, yDrift: 0.1 }; // Почти неподвижно
      case 'Happy':
        return { speedMultiplier: 1.5, bobSpeed: 1.2, directionChange: 0.012, yDrift: 0.8 }; // Быстро, энергично
      case 'Okay':
      default:
        return { speedMultiplier: 1.0, bobSpeed: 0.9, directionChange: 0.006, yDrift: 0.55 }; // Нормально
    }
  };

  const movementParams = getMovementParams(mood?.label || 'Okay');

  useEffect(() => {
    if (!layout.w || !layout.h) return;

    setSwimmers((prev) => {
      const prevMap = new Map(prev.map((s) => [s.id, s]));
      return (fishItems || []).slice(0, 3).map((f, idx) => {
        const existing = prevMap.get(f.id);
        if (existing) return { ...existing, image: f.image, active: !!f.active };

        const size = 140;
        const fromLeft = Math.random() > 0.5;

        return {
          id: f.id,
          image: f.image,
          active: !!f.active,
          size,
          x: fromLeft ? -size : layout.w,
          y: rand(10, Math.max(10, layout.h - size - 10)),
          dir: fromLeft ? 1 : -1,
          speed: (rand(0.9, 1.25) + idx * 0.08) * movementParams.speedMultiplier,
          bob: rand(0, 1000),
        };
      });
    });
  }, [fishItems, layout.w, layout.h]);

  useEffect(() => {
    if (!layout.w || !layout.h) return;
    if (tickRef.current) clearInterval(tickRef.current);

    tickRef.current = setInterval(() => {
      setSwimmers((prev) => {
        if (!prev.length) return prev;
        const w = layout.w;
        const h = layout.h;

        return prev.map((s) => {
          const size = s.size;
          const params = getMovementParams(mood?.label || 'Okay');

          let x = s.x + s.dir * (2.0 * s.speed);
          let dir = s.dir;

          if (x < -size) x = w;
          if (x > w) x = -size;

          if (Math.random() < params.directionChange) dir *= -1;

          const bob = s.bob + (0.9 * params.bobSpeed);
          const yDrift = Math.sin(bob / 20) * params.yDrift + (Math.random() - 0.5) * (params.yDrift * 0.6);
          const y = clamp(s.y + yDrift, 10, Math.max(10, h - size - 10));

          return { ...s, x, y, dir, bob };
        });
      });
    }, 16);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [layout.w, layout.h, mood?.label]);

  return (
    <View
      style={styles.swimWrap}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayout({ w: width, h: height });
      }}
    >
      {swimmers.map((s) => (
        <View
          key={s.id}
          pointerEvents="none"
          style={[
            styles.swimFish,
            {
              width: s.size,
              height: s.size,
              left: s.x,
              top: s.y,
              opacity: s.active ? 1 : 0.7,
              transform: [
                { scale: s.active ? 1.08 : 0.96 },
                // ✅ Рыба смотрит в направлении движения: dir=1 (вправо) -> scaleX=-1 (зеркалим), dir=-1 (влево) -> scaleX=1 (не зеркалим)
                { scaleX: s.dir === 1 ? -1 : 1 },
              ],
            },
          ]}
        >
          <Image source={s.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </View>
      ))}
    </View>
  );
}

export default function GameScreen({ onBack, coins: externalCoins, ownedFish: externalOwnedFish, onBuyFish, onCoinsChange }) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : insets.top + 10;

  const [save, setSave] = useState(() => makeDefaultSave());
  const [loaded, setLoaded] = useState(false);
  const [fishSelectModal, setFishSelectModal] = useState({ open: false });

  const [infoModal, setInfoModal] = useState({ open: false, fishId: null });
  const [toast, setToast] = useState({ open: false, title: '', msg: '' });

  const lastActionRef = useRef(0);
  const saveTimerRef = useRef(null);
  const tickRef = useRef(Date.now());
  const feedCountRef = useRef({ date: null, count: 0 }); // Для ограничения кормлений

  const activePet = useMemo(() => {
    const p = save.pets?.find((x) => x.id === save.activePetId) || save.pets?.[0];
    if (p && !p.stats) {
      p.stats = makeStats();
    }
    return p || null;
  }, [save.activePetId, save.pets]);

  const activeFish = useMemo(() => {
    const fishId = activePet?.fishId;
    return FISH_CATALOG.find((f) => f.id === fishId) || FISH_CATALOG[0];
  }, [activePet]);

  const mood = useMemo(() => moodFromStats(activePet?.stats), [activePet]);

  // Синхронизация coins с внешним источником
  useEffect(() => {
    if (externalCoins !== undefined && externalCoins !== save.coins) {
      setSave(prev => ({ ...prev, coins: externalCoins }));
    }
  }, [externalCoins, save.coins]);

  // Синхронизация ownedFish - проверяем, что все питомцы используют купленных рыб
  useEffect(() => {
    if (externalOwnedFish && Object.keys(externalOwnedFish).length > 0) {
      setSave(prev => {
        const next = { ...prev };
        // Фильтруем питомцев, оставляя только тех, у кого куплена рыба
        const validPets = (next.pets || []).filter(p => externalOwnedFish[p.fishId]);
        if (validPets.length === 0) {
          // Если нет валидных питомцев, создаем нового из первой купленной рыбы
          const firstOwnedFish = FISH_CATALOG.find(f => externalOwnedFish[f.id]);
          if (firstOwnedFish) {
            const petId = uid();
            validPets.push({ id: petId, fishId: firstOwnedFish.id, nickname: firstOwnedFish.name, stats: makeStats() });
            next.activePetId = petId;
          }
        } else {
          // Проверяем, что activePetId валиден
          if (!validPets.some(p => p.id === next.activePetId)) {
            next.activePetId = validPets[0].id;
          }
        }
        next.pets = validPets;
        return next;
      });
    }
  }, [externalOwnedFish]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!alive) return;

        if (raw) {
          const parsed = JSON.parse(raw);
          const safe = { ...makeDefaultSave(externalOwnedFish), ...parsed };

          // Фильтруем питомцев по ownedFish
          if (externalOwnedFish && Object.keys(externalOwnedFish).length > 0) {
            safe.pets = (safe.pets || []).filter(p => externalOwnedFish[p.fishId]);
            if (safe.pets.length === 0) {
              const firstOwnedFish = FISH_CATALOG.find(f => externalOwnedFish[f.id]);
              if (firstOwnedFish) {
                const petId = uid();
                safe.pets = [{ id: petId, fishId: firstOwnedFish.id, nickname: firstOwnedFish.name, stats: makeStats() }];
                safe.activePetId = petId;
              }
            }
          } else {
            safe.pets = Array.isArray(safe.pets) && safe.pets.length ? safe.pets : makeDefaultSave(externalOwnedFish).pets;
          }

          if (!safe.activePetId || !safe.pets.some((p) => p.id === safe.activePetId)) safe.activePetId = safe.pets[0]?.id;

          // Убеждаемся, что у каждого питомца есть stats
          safe.pets = safe.pets.map((p) => ({
            ...p,
            stats: p.stats && typeof p.stats === 'object' ? p.stats : makeStats(),
          }));

          const now = Date.now();
          const dtSec = Math.min(MAX_DT_SEC, Math.max(0, (now - (safe.lastTs || now)) / 1000));
          safe.pets = safe.pets.map((p) => ({ ...p, stats: tickOne(p.stats || makeStats(), dtSec) }));
          safe.lastTs = now;

          setSave(safe);
          tickRef.current = now;
        } else {
          const defaultSave = makeDefaultSave();
          setSave(defaultSave);
          tickRef.current = Date.now();
        }
      } catch (e) {
        tickRef.current = Date.now();
      } finally {
        if (alive) setLoaded(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const payload = { ...save, lastTs: Date.now() };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) { }
    }, 650);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [save, loaded]);

  useEffect(() => {
    if (!loaded) return;

    const id = setInterval(() => {
      const now = Date.now();
      const dtSec = Math.min(MAX_DT_SEC, Math.max(0, (now - tickRef.current) / 1000));
      tickRef.current = now;
      if (dtSec <= 0) return;

      setSave((prev) => {
        const next = { ...prev, lastTs: now };
        next.pets = (next.pets || []).map((p) => ({ ...p, stats: tickOne(p.stats, dtSec) }));

        const ap = next.pets.find((p) => p.id === next.activePetId) || next.pets[0];
        const m = moodFromStats(ap?.stats);
        const good = m.label === 'Happy' || m.label === 'Okay';

        if (good && ap?.stats?.health > 0) {
          const prog = (next.coinProgress || 0) + COINS_PER_GOOD_TICK * dtSec;
          const add = Math.floor(prog);
          next.coinProgress = prog - add;
          const newCoins = Math.max(0, (next.coins || 0) + add);
          next.coins = newCoins;
        }
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [loaded]);

  // Синхронизация coins с родительским компонентом
  useEffect(() => {
    if (onCoinsChange && save.coins !== undefined) {
      const timeoutId = setTimeout(() => {
        onCoinsChange(save.coins);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [save.coins, onCoinsChange]);

  const setActivePet = useCallback((petId) => {
    setSave((prev) => {
      if (!prev.pets?.some((p) => p.id === petId)) return prev;
      return { ...prev, activePetId: petId };
    });
  }, []);

  const doAction = useCallback((kind) => {
    console.log('=== doAction called ===', kind);
    const now = Date.now();
    if (now - lastActionRef.current < ACTION_COOLDOWN_MS) {
      console.log('Action cooldown active');
      return;
    }
    lastActionRef.current = now;

    // Проверка ограничения на кормление
    if (kind === 'feed') {
      const today = new Date().toDateString();
      if (feedCountRef.current.date !== today) {
        feedCountRef.current = { date: today, count: 0 };
      }
      if (feedCountRef.current.count >= MAX_FEEDS_PER_DAY) {
        setToast({ open: true, title: 'Limit reached', msg: `You can only feed ${MAX_FEEDS_PER_DAY} times per day.` });
        return;
      }
    }

    setSave((prev) => {
      const next = { ...prev };
      const pets = [...(next.pets || [])];
      const idx = pets.findIndex((p) => p.id === next.activePetId);

      if (idx < 0) {
        console.log('Pet not found');
        return prev;
      }

      const p = { ...pets[idx] };
      const s = p.stats ? { ...p.stats } : makeStats();

      console.log('Before action - sleeping:', s.sleeping, 'stats:', s);

      // Применяем действия
      if (kind === 'feed') {
        if (!s.sleeping) {
          s.hunger = clamp(s.hunger + 26, 0, 100);
          s.happiness = clamp(s.happiness + 5, 0, 100);
          s.health = clamp(s.health + 2, 0, 100);
          feedCountRef.current.count++;
          console.log('Feed applied - new hunger:', s.hunger, 'feeds today:', feedCountRef.current.count);
        } else {
          console.log('Feed blocked - fish is sleeping');
          return prev;
        }
      }

      if (kind === 'play') {
        if (!s.sleeping) {
          s.happiness = clamp(s.happiness + 20, 0, 100);
          s.energy = clamp(s.energy - 10, 0, 100);
          s.hunger = clamp(s.hunger - 6, 0, 100);
          console.log('Play applied - new happiness:', s.happiness);
        } else {
          console.log('Play blocked - fish is sleeping');
        }
      }

      if (kind === 'clean') {
        if (!s.sleeping) {
          s.cleanliness = clamp(s.cleanliness + 30, 0, 100);
          s.happiness = clamp(s.happiness + 4, 0, 100);
          console.log('Clean applied - new cleanliness:', s.cleanliness);
        } else {
          console.log('Clean blocked - fish is sleeping');
        }
      }

      if (kind === 'sleep') {
        s.sleeping = !s.sleeping;
        console.log('Sleep toggled - new sleeping:', s.sleeping);
      }

      p.stats = s;
      pets[idx] = p;

      next.pets = pets;
      const newCoins = Math.max(0, (next.coins || 0) + ACTION_COIN_BONUS);
      next.coins = newCoins;

      console.log('After action - new stats:', s, 'coins:', newCoins);
      return next;
    });

    // Синхронизируем coins с родительским компонентом после обновления состояния
    if (kind !== 'sleep' && onCoinsChange) {
      setTimeout(() => {
        setSave(prev => {
          if (onCoinsChange && prev.coins !== undefined) {
            onCoinsChange(prev.coins);
          }
          return prev;
        });
      }, 0);
    }
  }, [onCoinsChange]);

  const openFishInfo = useCallback((fishId) => setInfoModal({ open: true, fishId }), []);

  const buyInfo = useCallback((fishId) => {
    const fish = FISH_CATALOG.find((f) => f.id === fishId);
    if (!fish) return;
    const cost = priceInfo(fish);

    setSave((prev) => {
      const unlocked = new Set(prev.unlockedInfo || []);
      if (unlocked.has(fishId)) return prev;
      if ((prev.coins || 0) < cost) return prev;

      unlocked.add(fishId);
      return { ...prev, coins: (prev.coins || 0) - cost, unlockedInfo: Array.from(unlocked) };
    });

    setToast({ open: true, title: 'Unlocked', msg: `You bought info about ${fish.name}.` });
  }, []);

  // Упрощенные условия - кнопки активны если есть питомец
  const hasPet = !!activePet?.stats;
  const isSleeping = !!activePet?.stats?.sleeping;

  const canFeed = hasPet && !isSleeping;
  const canPlay = hasPet && !isSleeping;
  const canClean = hasPet && !isSleeping;
  const canSleep = hasPet;

  console.log('Button states:', {
    canFeed,
    canPlay,
    canClean,
    canSleep,
    hasPet,
    isSleeping,
    activePetId: activePet?.id,
    stats: activePet?.stats
  });

  return (
    <>
      <SafeAreaView style={styles.root} edges={[]}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <ImageBackground source={BG} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              { paddingTop: 20, paddingBottom: insets.bottom + 48 },
            ]}
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentInsetAdjustmentBehavior="never"
            bounces={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onBack} activeOpacity={0.9} style={styles.backBtn}>
                <Image source={require('../assets/back.png')} style={styles.backIcon} resizeMode="contain" />
              </TouchableOpacity>

              <View style={styles.headerMid}>
                <Text style={styles.headerTitle}>Fish Tamagotchi</Text>
              </View>

              <View style={styles.coinsPill}>
                <Text style={styles.coinsTxt}>{save.coins || 0}</Text>
              </View>
            </View>

            <IceCard style={{ padding: 14 }}>
              <View style={styles.aquaTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fishName} numberOfLines={1}>
                    {activePet?.nickname || activeFish?.name || 'Fish'}
                  </Text>
                  <Text style={styles.fishSub} numberOfLines={1}>
                    {activeFish?.name} • {mood.label}
                  </Text>
                </View>

                <View style={[styles.moodPill, { backgroundColor: mood.color + '20', borderColor: mood.color + '40' }]}>
                  <Text style={[styles.moodTxt, { color: mood.color }]}>
                    {mood.label}
                  </Text>
                </View>
              </View>

              {/* Aquarium */}
              <View style={styles.aquarium}>
                <LinearGradient
                  colors={['rgba(77,214,255,0.20)', 'rgba(255,255,255,0.96)']}
                  start={{ x: 0.2, y: 0.05 }}
                  end={{ x: 0.8, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.waterLine} />

                <View style={styles.fishStage}>
                  <SwimmingAquarium
                    fishItems={(save.pets || [])
                      .slice(0, 3)
                      .map((p) => {
                        const f = FISH_CATALOG.find((x) => x.id === p.fishId);
                        if (!f) return null;
                        return { id: p.id, image: f.image, active: p.id === save.activePetId };
                      })
                      .filter(Boolean)}
                    mood={mood}
                  />
                </View>

                <View style={styles.hintPill}>
                  <Text style={styles.aquaHint}>Feed • Clean • Play • Sleep</Text>
                </View>
              </View>

              {/* Pets row */}
              <View style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={styles.sectionTitle}>Your fish</Text>
                  <TouchableOpacity
                    onPress={() => setFishSelectModal({ open: true })}
                    style={styles.addFishBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addFishBtnText}>+ Add Fish</Text>
                  </TouchableOpacity>
                </View>
                {save.pets?.length ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                    {save.pets.map((p) => {
                      const f = FISH_CATALOG.find((x) => x.id === p.fishId);
                      if (!f) return null;
                      return <SmallPetChip key={p.id} fish={f} active={p.id === save.activePetId} onPress={() => setActivePet(p.id)} />;
                    })}
                    <View style={{ width: 4 }} />
                  </ScrollView>
                ) : (
                  <Text style={styles.noFishText}>No fish yet. Buy one in Store!</Text>
                )}
              </View>
            </IceCard>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <StatTile label="Hunger" value={`${Math.round(activePet?.stats?.hunger ?? 0)}%`} colors={['#FFFFFF', '#FFFFFF']} />
              <StatTile label="Health" value={`${Math.round(activePet?.stats?.health ?? 0)}%`} colors={['#FFFFFF', '#FFFFFF']} />
              <StatTile label="Clean" value={`${Math.round(activePet?.stats?.cleanliness ?? 0)}%`} colors={['#FFFFFF', '#FFFFFF']} />
              <StatTile label="Energy" value={`${Math.round(activePet?.stats?.energy ?? 0)}%`} colors={['#FFFFFF', '#FFFFFF']} />
            </View>

            {/* Actions */}
            <View style={{ marginTop: 12, marginBottom: 20 }}>
              <IceCard style={{ padding: 14, marginBottom: 0 }}>
                <Text style={styles.sectionTitle}>Actions</Text>
              </IceCard>

              <View style={[styles.actionsRow, { marginTop: 12, marginBottom: -5 }]}>
                <PngButton title="Feed" onPress={() => doAction('feed')} disabled={!hasPet || isSleeping} style={{ flex: 1 }} />
                <PngButton title="Play" onPress={() => doAction('play')} disabled={!hasPet || isSleeping} style={{ flex: 1 }} />
              </View>

              <View style={[styles.actionsRow, { marginTop: 20, marginBottom: 0 }]}>
                <GradientBtn title="Clean" onPress={() => doAction('clean')} disabled={!hasPet || isSleeping} colors={[]} style={{ flex: 1 }} />
                <GradientBtn
                  title={activePet?.stats?.sleeping ? 'Wake' : 'Sleep'}
                  onPress={() => doAction('sleep')}
                  disabled={!hasPet}
                  colors={[]}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>

      {/* Fish Selection Modal */}
      <Modal
        visible={fishSelectModal.open}
        transparent
        animationType="fade"
        onRequestClose={() => setFishSelectModal({ open: false })}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setFishSelectModal({ open: false })}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <View style={styles.modalTop}>
                <Text style={styles.modalTitle}>Select Fish</Text>
                <TouchableOpacity onPress={() => setFishSelectModal({ open: false })} activeOpacity={0.9}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 400 }}>
                {FISH_CATALOG.map((fish) => {
                  const isOwned = externalOwnedFish?.[fish.id];
                  const isAlreadyPet = save.pets?.some(p => p.fishId === fish.id);
                  const canAdd = isOwned && !isAlreadyPet && (save.pets?.length || 0) < MAX_PETS;

                  return (
                    <TouchableOpacity
                      key={fish.id}
                      style={[styles.fishSelectItem, !canAdd && styles.fishSelectItemDisabled]}
                      onPress={() => {
                        if (canAdd) {
                          const petId = uid();
                          setSave(prev => ({
                            ...prev,
                            pets: [...(prev.pets || []), { id: petId, fishId: fish.id, nickname: fish.name, stats: makeStats() }],
                            activePetId: petId,
                          }));
                          setFishSelectModal({ open: false });
                        }
                      }}
                      disabled={!canAdd}
                    >
                      <Image source={fish.image} style={styles.fishSelectImage} resizeMode="contain" />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.fishSelectName}>{fish.name}</Text>
                        {!isOwned && <Text style={styles.fishSelectStatus}>Not owned - Buy in Store</Text>}
                        {isOwned && isAlreadyPet && <Text style={styles.fishSelectStatus}>Already added</Text>}
                        {canAdd && <Text style={styles.fishSelectStatus}>Tap to add</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modals outside SafeAreaView to cover full screen including status bar */}
      <Modal
        visible={infoModal.open}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModal({ open: false, fishId: null })}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setInfoModal({ open: false, fishId: null })}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              {(() => {
                const fish = FISH_CATALOG.find((f) => f.id === infoModal.fishId);
                if (!fish) return null;

                const unlocked = (save.unlockedInfo || []).includes(fish.id);
                const cost = priceInfo(fish);

                return (
                  <>
                    <View style={styles.modalTop}>
                      <Text style={styles.modalTitle}>{fish.name}</Text>
                      <TouchableOpacity onPress={() => setInfoModal({ open: false, fishId: null })} activeOpacity={0.9}>
                        <Text style={styles.modalClose}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    <Image source={fish.image} style={styles.modalFishImg} resizeMode="contain" />

                    {!unlocked ? (
                      <>
                        <Text style={styles.lockedTxt}>🔒 Locked entry</Text>
                        <Text style={styles.lockedTxt}>Cost: {cost}</Text>

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                          <View style={{ flex: 1 }}>
                            <GradientBtn
                              title={`Buy (${cost})`}
                              onPress={() => buyInfo(fish.id)}
                              disabled={(save.coins || 0) < cost}
                              colors={['#BBF7D0', '#FFFFFF']}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <GradientBtn title="Close" onPress={() => setInfoModal({ open: false, fishId: null })} disabled={false} colors={['#E5E7EB', '#FFFFFF']} />
                          </View>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.lockedTxt}>✅ Unlocked (you can show details here later)</Text>
                    )}
                  </>
                );
              })()}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={toast.open}
        transparent
        animationType="fade"
        onRequestClose={() => setToast({ open: false, title: '', msg: '' })}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setToast({ open: false, title: '', msg: '' })}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.toastWrap}>
            <View style={{ padding: 16 }}>
              <View style={styles.toastCard}>
                <Text style={styles.toastTitle}>{toast.title}</Text>
                <Text style={styles.toastMsg}>{toast.msg}</Text>
                <TouchableOpacity onPress={() => setToast({ open: false, title: '', msg: '' })} activeOpacity={0.9} style={{ marginTop: 10 }}>
                  <Text style={styles.toastOk}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  bg: { flex: 1, backgroundColor: 'transparent' },
  bgImage: { width: '120%', height: '120%', left: '-10%', top: '-10%' },
  scrollView: { flex: 1, backgroundColor: 'transparent' },
  scroll: {
    paddingHorizontal: 16,
    flexGrow: 1,
    backgroundColor: 'transparent',
  },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F6F8FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#0B1A2A',
  },
  headerMid: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
  },
  headerTitle: { color: BLACK, fontSize: 16, fontWeight: '900', fontFamily: FONT_FAMILY },

  coinsPill: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
  },
  coinsTxt: { color: BLACK, fontWeight: '900', fontFamily: FONT_FAMILY },

  card: {
    marginTop: 12,
    borderRadius: 18,
    padding: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
    overflow: 'hidden',
  },

  aquaTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  fishName: { color: BLACK, fontSize: 18, fontWeight: '900', fontFamily: FONT_FAMILY },
  fishSub: { color: BLACK, marginTop: 4, fontWeight: '700', fontFamily: FONT_FAMILY },

  moodPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
  },
  moodTxt: { color: BLACK, fontWeight: '900', fontFamily: FONT_FAMILY },

  aquarium: {
    marginTop: 12,
    borderRadius: 18,
    height: 240,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
    overflow: 'hidden',
  },
  waterLine: { position: 'absolute', left: 0, right: 0, top: 44, height: 1, backgroundColor: 'rgba(0,0,0,0.10)' },

  fishStage: { flex: 1, position: 'relative', paddingHorizontal: 8, paddingTop: 10 },

  hintPill: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  aquaHint: { color: BLACK, fontWeight: '800', fontFamily: FONT_FAMILY, fontSize: 13 },

  sectionTitle: { color: BLACK, fontSize: 16, fontWeight: '900', fontFamily: FONT_FAMILY },

  petChip: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
  },
  petChipActive: { backgroundColor: 'rgba(0,0,0,0.08)' },
  petChipImg: { width: 32, height: 32 },
  petChipTxt: { color: BLACK, fontWeight: '900', fontFamily: FONT_FAMILY, maxWidth: 120 },

  statsGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statTile: {
    width: '48.6%',
    minHeight: 70,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statLabel: {
    color: BLACK,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  statValue: {
    color: BLACK,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    lineHeight: 22,
    marginTop: 4,
    paddingBottom: 2,
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Buttons
  btnPressable: {
    height: BTN_HIT_H,
    minHeight: BTN_HIT_H,
    maxHeight: BTN_HIT_H,
    borderRadius: 18,
    overflow: 'visible',
    width: '100%',
    margin: 0,

    padding: 0,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressableSmall: {
    height: BTN_HIT_H,
    minHeight: BTN_HIT_H,
    maxHeight: BTN_HIT_H,
    borderRadius: 18,
    overflow: 'visible',
    width: '100%',
    margin: 0,
    padding: 0,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBgWrapper: {
    width: '100%',
    height: BTN_H,
    position: 'absolute',
    top: (BTN_HIT_H - BTN_H) / 2,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  btnBgWrapperSmall: {
    width: '100%',
    height: BTN_H,
    position: 'absolute',
    top: (BTN_HIT_H - BTN_H) / 2,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  btnBgImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  btnBgContent: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 1,
    pointerEvents: 'none',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: -18,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },

  // Swim
  swimWrap: { flex: 1, width: '100%', height: '100%', position: 'relative' },
  swimFish: { position: 'absolute' },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalWrap: { justifyContent: 'center', alignItems: 'center', width: '100%' },
  modalCard: { width: '92%', borderRadius: 18, padding: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)' },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: BLACK, fontWeight: '900', fontFamily: FONT_FAMILY, fontSize: 18 },
  modalClose: { color: BLACK, fontWeight: '900', fontSize: 18 },
  modalFishImg: { width: '100%', height: 160, marginTop: 10 },
  lockedTxt: { marginTop: 8, color: BLACK, fontWeight: '800', fontFamily: FONT_FAMILY },

  toastWrap: { justifyContent: 'flex-end', width: '100%', flex: 1 },
  toastCard: { borderRadius: 18, padding: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)' },
  toastTitle: { color: BLACK, fontWeight: '900', fontFamily: FONT_FAMILY, fontSize: 16 },
  toastMsg: { marginTop: 6, color: BLACK, fontWeight: '800', fontFamily: FONT_FAMILY },
  toastOk: { color: BLACK, fontWeight: '900', fontFamily: FONT_FAMILY, fontSize: 14 },

  // Fish selection
  addFishBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(77,214,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(77,214,255,0.3)',
  },
  addFishBtnText: {
    color: '#0B1A2A',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  noFishText: {
    color: '#516273',
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    marginTop: 10,
    textAlign: 'center',
  },
  fishSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F6F8FC',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  fishSelectItemDisabled: {
    opacity: 0.5,
  },
  fishSelectImage: {
    width: 50,
    height: 50,
  },
  fishSelectName: {
    color: '#0B1A2A',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: FONT_FAMILY,
  },
  fishSelectStatus: {
    color: '#516273',
    fontSize: 12,
    fontFamily: FONT_FAMILY,
    marginTop: 2,
  },
});
