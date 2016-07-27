import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import _ from "lodash";
import {useRouterHistory} from "react-router";
import {syncHistoryWithStore, push} from "react-router-redux";
import Root from "./containers/Root";
import configureStore from "./redux/configureStore";
import withScroll from "scroll-behavior";
import Promise from "bluebird";
import {createHistory} from "history";
import "../styles/bootstrap/bootstrap.less";
import "../styles/pix.less";

//Определяем некоторые библиотеки в глобальное окружение
window.jQuery = window.$ = $;
window.Promise = Promise;
window._ = _;

let browserHistory = useRouterHistory(createHistory)({
    basename: '/'
});

//Инициализируем redux-store
const store = configureStore({}, browserHistory);
const history = withScroll(syncHistoryWithStore(browserHistory, store));

//Монтируем приложение на страницу
ReactDOM.render(
    <Root store={store} history={history}/>,
    document.getElementById('root')
);