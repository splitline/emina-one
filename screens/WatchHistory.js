import * as React from 'react';
import { Text, View, StyleSheet, Share, Linking, Alert } from 'react-native';
import { connect } from 'react-redux';
import { Appbar, List, Surface, Card, Title, Paragraph, Avatar } from 'react-native-paper';

const AboutScreen = ({ navigation, history }) => {
    return (
        <View>
            <Appbar.Header>
                <Appbar.Content title="觀看紀錄" />
                <Appbar.Action icon="information-outline" onPress={() => navigation.navigate("About")} />
            </Appbar.Header>
            {Object.entries(history)
                .sort((a, b) => b[1].lastWatch - a[1].lastWatch)
                .map(([animeId, data], i) =>
                    <List.Accordion
                        key={i}
                        title={data.watchedList[0].title}
                        description={new Date(data.watchedList[0].lastWatch) + ""}
                        left={props => <List.Icon {...props} icon="folder" />}
                    >
                        {data.watchedList.map((item, i) =>
                            <List.Item
                                key={i}
                                title={item.title}
                                onPress={() => navigation.navigate("Video", { animeId, videoId: item.id })}
                            />
                        )}
                    </List.Accordion>
                )}
        </View>
    )
}

export default connect(state => ({ history: state.history }))(AboutScreen);