import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, BackHandler, FlatList, Dimensions } from 'react-native';
import { parse } from 'node-html-parser';
import { Title, Button, ActivityIndicator, Surface } from 'react-native-paper'

import Player from '../components/Player';
import { ScreenOrientation } from 'expo';
import { Video } from 'expo-av';
import VideoPlayer from 'expo-video-player';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    button: {
        width: "23%",
        margin: 4,
    },
});

export default class VideoScreen extends React.Component {
    constructor(props) {
        super(props);
        this.animeId = this.props.route.params.animeId;
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this.handleBackPress());
        this.state = {
            videoList: [],
            playingIndex: 0,

            loadingVideo: true,
            sourceUri: null,
            inFullscreen: false,
            pageHeight: Dimensions.get('window').height,
            pageWidth: Dimensions.get('window').width
        };
    }

    componentDidMount() {
        fetch(`https://anime1.me/?cat=${this.animeId}`, { headers: { Cookie: "videopassword=1" }, credentials: "include" })
            .then(r => r.text())
            .then(html => {
                const document = parse(html);
                const result = document.querySelectorAll("article")
                    .map(elem => ({
                        title: elem.querySelector(".entry-title").text,
                        url: elem.querySelector('iframe')?.getAttribute('src') || elem.querySelector('button')?.getAttribute('data-src')
                    }))

                this.setState({ videoList: result, playingIndex: 0 },
                    () => this.fetchSourceUri(result[0].url));
            });
    }

    handleBackPress() {
        if (this.state.inFullscreen) {
            this.switchToPortrait();
            return true;
        }
        return false;
    }

    fetchSourceUri(videoUrl) {
        this.setState({ loadingVideo: true });
        const type =
            videoUrl?.startsWith("https://i.animeone.me/") ? "m3u8" :
                videoUrl?.startsWith("https://v.anime1.me/watch") ? "mp4" :
                    null;
        fetch(videoUrl)
            .then(r => r.text())
            .then(html => {
                switch (type) {
                    case "m3u8":
                        const document = parse(html);
                        this.setState({
                            sourceUri: document.querySelector("source").getAttribute("src"),
                            loadingVideo: false
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
                                    sourceUri: "https:" + json.sources[0].file,
                                    loadingVideo: false
                                })
                            })
                        break;
                    default:
                        break;
                }
            });
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
        const { videoList, playingIndex,
            loadingVideo, sourceUri, inFullscreen, pageHeight, pageWidth } = this.state;
        return (
            <View style={styles.container}>
                <StatusBar hidden />
                <View style={styles.container}>
                    {loadingVideo ?
                        <View style={{
                            backgroundColor: "black",
                            height: pageWidth / 16 * 9,
                            width: pageWidth,
                            flex: 1, justifyContent: 'center', alignItems: 'center'
                        }}>
                            <ActivityIndicator animating />
                        </View> :
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
                    }
                    <Surface>
                        <Title>{videoList[playingIndex]?.title}</Title>
                    </Surface>
                    <FlatList
                        data={videoList}
                        numColumns={4}
                        columnWrapperStyle={{ flex: 1, alignContent: "stretch", justifyContent: "flex-start" }}
                        keyExtractor={(_, index) => index}
                        renderItem={({ item, index }) => (
                            <Button
                                onPress={
                                    () => this.setState({ playingIndex: index },
                                        () => playingIndex !== index && this.fetchSourceUri(videoList[index].url))}
                                mode={index === playingIndex ? "contained" : "outlined"}
                                style={styles.button}>
                                {item.title.match(/\[[^\]]+\]/g).slice(-1)[0].slice(1,-1)}
                            </Button>
                        )}
                    />
                </View>
            </View>
        );
    }
}