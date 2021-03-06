import { ADD_FAVORITE, REMOVE_FAVORITE, SET_ANIME_DATAS, PUSH_HISTORY, CLEAR_HISTORY } from "./actionTypes";


export const addFavorite = (id, data) => ({
    type: ADD_FAVORITE,
    payload: { id, data }
});

export const removeFavorite = (id) => ({
    type: REMOVE_FAVORITE,
    payload: { id }
});

export const setAnimeDatas = (data) => ({
    type: SET_ANIME_DATAS,
    payload: data.reduce((obj, item) => (obj[+item.id] = item, obj) ,{})
})

export const pushHistory = (animeId, videoId, title) => ({
    type: PUSH_HISTORY,
    payload: {
        animeId,
        lastWatch: +(new Date()),
        videoId,
        title
    }
})

export const clearHistory = () => ({
    type: CLEAR_HISTORY
})