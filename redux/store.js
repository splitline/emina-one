import { AsyncStorage } from "react-native";
import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';

import rootReducer from './reducers'

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: [
        'favorites',
        'history'
    ]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

let store = createStore(persistedReducer);
let persistor = persistStore(store);

export {
    store,
    persistor
};