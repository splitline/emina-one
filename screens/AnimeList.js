import * as React from 'react';
import { Text, View, StyleSheet, ScrollView, BackHandler, RefreshControl, Dimensions, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { parse } from 'node-html-parser';
import { connect } from 'react-redux';
import { List, Appbar, Searchbar, Chip } from 'react-native-paper';
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";

import AnimeEntry from "../components/AnimeEntry";
import FullscreenLoading from '../components/fullscreenLoading'
import { getPastSeasons } from "../utils/anime-season";
import { setAnimeDatas } from "../redux/actions";

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

class AnimeList extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = this.props.navigation;
    let { width } = Dimensions.get("window");

    this.animeDatas = [];
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => this.handleBackPress());

    this.state = {
      refreshing: false,
      searchText: "",
      searching: false,

      dataProvider: new DataProvider((r1, r2) => r1.id !== r2.id),
      layoutProvider: new LayoutProvider(() => 0, (_, dim) => (dim.width = width) && (dim.height = 72))
    };
  }

  handleBackPress() {
    if (this.state.searching) {
      this.setState({ searching: false });
      this.restoreList();
      return true;
    }
    return false;
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const { setAnimeDatas } = this.props;
    this.setState({ refreshing: true });
    fetch('https://anime1.me/')
      .then(r => r.text())
      .then(html => {
        const document = parse(html);
        const result = document.querySelectorAll("#tablepress-1 tbody tr").map(elem => {
          const datas = elem.querySelectorAll("td");
          return {
            id: +datas[0].firstChild.getAttribute('href').split('=')[1],
            title: datas[0].text,
            episode: datas[1].text,
            season: datas[2].text + datas[3].text,
            fansub: datas[4].text.trim() !== "-" ? datas[4].text : "",
            keyword: [datas[0].text, datas[1].text, datas[2].text + datas[3].text].join("|").toLowerCase()
          };
        });
        this.setState({ refreshing: false, dataProvider: this.state.dataProvider.cloneWithRows(result) });
        this.animeDatas = result;
        setAnimeDatas(result);
      })
  }

  renderRow = (_, item) => (
    <AnimeEntry {...item} navigation={this.navigation} />
  )

  search(searchText) {
    searchText = searchText.trim().toLowerCase();
    if (searchText === "" || searchText === this.state.searchText) {
      this.restoreList();
      return;
    }
    this.setState({
      searchText,
      dataProvider: this.state.dataProvider.cloneWithRows(
        this.animeDatas.filter(data => data.keyword.includes(searchText))
      )
    });
  }

  restoreList() {
    this.setState({
      searchText: "",
      dataProvider: this.state.dataProvider.cloneWithRows(this.animeDatas)
    });
  }

  render() {
    const { refreshing, searching } = this.state;
    return (
      <SafeAreaView style={styles.container}>
        {searching ?
          <Appbar.Header>
            <Searchbar
              icon="keyboard-backspace"
              autoFocus
              onChangeText={text => this.search(text)}
              onIconPress={() => {
                this.restoreList();
                this.setState({ searching: !searching });
              }} />
          </Appbar.Header> :
          <Appbar.Header>
            <Appbar.Content title="所有動畫" />
            <Appbar.Action icon="magnify" onPress={() => this.setState({ searching: !searching })} />
            <Appbar.Action icon="information-outline" onPress={() => { }} />
          </Appbar.Header>}
        <View>
          <ScrollView keyboardShouldPersistTaps="always" horizontal>
            {["連載中", "劇場版", "OVA", "OAD", ...getPastSeasons()].map(
              (text, i) =>
                <Chip
                  key={i}
                  style={{ marginHorizontal: 4, marginVertical: 8 }}
                  onPress={() => this.search(text)}
                  selected={this.state.searchText === text.toLowerCase()}>
                  {text}
                </Chip>)}
          </ScrollView>
        </View>
        {this.state.dataProvider.getSize() !== 0 ?
          <RecyclerListView
            dataProvider={this.state.dataProvider}
            layoutProvider={this.state.layoutProvider}
            rowRenderer={this.renderRow}
            style={{ flex: 1 }}
            scrollViewProps={{
              refreshControl: !searching && <RefreshControl refreshing={refreshing} onRefresh={() => this.fetchData()} />,
              keyboardShouldPersistTaps: "always"
            }}
          /> :
          refreshing ?
            <FullscreenLoading /> :
            <View style={{ flex: 1, paddingTop: 24, alignItems: 'center' }} >
              <Text>這裡什麼都沒有 (´；ω；｀)</Text>
            </View>

        }
      </SafeAreaView>
    );
  }
}

export default connect(
  state => ({ animeDatas: state.animeDatas }),
  { setAnimeDatas }
)(AnimeList);