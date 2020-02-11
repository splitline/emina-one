import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import AnimeList from './screens/AnimeList';

const MaterialBottomTabs = createMaterialBottomTabNavigator();

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>
    </View>
  );
}

function App() {
  return (
    <NavigationContainer>
      <MaterialBottomTabs.Navigator>
        <MaterialBottomTabs.Screen
          name="動畫列表"
          component={AnimeList}
          options={{
            tabBarIcon: 'view-list',
          }}
        />
        <MaterialBottomTabs.Screen
          name="近期更新"
          component={HomeScreen}
          options={{
            tabBarIcon: 'update',
          }}
        />
        <MaterialBottomTabs.Screen
          name="新番時間表"
          component={HomeScreen}
          options={{
            tabBarIcon: 'calendar',
          }}
        />
        <MaterialBottomTabs.Screen
          name="收藏的動畫"
          component={HomeScreen}
          options={{
            tabBarIcon: 'heart',
          }}
        />
      </MaterialBottomTabs.Navigator>
    </NavigationContainer>
  );
}

export default App;