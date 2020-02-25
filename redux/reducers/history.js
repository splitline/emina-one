import { PUSH_HISTORY } from '../actionTypes'

const initialState = {
    // 123: {
    //     lastWatch: 'Thu Jan 01 1970 00:00:00',
    //     watchedList: [{
    //         id: 13337,
    //         title: 'meowmeow [1]',
    //         lastWatch: 'Thu Jan 01 1970 00:00:00'
    //     }, {
    //         id: 12345,
    //         title: 'meowmeow [2]',
    //         lastWatch: 'Thu Jan 01 1970 00:00:00'
    //     }]
    // }
};

export default function (state = initialState, action) {
    switch (action.type) {
        case PUSH_HISTORY:
            const { animeId, lastWatch, videoId, title } = action.payload;
            const watchedList = state[animeId]?.watchedList || [];

            return {
                ...state,
                [animeId]: {
                    lastWatch,
                    watchedList: [
                        {
                            id: videoId,
                            title,
                            lastWatch
                        },
                        ...watchedList?.filter(item => item.id !== videoId)
                    ]
                }
            };
        default:
            return state;
    }
}