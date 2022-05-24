import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Form, Row} from 'react-bootstrap';
import * as validate from '../../helper/validate';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import HelpIconView from '../utils/help-icon-view';
import {bool_label} from '../../helper/format';
import {connect} from 'react-redux';
import {walletUpdateConfig} from '../../redux/actions';


class ConfigStorageView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sending               : false,
            error_list            : {},
            modal_show_save_result: false,
            reload                : false
        };
    }

    componentDidMount() {
        this.populateForm();
    }

    populateForm() {
        this.mode_node_sync_full.value    = !!JSON.parse(this.props.config.MODE_NODE_SYNC_FULL) ? 1 : 0;
        this.mode_storage_sync_full.value = !!JSON.parse(this.props.config.MODE_STORAGE_SYNC_FULL) ? 1 : 0;
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
        let config       = {
            MODE_NODE_SYNC_FULL   : validate.integerPositive('full node', this.mode_node_sync_full.value, error_list, true),
            MODE_STORAGE_SYNC_FULL: validate.integerPositive('full storage sync', this.mode_storage_sync_full.value, error_list, true)
        };
        if (error_list.length === 0) {
            this.props.walletUpdateConfig(config).then(() => {
                this.setState({
                    sending: false
                });
                this.changeModalShowSaveResult();
            }).catch(() => {
                error_list.push({
                    name   : 'save_error',
                    message: 'error while saving occurred, please try again later'
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
        return (
            <Row>
                <div className={'col-lg-12'}>
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
                    <div className={'panel panel-filled'}>
                        <div className={'panel-heading bordered'}>storage</div>
                        <div className={'panel-body'}>
                            <Form>
                                <ErrorList
                                    error_list={this.state.error_list}/>
                                <Form.Group className="form-group">
                                    <label>full node<HelpIconView help_item_name={'full_node'}/></label>
                                    <Form.Select
                                        as="select"
                                        ref={(c) => this.mode_node_sync_full = c}
                                    >
                                        <option value={1} key={1}>
                                            {bool_label(1)}
                                        </option>
                                        <option value={0} key={0}>
                                            {bool_label(0)}
                                        </option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="form-group">
                                    <label>full storage sync<HelpIconView help_item_name={'full_storage_sync'}/></label>
                                    <Form.Select
                                        as="select"
                                        ref={(c) => this.mode_storage_sync_full = c}
                                    >
                                        <option value={1} key={1}>
                                            {bool_label(1)}
                                        </option>
                                        <option value={0} key={0}>
                                            {bool_label(0)}
                                        </option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group
                                    className={'d-flex justify-content-center'}>
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => this.save()}
                                        disabled={this.state.sending}>
                                        {this.state.sending ? <>{'saving'}</> : <>continue</>}
                                    </Button>
                                </Form.Group>
                            </Form>
                        </div>
                    </div>
                </div>
            </Row>
        );
    }
}


export default connect(
    state => ({
        config: state.config
    }),
    {
        walletUpdateConfig
    })(withRouter(ConfigStorageView));
