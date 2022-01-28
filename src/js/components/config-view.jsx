import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {addWalletAddressVersion, removeWalletAddressVersion, walletUpdateConfig} from '../redux/actions/index';
import API from '../api/index';
import _ from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import DatatableView from './utils/datatable-view';

class ConfigView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            address_version_name : '',
            address_version_regex: '',
            address_is_default   : false,
            node_public_ip       : '',
            datatables           : []
        };
    }

    async getNodePublicIP() {
        API.getNodePublicIP().then(data => {
            this.setState({
                node_public_ip: data.node_public_ip
            });
        });
    }

    componentDidMount() {
        this.getNodePublicIP()
        this.setConfigToState();
    }

    setConfig(data) {
        _.each(_.keys(data), key => {
            switch (this.props.configType[key]) {
                case 'number':
                    data[key] = JSON.parse(data[key]);
            }
        });

        return this.props.walletUpdateConfig(data);
    }

    addAddressVersion() {
        const data = {
            version        : this._address_version_name.value,
            is_main_network: this.props.config.MODE_TEST_NETWORK ? 0 : 1,
            regex_pattern  : this._address_version_regex.value,
            is_default     : this.state.address_is_default ? 1 : 0
        };
        this.props.addWalletAddressVersion(data);
        this.setState({
            address_version_name : '',
            address_version_regex: '',
            address_is_default   : false
        });
    }

    addToConfigList(configName, stateName) {
        let value        = this.state[stateName];
        const configList = this.props.config[configName];
        if (!value || configList.includes(value)) {
            return;
        }
        value = value.trim();
        configList.push(value);
        this.setState({[stateName]: ''});
        this.setConfig({[configName]: configList});
        this.setConfigToState();
    }


    removeFromConfigList(configName, value) {
        _.pull(this.props.config[configName], value);
        this.setConfig({[configName]: this.props.config[configName]});
        this.setConfigToState();
    }

    setConfigToState() {
        this.setState({
            datatables: {
                connection_inbound: this.props.config.NODE_CONNECTION_INBOUND_WHITELIST.map((input) => ({
                    node_id: input,
                    action : this.getConnectionDeleteButton(input, 'NODE_CONNECTION_INBOUND_WHITELIST')
                })),
                connection_outbound: this.props.config.NODE_CONNECTION_OUTBOUND_WHITELIST.map((input) => ({
                    node_id: input,
                    action : this.getConnectionDeleteButton(input, 'NODE_CONNECTION_OUTBOUND_WHITELIST')
                })),
                connection_static: this.props.config.NODE_CONNECTION_STATIC.map((input) => ({
                    node_id: input,
                    action : this.getConnectionDeleteButton(input, 'NODE_CONNECTION_STATIC')
                })),
                address_version_list: this.props.wallet.address_version_list.map((input) => ({
                    version: input.version,
                    regex_pattern: input.regex_pattern,
                    default_address: input.is_default === 1 ? 'yes' : 'no',
                    action : this.getRemoveWalletAddressVersionButton(input)
                }))
            }
        })
    }


    getConnectionDeleteButton(nodeID, configName) {
        return <Button
            variant="outline-default"
            onClick={() => this.removeFromConfigList(configName, nodeID)}
            className={'btn-xs icon_only ms-auto'}>
            <FontAwesomeIcon
                icon={'trash'}
                size="1x"/>
        </Button>;
    }

    getRemoveWalletAddressVersionButton(addressVersion) {
        return <Button
            variant="outline-default"
            onClick={() => this.props.removeWalletAddressVersion(addressVersion)}
            className={'btn-xs icon_only ms-auto'}>
            <FontAwesomeIcon
                icon={'trash'}
                size="1x"/>
        </Button>;
    }

    render() {
        return <div>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>network</div>
                    <div className={'panel-body'}>
                        <Row>
                            <Form>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label
                                            className="control-label">debug</label>
                                        <div
                                            className="btn-group btn-full-width">
                                            <Form.Control
                                                as="select"
                                                value={this.props.config.MODE_DEBUG ? 'on' : 'off'}
                                                onChange={(e) => {
                                                    this.setConfig({MODE_DEBUG: e.target.value === 'on'})
                                                }}
                                            >
                                                {Array.from([
                                                    'on',
                                                    'off'
                                                ]).map(type =>
                                                    <option
                                                        key={type}
                                                    >{type}</option>
                                                )}
                                            </Form.Control>
                                        </div>
                                    </Form.Group>
                                </Col>

                                {/*            /!**/}
                                {/*             <Form.Group className="form-group" as={Row}>*/}
                                {/*             <Form.Label column sm="1">*/}
                                {/*             network*/}
                                {/*             </Form.Label>*/}

                                {/*             <Col sm="10" style={{*/}
                                {/*             marginTop   : 'auto',*/}
                                {/*             marginBottom: 'auto'*/}
                                {/*             }}>*/}
                                {/*             <Switch*/}
                                {/*             className={"switch-class network-switch"}*/}
                                {/*             id="networkSelectSwitch"*/}
                                {/*             options={*/}
                                {/*             {*/}
                                {/*             color: '#9400CE',*/}
                                {/*             size : 'small'*/}
                                {/*             }*/}
                                {/*             }*/}
                                {/*             label={!this.props.config.MODE_TEST_NETWORK ? 'main network' : 'test network'}*/}
                                {/*             checked={!this.props.config.MODE_TEST_NETWORK}*/}
                                {/*             ref={(c) => this._network = c}*/}
                                {/*             onChange={(checked) => {*/}
                                {/*             this.setState({*/}
                                {/*             is_main_network   : checked,*/}
                                {/*             show_restart_modal: true*/}
                                {/*             });*/}
                                {/*             }}*/}
                                {/*             />*/}
                                {/*             </Col>*/}
                                {/*             </Form.Group>*!/*/}

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>network
                                            port</label>

                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._port = c}
                                            onChange={() => {
                                                this.setConfig({NODE_PORT: this._port.value});
                                            }}
                                            value={this.props.config.NODE_PORT}/>
                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>rpc
                                            port</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._api_port = c}
                                            onChange={() => {
                                                this.setConfig({NODE_PORT_API: this._api_port.value});
                                            }}
                                            value={this.props.config.NODE_PORT_API}/>

                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>server bind</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._host = c}
                                            onChange={() => {
                                                this.setConfig({NODE_HOST: this._host.value});
                                            }}
                                            value={this.props.config.NODE_HOST}/>

                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>node
                                            public ip</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            value={this.state.node_public_ip}
                                            readOnly/>
                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>nodes</label>
                                        <Form.Control as="textarea" rows={10}
                                                      placeholder=""
                                                      ref={(c) => this._nodes = c}
                                                      onChange={() => {
                                                          this.setConfig({NODE_INITIAL_LIST: JSON.parse(this._nodes.value.split(','))});
                                                      }}
                                                      value={JSON.stringify(this.props.config.NODE_INITIAL_LIST)}
                                        />

                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>max
                                            connections
                                            in</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._max_in_connections = c}
                                            onChange={() => {
                                                this.setConfig({NODE_CONNECTION_INBOUND_MAX: this._max_in_connections.value});
                                            }}
                                            value={this.props.config.NODE_CONNECTION_INBOUND_MAX}/>
                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>max
                                            connections
                                            out</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this.max_out_connections = c}
                                            onChange={() => {
                                                this.setConfig({NODE_CONNECTION_OUTBOUND_MAX: this.max_out_connections.value});
                                            }}
                                            value={this.props.config.NODE_CONNECTION_OUTBOUND_MAX}/>
                                    </Form.Group>
                                </Col>
                            </Form>
                        </Row>
                    </div>
                </div>

                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>inbound connection
                        whitelist
                    </div>
                    <div className={'panel-body'}>
                        <Col>
                            <Form.Group className="form-group">
                                <label>add
                                    inbound
                                    connection
                                </label>
                                <Row>
                                    <Col sm="10"
                                         md="11">
                                        <Form.Control
                                            type="text"
                                            placeholder="node id"
                                            ref={(c) => this._connection_whitelist_inbound_node = c}
                                            onChange={() => {
                                                this.setState({connection_whitelist_inbound_node: this._connection_whitelist_inbound_node.value});
                                            }}
                                            value={this.state.connection_whitelist_inbound_node}/>
                                    </Col>
                                    <Col sm="2"
                                         md="1">
                                        <Button
                                            variant="outline-primary"
                                            size={'sm'}
                                            onClick={() => this.addToConfigList('NODE_CONNECTION_INBOUND_WHITELIST', 'connection_whitelist_inbound_node')}>
                                            <FontAwesomeIcon
                                                icon="plus"
                                                size="1x"/>
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Col>
                        <Col>
                            <DatatableView
                                value={this.state.datatables.connection_inbound}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'node_id'
                                    },
                                ]}/>
                        </Col>
                    </div>
                </div>

                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>outbound
                        connection
                        whitelist
                    </div>
                    <div className={'panel-body'}>
                        <Col>
                            <Form.Group className="form-group">
                                <label>add
                                    outbound
                                    connection
                                </label>
                                <Row>
                                    <Col sm="10"
                                         md="11">
                                        <Form.Control
                                            type="text"
                                            placeholder="node id"
                                            ref={(c) => this._connection_whitelist_outbound_node = c}
                                            onChange={() => {
                                                this.setState({connection_whitelist_outbound_node: this._connection_whitelist_outbound_node.value});
                                            }}
                                            value={this.state.connection_whitelist_outbound_node}/>
                                    </Col>
                                    <Col sm="2"
                                         md="1">
                                        <Button
                                            variant="outline-primary"
                                            size={'sm'}
                                            onClick={() => this.addToConfigList('NODE_CONNECTION_OUTBOUND_WHITELIST', 'connection_whitelist_outbound_node')}>
                                            <FontAwesomeIcon
                                                icon="plus"
                                                size="1x"/>
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Col>
                        <Col>
                            <DatatableView
                                value={this.state.datatables.connection_outbound}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'node_id'
                                    },
                                ]}/>
                        </Col>
                    </div>
                </div>

                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>static
                        connection
                    </div>
                    <div className={'panel-body'}>
                        <Col>
                            <Form.Group className="form-group">
                                <label>add
                                    static
                                    connection
                                </label>
                                <Row>
                                    <Col sm="10"
                                         md="11">
                                        <Form.Control
                                            type="text"
                                            placeholder="node id"
                                            ref={(c) => this._connection_static_node = c}
                                            onChange={() => {
                                                this.setState({connection_static_node: this._connection_static_node.value});
                                            }}
                                            value={this.state.connection_static_node}/>
                                    </Col>
                                    <Col sm="2"
                                         md="1">
                                        <Button
                                            variant="outline-primary"
                                            size={'sm'}
                                            onClick={() => this.addToConfigList('NODE_CONNECTION_STATIC', 'connection_static_node')}>
                                            <FontAwesomeIcon
                                                icon="plus"
                                                size="1x"/>
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Col>
                        <Col>
                            <DatatableView
                                value={this.state.datatables.connection_static}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'node_id'
                                    },
                                ]}/>
                        </Col>
                    </div>
                </div>

                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>fees</div>
                    <div className={'panel-body'}>
                        <Col>
                            <Form.Group className="form-group">
                                <label>transaction proxy
                                    fees</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._fee_proxy_fee = c}
                                    onChange={() => {
                                        this.setConfig({TRANSACTION_FEE_PROXY: this._fee_proxy_fee.value});
                                    }}
                                    value={this.props.config.TRANSACTION_FEE_PROXY}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>transaction
                                    fees</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._fee_transaction_default = c}
                                    onChange={() => {
                                        this.setConfig({TRANSACTION_FEE_DEFAULT: this._fee_transaction_default.value});
                                    }}
                                    value={this.props.config.TRANSACTION_FEE_DEFAULT}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>network fee
                                    (%)</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._fee_transaction_network = c}
                                    onChange={() => {
                                        this.setConfig({TRANSACTION_FEE_NETWORK: parseFloat(this._fee_transaction_network.value) / 100});
                                    }}
                                    value={this.props.config.TRANSACTION_FEE_NETWORK * 100}/>
                            </Form.Group>
                        </Col>
                    </div>
                </div>

                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>consensus</div>
                    <div className={'panel-body'}>
                        <Col>
                            <Form.Group className="form-group">
                                <label>number
                                    of nodes</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_n_nodes = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_ROUND_NODE_COUNT: this._consensus_n_nodes.value});
                                    }}
                                    value={this.props.config.CONSENSUS_ROUND_NODE_COUNT}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>min
                                    include
                                    path</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_min_inc_path = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_ROUND_PATH_LENGTH_MIN: this._consensus_min_inc_path.value});
                                    }}
                                    value={this.props.config.CONSENSUS_ROUND_PATH_LENGTH_MIN}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>number
                                    of validation
                                    rounds</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_max_validation_rounds = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_ROUND_VALIDATION_MAX: this._consensus_max_validation_rounds.value});
                                    }}
                                    value={this.props.config.CONSENSUS_ROUND_VALIDATION_MAX}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>max
                                    double spend
                                    bound</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_max_double_spend_rounds = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_ROUND_DOUBLE_SPEND_MAX: this._consensus_max_double_spend_rounds.value});
                                    }}
                                    value={this.props.config.CONSENSUS_ROUND_DOUBLE_SPEND_MAX}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>number
                                    of validation
                                    required</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_required_validation_rounds = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_ROUND_VALIDATION_REQUIRED: this._consensus_required_validation_rounds.value});
                                    }}
                                    value={this.props.config.CONSENSUS_ROUND_VALIDATION_REQUIRED}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>max
                                    wait
                                    (sec)</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_max_wait_time = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_VALIDATION_WAIT_TIME_MAX: this._consensus_max_wait_time.value});
                                    }}
                                    value={this.props.config.CONSENSUS_VALIDATION_WAIT_TIME_MAX}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>retry
                                    wait
                                    (sec)</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_retry_wait_time = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_VALIDATION_RETRY_WAIT_TIME: this._consensus_retry_wait_time.value});
                                    }}
                                    value={this.props.config.CONSENSUS_VALIDATION_RETRY_WAIT_TIME}/>
                            </Form.Group>
                        </Col>
                    </div>
                </div>

                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>address version
                    </div>
                    <div className={'panel-body'}>
                        <Col>
                            <Form.Group className="form-group">
                                <label
                                    className="label-btn">default
                                    address</label>
                                <div
                                    className="btn-group btn-full-width">
                                    <Form.Control
                                        as="select"
                                        value={this.state.address_is_default ? 'yes' : 'no'}
                                        onChange={(e) => {
                                            this.setState({address_is_default: e.target.value === 'yes'});
                                        }}
                                    >
                                        {Array.from([
                                            'yes',
                                            'no'
                                        ]).map(type =>
                                            <option
                                                key={type}
                                            >{type}</option>
                                        )}
                                    </Form.Control>
                                </div>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>version</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._address_version_name = c}
                                    onChange={() => {
                                        this.setState({address_version_name: this._address_version_name.value});
                                    }}
                                    value={this.state.address_version_name}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>add
                                    static
                                    connection
                                </label>
                                <Row>
                                    <Col sm="10"
                                         md="11">
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._address_version_regex = c}
                                            onChange={() => {
                                                this.setState({address_version_regex: this._address_version_regex.value});
                                            }}
                                            value={this.state.address_version_regex}/>
                                    </Col>
                                    <Col sm="2"
                                         md="1">
                                        <Button
                                            variant="outline-primary"
                                            size={'sm'}
                                            onClick={this.addAddressVersion.bind(this)}>
                                            <FontAwesomeIcon
                                                icon="plus"
                                                size="1x"/>
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Col>

                        <div>
                            <DatatableView
                                value={this.state.datatables.address_version_list}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'version'
                                    },
                                    {
                                        field: 'regex_pattern'
                                    },
                                    {
                                        field: 'default_address'
                                    },
                                ]}/>
                        </div>
                    </div>
                </div>

            </Form>
        </div>;
    }
}


export default connect(
    state => ({
        config    : state.config,
        configType: state.configType,
        wallet    : state.wallet
    }),
    {
        walletUpdateConfig,
        addWalletAddressVersion,
        removeWalletAddressVersion
    })(withRouter(ConfigView));
