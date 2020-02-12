import * as React from 'react';
import { Text, View, Dimensions, BackHandler } from 'react-native';
import { parse } from 'node-html-parser';
import { IconButton } from 'react-native-paper';

import { ScreenOrientation } from 'expo';
import { Video } from 'expo-av';
import VideoPlayer from 'expo-video-player';

export default class Player extends React.Component {
    constructor(props) {
        super(props);
        this.videoUrl = this.props.videoUrl;
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this.handleBackPress());
        this.state = {
            sourceUri: null,
            inFullscreen: false,
            pageHeight: Dimensions.get('window').height,
            pageWidth: Dimensions.get('window').width
        };
    }

    componentDidMount() {
        const type =
            this.videoUrl.startsWith("https://i.animeone.me/") ? "m3u8" :
                this.videoUrl.startsWith("https://v.anime1.me/watch") ? "mp4" :
                    null;
        fetch(this.videoUrl)
            .then(r => r.text())
            .then(html => {
                switch (type) {
                    case "m3u8":
                        const document = parse(html);
                        this.setState({
                            sourceUri: document.querySelector("source").getAttribute("src")
                        });
                        break;
                    case "mp4":
                        const requestData = html.match(/x\.send\('(d=[A-Za-z0-9%]+)'\);/)[1];
                        fetch("https://v.anime1.me/apiv2", {
                            method: "POST",
                            body: requestData,
                            headers: { 'Content-Type': "application/x-www-form-urlencoded" }
                        })
                            .then(r => r.json())
                            .then(json => {
                                this.setState({
                                    sourceUri: "https:" + json.sources[0].file
                                })
                            })
                        break;
                    default:
                        break;
                }
            })
    }

    handleBackPress() {
        this.state.inFullscreen &&
            this.switchToPortrait();
        return false
    }

    switchToLandscape() {
        ScreenOrientation.lockAsync(ScreenOrientation.Orientation.LANDSCAPE)
            .then(_ => this.setState({
                inFullscreen: true,
                pageHeight: this.state.pageWidth,
                pageWidth: this.state.pageHeight
            }));
    }

    switchToPortrait() {
        ScreenOrientation.lockAsync(ScreenOrientation.Orientation.PORTRAIT)
            .then(_ => this.setState({
                inFullscreen: false,
                pageHeight: this.state.pageWidth,
                pageWidth: this.state.pageHeight
            }));
    }

    render() {
        const { sourceUri, inFullscreen, pageHeight, pageWidth } = this.state;
        return (
            <View onLayout={() => this.getNewDimensions}>
                {/* {!sourceUri ?
                    <Text>Loading Anime</Text> : */}
                    <View>
                        <VideoPlayer
                            videoProps={{
                                shouldPlay: true,
                                resizeMode: Video.RESIZE_MODE_CONTAIN,
                                source: { uri: sourceUri },
                            }}
                            inFullscreen={inFullscreen}
                            height={inFullscreen ? pageHeight : pageWidth * 9 / 16}
                            width={pageWidth}
                            fadeOutDuration={200}
                            switchToLandscape={() => this.switchToLandscape()}
                            switchToPortrait={() => this.switchToPortrait()}
                            showControlsOnLoad
                        />
                    </View>
                {/* } */}
            </View>
        );
    }
}