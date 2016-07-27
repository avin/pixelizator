import {createStore, compose, applyMiddleware} from "redux";
import {routerMiddleware} from "react-router-redux";
import thunk from "redux-thunk";
import rootReducer from "./modules/index";

export default function configureStore(initialState = {}, history) {

    const middlewares = [
        thunk,
        routerMiddleware(history),
    ];

    const store = createStore(rootReducer, initialState, compose(
        applyMiddleware(...middlewares),

        window.devToolsExtension ? window.devToolsExtension() : f => f
    ));

    //Включаем HMR (только в режиме разработки)
    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('./modules', () => {
            const nextRootReducer = require('./modules/index');
            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
}