// Constants/gameConstants.js
// Константы для игры IdleFishCare: Fish Catch

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Assets
export const BG = require('../assets/onb_bg.png');
export const BUTTON_BG = require('../assets/button.png');
export const ROD = require('../assets/rod.png');
export const HOOK = require('../assets/hook.png');

// Fish images
export const FISH_IMAGES = {
  perch: require('../assets/Perch.png'),
  pike: require('../assets/Pike.png'),
  trout: require('../assets/Trout.png'),
  zander: require('../assets/Zander.png'),
  whitefish: require('../assets/Whitefish.png'),
  burbot: require('../assets/Burbot.png'),
  roach: require('../assets/Roach.png'),
  carp: require('../assets/Carp.png'),
  salmon: require('../assets/Salmon.png'),
  grayling: require('../assets/Grayling.png'),
};

export const FONT_FAMILY = 'TitanOne-Regular';

export const COLORS = {
  bg: '#07121B',
  card: 'rgba(10,25,38,0.95)',
  card2: 'rgba(10,25,38,0.78)',
  line: 'rgba(77,214,255,0.16)',
  line2: 'rgba(124,255,204,0.16)',
  text: '#E8ECF1',
  muted: 'rgba(232,236,241,0.70)',
  cyan: '#4DD6FF',
  mint: '#7CFFCC',
  danger: '#EF4444',
  overlay: 'rgba(0,0,0,0.65)',
  ice: 'rgba(200,230,255,0.12)',
};

