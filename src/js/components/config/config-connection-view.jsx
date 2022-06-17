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
import _ from 'lodash';
import Translation from '../../common/translation';


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

        this.connection_config_names = [
            'NODE_CONNECTION_STATIC',
            'NODE_CONNECTION_OUTBOUND_WHITELIST',
            'NODE_CONNECTION_INBOUND_WHITELIST'
        ];
    }

    componentDidMount() {
        this.loadConfig();
    }

    showDatatableLoading(connection_data, config_name = false, show_loader = true) {
        if (config_name) {
            connection_data['loading_' + config_name] = show_loader;
        }
        else {
            this.connection_config_names.forEach((element) => {
                connection_data['loading_' + element] = show_loader;
            });
        }
        connection_data['loading_' + config_name] = show_loader;
        this.setState({
            connection_data
        });
    }

    loadConfig(config_name) {
        const connection_data = this.state.connection_data;
        this.showDatatableLoading(connection_data, config_name);

        if (config_name) {
            API.getNodeConfigValueByName(config_name).then((data) => {
                connection_data[data.config_name] = [];
                this.updateData(connection_data, data);
            });
        }
        else {
            API.getNodeConfig().then((data) => {
                connection_data[data.config_name] = [];
                data.forEach(element => {
                    if (this.connection_config_names.includes(element.config_name)) {
                        this.updateData(connection_data, element);
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

    updateData(connection_data, element) {
        if (!_.isArray(element.value)) {
            element.value = JSON.parse(element.value);
        }
        element.value.forEach(el => {
            connection_data[element.config_name].push({
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
        connection_data['reload_timestamp_' + element.config_name] = new Date();
        this.showDatatableLoading(connection_data, element.config_name, false);

        this.setState({
            connection_data
        });
    }

    removeConnection(config_name, value) {
        let result_config = [];
        this.state.connection_data[config_name].forEach(element => {
            if (element.node_id !== value) {
                result_config.push(element);
            }
        });
        API.updateNodeConfigValue(config_name, this.prepareApiConfigData(result_config)).then(() => {
            this.setState({
                connection_data: {
                    ...this.state.connection_data,
                    [config_name]: result_config
                }
            });
        });
    }

    showModal(config_name, show = true) {
        let connection_data                    = this.state.connection_data;
        connection_data['show_' + config_name] = show;
        this.setState({
            connection_data: {...connection_data}
        });
        this.clearErrorList();
    }

    saveConfig(config_name) {
        this.clearErrorList();
        let error_list = [];
        validate.required(Translation.getPhrase('6ba360897'), this[config_name].value, error_list);
        const node_id = validate.string_alphanumeric(Translation.getPhrase('6ba360897'), this[config_name].value, error_list, 34);

        if (error_list.length > 0) {
            this.setState({
                error_list
            });
        }
        else {
            let configuration_data = this.prepareApiConfigData(this.state.connection_data[config_name]);
            configuration_data.push(node_id);

            API.updateNodeConfigValue(config_name, configuration_data).then(() => {
                this.showModal(config_name, false);
                this.loadConfig(config_name);
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

    prepareApiConfigData(config_data) {
        let configuration_data = [];

        config_data.forEach(element => {
            configuration_data.push(element.node_id);
        });

        return configuration_data;
    }

    getConnectionDatatable(connection_name, config_name) {
        return (
            <div className={'panel panel-filled'}>
                <ModalView
                    show={this.state.connection_data['show_' + config_name]}
                    size={'lg'}
                    prevent_close_after_accept={true}
                    on_close={() => this.showModal(config_name, false)}
                    on_accept={() => this.saveConfig(config_name)}
                    heading={Translation.getPhrase('33237b160') + ` ${connection_name}`}
                    body={
                        <Form>
                            <ErrorList
                                error_list={this.state.error_list}/>
                            <Form.Control
                                type="text"
                                placeholder={Translation.getPhrase('6ba360897')}
                                ref={(c) => this[config_name] = c}
                                onChange={(e) => {
                                    return validate.handleInputChangeAlphanumericString(e, 34);
                                }}
                            />
                        </Form>
                    }/>
                <div className={'panel-heading bordered'}>
                    {Translation.getPhrase('d53e5838a', {connection_name: connection_name})}
                </div>
                <div className={'panel-body'}>
                    <Col>
                        <DatatableView
                            reload_datatable={() => {
                                this.loadConfig(config_name);
                            }}
                            loading={this.state.connection_data['loading_' + config_name]}
                            datatable_reload_timestamp={this.state.connection_data['reload_timestamp_' + config_name]}
                            action_button={{
                                label   : Translation.getPhrase('33237b160') + ` ${connection_name}`,
                                on_click: () => this.showModal(config_name)
                            }}
                            value={this.state.connection_data[config_name]}
                            sortOrder={1}
                            showActionColumn={true}
                            resultColumn={[
                                {
                                    field : 'node_id',
                                    header: Translation.getPhrase('6ba360897')
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
            {this.getConnectionDatatable(Translation.getPhrase('bd92fdceb'), 'NODE_CONNECTION_INBOUND_WHITELIST')}
            {this.getConnectionDatatable(Translation.getPhrase('cae4027ec'), 'NODE_CONNECTION_OUTBOUND_WHITELIST')}
            {this.getConnectionDatatable(Translation.getPhrase('483306b8a'), 'NODE_CONNECTION_STATIC')}
        </div>;
    }
}


export default connect(
    state => ({
        config: state.config
    }),
    {})(withRouter(ConfigConnectionView));
