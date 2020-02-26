import * as React from 'react';
import { View, ScrollView, Alert, Text } from 'react-native';
import { connect } from 'react-redux';
import { Appbar, List, Surface, Button } from 'react-native-paper';

import { clearHistory } from "../redux/actions";

const WatchHistory = ({ navigation, history, clearHistory }) => {
    const formatDate = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.Content title="觀看紀錄" />
                <Appbar.Action icon="information-outline" onPress={() => navigation.navigate("About")} />
            </Appbar.Header>
            <ScrollView contentContainerStyle={{flex:1}}>
                <Button
                    icon="notification-clear-all"
                    onPress={() => Alert.alert(
                        "清除紀錄",
                        "確定要清除嗎？", [
                        { text: "確定", onPress: () => clearHistory() },
                        { text: "取消", style: "cancel" }
                    ])}
                    style={{ alignSelf: "flex-end", marginTop: 4, marginRight: 8 }}
                    compact
                >
                    清除紀錄
                </Button>
                {Object.keys(history).length === 0 ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text>到時候觀看紀錄會出現在這邊</Text>
                    </View> :
                    Object.entries(history)
                        .sort((a, b) => b[1].lastWatch - a[1].lastWatch)
                        .map(([animeId, data], i) =>
                            <Surface key={i} style={{ margin: 8, elevation: 3 }}>
                                <List.Accordion
                                    title={data.watchedList[0].title}
                                    titleNumberOfLines={0}
                                    description={formatDate(new Date(data.watchedList[0].lastWatch))}
                                >
                                    {data.watchedList.map((item, i) =>
                                        <List.Item
                                            key={i}
                                            title={item.title}
                                            titleNumberOfLines={0}
                                            right={() => <List.Subheader>{formatDate(new Date(item.lastWatch))}</List.Subheader>}
                                            onPress={() => navigation.navigate("Video", { animeId, videoId: item.id })}
                                        />
                                    )}
                                </List.Accordion>
                            </Surface>
                        )}
            </ScrollView>
        </View>
    )
}

export default connect(state => ({ history: state.history }), { clearHistory })(WatchHistory);