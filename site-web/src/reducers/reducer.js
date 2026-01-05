import { Action, Category } from '../utils/constants';

export const initialState = {
    pseudo: '',
    title: '',
    category: Category.DEBATE,
    content: '',
};

export const reducer = (state, action) => {
    switch (action.type) {
        case Action.LOGIN:
            return { ...state, pseudo: action.pseudo };
        case Action.LOGOUT:
            return { ...state, pseudo: initialState.pseudo };
        case Action.NEW_POST_CONTENT:
            return { ...state, post: action.post };
        case Action.NEW_POST_TITLE:
            return { ...state, title: action.title };
        case Action.NEW_POST_CATEGORY:
            return { ...state, category: action.category };
        case Action.RESET_NEW_POST:
            return { ...state, post: initialState.post, title: initialState.title, category: initialState.category };
        default:
            return state;
    }
};
