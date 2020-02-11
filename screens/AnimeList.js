import * as React from 'react';
import { Text, View, StyleSheet, FlatList, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { parse } from 'node-html-parser';

import { List, Appbar, Searchbar } from 'react-native-paper';


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cellContainer: {
    borderBottomWidth: 1,
    borderColor: '#dcdcdc',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15
  },
});

class AnimeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      animeData: []
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    this.setState({ refreshing: true });
    fetch('https://anime1.me/')
      .then(r => r.text())
      .then(html => {
        const document = parse(html);
        const result = document.querySelectorAll("#tablepress-1 tbody tr").map(elem => {
          const datas = elem.querySelectorAll("td");
          return {
            id: datas[0].firstChild.getAttribute('href').split('=')[1],
            name: datas[0].text,
            episode: datas[1].text,
            season: datas[2].text + datas[3].text,
            fansub: datas[4].text.trim() !== "-" ? datas[4].text : ""
          }
        })
        this.setState({ animeData: result, refreshing: false });
      })
  }

  renderRow = rowData => {
    return (
      <List.Item
        title={rowData.name}
        description={`${rowData.episode} / ${rowData.season}`}
        right={() => <List.Subheader>{rowData.fansub}</List.Subheader>}
        onPress={() => { }}
      />
    )
  }

  render() {
    const { refreshing, animeData } = this.state;
    return (
      <SafeAreaView>
        <Appbar.Header>
          <Appbar.Content title="所有動畫" />
        </Appbar.Header>
        <FlatList
          data={animeData}
          renderItem={({ item }) => this.renderRow(item)}
          keyExtractor={item => item.id}
          initialNumToRender={10}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => this.fetchData()} />}
        />
      </SafeAreaView>
    );
  }
}

export default AnimeList;