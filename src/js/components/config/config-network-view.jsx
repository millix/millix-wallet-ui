import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {walletUpdateConfig} from '../../redux/actions';
import API from '../../api';
import ErrorList from '../utils/error-list-view';
import ModalView from '../utils/modal-view';
import * as validate from '../../helper/validate';
import * as format from '../../helper/format';
import HelpIconView from '../utils/help-icon-view';
import Translation from '../../common/translation';


class ConfigNetworkView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            node_public_ip        : '',
            sending               : false,
            error_list            : {},
            modal_show_save_result: false
        };
    }

    componentDidMount() {
        this.getNodePublicIP();
        this.populateForm();
    }

    getNodePublicIP() {
        API.getNodePublicIP().then(data => {
            this.setState({
                node_public_ip: data.node_public_ip
            });
        });
    }

    populateForm() {
        this.node_port.value                    = this.props.config.NODE_PORT;
        this.node_host.value                    = this.props.config.NODE_HOST;
        this.node_port_api.value                = this.props.config.NODE_PORT_API;
        this.node_connection_inbound_max.value  = format.number(this.props.config.NODE_CONNECTION_INBOUND_MAX);
        this.node_connection_outbound_max.value = format.number(this.props.config.NODE_CONNECTION_OUTBOUND_MAX);
        this.node_initial_list.value            = JSON.stringify(this.props.config.NODE_INITIAL_LIST);
    }

    changeModalShowSaveResult(value = true) {
        this.setState({
            modal_show_save_result: value
        });
        if (value === false) {
            this.populateForm();
        }
    }

    save() {
        this.setState({
            sending   : true,
            error_list: []
        });

        const error_list = [];
        validate.required(Translation.getPhrase('cc19fdc0f'), this.node_port.value, error_list);
        validate.required(Translation.getPhrase('110237d00'), this.node_host.value, error_list);
        validate.required(Translation.getPhrase('9e90916e1'), this.node_port_api.value, error_list);
        validate.required(Translation.getPhrase('b389b5852'), this.node_connection_inbound_max.value, error_list);
        validate.required(Translation.getPhrase('df5bcf14a'), this.node_connection_outbound_max.value, error_list);
        validate.required(Translation.getPhrase('3d2b1d5b1'), this.node_initial_list.value, error_list);
        let network_config = {
            NODE_PORT                   : validate.integerPositive(Translation.getPhrase('cc19fdc0f'), this.node_port.value, error_list, false),
            NODE_HOST                   : validate.ip(Translation.getPhrase('110237d00'), this.node_host.value, error_list),
            NODE_PORT_API               : validate.integerPositive(Translation.getPhrase('9e90916e1'), this.node_port_api.value, error_list, false),
            NODE_CONNECTION_INBOUND_MAX : validate.integerPositive(Translation.getPhrase('b389b5852'), this.node_connection_inbound_max.value, error_list, false),
            NODE_CONNECTION_OUTBOUND_MAX: validate.integerPositive(Translation.getPhrase('df5bcf14a'), this.node_connection_outbound_max.value, error_list, false),
            NODE_INITIAL_LIST           : validate.json(Translation.getPhrase('3d2b1d5b1'), this.node_initial_list.value, error_list)
        };

        if (error_list.length === 0) {
            this.props.walletUpdateConfig(network_config).then(() => {
                this.setState({
                    sending: false
                });
                this.changeModalShowSaveResult();
            }).catch(() => {
                error_list.push({
                    name   : 'save_error',
                    message: Translation.getPhrase('6c6762f14')
                });
            });
        }
        else {
            this.setState({
                sending   : false,
                error_list: error_list
            });
        }
    }

    render() {
        return <div>
            <ModalView
                show={this.state.modal_show_save_result}
                size={'lg'}
                on_close={() => this.changeModalShowSaveResult(false)}
                heading={Translation.getPhrase('178dc8098')}
                body={
                    <div>{Translation.getPhrase('ccbc62204')}</div>
                }/>
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>{Translation.getPhrase('8129a4405')}</div>
                    <div className={'panel-body'}>
                        <ErrorList
                            error_list={this.state.error_list}/>
                        <Row>
                            <Form>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>{Translation.getPhrase('57dd46c3f')}</label>
                                        <Form.Control
                                            type="text"
                                            value={this.state.node_public_ip}
                                            readOnly/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>{Translation.getPhrase('110237d00')}<HelpIconView help_item_name={'node_ip'}/></label>
                                        <Form.Control
                                            type="text"
                                            ref={(c) => this.node_host = c}
                                            />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>{Translation.getPhrase('cc19fdc0f')}</label>
                                        <Form.Control
                                            type="text"
                                            ref={(c) => this.node_port = c}
                                            onChange={(e) => {
                                                return validate.handleInputChangeInteger(e, false, false);
                                            }}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>{Translation.getPhrase('9e90916e1')}<HelpIconView help_item_name={'api_port'}/></label>
                                        <Form.Control
                                            type="text"
                                            ref={(c) => this.node_port_api = c}
                                            onChange={(e) => {
                                                return validate.handleInputChangeInteger(e, false, false);
                                            }}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>{Translation.getPhrase('b389b5852')}<HelpIconView help_item_name={'max_connections_in'}/></label>
                                        <Form.Control
                                            type="text"
                                            ref={(c) => this.node_connection_inbound_max = c}
                                            onChange={(e) => {
                                                return validate.handleInputChangeInteger(e, false);
                                            }}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>{Translation.getPhrase('df5bcf14a')}<HelpIconView help_item_name={'max_connections_out'}/></label>
                                        <Form.Control
                                            type="text"
                                            ref={(c) => this.node_connection_outbound_max = c}
                                            onChange={(e) => {
                                                return validate.handleInputChangeInteger(e, false);
                                            }}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>{Translation.getPhrase('3d2b1d5b1')}<HelpIconView help_item_name={'initial_peer_list'}/></label>
                                        <Form.Control as="textarea" rows={5}
                                                      ref={(c) => this.node_initial_list = c}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group
                                        className={'d-flex justify-content-center'}>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => this.save()}
                                            disabled={this.state.sending}>
                                            {this.state.sending ? <>{Translation.getPhrase('15cc5bad2')}</> : <>{Translation.getPhrase('3dedae695')}</>}
                                        </Button>
                                    </Form.Group>
                                </Col>
                            </Form>
                        </Row>
                    </div>
                </div>
            </div>
        </div>;
    }
}


export default connect(
    state => ({
        config: state.config
    }),
    {
        walletUpdateConfig
    })(withRouter(ConfigNetworkView));
