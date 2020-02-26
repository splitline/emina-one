import * as React from 'react';
import { Text, View, StyleSheet, Share, Linking, Alert } from 'react-native';
import { Appbar, List, Surface, Card, Title, Paragraph, Avatar } from 'react-native-paper';

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        margin: 16,
        elevation: 3
    }
})

const AboutScreen = ({ navigation }) => {
    return (
        <View>
            <Appbar.Header dark statusBarHeight={0} style={{backgroundColor:'white'}}>
                <Appbar.BackAction color="black" onPress={() => navigation.goBack()} />
            </Appbar.Header>
            <Card style={styles.card}>
                <Card.Title
                    title="關於 Emina One"
                    subtitle="這是一個 anime1.me 的非官方 APP。"
                />
                <List.Item
                    title="Anime1.me"
                    description="前往 Anime1.me 的官方網站"
                    left={props => <List.Icon icon="web" {...props} />}
                    onPress={() => Linking.openURL("https://anime1.me/")}
                />
                <List.Item
                    title="程式原始碼"
                    description="給個星星或是貢獻一下"
                    left={props => <List.Icon icon="github-circle" {...props} />}
                    onPress={() => Linking.openURL("https://github.com/splitline/emina-one")}
                />
                <List.Item
                    title="分享這個 App"
                    description="真的會有人用這個功能嗎？"
                    left={props => <List.Icon icon="share" {...props} />}
                    onPress={() => Share.share({ message: "Emina One：anime1.me 的非官方 APP。\nhttps://github.com/splitline/emina-one/releases" })}
                />
            </Card>

            {/* <Card style={styles.card}>
                <List.Item
                    title="清除資料"
                    description="包含觀看紀錄、收藏的動畫"
                    left={props => <List.Icon icon="trash-can" {...props} />}
                    onPress={() => Alert.alert(
                        "清除資料",
                        "確定要清除嗎？", [
                        { text: "確定", onPress: () => persistor.purge().then(() => Alert.alert("清除成功","請手動重啟 App 以重置資料")) },
                        { text: "取消", style: "cancel" }
                    ])}
                />
            </Card> */}
        </View>
    )
}

export default AboutScreen;