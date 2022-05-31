import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Form} from 'react-bootstrap';
import DatatableView from '../utils/datatable-view';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import * as validate from '../../helper/validate';
import API from '../../api';
import DatatableActionButtonView from '../utils/datatable-action-button-view';


class ConfigConnectionView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connection_data: {
                NODE_CONNECTION_STATIC            : [],
                NODE_CONNECTION_OUTBOUND_WHITELIST: [],
                NODE_CONNECTION_INBOUND_WHITELIST : []
            },
            error_list     : []
        };

        this.connectionConfigNames = [
            'NODE_CONNECTION_STATIC',
            'NODE_CONNECTION_OUTBOUND_WHITELIST',
            'NODE_CONNECTION_INBOUND_WHITELIST'
        ];
    }

    componentDidMount() {
        this.loadConfig();
    }

    showDatatableLoading(connectionData, configName = false, showLoader = true) {
        if (configName) {
            connectionData['loading_' + configName] = showLoader;
        }
        else {
            this.connectionConfigNames.forEach((element) => {
                connectionData['loading_' + element] = showLoader;
            });
        }
        connectionData['loading_' + configName] = showLoader;
        this.setState({
            connection_data: connectionData
        });
    }

    loadConfig(configName) {
        const connectionData = this.state.connection_data;
        this.showDatatableLoading(connectionData, configName);

        if (configName) {
            API.getNodeConfigValueByName(configName).then((data) => {
                connectionData[data.config_name] = [];
                this.updateData(connectionData, data);
            });
        }
        else {
            API.getNodeConfig().then((data) => {
                connectionData[data.config_name] = [];
                data.forEach(element => {
                    if (this.connectionConfigNames.includes(element.config_name)) {
                        this.updateData(connectionData, element);
                    }
                });
            });
        }
    }

    clearErrorList() {
        this.setState({
            error_list: []
        });
    }

    updateData(connectionData, element) {
        JSON.parse(element.value).forEach(el => {
            connectionData[element.config_name].push({
                node_id: el,
                action : (<DatatableActionButtonView
                    icon={'trash'}
                    callback={() => this.removeConnection(element.config_name, el)}
                    callback_args={[
                        element.config_name,
                        el
                    ]}
                />)
            });
        });
        connectionData['reload_timestamp_' + element.config_name] = new Date();
        this.showDatatableLoading(connectionData, element.config_name, false);

        this.setState({
            connection_data: connectionData
        });
    }

    removeConnection(configName, value) {
        let resultConfig = [];
        this.state.connection_data[configName].forEach(element => {
            if (element.node_id !== value) {
                resultConfig.push(element);
            }
        });
        API.updateNodeConfigValue(configName, this.prepareApiConfigData(resultConfig)).then(() => {
            this.setState({
                connection_data: {
                    ...this.state.connection_data,
                    [configName]: resultConfig
                }
            });
        });
    }

    showModal(configName, show = true) {
        let connectionData                   = this.state.connection_data;
        connectionData['show_' + configName] = show;
        this.setState({
            connection_data: {...connectionData}
        });
        this.clearErrorList();
    }

    saveConfig(configName) {
        this.clearErrorList();
        let errorList = [];
        validate.required('node id', this[configName].value, errorList);
        const nodeID = validate.string_alphanumeric('node id', this[configName].value, errorList, 34);

        if (errorList.length > 0) {
            this.setState({
                error_list: errorList
            });
        }
        else {
            let configurationData = this.prepareApiConfigData(this.state.connection_data[configName]);
            configurationData.push(nodeID);

            API.updateNodeConfigValue(configName, configurationData).then(() => {
                this.showModal(configName, false);
                this.loadConfig(configName);
            }).catch((e) => {
                this.setState({
                    error_list: [
                        {
                            name   : 'error',
                            message: e.getMessage()
                        }
                    ]
                });
            });
        }
    }

    prepareApiConfigData(configData) {
        let configurationData = [];

        configData.forEach(element => {
            configurationData.push(element.node_id);
        });

        return configurationData;
    }

    getConnectionDatatable(connectionName, configName) {
        return (
            <div className={'panel panel-filled'}>
                <ModalView
                    show={this.state.connection_data['show_' + configName]}
                    size={'lg'}
                    prevent_close_after_accept={true}
                    on_close={() => this.showModal(configName, false)}
                    on_accept={() => this.saveConfig(configName)}
                    heading={`add ${connectionName}`}
                    body={
                        <Form>
                            <ErrorList
                                error_list={this.state.error_list}/>
                            <Form.Control
                                type="text"
                                placeholder="node id"
                                ref={(c) => this[configName] = c}
                                onChange={(e) => {
                                    return validate.handleInputChangeAlphanumericString(e, 34);
                                }}
                            />
                        </Form>
                    }/>
                <div className={'panel-heading bordered'}>
                    {connectionName} whitelist
                </div>
                <div className={'panel-body'}>
                    <Col>
                        <DatatableView
                            reload_datatable={() => {
                                this.loadConfig(configName);
                            }}
                            loading={this.state.connection_data['loading_' + configName]}
                            datatable_reload_timestamp={this.state.connection_data['reload_timestamp_' + configName]}
                            action_button={{
                                label   : `add ${connectionName}`,
                                on_click: () => this.showModal(configName)
                            }}
                            value={this.state.connection_data[configName]}
                            sortOrder={1}
                            showActionColumn={true}
                            resultColumn={[
                                {
                                    field: 'node_id'
                                }
                            ]}
                        />
                    </Col>
                </div>
            </div>
        );
    }

    render() {
        return <div>
            {this.getConnectionDatatable('inbound connection', 'NODE_CONNECTION_INBOUND_WHITELIST')}
            {this.getConnectionDatatable('outbound connection', 'NODE_CONNECTION_OUTBOUND_WHITELIST')}
            {this.getConnectionDatatable('static connection', 'NODE_CONNECTION_STATIC')}
        </div>;
    }
}


export default connect(
    state => ({
        config: state.config
    }),
    {})(withRouter(ConfigConnectionView));
