import { ADD_FAVORITE, REMOVE_FAVORITE } from "../actionTypes";

const initialState = {
    byIds: {},
    idList: []
};

export default function (state = initialState, action) {
    switch (action.type) {
        case ADD_FAVORITE: {
            const { id, data } = action.payload;
            if (id in state.byIds)
                return state;
            return {
                ...state,
                byIds: {
                    ...state.byIds,
                    [id]: data
                },
                idList: [id, ...state.idList]
            };
        }
        case REMOVE_FAVORITE: {
            const { id } = action.payload;
            const { [id]: _, ...byIds } = state.byIds;
            const index = state.idList.indexOf(id);
            return {
                ...state,
                byIds,
                idList: [
                    ...state.idList.slice(0, index),
                    ...state.idList.slice(index + 1)
                ]
            };
        }
        default:
            return state;
    }
}