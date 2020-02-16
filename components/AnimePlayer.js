import * as React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Slider, Animated } from 'react-native';
import { Video } from 'expo-av';
import { IconButton, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';

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

export default class AnimePlayer extends React.Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
        this.controlsTimeout = null;
        this.state = {
            sourceUri: this.props.sourceUri,
            inFullscreen: this.props.inFullscreen,

            seekingMillis: undefined,
            durationMillis: 0,
            positionMillis: 0,
            isPlaying: true,
            isBuffering: true,
            isLoading: true,

            controlsOpacity: new Animated.Value(1),
            ControlState: ControlStates.Shown
        }
    }

    hideControls(timing = 500) {
        this.controlsTimeout && clearTimeout(this.controlsTimeout);
        this.setState({ ControlState: ControlStates.Hiding });
        Animated.timing(this.state.controlsOpacity, {
            toValue: 0,
            timing: timing
        }).start(
            () => this.setState({ ControlState: ControlStates.Hidden })
        );
    }

    showControls() {
        this.setState({ ControlState: ControlStates.Showing });
        Animated.timing(this.state.controlsOpacity, {
            toValue: 1,
            timing: 200
        }).start(() => {
            this.setState({ ControlState: ControlStates.Shown });
            this.controlsTimeout = setTimeout(() => {
                this.hideControls()
            }, 3000);
        });
    }

    toggleControls() {
        const { ControlState, controlsOpacity } = this.state;
        if (ControlState === ControlStates.Shown) {
            this.hideControls(200);
        } else if (ControlState === ControlStates.Showing) {
            Animated.timing(controlsOpacity).stop()
            this.hideControls(200);
        } else if (ControlState === ControlStates.Hidden) {
            this.showControls();
        } else if (ControlState === ControlStates.Hiding) {
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
        this.setState({
            positionMillis: status.positionMillis,
            isBuffering: status.isBuffering,
            isPlaying: status.isPlaying,
            isLoading: status.playableDurationMillis <= status.positionMillis
        })
    }

    seekingPosition(value) {
        this.setState({ seekingMillis: value * 1000 });
    }

    seekingComplete(value) {
        this.videoRef.current.setPositionAsync(value * 1000)
            .then(() => this.setState({ seekingMillis: undefined }))
    }

    handleFullscreen() {
        const { inFullscreen } = this.state;
        inFullscreen ? this.props.switchToPortrait() : this.props.switchToLandscape();
    }

    static getDerivedStateFromProps(props) {
        return { inFullscreen: props.inFullscreen };
    }

    render() {
        const {
            controlsOpacity, ControlState,
            sourceUri, inFullscreen,
            seekingMillis, durationMillis, positionMillis, isPlaying, isLoading
        } = this.state;

        return (
            <View>
                <Video
                    shouldPlay
                    ref={this.videoRef}
                    resizeMode={Video.RESIZE_MODE_CONTAIN}
                    onLoad={this.loaded.bind(this)}
                    onPlaybackStatusUpdate={this.playbackStatusUpdate.bind(this)}
                    source={{ uri: sourceUri }}
                    style={{
                        backgroundColor: 'black',
                        aspectRatio: !inFullscreen ? 16 / 9 : undefined,
                        width: '100%',
                        height: inFullscreen ? '100%' : undefined,
                    }}
                />
                {isLoading &&
                    <View style={styles.controls}>
                        <ActivityIndicator color="white" />
                    </View>}
                <TouchableWithoutFeedback onPress={this.toggleControls.bind(this)}>
                    {ControlState !== ControlStates.Hidden ?
                        <Animated.View style={[styles.controls, { opacity: controlsOpacity }]}>
                            <View style={styles.bottomControls}>
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.8)']}
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
                                    onValueChange={this.seekingPosition.bind(this)}
                                    onSlidingComplete={this.seekingComplete.bind(this)}
                                    maximumValue={durationMillis / 1000}
                                    step={1}
                                    value={(seekingMillis || positionMillis) / 1000}
                                    style={{ flex: 1 }}
                                />
                                <IconButton
                                    size={30}
                                    icon={inFullscreen ? "fullscreen-exit" : "fullscreen"}
                                    color="white"
                                    onPress={this.handleFullscreen.bind(this)}
                                />

                            </View>
                            {!isLoading &&
                                <IconButton
                                    icon={isPlaying ? "pause-circle" : "play-circle"}
                                    color="white"
                                    size={48}
                                    onPress={() =>
                                        isPlaying ?
                                            this.videoRef.current.pauseAsync() :
                                            this.videoRef.current.playAsync()}
                                />}
                        </Animated.View> :
                        <View style={styles.controls}></View>
                    }
                </TouchableWithoutFeedback>
            </View >
        );
    }
};


const styles = StyleSheet.create({
    controls: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomControls: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingLeft: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
});