import {routerReducer as routing} from "react-router-redux";
import {reducer as formReducer} from "redux-form";
import {combineReducers} from "redux";
import about from "./about";

export default combineReducers({
    about,

    //Special reducers
    form: formReducer,
    routing,
});
