import React, { useState, useEffect } from 'react';
import { View, ScrollView, FlatList } from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import { parse } from 'node-html-parser';
import { connect } from 'react-redux';

import AnimeEntry from "../components/AnimeEntry";
import { getCurrentSeason } from "../utils/anime-season";

const AnimeCalendar = ({ navigation, animeDatas }) => {
    const [calendar, setCalendar] = useState([]);
    const today = new Date().getDay();

    useEffect(() => {
        fetch(`https://anime1.me/${getCurrentSeason()}新番`)
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
        <ScrollableTabView
            style={{ marginTop: 25 }}
            prerenderingSiblingsNumber={1}
            initialPage={1}
            renderTabBar={() => <DefaultTabBar />}
            initialPage={today}
        >
            {["日", "一", "二", "三", "四", "五", "六"].map((day, i) =>
                <FlatList
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
                />
            )}
        </ScrollableTabView>
    )
};

export default connect(state => ({ animeDatas: state.animeDatas }))(AnimeCalendar);