import * as React from 'react';
import { Alert } from "react-native";
import { List } from 'react-native-paper';

export default ({ id, title, episode, season, fansub, navigation }) => {
    return (
        <List.Item
            title={title}
            description={`${episode || "-"} / ${season || "-"}`}
            right={() => <List.Subheader>{fansub}</List.Subheader>}
            onPress={() => typeof id !== 'number' ?
                Alert.alert("(´；ω；｀)", "這部動畫沒上架") :
                navigation.navigate("Video", { animeId: id })}
        />
    );
}
