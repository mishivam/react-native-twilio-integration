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
import MIcon from 'react-native-vector-icons/MaterialIcons';


const dimensions = Dimensions.get('window');

const VideoCallScreen = ({ roomState, setRoomState, initialState }) => {

    const twilioRef = useRef(null);
    const navigation = useNavigation();

    useEffect(() => {
        const { roomName, accessToken } = roomState;

        //TODO: check if we have to use await in next line or not.
        twilioRef.current.connect({
            roomName,
            accessToken,
        });

        setRoomState({ ...roomState, status: 'connecting' });

        return () => {
            handleEndButton();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //when end button clicks
    const handleEndButton = async () => {
        await twilioRef.current.disconnect();
        setRoomState(initialState);
        navigation.pop();
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
        console.log('onParticipantAddedVideoTrack: ', participant, track);

        setRoomState({
            ...roomState,
            videoTracks: new Map([
                ...roomState.videoTracks,
                [track.trackSid, { participantSid: participant.sid, videoTrackSid: track.trackSid }],
            ]),
        });

        console.log('videoTracks', roomState.videoTracks);
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
            <Text>Video screen</Text>
            {
                (roomState.status === 'connected' || roomState.staus === 'connecting') && (
                    <View style={styles.callWrapper}>
                        {(roomState.status === 'connected') &&
                            <View style={styles.remoteGrid}>
                                {Array.from(roomState.videoTracks, ([trackSid, trackIdentifier]) =>{
                                    console.log(trackSid, trackIdentifier);
                                    return <TwilioVideoParticipantView
                                        key={trackSid}
                                        trackIdentifier={trackIdentifier}
                                    />;
                                })}
                            </View>
                        }
                    </View>
                )
            }
            <View style={styles.optionsContainer}>
                <TouchableOpacity key="call-end" onPress={handleEndButton}>
                    <MIcon
                        name="call-end"
                        size={28}
                        style={{ backgroundColor: 'red', color: '#fff' }}
                    />
                </TouchableOpacity>
                <TouchableOpacity key="mic" onPress={handleMuteButton}>
                    <MIcon
                        name={roomState.isAudioEnabled ? 'mic' : 'mic-off'}
                        size={28}
                        style={{
                            backgroundColor: roomState.isAudioEnabled ? 'green' : 'white',
                            color: '#fff',
                        }}
                    />
                </TouchableOpacity>
                <TouchableOpacity key="flip-camera-android" onPress={handleFlipButton}>
                    <MIcon name="flip-camera-android" size={28} color="#fff" />
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
    remoteVideo: {
        flex: 1,
    },
    localVideo: {
        position: 'absolute',
        right: 5,
        bottom: 50,
        width: dimensions.width / 4,
        height: dimensions.height / 4,
    },
    optionsContainer: {
        position: 'absolute',
        paddingHorizontal: 10,
        left: 0,
        right: 0,
        bottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});



export default VideoCallScreen;
