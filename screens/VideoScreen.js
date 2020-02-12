import * as React from 'react';
import { Text, View, StyleSheet, StatusBar } from 'react-native';
import { parse } from 'node-html-parser';
import { Headline, Button, Divider,Surface } from 'react-native-paper'

import Player from '../components/Player';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
    },
    button: {
        margin: 4,
    },
});

export default class VideoScreen extends React.Component {
    constructor(props) {
        super(props);
        this.animeId = this.props.route.params.animeId;
        this.state = { videoList: [], playingAnime: null };
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

                this.setState({ videoList: result, playingAnime: result[0] });
            });
    }

    render() {
        const { videoList, playingAnime } = this.state;
        return (
            <View style={styles.container}>
                <StatusBar hidden />
                {videoList.length !== 0 ?
                    <View>
                        <Player videoUrl={playingAnime?.url || videoList[0].url} />
                        
                        <Surface>
                        <Headline>{playingAnime?.title}</Headline>
                        </Surface>
                        <View style={styles.row}>
                            {videoList.map((video, i) =>
                                <Button
                                    key={i}
                                    onPress={() => this.setState({ playingAnime: video })}
                                    mode="outlined"
                                    style={styles.button}>
                                    {video.title.match(/\[.+\]/)[0]}
                                </Button>
                            )}
                        </View>
                    </View>
                    :
                    <Text>Loading Episodes</Text>
                }
            </View>
        );
    }
}