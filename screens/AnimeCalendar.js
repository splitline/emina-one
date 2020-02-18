import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import { parse } from 'node-html-parser';

import AnimeEntry from "../components/AnimeEntry";
import { getCurrentSeason } from "../utils/anime-season";

export default ({ navigation }) => {
    const [calendar, setCalendar] = useState([]);
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
    });
    return (
        <ScrollableTabView
            style={{ marginTop: 25 }}
            initialPage={1}
            renderTabBar={() => <DefaultTabBar />}
        >
            {["日", "一", "二", "三", "四", "五", "六"].map((day, i) =>
                <View tabLabel={day}>
                    {calendar[i] &&
                        calendar[i].map(({ id, title }) =>
                            <AnimeEntry
                                navigation={navigation}
                                item={{ id, name: title }}
                            />)
                    }
                </View>
            )}
        </ScrollableTabView>
    )
};