import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Form, Row} from 'react-bootstrap';
import {removeWalletAddressVersion, walletUpdateConfig} from '../../redux/actions';
import DatatableView from '../utils/datatable-view';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import API from '../../api/index';
import * as validate from '../../helper/validate';
import {boolLabel} from '../../helper/format';
import DatatableActionButtonView from '../utils/datatable-action-button-view';


class ConfigAddressVersionView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_show                : false,
            address_version_list      : [],
            datatable_reload_timestamp: new Date(),
            datatable_loading         : false,
            error_list                : []
        };
    }

    componentDidMount() {
        this.loadConfig();
    }

    changeModalAddAddressVersion(value = true) {
        this.setState({
            modal_show: value,
            error_list: []
        });
    }

    addAddressVersion() {
        this.setState({
            error_list: []
        });

        let errorList = [];
        validate.required('version', this.addressVersionName.value, errorList);
        validate.required('regex pattern', this.addressVersionRegex.value, errorList);

        if (errorList.length > 0) {
            this.setState({
                error_list: errorList
            });
        }
        else {
            const data = {
                version        : this.addressVersionName.value,
                is_main_network: this.props.config.MODE_TEST_NETWORK ? 0 : 1,
                regex_pattern  : this.addressVersionRegex.value,
                is_default     : this.addressIsDefault.value
            };

            API.addWalletAddressVersion(data)
               .then(data => {
                   if (!data || data.api_status === 'fail') {
                       this.setState({
                           error_list: [
                               {
                                   name   : 'api error',
                                   message: data.api_message ? data.api_message : 'bad request'
                               }
                           ]
                       });
                   }
                   else {
                       this.loadConfig();
                       this.changeModalAddAddressVersion(false);
                   }
               });
        }
    }


    removeFromConfigList(addressVersion) {
        this.props.removeWalletAddressVersion(addressVersion).then(() => {
            this.loadConfig();
        });
    }

    loadConfig() {
        this.setState({
            datatable_loading: true
        });
        API.listWalletAddressVersion()
           .then(data => {
               this.setAddressVersionList(data);
           });
    }

    setAddressVersionList(data) {
        this.setState({
            datatable_reload_timestamp: new Date(),
            datatable_loading         : false,
            address_version_list      : data.map((input) => ({
                version        : input.version,
                regex_pattern  : input.regex_pattern,
                default_address: boolLabel(input.is_default),
                action         : <DatatableActionButtonView
                    icon={'trash'}
                    callback={() => this.removeFromConfigList(input)}
                    callback_args={input}
                />
            }))
        });
    }

    getAddressVersionBody() {
        return <div>
            <Col>
                <ErrorList error_list={this.state.error_list}/>
                <Form.Group className="form-group">
                    <label>default address</label>
                    <Form.Select
                        as="select"
                        ref={(c) => this.addressIsDefault = c}
                    >
                        <option value={1} key={1}>
                            {boolLabel(1)}
                        </option>
                        <option value={0} key={0}>
                            {boolLabel(0)}
                        </option>
                    </Form.Select>
                </Form.Group>
            </Col>

            <Col>
                <Form.Group className="form-group">
                    <label>version</label>
                    <Form.Control
                        type="text"
                        ref={(c) => this.addressVersionName = c}
                        onChange={(e) => {
                            return validate.handleInputChangeAlphanumericString(e, 4);
                        }}
                    />
                </Form.Group>
            </Col>

            <Col>
                <Form.Group className="form-group">
                    <label>
                        regex pattern
                    </label>
                    <Row>
                        <Col>
                            <Form.Control
                                type="text"
                                ref={(c) => this.addressVersionRegex = c}
                            />
                        </Col>
                    </Row>
                </Form.Group>
            </Col>
        </div>;
    }

    render() {
        return <div>
            <ModalView
                show={this.state.modal_show}
                size={'lg'}
                prevent_close_after_accept={true}
                on_close={() => this.changeModalAddAddressVersion(false)}
                on_accept={() => this.addAddressVersion()}
                heading={'address version'}
                body={this.getAddressVersionBody()}/>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        address version
                    </div>
                    <div className={'panel-body'}>
                        <div>
                            <DatatableView
                                reload_datatable={() => this.loadConfig()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                loading={this.state.datatable_loading}
                                action_button_label={'add address version'}
                                action_button={{
                                    label   : 'add address version',
                                    on_click: () => this.changeModalAddAddressVersion()
                                }}
                                value={this.state.address_version_list}
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
                                    }
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
        config: state.config,
        wallet: state.wallet
    }),
    {
        walletUpdateConfig,
        removeWalletAddressVersion
    })(withRouter(ConfigAddressVersionView));
