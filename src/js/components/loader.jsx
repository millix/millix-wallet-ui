import React from 'react';
import {Subject} from 'rxjs';

const loaderState = new Subject();

export function changeLoaderState(value) {
    loaderState.next(value);
}

const LoadingContainer = props => {
    return (
        <div className="loader-container">
            <div className="loader">
                <div className="circle">
                </div>
            </div>
        </div>
    );
};


class Loader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    componentWillMount() {
        loaderState.subscribe(result => {
            this.setState({loading: result ? true : false});
        });
    }

    render() {
        const {loading} = this.state;

        return loading ? <LoadingContainer/> : null;
    }
}


export default Loader;
