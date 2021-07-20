/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import {
    TwilioVideoLocalView,
    TwilioVideoParticipantView,
    TwilioVideo,
} from 'react-native-twilio-video-webrtc';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const dimensions = Dimensions.get('window');

const VideoCallScreen = ({ roomState, setRoomState, initialState }) => {

    const twilioRef = useRef(null);
    const navigation = useNavigation();

    useEffect(() => {
        const { roomName, token } = roomState;
        console.log("token:", token);
        //TODO: check if we have to use await in next line or not.
        twilioRef.current.connect({
            roomName,
            accessToken: token,
        });

        setRoomState({ ...roomState, status: 'connecting' });
        return () => {
            console.log("video call screen is ended!");
            handleEndButton();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //when end button clicks
    const handleEndButton = () => {
        setRoomState(initialState);
        twilioRef.current.disconnect();
    };

    //when mute button is pressed
    const handleMuteButton = async () => {
        const isEnabled = await twilioRef.current.setLocalAudioEnabled(!roomState.isAudioEnabled);
        setRoomState({ ...roomState, isAudioEnabled: isEnabled });
    };

    //flip fornt and rear camera
    const handleFlipButton = async () => {
        await twilioRef.current.flipCamera();
    };

    //when room connects
    const onRoomConnects = () => {
        setRoomState({ ...roomState, status: 'connected' });
    };

    //when room disconnects
    const onRoomDisconnects = ({ error }) => {
        console.error('ERROR: ', JSON.stringify(error));
        setRoomState({ ...roomState, status: 'disconnected' });
        navigation.pop();
    };

    //when room faild to connect to server
    const onRoomFaildToConnect = (err) => {
        console.error('Error: ', JSON.stringify(err));
        setRoomState({ status: 'disconnected' });
    };

    //when participant joins the room
    const onParticipantJoinsRoom = ({ participant, track }) => {
        setRoomState({
            ...roomState,
            videoTracks: new Map([
                ...roomState.videoTracks,
                [track.trackSid, { participantSid: participant.sid, videoTrackSid: track.trackSid }],
            ]),
        });
    };

    //when participant leaves the room
    const onParticipantLeft = ({ participant, track }) => {
        console.log('onParticipantLeft: ', participant, track);

        const newVideoTracks = roomState.videoTracks;
        newVideoTracks.delete(track.trackSid);
        setRoomState({ ...roomState, videoTracks: newVideoTracks });
    };


    return (
        <View style={styles.callContainer}>
            {
                console.log('videoTracks ----> ', roomState.videoTracks)
            }
            {
                (roomState.status === 'connected' || roomState.staus === 'connecting') ? (
                    <View style={styles.callWrapper}>
                        {(roomState.status === 'connected') &&
                            <View style={styles.remoteGrid}>
                                {Array.from(roomState.videoTracks, ([trackSid, trackIdentifier]) => {
                                    return <TwilioVideoParticipantView
                                        key={trackSid}
                                        trackIdentifier={trackIdentifier}
                                        style={styles.remoteVideo}
                                    />;
                                })}
                            </View>
                        }
                    </View>
                ) : (<View>
                    <Text>Room Name: {roomState.roomName}</Text>
                    <Text>UserName: {roomState.username}</Text>
                </View>)
            }
            <View style={styles.optionsContainer}>
                <TouchableOpacity key="mic" onPress={handleMuteButton}>
                    <Icon
                        name={roomState.isAudioEnabled ? 'mic' : 'mic-off'}
                        size={28}
                        style={{
                            backgroundColor: 'white',
                            color: 'green',
                            padding: 10,
                            borderRadius: 50,
                            zIndex: 10,
                        }}
                    />
                </TouchableOpacity>
                <TouchableOpacity key="phone-hangup" onPress={handleEndButton}>
                    <MCIcon
                        name="phone-hangup"
                        size={36}
                        style={{
                            backgroundColor: 'red',
                            color: "white",
                            padding: 15,
                            borderRadius: 50,
                            marginHorizontal: 12,
                            zIndex: 10,
                        }}
                    />
                </TouchableOpacity>
                <TouchableOpacity key="flip-camera-android" onPress={handleFlipButton}>
                    <Icon name="flip-camera-android" size={28} color="#fff" style={{
                        backgroundColor: 'white',
                        color: 'green',
                        padding: 10,
                        borderRadius: 50,
                        zIndex: 10,
                    }} />
                </TouchableOpacity>
            </View>

            <TwilioVideoLocalView
                enabled={roomState.status === 'connected'}
                style={styles.localVideo}
            />

            <TwilioVideo
                ref={twilioRef}
                onRoomDidConnect={onRoomConnects}
                onRoomDidDisconnect={onRoomDisconnects}
                onRoomDidFailToConnect={onRoomFaildToConnect}
                onParticipantAddedVideoTrack={onParticipantJoinsRoom}
                onParticipantRemovedVideoTrack={onParticipantLeft}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'lightgrey',
        flexDirection: 'row',
    },
    callContainer: {
        flex: 1,
    },
    callWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    remoteGrid: {
        flex: 1,
    },
    // remoteVideo: {
    //     flex: 1,
    // },
    remoteVideo: {
        width: "100%",
        height: "100%"  ,
        zIndex: -1,
    },
    localVideo: {
        position: 'absolute',
        right: 5,
        bottom: 100,
        width: dimensions.width / 4,
        height: dimensions.height / 6,
    },
    optionsContainer: {
        position: 'absolute',
        paddingHorizontal: 10,
        left: 0,
        right: 0,
        bottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});



export default VideoCallScreen;
