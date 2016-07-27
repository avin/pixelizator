import React from "react";

export default class AppLayout extends React.Component {
    render() {
        return (
            <div>
                <hr/>
                {this.props.children}
                <hr/>
            </div>
        )
    }
}