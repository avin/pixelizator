import Immutable from "immutable";
import {createSelector} from "reselect";

/*
 ================
 CONSTANTS
 ================
 */

const SET_HELLO = 'pix/about/SET_HELLO';

/*
 ================
 initialState
 ================
 */

const initialState = Immutable.fromJS({
    hello: ''
});

/*
 ================
 REDUCER
 ================
 */

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case SET_HELLO: {
            return state.set('hello', action.value);
        }

        default: {
            return state;
        }
    }
}

/*
 ================
 METHODS
 ================
 */

export const setHello = (value) => (dispatch, getState) => {

    setTimeout(() => {
        dispatch({type: SET_HELLO, value});
    }, 1000)

};
