import * as React from 'react';
import { Text, View, StyleSheet, FlatList, SafeAreaView, AsyncStorage, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { List, Appbar } from 'react-native-paper';


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
    }


    renderRow = ({ item }) => {
        return (
            <ListItem item={item} navigation={this.navigation} />
        )
    }

    render() {
        const { favorites } = this.props;
        return (
            <SafeAreaView style={styles.container}>
                <Appbar.Header>
                    <Appbar.Content title="所有動畫" />
                    <Appbar.Action icon="information-outline" onPress={() => { }} />
                </Appbar.Header>
                <FlatList
                    data={favorites.idList.map(id => [id, favorites.byIds[id]])}
                    renderItem={this.renderRow}
                    keyExtractor={item => `${item[0]}`}
                />
            </SafeAreaView>
        );
    }
}

export default connect(
    state => ({ favorites: state.favorites }),
)(FavoritesList);