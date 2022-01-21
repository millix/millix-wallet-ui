import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {Route, withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';


class DatatableActionButtonView extends Component {
    constructor(props) {
        super(props);
    }

    onClickHandler() {
        if (this.props.history_path && this.props.history_state) {
            this.props.history.push(this.props.history_path, this.props.history_state);
        }
    }

    render() {
        let icon = 'pencil-alt';
        if (this.props.icon) {
            icon = this.props.icon;
        }

        return (
            <Button
                variant="outline-default"
                className={'btn-xs icon_only ms-auto'}
                onClick={() => this.onClickHandler()}>
                <FontAwesomeIcon
                    icon={icon}
                    size="1x"/>
            </Button>
        );
    }
}


DatatableActionButtonView.propTypes = {
    icon         : PropTypes.string,
    history_path : PropTypes.string,
    history_state: PropTypes.any
};

export default withRouter(DatatableActionButtonView);
