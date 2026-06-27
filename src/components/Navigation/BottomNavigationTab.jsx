import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Screens
import HomeScreen from '../../screen/HomeScreen';
import SettingScreen from '../../screen/SettingScreen';
import DemoScreen from '../../screen/DemoScreen';
import ScanQRCodeScreen from '../../screen/ScanQRCodeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// import AttendanceScreen from '../../screen/AttendanceScreen';
// import VisitScreen from '../../screen/VisitScreen';
// import ProfileScreen from '../../screen/ProfileScreen';
// import Demo from '../../screen/AtteendanceReport';


const BottomTab = createBottomTabNavigator();

const SCREENS = {
  Home: {
    component: HomeScreen,
    label: 'Home',
    icon: 'home',
  },
  QRScan: {
    component: ScanQRCodeScreen,
    label: 'Customer List',
    icon: 'list',
  },
  Setting: {
    component: SettingScreen,
    label: 'Settings',
    icon: 'settings',
  },
  // Demo: {
  //   component: DemoScreen,
  //   label: 'Demo',
  //   icon: 'list',
  // },
  // Visit: {
  //   component: VisitScreen,
  //   label: 'Visit',
  //   icon: 'location',
  // },
  // Demo: {
  //   component: Demo,
  //   label: 'Report',
  //   icon: 'list',
  // },
  // Profile: {
  //   component: ProfileScreen,
  //   label: 'Profile',
  //   icon: 'person-circle',
  // },
};

const BottomNavigationTab = () => {

  const insets = useSafeAreaInsets();

  return (

    <SafeAreaProvider>
      <BottomTab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            paddingBottom: insets.bottom,
            height: 60 + (insets.bottom || 0), // 🔥 main fix
            backgroundColor: '#fff',
            borderTopWidth: 0.5,
            borderTopColor: '#e0e0e0',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginBottom: 4,
          },
          tabBarIcon: ({ focused, color, size }) => {
            const screenConfig = SCREENS[route.name];
            if (!screenConfig) return null;

            const iconName = focused
              ? screenConfig.icon
              : `${screenConfig.icon}-outline`;

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        {Object.entries(SCREENS).map(([name, config]) => (
          <BottomTab.Screen
            key={name}
            name={name}
            component={config.component}
            options={{
              title: config.label,
            }}
          />
        ))}
      </BottomTab.Navigator>
    </SafeAreaProvider>
  );
};

export default BottomNavigationTab;
