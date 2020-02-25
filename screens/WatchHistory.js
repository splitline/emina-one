import * as React from 'react';
import { Text, View, StyleSheet, Share, Linking, Alert } from 'react-native';
import { connect } from 'react-redux';
import { Appbar, List, Surface, Card, Title, Paragraph, IconButton } from 'react-native-paper';

const AboutScreen = ({ navigation, history }) => {
    const formatDate = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    return (
        <View>
            <Appbar.Header>
                <Appbar.Content title="觀看紀錄" />
                <Appbar.Action icon="information-outline" onPress={() => navigation.navigate("About")} />
            </Appbar.Header>
            {Object.entries(history)
                .sort((a, b) => b[1].lastWatch - a[1].lastWatch)
                .map(([animeId, data], i) =>
                    <Surface key={i} style={{ margin: 8, elevation: 3 }}>
                        <List.Accordion
                            title={data.watchedList[0].title}
                            description={formatDate(new Date(data.watchedList[0].lastWatch))}
                        >
                            {data.watchedList.map((item, i) =>
                                <List.Item
                                    key={i}
                                    title={item.title}
                                    right={() => <List.Subheader>{formatDate(new Date(item.lastWatch))}</List.Subheader>}
                                    onPress={() => navigation.navigate("Video", { animeId, videoId: item.id })}
                                />
                            )}
                        </List.Accordion>
                    </Surface>
                )}
        </View>
    )
}

export default connect(state => ({ history: state.history }))(AboutScreen);