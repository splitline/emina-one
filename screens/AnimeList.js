import * as React from 'react';
import { Text, View, StyleSheet, FlatList, SafeAreaView, RefreshControl } from 'react-native';
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
    this.navigation = this.props.navigation;
    this.state = {
      animeData: [],
      refreshing: true
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

  renderRow = ({ item }) => {
    return (
      <List.Item
        title={item.name}
        description={`${item.episode} / ${item.season}`}
        right={() => <List.Subheader>{item.fansub}</List.Subheader>}
        onPress={() => { this.navigation.navigate("Video", { animeId: item.id }) }}
      />
    )
  }

  render() {
    const { refreshing, animeData } = this.state;
    return (
      <SafeAreaView>
        <Appbar.Header>
          <Appbar.Content title="所有動畫" />
          <Appbar.Action icon="information-outline" onPress={() => { }} />
        </Appbar.Header>
        <FlatList
          data={animeData}
          renderItem={this.renderRow}
          keyExtractor={item => item.id}
          initialNumToRender={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => this.fetchData()} />}
        />
      </SafeAreaView>
    );
  }
}

export default AnimeList;