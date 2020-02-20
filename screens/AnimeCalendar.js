import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import { Appbar, withTheme } from "react-native-paper";
import { parse } from 'node-html-parser';
import { connect } from 'react-redux';

import AnimeEntry from "../components/AnimeEntry";
import { getCurrentSeason } from "../utils/anime-season";
import FullscreenLoading from "../components/fullscreenLoading";

const AnimeCalendar = ({ navigation, animeDatas, theme }) => {
    const [calendar, setCalendar] = useState([]);
    const today = new Date().getDay();
    const width = Dimensions.get('window').width / 7;
    const size = Math.min(width, 40);
    const margin = (width - size) / 2;
    const currentSeason = getCurrentSeason();

    useEffect(() => {
        fetch(`https://anime1.me/${currentSeason}新番`)
            .then(r => r.text())
            .then(html => {
                const document = parse(html.replace(/<tr><tr>/g, "<tr>"));
                const calendar = Array(7).fill(null).map(() => []);
                document.querySelectorAll('tbody tr').slice(0, -1).forEach(row =>
                    row.querySelectorAll('td').forEach((data, i) =>
                        data.text.trim() !== '' && calendar[i].push({
                            id: data.firstChild.getAttribute && +data.firstChild.getAttribute('href').split('=')[1],
                            title: data.text
                        })
                    )
                );
                setCalendar(calendar);
            });
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.Content title="新番時間表" subtitle={currentSeason} />
                <Appbar.Action icon="information-outline" onPress={() => { }} />
            </Appbar.Header>
            <ScrollableTabView
                prerenderingSiblingsNumber={1}
                initialPage={today}
                renderTabBar={() =>
                    <DefaultTabBar
                        activeTextColor="white"
                        underlineStyle={{
                            backgroundColor: theme.colors.primary,
                            alignSelf: 'center',
                            margin: margin,
                            width: size,
                            height: size,
                            bottom: undefined,
                            zIndex: -1,
                            borderRadius: size,
                        }}
                        tabStyle={{ paddingBottom: 0, }}
                        style={{ backgroundColor: theme.colors.surface }}
                    />}
            >
                {["日", "一", "二", "三", "四", "五", "六"].map((day, i) =>
                    calendar[i] ?
                        (<FlatList
                            key={i}
                            tabLabel={day}
                            data={calendar[i]}
                            keyExtractor={item => `${item.id}`}
                            renderItem={({ item }) =>
                                <AnimeEntry
                                    navigation={navigation}
                                    {...{
                                        id: item.id,
                                        title: item.title,
                                        ...animeDatas[item.id]
                                    }}
                                />}
                        />) : (<FullscreenLoading tabLabel={day} key={i} />)
                )}
            </ScrollableTabView>
        </View>
    )
};

export default connect(
    state => ({ animeDatas: state.animeDatas })
)(withTheme(AnimeCalendar));