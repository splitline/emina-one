import * as React from 'react';
import { Text, View, AsyncStorage } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { SplashScreen } from "expo";

import AnimeList from './screens/AnimeList';
import VideoScreen from './screens/VideoScreen';
import AnimeCalendar from './screens/AnimeCalendar';
import FavoritesList from './screens/FavoritesList';
import AboutScreen from './screens/AboutScreen';

import { store, persistor } from "./redux/store";
import { PersistGate } from 'redux-persist/integration/react';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#e4017e' // from anime1.me icon
  },
};

SplashScreen.preventAutoHide()

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>建置中 _(:з」∠)_</Text>
    </View>
  );
}

function Home({ navigation }) {
  return (
    <Tab.Navigator
      backBehavior="initialRoute"
      initialRouteName="animeList"
      activeColor={theme.colors.primary}
      barStyle={{ backgroundColor: theme.colors.surface, elevation: 8 }}
    >
      <Tab.Screen
        name="animeList"
        component={AnimeList}
        options={{
          title: "動畫列表",
          tabBarIcon: 'view-list',
        }}
        navigation={navigation}
      />
      <Tab.Screen
        name="AnimeCalendar"
        component={AnimeCalendar}
        options={{
          title: "新番時間表",
          tabBarIcon: 'calendar',
        }}
      />
      <Tab.Screen
        name="觀看紀錄"
        component={HomeScreen}
        options={{
          tabBarIcon: 'history',
        }}
      />
      <Tab.Screen
        name="FavoritesList"
        component={FavoritesList}
        options={{
          title: "收藏的動畫",
          tabBarIcon: 'heart'
        }}
      />
    </Tab.Navigator>);
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        headerMode="none"
        mode="modal"
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Video" component={VideoScreen} />
        <Stack.Screen name="About" component={AboutScreen} options={{cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default () =>
  <Provider store={store}>
    <PersistGate loading={null} onBeforeLift={() => SplashScreen.hide()} persistor={persistor}>
      <PaperProvider theme={theme}>
        <App />
      </PaperProvider>
    </PersistGate>
  </Provider>;