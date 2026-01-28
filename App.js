// App.js — Idle Fishing Tamagotchi (Trips/Routes version)
import 'react-native-gesture-handler'; // обязательно первой строкой

import React, { useEffect, useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

/* ── Splash / Onboarding ── */
import Loader from './Components/Loader';
import Onboarding from './Components/Onboarding';

/* ── Custom Tab Bar ── */
import CustomTabBar from './Components/CustomTabBar';

/* ── ICE FISHING: Trips/Routes flow (без карт и ключей) ── */
import TripsHomeScreen from './Components/TripsHomeScreen';          // главный: Trips + Saved Spots
import CreateTripScreen from './Components/CreateTripScreen';        // создание поездки
import TripDetailsScreen from './Components/TripDetailsScreen';      // детали поездки + таймлайн
import ChecklistScreen from './Components/ChecklistScreen';          // чеклист снаряжения/безопасности
import SavedSpotsScreen from './Components/SavedSpotsScreen';        // интересные места (каталог карточками)

/* ── Logbook / Stats / Quiz (можно в одном экране) ── */
import LogbookScreen from './Components/LogbookScreen';

/* ── Mini Game flow ── */
import IceGameScreenNew from './Components/IceGameScreenNew';
import IceGameHistoryScreen from './Components/IceGameHistoryScreen';

/* ── Profile ── */
import ProfileScreen from './Components/ProfileScreen';

/* ── Details ── */
import SpotDetailsScreen from './Components/SpotDetailsScreen';      // детали места (без карты)

/* ── Theme ── */
const IceHookTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#07121B',
    card: '#0A1926',
    text: '#E8ECF1',
    border: '#1C3342',
    primary: '#4DD6FF',
    notification: '#7CFFCC',
  },
};

const PALETTE = {
  bg: '#07121B',
  card: '#0A1926',
  text: '#E8ECF1',
  dim: '#8A96B2',
  ice: '#4DD6FF',
  aurora: '#7CFFCC',
  danger: '#FF4D8C',
};

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ── Trips stack ── */
const TripsStack = createNativeStackNavigator();
function TripsFlow() {
  return (
    <TripsStack.Navigator screenOptions={{ headerShown: false }}>
      <TripsStack.Screen name="TripsHomeScreen" component={TripsHomeScreen} />
      <TripsStack.Screen name="CreateTripScreen" component={CreateTripScreen} />
      <TripsStack.Screen name="TripDetailsScreen" component={TripDetailsScreen} />
      <TripsStack.Screen name="ChecklistScreen" component={ChecklistScreen} />
      <TripsStack.Screen name="SavedSpotsScreen" component={SavedSpotsScreen} />
      {/* Детали места можно открывать и внутри стэка, и через RootStack — как удобнее */}
      <TripsStack.Screen name="SpotDetails" component={SpotDetailsScreen} />
    </TripsStack.Navigator>
  );
}

/* ── Game stack ── */
const GameStack = createNativeStackNavigator();
function GameFlow() {
  return (
    <GameStack.Navigator screenOptions={{ headerShown: false }}>
      <GameStack.Screen name="IceGameScreen" component={IceGameScreenNew} />
      <GameStack.Screen name="IceGameHistoryScreen" component={IceGameHistoryScreen} />
    </GameStack.Navigator>
  );
}

/* ── Bottom Tabs ──
   ВАЖНО: названия route оставлены как в zip, чтобы CustomTabBar работал без правок.
*/
function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Training"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          colors={{
            bg: PALETTE.bg,
            card: PALETTE.card,
            primary: PALETTE.ice,
            success: PALETTE.aurora,
            danger: PALETTE.danger,
            text: PALETTE.text,
            dim: PALETTE.dim,
          }}
        />
      )}
    >
      {/* Training = Trips / Routes */}
      <Tab.Screen name="Training" component={TripsFlow} options={{ title: 'Trips' }} />

      {/* Leaderboard = Logbook / Stats / Quiz */}
      <Tab.Screen name="Leaderboard" component={LogbookScreen} options={{ title: 'Logbook' }} />

      {/* Timer = Mini Game */}
      <Tab.Screen name="Timer" component={GameFlow} options={{ title: 'Games' }} />

      {/* Profile = Profile/Settings */}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [bootDone, setBootDone] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // как в zip: Loader ~10s
    const t = setTimeout(() => {
      setIsLoading(false);
      setBootDone(true);
    }, 10000);
    return () => clearTimeout(t);
  }, []);

  const handleOnboardingComplete = () => setShowOnboarding(false);

  if (!bootDone || isLoading) return <Loader />;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <StatusBar barStyle="light-content" backgroundColor={PALETTE.bg} />
      <NavigationContainer theme={IceHookTheme}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {showOnboarding ? (
            <RootStack.Screen name="Onboarding">
              {(props) => (
                <Onboarding
                  {...props}
                  onComplete={handleOnboardingComplete}
                  palette={PALETTE}
                />
              )}
            </RootStack.Screen>
          ) : (
            <>
              <RootStack.Screen name="Main" component={BottomTabs} />
              {/* Если хочешь открывать SpotDetails поверх табов из любого места */}
              <RootStack.Screen name="SpotDetails" component={SpotDetailsScreen} />
            </>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
