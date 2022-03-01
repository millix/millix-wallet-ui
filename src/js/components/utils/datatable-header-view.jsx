import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {Route, withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import moment from 'moment';
import HelpIconView from './help-icon-view';


class DatatableHeaderView extends Component {
    constructor(props) {
        super(props);
        moment.relativeTimeThreshold('ss', -1); // required to get diff in
        // seconds instead of "a few
        // seconds ago"
    }

    render() {
        let action_button = {
            icon    : 'plus-circle',
            label   : 'create',
            on_click: false,
            args    : []
        };

        if (this.props.action_button) {
            if (typeof (this.props.action_button.on_click) === 'function') {
                action_button.on_click = this.props.action_button.on_click;
            }

            if (this.props.action_button.icon) {
                action_button.icon = this.props.action_button.icon;
            }

            if (this.props.action_button.label) {
                action_button.label = this.props.action_button.label;
            }

            if (this.props.action_button.args) {
                action_button.args = this.props.action_button.args;
            }
        }

        return (
            <div className={'datatable_action_row'}>
                {action_button.on_click && (
                    <>
                        <Col>
                            <Button variant="outline-primary"
                                    size={'sm'}
                                    className={'datatable_action_button'}
                                    onClick={() => action_button.on_click(this.props, action_button.args)}>
                                <FontAwesomeIcon
                                    icon={action_button.icon}
                                    size="1x"/>
                                {action_button.label}
                            </Button>

                        </Col>
                        <hr/>
                    </>
                )}
                <Col xs={12} md={4}>
                    {typeof (this.props.reload_datatable) === 'function' && (
                        <Button variant="outline-primary"
                                size={'sm'}
                                className={'refresh_button'}
                                onClick={() => this.props.reload_datatable()}
                        >
                            <FontAwesomeIcon
                                icon={'sync'}
                                size="1x"/>
                            refresh
                        </Button>
                    )}
                </Col>

                <Col xs={12} md={4} className={'datatable_refresh_ago'}>
                    {this.props.datatable_reload_timestamp && (
                        <span>
                                refreshed {this.props.datatable_reload_timestamp && moment(this.props.datatable_reload_timestamp).fromNow()}
                            </span>
                    )}
                </Col>

                <Col xs={12} md={4}>
                    {typeof (this.props.on_global_search_change) === 'function' && (
                        <Form.Control
                            type="text"
                            className={'datatable_search_input'}
                            onChange={this.props.on_global_search_change.bind(this)}
                            placeholder="search"/>
                    )}
                </Col>
            </div>
        );
    }
}


DatatableHeaderView.propTypes = {
    datatable_reload_timestamp: PropTypes.any,
    action_button             : PropTypes.any,
    reload_datatable          : PropTypes.func,
    on_global_search_change   : PropTypes.func
};

export default withRouter(DatatableHeaderView);
