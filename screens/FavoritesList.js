import * as React from 'react';
import { Text, View, StyleSheet, FlatList, SafeAreaView, AsyncStorage, RefreshControl } from 'react-native';
import { parse } from 'node-html-parser';

import { List, Appbar, Searchbar } from 'react-native-paper';


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});

class ListItem extends React.PureComponent {
    render() {
        const [id, data] = this.props.item;
        return (
            <List.Item
                title={data.name}
                description={data.season}
                right={() => <List.Subheader>{data.fansub}</List.Subheader>}
                onPress={() => { this.props.navigation.navigate("Video", { animeId: id, animeData: data }) }}
            />
        );
    }
}

class FavoritesList extends React.Component {
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this.state = {
            favorites: [],
            refreshing: false
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        this.setState({ refreshing: true });
        AsyncStorage.getItem("@EminaOne:favorites")
            .then(favorites => {
                if (favorites !== null) {
                    favorites = JSON.parse(favorites);
                    this.setState({ favorites, refreshing: false })
                }
                console.log(favorites)
            });
    }

    renderRow = ({ item }) => {
        return (
            <ListItem item={item} navigation={this.navigation} />
        )
    }

    render() {
        const { favorites, refreshing } = this.state;
        return (
            <SafeAreaView>
                <Appbar.Header>
                    <Appbar.Content title="所有動畫" />
                    <Appbar.Action icon="information-outline" onPress={() => { }} />
                </Appbar.Header>
                <FlatList
                    data={Object.entries(favorites)}
                    renderItem={this.renderRow}
                    keyExtractor={item => item[0]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => this.fetchData()} />}
                />
            </SafeAreaView>
        );
    }
}

export default FavoritesList;