// FISH CATALOG
export const FISH_CATALOG = [
  {
    id: 'perch',
    name: 'Perch',
    image: FISH_IMAGES.perch,
    basePrice: 4,
    habitat: 'Shallow waters, weed beds, near structures',
    size: '15-30 cm',
    weight: '0.2-0.8 kg',
    behavior: 'Active during day, schools near bottom',
    bestBait: 'Small jigs, maggots, worms',
    funFact: 'Perch have sharp spines on their dorsal fin - handle with care!',
    depth: '1-5 meters',
    temperature: '0-15°C',
    season: 'Year-round, best in winter',
    difficulty: 'Easy',
    tips: 'Look for schools near structures. Use small, subtle movements.',
    diet: 'Small fish, insects, crustaceans',
    lifespan: 'Up to 10 years',
  },
  {
    id: 'pike',
    name: 'Pike',
    image: FISH_IMAGES.pike,
    basePrice: 12,
    habitat: 'Deep waters, reed beds, ambush points',
    size: '40-100 cm',
    weight: '1-8 kg',
    behavior: 'Predator, ambush hunter, active at dawn/dusk',
    bestBait: 'Large spoons, deadbait, flashy lures',
    funFact: 'Pike can grow up to 1.5 meters and live over 20 years!',
    depth: '2-8 meters',
    temperature: '0-18°C',
    season: 'Year-round, peak in late winter',
    difficulty: 'Medium',
    tips: 'Target ambush points. Use large, flashy lures with aggressive movements.',
    diet: 'Fish, frogs, small mammals',
    lifespan: 'Up to 25 years',
  },
  {
    id: 'trout',
    name: 'Trout',
    image: FISH_IMAGES.trout,
    basePrice: 10,
    habitat: 'Clean, oxygen-rich water, currents',
    size: '25-50 cm',
    weight: '0.5-3 kg',
    behavior: 'Sensitive to water quality, active in morning',
    bestBait: 'Small spoons, waxworms, shrimp',
    funFact: 'Trout can detect vibrations in water from great distances!',
    depth: '2-6 meters',
    temperature: '4-16°C',
    season: 'Year-round, best in cold months',
    difficulty: 'Medium-Hard',
    tips: 'Quiet approach is essential. Use natural baits and light tackle.',
    diet: 'Insects, small fish, crustaceans',
    lifespan: 'Up to 7 years',
  },
  {
    id: 'zander',
    name: 'Zander',
    image: FISH_IMAGES.zander,
    basePrice: 11,
    habitat: 'Deep water, hard bottom, structure',
    size: '30-70 cm',
    weight: '1-5 kg',
    behavior: 'Low light hunter, vertical jigging works best',
    bestBait: 'Soft plastics, vertical jigs',
    funFact: 'Zander have excellent night vision and are most active after sunset!',
    depth: '3-10 meters',
    temperature: '2-20°C',
    season: 'Year-round, best in winter',
    difficulty: 'Hard',
    tips: 'Fish during low light conditions. Vertical jigging near structure is key.',
    diet: 'Small fish, mainly roach and perch',
    lifespan: 'Up to 17 years',
  },
  {
    id: 'whitefish',
    name: 'Whitefish',
    image: FISH_IMAGES.whitefish,
    basePrice: 5,
    habitat: 'Mid-water, suspended, open areas',
    size: '20-40 cm',
    weight: '0.4-1.5 kg',
    behavior: 'Suspended feeding, slow steady presentation',
    bestBait: 'Tiny jigs, small flies, subtle glow',
    funFact: 'Whitefish are schooling fish - where you find one, there are many!',
    depth: '5-15 meters',
    temperature: '0-12°C',
    season: 'Winter and early spring',
    difficulty: 'Medium',
    tips: 'Find the school depth. Use subtle, slow movements with small baits.',
    diet: 'Zooplankton, small insects, larvae',
    lifespan: 'Up to 12 years',
  },
  {
    id: 'burbot',
    name: 'Burbot',
    image: FISH_IMAGES.burbot,
    basePrice: 18,
    habitat: 'Deep bottom, cold water, dark areas',
    size: '30-80 cm',
    weight: '1-6 kg',
    behavior: 'Night feeder, bottom dweller, peak after sunset',
    bestBait: 'Smelly baits, dead fish strips, heavy jigging',
    funFact: 'Burbot is the only freshwater cod species - they love the cold!',
    depth: '5-20 meters',
    temperature: '0-10°C',
    season: 'Winter, especially January-February',
    difficulty: 'Hard',
    tips: 'Fish at night near bottom. Strong-smelling baits work best.',
    diet: 'Fish, crayfish, insects, worms',
    lifespan: 'Up to 20 years',
  },
  {
    id: 'roach',
    name: 'Roach',
    image: FISH_IMAGES.roach,
    basePrice: 3,
    habitat: 'Shallow areas, schools, near vegetation',
    size: '10-25 cm',
    weight: '0.1-0.5 kg',
    behavior: 'Schooling, sensitive bite, watch line carefully',
    bestBait: 'Bread, worms, micro-jigs',
    funFact: 'Roach can survive in very low oxygen conditions!',
    depth: '1-4 meters',
    temperature: '0-20°C',
    season: 'Year-round',
    difficulty: 'Easy',
    tips: 'Light tackle and small baits. Watch for subtle bites carefully.',
    diet: 'Algae, insects, small crustaceans, plant matter',
    lifespan: 'Up to 14 years',
  },
  {
    id: 'carp',
    name: 'Carp',
    image: FISH_IMAGES.carp,
    basePrice: 14,
    habitat: 'Deep holes, soft bottom, slow currents',
    size: '40-90 cm',
    weight: '2-15 kg',
    behavior: 'Winter carp are slow - patience is key',
    bestBait: 'Sweet corn, dough, small boilies',
    funFact: 'Carp can live over 50 years and grow to massive sizes!',
    depth: '3-12 meters',
    temperature: '4-25°C',
    season: 'Year-round, slower in winter',
    difficulty: 'Medium-Hard',
    tips: 'Patience is essential. Pre-baiting helps. Use sweet, aromatic baits.',
    diet: 'Plants, insects, crustaceans, small fish',
    lifespan: 'Up to 50+ years',
  },
  {
    id: 'salmon',
    name: 'Salmon',
    image: FISH_IMAGES.salmon,
    basePrice: 20,
    habitat: 'Currents, oxygen-rich zones, deep runs',
    size: '50-100 cm',
    weight: '2-8 kg',
    behavior: 'Strong runs, keep drag smooth, maintain tension',
    bestBait: 'Spoons, streamers, bright lures',
    funFact: 'Salmon can jump up to 3 meters out of water!',
    depth: '4-15 meters',
    temperature: '2-18°C',
    season: 'Year-round, best in cold months',
    difficulty: 'Very Hard',
    tips: 'Strong tackle required. Fish in current. Bright, flashy lures attract them.',
    diet: 'Small fish, insects, crustaceans',
    lifespan: 'Up to 13 years',
  },
  {
    id: 'grayling',
    name: 'Grayling',
    image: FISH_IMAGES.grayling,
    basePrice: 8,
    habitat: 'Currents, gravel bottom, clean water',
    size: '20-40 cm',
    weight: '0.3-1.5 kg',
    behavior: 'Light bite, gentle hook set, short lifts work',
    bestBait: 'Small flies, larvae, tiny spoons',
    funFact: 'Grayling have a beautiful sail-like dorsal fin!',
    depth: '2-6 meters',
    temperature: '4-16°C',
    season: 'Year-round, best in winter',
    difficulty: 'Medium',
    tips: 'Gentle presentation is key. Use light tackle and small baits.',
    diet: 'Insects, larvae, small crustaceans',
    lifespan: 'Up to 7 years',
  },
];

// Game constants
export const GAME_AREA_WIDTH = SCREEN_WIDTH - 32;
export const GAME_AREA_HEIGHT = 400;
export const HOOK_SIZE = 24;
export const FISH_SIZE = 100;
export const ROD_X = SCREEN_WIDTH / 2 - 100;
export const ROD_Y = -10;
export const ROD_WIDTH = 240;
export const ROD_HEIGHT = 440;
export const GAME_AREA_TOP_OFFSET = 180;

export const INITIAL_HOOK_SPEED = 3;
export const INITIAL_FISH_SPEED = 2;
export const MAX_HOOK_SPEED = 8;
export const MAX_FISH_SPEED = 6;
export const SPEED_INCREASE = 0.2;

export { SCREEN_WIDTH, SCREEN_HEIGHT };
