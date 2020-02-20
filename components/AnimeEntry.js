import * as React from 'react';
import { Alert } from "react-native";
import { List, IconButton, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';

import { addFavorite, removeFavorite } from "../redux/actions";

const AnimeEntry = ({
    id, title, episode, season, fansub, navigation,
    favorites, addFavorite, removeFavorite,
    theme
}) => {
    const isFavorite = id in favorites.byIds;
    const toggleFavorite = () => {
        isFavorite ?
            removeFavorite(id) :
            addFavorite(id, {
                addedDate: new Date()
            })
    }
    return (
        <List.Item
            title={title}
            description={`${episode || "-"} / ${season || "-"}`}
            right={() =>
                <IconButton
                    size={20}
                    color={theme.colors.primary}
                    icon={isFavorite ? "heart" : "heart-outline"}
                    onPress={toggleFavorite}
                />}
            onPress={() => typeof id !== 'number' ?
                Alert.alert("(´；ω；｀)", "這部動畫沒上架") :
                navigation.navigate("Video", { animeId: id })}
        />
    );
}

export default connect(
    state => ({ favorites: state.favorites }),
    { addFavorite, removeFavorite }
)(withTheme(AnimeEntry));