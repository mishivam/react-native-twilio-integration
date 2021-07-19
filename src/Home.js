/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator} from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';


import permissionHandler from './permissionHandler';

const Home = ({ roomState, setRoomState, handleRoomInputChange }) => {

    const API_URL = 'https://41094903dcf9.ngrok.io';
    const navigation = useNavigation();
    const [showLoading, setShowLoading] = useState(false);
    const [isPermissionGranted, setPermssionGranted] = useState(false);
    const [roomInputErrors, setRoomInputErrors] = useState({ roomName: '', username: '' });

    const getPermissions = async () => {
        const iosPermission = [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE];
        const androidPermission = [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO];

        const result = await permissionHandler(iosPermission, androidPermission);

        if (result) { setPermssionGranted(true); }
        else { setPermssionGranted(false); }
    };

    useEffect(() => {
        getPermissions();
    }, []);




    const createTwilioRoom = async () => {
        const { username } = roomState;
        setShowLoading(true);
        if (!isPermissionGranted) { return getPermissions(); }
        try {
            const res = await axios.get(`${API_URL}/getToken?username=${username}`);
            console.log(res.status);
            if (res.status === 200) {
                const jwtToken = res.data;
                console.log("jwtToken: ", jwtToken);
                setRoomState({ ...roomState, token: jwtToken });
                setShowLoading(false);
                navigation.navigate('Video-Call');
            } else {
                const error = res.toString();
                Alert.alert('ERROR:', error);
            }
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'some error occured while creating a room');
        }
        setShowLoading(false);
    };

    console.log(isPermissionGranted);

    return (
        <View style={{ padding: 20, height: "100%", display: 'flex', justifyContent: 'space-around' }}>
            {
                isPermissionGranted ?
                    <View style={{ height: 200, display: 'flex', justifyContent: 'space-around' }}>
                        <TextInput
                            label="Username"
                            style={{
                                padding: 10,
                                borderRadius: 5,
                                borderWidth: 1,
                                borderColor: 'lightblue',
                                backgroundColor: '#fff',
                                color: 'black',
                            }}
                            placeholder="Enter Username"
                            placeholderTextColor="gray"
                            onChangeText={(val) => handleRoomInputChange(val, 'username')}
                        />
                        <TextInput
                            label="Room Name"
                            style={{
                                padding: 10,
                                borderRadius: 5,
                                borderWidth: 1,
                                borderColor: 'lightblue',
                                backgroundColor: '#fff',
                                color: 'black',
                            }}
                            placeholder="Enter room name"
                            placeholderTextColor="gray"
                            onChangeText={(val) => handleRoomInputChange(val, 'roomName')}
                        />
                        {showLoading ? <ActivityIndicator size='large' color="blue" /> :
                            <Button
                                title="create room"
                                onPress={createTwilioRoom}
                            />}

                    </View> :
                    <View>
                        <Text>{"You can't go ahead \n since you didn't provide the required permission!"}</Text>
                        <Text>{'Click button to give permission!'}</Text>
                        <Button

                            onPress={getPermissions}
                            title="grant permissions"
                        />
                    </View>
            }
            <Text>{roomState.token}</Text>
        </View>
    );
};



export default Home;
