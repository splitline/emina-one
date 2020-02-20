import * as React from 'react';
import { Text, View, StyleSheet, StatusBar, BackHandler, FlatList, Share } from 'react-native';
import { parse } from 'node-html-parser';
import { Title, Button, ActivityIndicator, Surface, Divider, Caption, IconButton, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';

import { ScreenOrientation } from 'expo';
import * as IntentLauncher from 'expo-intent-launcher';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import AnimePlayer from "../components/AnimePlayer";
import { addFavorite, removeFavorite } from "../redux/actions";

class VideoScreen extends React.Component {
    constructor(props) {
        super(props);
        this.animeId = this.props.route.params.animeId;
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this.handleBackPress());
        this.state = {
            loadingList: true,
            videoList: [],
            playingIndex: 0,
            page: 1,

            loadingVideo: true,
            sourceUri: null,
            inFullscreen: false,
        };
    }

    componentDidMount() {
        activateKeepAwake();
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
                            credentials: 'include',
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
                        url: elem.querySelector('iframe')?.getAttribute('src') || elem.querySelector('button')?.getAttribute('data-src'),
                        pageURL: `https://anime1.me/${elem.getAttribute('id').split('-')[1]}`
                    }));

                this.setState({ videoList: [...this.state.videoList, ...result], playingIndex: 0, loadingList: false });
                return result;
            });
    }

    switchToLandscape() {
        ScreenOrientation.lockAsync(ScreenOrientation.Orientation.LANDSCAPE)
            .then(_ => this.setState({ inFullscreen: true }));
    }

    switchToPortrait() {
        ScreenOrientation.lockAsync(ScreenOrientation.Orientation.PORTRAIT)
            .then(_ => this.setState({ inFullscreen: false }));
    }

    toggleFavorite() {
        const { favorites, addFavorite, removeFavorite } = this.props;

        this.animeId in favorites.byIds ?
            removeFavorite(this.animeId) :
            addFavorite(this.animeId, {
                addedDate: new Date()
            })
    }


    render() {
        const { loadingList, videoList, playingIndex, page,
            loadingVideo, sourceUri, inFullscreen } = this.state;
        const { favorites } = this.props;
        const isFavorite = this.animeId in favorites.byIds
        return (
            <View style={styles.container}>
                <StatusBar hidden />
                <View style={styles.container}>
                    {loadingVideo ?
                        <View style={styles.videoPlaceholder}>
                            <ActivityIndicator animating />
                            <Text style={{ color: "white", marginVertical: 8 }}>獲取影片網址中</Text>
                        </View> :
                        <AnimePlayer
                            title={videoList[playingIndex]?.title}
                            sourceUri={sourceUri}
                            inFullscreen={inFullscreen}
                            switchToLandscape={() => this.switchToLandscape()}
                            switchToPortrait={() => this.switchToPortrait()}
                            goBack={() => this.props.navigation.goBack()}
                        />
                    }
                    <Surface style={styles.titleContainer}>
                        <Title>{videoList[playingIndex]?.title}</Title>
                        <Caption>上架時間：{videoList[playingIndex]?.date}</Caption>
                        <Divider />
                        <View style={{ flex: 0, flexDirection: "row", justifyContent: "space-around" }}>
                            <IconButton
                                color={isFavorite ? this.props.theme.colors.primary : '#757575'}
                                icon={isFavorite ? "heart" : "heart-outline"}
                                onPress={() => this.toggleFavorite()}
                                animated
                            />
                            <IconButton
                                color="#757575"
                                icon="share"
                                onPress={() => Share.share({ message: videoList[playingIndex]?.title + "\n" + videoList[playingIndex]?.pageURL })}
                                animated
                            />
                            <IconButton
                                color="#757575"
                                icon="open-in-new"
                                onPress={() => IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: sourceUri })}
                                animated
                            />
                        </View>
                    </Surface>
                    <FlatList
                        data={[...videoList, ...Array(4 - videoList.length % 4).fill({ empty: true })]}
                        numColumns={4}
                        columnWrapperStyle={{ flex: 1 }}
                        keyExtractor={(_, index) => index}
                        renderItem={({ item, index }) => (
                            item.empty ?
                                <View style={{ flex: 1, margin: 4, minWidth: 64 }}></View> :
                                <Button
                                    onPress={
                                        () => this.setState({ playingIndex: index },
                                            () => playingIndex !== index && this.fetchSourceUri(videoList[index].url))}
                                    mode={index === playingIndex ? "contained" : "outlined"}
                                    style={styles.button}>
                                    {item.title.match(/\[[^\]]+\]/g).slice(-1)[0].slice(1, -1)}
                                </Button>
                        )}
                        ListFooterComponent={() => (page && (
                            <Button
                                disabled={loadingList}
                                loading={loadingList}
                                onPress={() => this.fetchVideoList()}>
                                {loadingList ? "載入章節列表中" : "載入更多集數"}
                            </Button>
                        ))}
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
        flex: 1,
        margin: 4,
    },
    videoPlaceholder: {
        backgroundColor: "black",
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
        aspectRatio: 16 / 9,
        width: '100%'
    },
    titleContainer: {
        paddingHorizontal: 8,
        paddingTop: 4,
        marginBottom: 8,
        elevation: 2
    },
});

export default connect(
    state => ({ favorites: state.favorites }),
    { addFavorite, removeFavorite }
)(withTheme(VideoScreen));