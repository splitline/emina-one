import * as React from 'react';
import { Text, View, StyleSheet, ScrollView, SafeAreaView, RefreshControl, Dimensions } from 'react-native';
import { parse } from 'node-html-parser';

import { List, Appbar, Searchbar, Chip, IconButton } from 'react-native-paper';
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";


const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

const genSeasons = () =>
  Array(4).fill(0)
    .map((_, i) => {
      const date = new Date();
      return new Date(date.setMonth(date.getMonth() - 3 * i))
    })
    .map(d => d.getFullYear() + ["冬", "春", "夏", "秋"][Math.floor(d.getMonth() / 3)]);

class ListItem extends React.PureComponent {
  render() {
    return (
      <List.Item
        title={this.props.item.name}
        description={`${this.props.item.episode} / ${this.props.item.season}`}
        right={() => <List.Subheader>{this.props.item.fansub}</List.Subheader>}
        onPress={() => { this.props.navigation.navigate("Video", { animeId: this.props.item.id, animeData: this.props.item }) }}
      />
    );
  }
}

class AnimeList extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = this.props.navigation;
    let { width } = Dimensions.get("window");

    this._animeData = [];
    this.state = {
      animeData: [],
      refreshing: false,
      searchText: "",

      dataProvider: new DataProvider((r1, r2) => r1.id !== r2.id),
      layoutProvider: new LayoutProvider(() => 0, (_, dim) => (dim.width = width) && (dim.height = 64))
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
            fansub: datas[4].text.trim() !== "-" ? datas[4].text : "",
            keyword: [datas[0].text, datas[1].text, datas[2].text + datas[3].text].join("|").toLowerCase()
          }
        })
        this.setState({ animeData: result, refreshing: false, dataProvider: this.state.dataProvider.cloneWithRows(result) });
        this._animeData = result;
      })
  }

  renderRow = (_, item) => (
    <ListItem item={item} navigation={this.navigation} />
  )

  search(searchText) {
    searchText = searchText.trim().toLowerCase();
    if (searchText === "" || searchText === this.state.searchText) {
      this.restoreList();
      return;
    }
    this.setState({ searchText });
    const animeData = this._animeData.filter(data => data.keyword.indexOf(searchText) > -1)
    this.setState({
      animeData,
      dataProvider: this.state.dataProvider.cloneWithRows(animeData)
    });
  }

  restoreList() {
    this.setState({
      searchText: "",
      animeData: this._animeData,
      dataProvider: this.state.dataProvider.cloneWithRows(this._animeData)
    });
  }

  render() {
    const { refreshing, animeData } = this.state;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {this.state.search ?
          <Appbar.Header>
            <Searchbar
              icon="keyboard-backspace"
              autoFocus
              onChangeText={text => this.search(text)}
              onIconPress={() => {
                this.restoreList();
                this.setState({ search: !this.state.search });
              }} />
          </Appbar.Header> :
          <Appbar.Header>
            <Appbar.Content title="所有動畫" />
            <Appbar.Action icon="magnify" onPress={() => this.setState({ search: !this.state.search })} />
            <Appbar.Action icon="information-outline" onPress={() => { }} />
          </Appbar.Header>}
        <View>
          <ScrollView style={{ padding: 5 }} horizontal>
            {["連載中", "劇場版", "OVA", "OAD", ...genSeasons()].map(
              (text, i) =>
                <Chip
                  onPress={() => this.search(text)}
                  selected={this.state.searchText === text.toLowerCase()} key={i}>
                  {text}
                </Chip>)}
          </ScrollView>
        </View>
        {animeData.length !== 0 ?
          <RecyclerListView
            dataProvider={this.state.dataProvider}
            layoutProvider={this.state.layoutProvider}
            rowRenderer={this.renderRow}
            style={{ flex: 1 }}
            scrollViewProps={{
              refreshControl: <RefreshControl refreshing={refreshing} onRefresh={() => this.fetchData()} />
            }}
          /> :
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
            <Text>{refreshing ? "載入中" : "這裡什麼都沒有"}</Text>
          </View>
        }
      </SafeAreaView>
    );
  }
}

export default AnimeList;