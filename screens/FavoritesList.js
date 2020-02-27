import * as React from 'react';
import { Text, View, StyleSheet, FlatList, SafeAreaView, UIManager, LayoutAnimation } from 'react-native';
import { connect } from 'react-redux';
import { Appbar, Surface } from 'react-native-paper';
import AnimeEntry from "../components/AnimeEntry";

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});

class FavoritesList extends React.Component {
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
    }

    setAnimation = () => {
        LayoutAnimation.configureNext({
          duration: 150,
          update: {
            type: LayoutAnimation.Types.easeIn,
            springDamping: 0.1,
          },
        });
    }

    renderRow = ({ item }) => {
        const { animeDatas } = this.props;
        this.setAnimation();
        return (
            <AnimeEntry {...animeDatas[item]} navigation={this.navigation} />
        )
    }

    render() {
        const { favorites, navigation } = this.props;
        return (
            <SafeAreaView style={styles.container}>
                <Appbar.Header>
                    <Appbar.Content title="收藏的動畫" />
                    <Appbar.Action icon="information-outline" onPress={() => navigation.navigate("About")} />
                </Appbar.Header>
                <Surface style={styles.container}>
                {favorites.idList.length === 0 ?
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>該去收藏點東西了吧</Text>
                    </View> :
                    <FlatList
                        data={favorites.idList}
                        renderItem={this.renderRow}
                        keyExtractor={item => `${item}`}
                    />
                }
                </Surface>
            </SafeAreaView>
        );
    }
}

export default connect(state => ({
    favorites: state.favorites,
    animeDatas: state.animeDatas
}))(FavoritesList);