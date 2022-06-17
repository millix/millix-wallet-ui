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
import {bool_label} from '../../helper/format';
import DatatableActionButtonView from '../utils/datatable-action-button-view';
import Translation from '../../common/translation';


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

        let error_list = [];
        validate.required(Translation.getPhrase('b52d6e1fb'), this.address_version_name.value, error_list);
        validate.required(Translation.getPhrase('1aba9d290'), this.address_version_regex.value, error_list);

        if (error_list.length > 0) {
            this.setState({
                error_list: error_list
            });
        }
        else {
            const data = {
                version        : this.address_version_name.value,
                is_main_network: this.props.config.MODE_TEST_NETWORK ? 0 : 1,
                regex_pattern  : this.address_version_regex.value,
                is_default     : this.address_is_default.value
            };

            API.addWalletAddressVersion(data)
               .then(data => {
                   if (!data || data.api_status === 'fail') {
                       this.setState({
                           error_list: [
                               {
                                   name   : Translation.getPhrase('25df0b975'),
                                   message: data.api_message ? data.api_message : Translation.getPhrase('25b452e43')
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
                default_address: bool_label(input.is_default),
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
                    <label>{Translation.getPhrase('e805e90ab')}</label>
                    <Form.Select
                        as="select"
                        ref={(c) => this.address_is_default = c}
                    >
                        <option value={1} key={1}>
                            {bool_label(1)}
                        </option>
                        <option value={0} key={0}>
                            {bool_label(0)}
                        </option>
                    </Form.Select>
                </Form.Group>
            </Col>

            <Col>
                <Form.Group className="form-group">
                    <label>{Translation.getPhrase('16562cacb')}</label>
                    <Form.Control
                        type="text"
                        ref={(c) => this.address_version_name = c}
                        onChange={(e) => {
                            return validate.handleInputChangeAlphanumericString(e, 4);
                        }}
                    />
                </Form.Group>
            </Col>

            <Col>
                <Form.Group className="form-group">
                    <label>
                        {Translation.getPhrase('496398096')}
                    </label>
                    <Row>
                        <Col>
                            <Form.Control
                                type="text"
                                ref={(c) => this.address_version_regex = c}
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
                heading={Translation.getPhrase('e7b50ed39')}
                body={this.getAddressVersionBody()}/>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        {Translation.getPhrase('c72953bd2')}
                    </div>
                    <div className={'panel-body'}>
                        <div>
                            <DatatableView
                                reload_datatable={() => this.loadConfig()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                loading={this.state.datatable_loading}
                                action_button_label={Translation.getPhrase('d0db52233')}
                                action_button={{
                                    label   : Translation.getPhrase('f62c48427'),
                                    on_click: () => this.changeModalAddAddressVersion()
                                }}
                                value={this.state.address_version_list}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field : 'version',
                                        header: Translation.getPhrase('5fa8b6429')
                                    },
                                    {
                                        field : 'regex_pattern',
                                        header: Translation.getPhrase('cc95a518b')
                                    },
                                    {
                                        field : 'default_address',
                                        header: Translation.getPhrase('a07ac1628')
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
