import * as React from 'react';
import { Text, View, AsyncStorage } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import AnimeList from './screens/AnimeList';
import VideoScreen from './screens/VideoScreen';
import AnimeCalendar from './screens/AnimeCalendar';
import FavoritesList from './screens/FavoritesList';
import Loading from "./components/fullscreenLoading";

import { store, persistor } from "./redux/store";
import { PersistGate } from 'redux-persist/integration/react';

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
    <Tab.Navigator backBehavior="initialRoute" initialRouteName="animeList">
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
          title:"收藏的動畫",
          tabBarIcon: 'heart',
        }}
      />
    </Tab.Navigator>);
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Video" component={VideoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default () =>
  <Provider store={store}>
    <PersistGate loading={<Loading />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>;