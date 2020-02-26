import * as React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Slider, Animated, Dimensions } from 'react-native';
import { Video, Audio } from 'expo-av';
import { Button, IconButton, ActivityIndicator, List } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import ActionSheet from 'react-native-actions-sheet';
import { connect } from 'react-redux';

import { pushHistory } from "../redux/actions";

const millisToTime = ms => {
    const totalSeconds = ms / 1000;
    const seconds = String(Math.floor(totalSeconds % 60));
    const minutes = String(Math.floor(totalSeconds / 60));
    return minutes.padStart(2, '0') + ':' + seconds.padStart(2, '0');
};

const ControlStates = {
    Shown: 0,
    Showing: 1,
    Hidden: 2,
    Hiding: 3
};

class AnimePlayer extends React.Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
        this.actionSheetRef = React.createRef();
        this.controlsTimeout = null;
        this.videoHeight = Math.min(Dimensions.get('window').width, Dimensions.get('window').height);
        this.state = {
            sourceUri: this.props.sourceUri,
            inFullscreen: this.props.inFullscreen,

            played: false,
            playbackRate: 1.0,
            seekingMillis: undefined,
            durationMillis: 0,
            positionMillis: 0,
            isPlaying: true,
            isBuffering: true,
            isLoading: true,
            isFinished: false,

            controlsOpacity: new Animated.Value(1),
            controlState: ControlStates.Shown
        }
    }

    hideControls(timing = 500) {
        this.controlsTimeout && clearTimeout(this.controlsTimeout);
        this.setState({ controlState: ControlStates.Hiding });
        Animated.timing(this.state.controlsOpacity, {
            toValue: 0,
            timing: timing
        }).start(
            () => this.setState({ controlState: ControlStates.Hidden })
        );
    }

    showControls() {
        this.setState({ controlState: ControlStates.Showing });
        Animated.timing(this.state.controlsOpacity, {
            toValue: 1,
            timing: 200
        }).start(() => {
            this.setState({ controlState: ControlStates.Shown });
            this.controlsTimeout = setTimeout(() => {
                this.hideControls()
            }, 3000);
        });
    }

    toggleControls() {
        const { controlState, controlsOpacity } = this.state;
        if (controlState === ControlStates.Shown) {
            this.hideControls(200);
        } else if (controlState === ControlStates.Showing) {
            Animated.timing(controlsOpacity).stop()
            this.hideControls(200);
        } else if (controlState === ControlStates.Hidden) {
            this.showControls();
        } else if (controlState === ControlStates.Hiding) {
            Animated.timing(controlsOpacity).stop()
            this.showControls();
        }
    }

    loaded(status) {
        this.setState({ durationMillis: status.durationMillis });
        this.controlsTimeout = setTimeout(() => {
            this.hideControls()
        }, 3000);
    }

    playbackStatusUpdate(status) {
        if (!this.state.isFinished)
            this.setState({
                positionMillis: status.positionMillis,
                isBuffering: status.isBuffering,
                isPlaying: status.isPlaying,
                isLoading: status.playableDurationMillis <= status.positionMillis,
                isFinished: status.didJustFinish
            });
    }

    seekingPosition(value) {
        this.setState({ seekingMillis: value * 1000 });
    }

    seekingComplete(value) {
        this.videoRef.current.setPositionAsync(value * 1000)
            .then(() => this.setState({ seekingMillis: undefined, isFinished: false }))
    }

    handleFullscreen() {
        const { inFullscreen } = this.state;
        inFullscreen ? this.props.switchToPortrait() : this.props.switchToLandscape();
    }

    controlsEvent(callback, resetTimeout = true, ...args) {
        if (this.controlsTimeout)
            clearTimeout(this.controlsTimeout);
        if (resetTimeout)
            this.controlsTimeout = setTimeout(() => {
                this.hideControls()
            }, 3000);
        callback(...args);
    }

    static getDerivedStateFromProps(props) {
        return { inFullscreen: props.inFullscreen };
    }

    render() {
        const {
            played,
            controlsOpacity, controlState,
            sourceUri, inFullscreen,
            playbackRate,
            seekingMillis, durationMillis, positionMillis, isPlaying, isLoading, isFinished
        } = this.state;
        const { animeData, pushHistory } = this.props;

        return (
            <View>
                <Video
                    shouldPlay={false}
                    ref={this.videoRef}
                    resizeMode={Video.RESIZE_MODE_CONTAIN}
                    onLoad={this.loaded.bind(this)}
                    onPlaybackStatusUpdate={this.playbackStatusUpdate.bind(this)}
                    source={{ uri: sourceUri }}
                    style={{
                        backgroundColor: 'black',
                        aspectRatio: !inFullscreen ? 16 / 9 : undefined,
                        width: '100%',
                        height: inFullscreen ? this.videoHeight : undefined,
                    }}
                />
                <TouchableWithoutFeedback onPress={this.toggleControls.bind(this)}>
                    {controlState !== ControlStates.Hidden ?
                        <Animated.View style={[styles.controls, { opacity: controlsOpacity, backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                            <View style={styles.topControls}>
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.6)', 'transparent']}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        height: '150%'
                                    }}
                                />
                                <IconButton
                                    icon="keyboard-backspace"
                                    size={30}
                                    color="white"
                                    onPress={inFullscreen ? this.props.switchToPortrait : this.props.goBack} />
                                <Text style={{ color: 'white', flex: 1, fontSize: 18 }} numberOfLines={1}>{this.props.title}</Text>
                                {inFullscreen &&
                                    <Button
                                        theme={{ roundness: 12 }}
                                        onPress={() => { }}
                                        color="white"
                                        onPress={() => this.controlsEvent(
                                            () => this.actionSheetRef.current.setModalVisible(), false
                                        )}
                                        uppercase={false}
                                    >
                                        {playbackRate}x
                                    </Button>
                                }
                            </View>
                            <View style={styles.bottomControls}>
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        height: '150%'
                                    }}
                                />
                                <Text style={{ color: 'white' }}>{millisToTime((typeof seekingMillis !== 'undefined') ? seekingMillis : positionMillis)} / {millisToTime(durationMillis)}</Text>
                                <Slider
                                    onValueChange={value => this.controlsEvent(this.seekingPosition.bind(this), false, value)}
                                    onSlidingComplete={value => this.controlsEvent(this.seekingComplete.bind(this), true, value)}
                                    maximumValue={durationMillis / 1000}
                                    step={1}
                                    value={(seekingMillis || positionMillis) / 1000}
                                    style={{ flex: 1 }}
                                />
                                <IconButton
                                    size={30}
                                    icon={inFullscreen ? "fullscreen-exit" : "fullscreen"}
                                    color="white"
                                    onPress={() => this.controlsEvent(() => this.handleFullscreen())}
                                />

                            </View>
                            {inFullscreen &&
                                <View style={styles.rwdfwdControls}>
                                    <IconButton
                                        icon="rewind-10"
                                        color="white"
                                        size={48}
                                        onPress={() => this.controlsEvent(() => {
                                            this.setState({ isFinished: false });
                                            this.videoRef.current.setPositionAsync(Math.max(positionMillis - 10000, 0))
                                        })}
                                    />
                                    <IconButton
                                        icon="fast-forward-10"
                                        color="white"
                                        size={48}
                                        onPress={() => this.controlsEvent(() => {
                                            this.setState({ isFinished: false });
                                            this.videoRef.current.setPositionAsync(Math.min(positionMillis + 10000, durationMillis))
                                        })}
                                    />
                                </View>}

                            {(!isFinished && !isLoading) &&
                                <IconButton
                                    icon={isPlaying ? "pause-circle" : "play-circle"}
                                    color="white"
                                    size={48}
                                    onPress={() => this.controlsEvent(() => {
                                        if (isPlaying)
                                            this.videoRef.current.pauseAsync();
                                        else {
                                            this.videoRef.current.playAsync();
                                            if (!played) {
                                                this.setState({ played: true });
                                                pushHistory(
                                                    animeData.animeId,
                                                    animeData.videoId,
                                                    animeData.title
                                                );
                                            }
                                        }
                                    })}
                                />}
                            <ActionSheet
                                gestureEnabled
                                initialOffsetFromBottom={0.5}
                                ref={this.actionSheetRef}
                                onClose={() => this.controlsEvent(() => { }, true)}
                            >
                                <View style={{ height: '100%' }}>
                                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed, i) =>
                                        <List.Item
                                            key={i}
                                            title={`${speed} 倍`}
                                            left={() => <List.Icon icon={playbackRate === speed && "check"} style={{ marginVertical: 0 }} />}
                                            onPress={() => this.controlsEvent(() => {
                                                this.videoRef.current.setRateAsync(speed, true, Audio.PitchCorrectionQuality.High);
                                                this.actionSheetRef.current.setModalVisible();
                                                this.setState({ playbackRate: speed });
                                            })}
                                        />
                                    )}
                                </View>
                            </ActionSheet>
                        </Animated.View> :
                        <View style={styles.controls}></View> // empty :)
                    }
                </TouchableWithoutFeedback>
                <View style={styles.controls}>
                    {(!isFinished && isLoading) &&
                        <ActivityIndicator color="white" />}
                    {isFinished &&
                        <IconButton
                            icon={"replay"}
                            color="white"
                            size={48}
                            onPress={() => this.controlsEvent(() =>
                                this.setState({ isFinished: false },
                                    () => this.videoRef.current.replayAsync())
                            )}
                        />
                    }
                </View>
            </View>
        );
    }
};


const styles = StyleSheet.create({
    controls: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    bottomControls: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingLeft: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    topControls: {
        position: 'absolute',
        top: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 16
    },
    rwdfwdControls: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row'
    }
});

export default connect(
    undefined,
    { pushHistory }
)(AnimePlayer);