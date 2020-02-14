import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, BackHandler, FlatList, Dimensions, Share, AsyncStorage } from 'react-native';
import { parse } from 'node-html-parser';
import { Title, Button, ActivityIndicator, Surface, Divider, Caption, IconButton } from 'react-native-paper';

import { ScreenOrientation } from 'expo';
import { Video } from 'expo-av';
import VideoPlayer from 'expo-video-player';
import * as IntentLauncher from 'expo-intent-launcher';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';



export default class VideoScreen extends React.Component {
    constructor(props) {
        super(props);
        this.animeId = this.props.route.params.animeId;
        this.animeData = this.props.route.params.animeData;
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this.handleBackPress());
        this.state = {
            favorites: {},

            loadingList: true,
            videoList: [],
            playingIndex: 0,
            page: 1,

            loadingVideo: true,
            sourceUri: null,
            inFullscreen: false,
            pageHeight: Dimensions.get('window').height,
            pageWidth: Dimensions.get('window').width
        };
    }

    componentDidMount() {
        activateKeepAwake();
        AsyncStorage.getItem("@EminaOne:favorites")
            .then(favorites => {
                if (favorites !== null) {
                    favorites = JSON.parse(favorites);
                    this.setState({ favorites })
                }
            });
        this.fetchVideoList()
            .then(result => this.fetchSourceUri(result[0].url));
    }

    handleBackPress() {
        if (this.state.inFullscreen) {
            this.switchToPortrait();
            return true;
        }
        deactivateKeepAwake();
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

    fetchVideoList() {
        const { page } = this.state;
        const url = `https://anime1.me/page/${page}?cat=${this.animeId}`;
        this.setState({ loadingList: true });
        return fetch(url, { credentials: "include" })
            .then(r => r.text())
            .then(html => html.includes("acpwd-pass") ?
                fetch(url, {
                    method: "POST",
                    body: 'acpwd-pass=anime1.me',
                    credentials: "include",
                    headers: { 'Content-Type': "application/x-www-form-urlencoded" }
                }).then(r => r.text()) :
                html)
            .then(html => {
                if (html.includes("上一頁")) this.setState({ page: page + 1 });
                else this.setState({ page: null });
                const document = parse(html);
                const result = document.querySelectorAll("article")
                    .map(elem => ({
                        title: elem.querySelector(".entry-title").text,
                        date: elem.querySelector('time').text,
                        url: elem.querySelector('iframe')?.getAttribute('src') || elem.querySelector('button')?.getAttribute('data-src')
                    }));

                this.setState({ videoList: [...this.state.videoList, ...result], playingIndex: 0, loadingList: false });
                return result;
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

    toggleFavorite() {
        AsyncStorage.getItem("@EminaOne:favorites")
            .then(result => {
                let favorites = {};
                if (result !== null)
                    favorites = JSON.parse(result);
                this.animeId in this.state.favorites ?
                    delete favorites[this.animeId] :
                    favorites[this.animeId] = this.animeData;
                AsyncStorage.setItem("@EminaOne:favorites", JSON.stringify(favorites))
                this.setState({ favorites })
            })
    }

    loadMoreEpisode = () =>
        (
            <Button
                disabled={this.state.loadingList}
                loading={this.state.loadingList}
                onPress={() => this.fetchVideoList()}>
                {this.state.loadingList ? "載入章節列表中" : "載入更多集數"}
            </Button>
        )

    render() {
        const { loadingList, videoList, playingIndex, page,
            loadingVideo, sourceUri, inFullscreen, pageHeight, pageWidth } = this.state;
        return (
            <View style={styles.container}>
                <StatusBar hidden />
                <View style={styles.container}>
                    {loadingVideo ?
                        <View style={[
                            styles.videoPlaceholder, {
                                height: pageWidth * 9 / 16,
                                width: pageWidth
                            }]}>
                            <ActivityIndicator animating />
                            <Text style={{ color: "white", marginVertical: 8 }}>獲取影片網址中</Text>
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
                        />
                    }
                    <Surface style={styles.titleContainer}>
                        <Title>{videoList[playingIndex]?.title}</Title>
                        <Caption>上架時間：{videoList[playingIndex]?.date}</Caption>
                        <Divider />
                        <View style={{ flex: 0, flexDirection: "row", justifyContent: "space-around" }}>
                            <IconButton
                                icon={this.animeId in this.state.favorites ? "heart" : "heart-outline"}
                                onPress={() => this.toggleFavorite()}
                                animated
                            />

                            <IconButton
                                icon="share"
                                onPress={() => Share.share({ message: videoList[playingIndex]?.url })}
                                animated
                            />
                            <IconButton
                                icon="open-in-new"
                                onPress={() => IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: sourceUri })}
                                animated
                            />
                        </View>
                    </Surface>
                    <FlatList
                        data={videoList}
                        style={{ flexGrow: 0 }}
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
                                {item.title.match(/\[[^\]]+\]/g).slice(-1)[0].slice(1, -1)}
                            </Button>
                        )}
                        ListFooterComponent={() => (page && this.loadMoreEpisode())}
                    />
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    button: {
        width: "23%",
        margin: 4,
    },
    videoPlaceholder: {
        backgroundColor: "black",
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleContainer: {
        paddingHorizontal: 8,
        paddingTop: 4,
        marginBottom: 8,
        elevation: 2
    },
});