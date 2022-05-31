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
        this.nodePort.value                  = this.props.config.NODE_PORT;
        this.nodeHost.value                  = this.props.config.NODE_HOST;
        this.nodePortApi.value               = this.props.config.NODE_PORT_API;
        this.nodeConnectionInboundMax.value  = format.number(this.props.config.NODE_CONNECTION_INBOUND_MAX);
        this.nodeConnectionOutboundMax.value = format.number(this.props.config.NODE_CONNECTION_OUTBOUND_MAX);
        this.nodeInitialList.value           = JSON.stringify(this.props.config.NODE_INITIAL_LIST);
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

        const errorList = [];
        validate.required('node port', this.nodePort.value, errorList);
        validate.required('node ip', this.nodeHost.value, errorList);
        validate.required('api port', this.nodePortApi.value, errorList);
        validate.required('max connections in', this.nodeConnectionInboundMax.value, errorList);
        validate.required('max connections out', this.nodeConnectionOutboundMax.value, errorList);
        validate.required('initial peer list', this.nodeInitialList.value, errorList);
        let networkConfig = {
            NODE_PORT                   : validate.integerPositive('node port', this.nodePort.value, errorList, false),
            NODE_HOST                   : validate.ip('node ip', this.nodeHost.value, errorList),
            NODE_PORT_API               : validate.integerPositive('api port', this.nodePortApi.value, errorList, false),
            NODE_CONNECTION_INBOUND_MAX : validate.integerPositive('max connections in', this.nodeConnectionInboundMax.value, errorList, false),
            NODE_CONNECTION_OUTBOUND_MAX: validate.integerPositive('max connections out', this.nodeConnectionOutboundMax.value, errorList, false),
            NODE_INITIAL_LIST           : validate.json('initial peer list', this.nodeInitialList.value, errorList)
        };

        if (errorList.length === 0) {
            this.props.walletUpdateConfig(networkConfig).then(() => {
                this.setState({
                    sending: false
                });
                this.changeModalShowSaveResult();
            }).catch(() => {
                errorList.push({
                    name   : 'save_error',
                    message: 'error while saving occurred, please try again later'
                });
            });
        }
        else {
            this.setState({
                sending   : false,
                error_list: errorList
            });
        }
    }

    render() {
        return <div>
            <ModalView
                show={this.state.modal_show_save_result}
                size={'lg'}
                on_close={() => this.changeModalShowSaveResult(false)}
                heading={'success'}
                body={
                    <div>
                        successfully saved
                    </div>
                }/>
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>network</div>
                    <div className={'panel-body'}>
                        <ErrorList
                            error_list={this.state.error_list}/>
                        <Row>
                            <Form>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>node public ip</label>
                                        <Form.Control
                                            type="text"
                                            value={this.state.node_public_ip}
                                            readOnly/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>node ip<HelpIconView help_item_name={'node_ip'}/></label>
                                        <Form.Control
                                            type="text"
                                            ref={(c) => this.nodeHost = c}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>node port</label>
                                        <Form.Control
                                            type="text"
                                            ref={(c) => this.nodePort = c}
                                            onChange={(e) => {
                                                return validate.handleInputChangeInteger(e, false, false);
                                            }}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>api port<HelpIconView help_item_name={'api_port'}/></label>
                                        <Form.Control
                                            type="text"
                                            ref={(c) => this.nodePortApi = c}
                                            onChange={(e) => {
                                                return validate.handleInputChangeInteger(e, false, false);
                                            }}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>max connections in<HelpIconView help_item_name={'max_connections_in'}/></label>
                                        <Form.Control
                                            type="text"
                                            ref={(c) => this.nodeConnectionInboundMax = c}
                                            onChange={(e) => {
                                                return validate.handleInputChangeInteger(e, false);
                                            }}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>max connections out<HelpIconView help_item_name={'max_connections_out'}/></label>
                                        <Form.Control
                                            type="text"
                                            ref={(c) => this.nodeConnectionOutboundMax = c}
                                            onChange={(e) => {
                                                return validate.handleInputChangeInteger(e, false);
                                            }}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>initial peer list<HelpIconView help_item_name={'initial_peer_list'}/></label>
                                        <Form.Control as="textarea" rows={5}
                                                      ref={(c) => this.nodeInitialList = c}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group
                                        className={'d-flex justify-content-center'}>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => this.save()}
                                            disabled={this.state.sending}>
                                            {this.state.sending ? <>{'saving'}</> : <>continue</>}
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
