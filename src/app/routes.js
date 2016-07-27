import React from "react";
import {Route, IndexRoute} from "react-router";
import AppLayout from "./containers/layout/AppLayout";
import HomePage from "./containers/pages/home/HomePage";
import AboutPage from "./containers/pages/about/AboutPage";

export default (
    <Route path="/" component={AppLayout}>
        <IndexRoute component={HomePage}/>
        <Route path="/about" component={AboutPage}/>
    </Route>
)