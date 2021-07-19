/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import Home from './src/Home';
import VideoCallScreen from './src/VideoCallScreen';

const Stack = createStackNavigator();

const App = () => {
  const initialState = {
    isAudioEnabled: true,
    isVideoEnabled: true,
    isButtonDispaly: true,
    status: 'disconnected',
    participants: new Map(),
    videoTracks: new Map(),
    roomName: '',
    username: '',
    token: '',
  };

  const [roomState, setRoomState] = useState(initialState);

  const handleRoomInputChange = (val, type) => {
    setRoomState({...roomState, [type]: val});
  };

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            children={() => (
              <Home
                roomState={roomState}
                setRoomState={setRoomState}
                handleRoomInputChange={handleRoomInputChange}
              />
            )}
          />
          <Stack.Screen
            name="Video-Call"
            children={() => (
              <VideoCallScreen
                initialState={initialState}
                roomState={roomState}
                setRoomState={setRoomState}
              />
            )}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
