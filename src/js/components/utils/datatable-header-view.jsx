import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Col} from 'react-bootstrap';
import {Route, withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import moment from 'moment';


class DatatableHeaderView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let action_button_icon = 'plus-circle';
        if (this.props.action_button_icon) {
            action_button_icon = this.props.action_button_icon;
        }

        let action_button_label = 'create';
        if (this.props.action_button_label) {
            action_button_label = this.props.action_button_label;
        }

        return (
            <div className={'datatable_action_row'}>
                <Col md={4}>
                    {typeof (this.props.reload_datatable) === 'function' && (
                        <Button variant="outline-primary"
                                className={'btn-sm refresh_button'}
                                onClick={() => this.props.reload_datatable()}
                        >
                            <FontAwesomeIcon
                                icon={'sync'}
                                size="1x"/>
                            refresh
                        </Button>
                    )}
                </Col>

                <Col md={4} className={'datatable_refresh_ago'}>
                    {this.props.datatable_reload_timestamp && (
                        <span>
                                refreshed {this.props.datatable_reload_timestamp && moment(this.props.datatable_reload_timestamp).fromNow()}
                            </span>
                    )}
                </Col>

                <Col md={4}>
                    {typeof (this.props.action_button_on_click) === 'function' && (
                        <Button variant="outline-primary"
                                className={'btn-sm datatable_action_button'}
                                onClick={() => this.props.action_button_on_click()}>
                            <FontAwesomeIcon
                                icon={action_button_icon}
                                size="1x"/>
                            {action_button_label}
                        </Button>
                    )}
                </Col>
            </div>
        );
    }
}


DatatableHeaderView.propTypes = {
    datatable_reload_timestamp: PropTypes.string,
    action_button_icon        : PropTypes.string,
    action_button_label       : PropTypes.string,
    action_button_on_click    : PropTypes.func,
    reload_datatable          : PropTypes.func
};

export default withRouter(DatatableHeaderView);
