import { SET_ANIME_DATAS } from "../actionTypes";

const initialState = {};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_ANIME_DATAS: {
            return action.payload;
        }
        default:
            return state;
    }
}