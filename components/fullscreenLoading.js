import * as React from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from "react-native-paper";
export default (...props) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} {...props} >
            <ActivityIndicator />
        </View>
    );
}