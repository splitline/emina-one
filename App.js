import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import AnimeList from './screens/AnimeList';
import VideoScreen from './screens/VideoScreen';

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>
    </View>
  );
}

function Home({ navigation }) {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="動畫列表"
        component={AnimeList}
        options={{
          tabBarIcon: 'view-list',
        }}
        navigation={navigation}
      />
      <Tab.Screen
        name="近期更新"
        component={HomeScreen}
        options={{
          tabBarIcon: 'update',
        }}
      />
      <Tab.Screen
        name="新番時間表"
        component={HomeScreen}
        options={{
          tabBarIcon: 'calendar',
        }}
      />
      <Tab.Screen
        name="收藏的動畫"
        component={HomeScreen}
        options={{
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
        <Stack.Screen name="Video" component={VideoScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;