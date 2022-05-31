import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Col, Form} from 'react-bootstrap';
import {withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import moment from 'moment';


class DatatableHeaderView extends Component {
    constructor(props) {
        super(props);
        moment.relativeTimeThreshold('ss', -1); // required to get diff in
        // seconds instead of "a few
        // seconds ago"
    }

    render() {
        let actionButton = {
            icon    : 'plus-circle',
            label   : 'create',
            on_click: false,
            args    : []
        };

        if (this.props.action_button) {
            if (typeof (this.props.action_button.on_click) === 'function') {
                actionButton.on_click = this.props.action_button.on_click;
            }

            if (this.props.action_button.icon) {
                actionButton.icon = this.props.action_button.icon;
            }

            if (this.props.action_button.label) {
                actionButton.label = this.props.action_button.label;
            }

            if (this.props.action_button.args) {
                actionButton.args = this.props.action_button.args;
            }
        }

        return (
            <div className={'datatable_action_row'}>
                {this.props.allow_export && (
                    <>
                        <Col>
                            <Button variant="outline-primary"
                                    size={'sm'}
                                    onClick={() => this.props.datatable_reference.exportCSV({selectionOnly: false})}
                            >
                                csv
                            </Button>
                        </Col>
                    </>
                )}

                {actionButton.on_click && (
                    <>
                        <Col>
                            <Button variant="outline-primary"
                                    size={'sm'}
                                    className={'datatable_action_button'}
                                    onClick={() => actionButton.on_click(this.props, actionButton.args)}>
                                <FontAwesomeIcon
                                    icon={actionButton.icon}
                                    size="1x"/>
                                {actionButton.label}
                            </Button>

                        </Col>
                    </>
                )}

                {(this.props.allow_export || actionButton.on_click) && (
                    <hr/>
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
    on_global_search_change   : PropTypes.func,
    datatable_reference       : PropTypes.any,
    allow_export              : PropTypes.bool
};

export default withRouter(DatatableHeaderView);
