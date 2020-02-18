import * as React from 'react';
import { Alert } from "react-native";
import { List } from 'react-native-paper';

export default class AnimeEntry extends React.PureComponent {
    render() {
        return (
            <List.Item
                title={this.props.item.name}
                description={`${this.props.item.episode} / ${this.props.item.season}`}
                right={() => <List.Subheader>{this.props.item.fansub}</List.Subheader>}
                onPress={() => typeof this.props.item.id !== 'number' ? 
                 Alert.alert("(´；ω；｀)", "這部動畫沒上架"):
                 this.props.navigation.navigate("Video", { animeId: this.props.item.id, animeData: this.props.item })}
            />
        );
    }
};