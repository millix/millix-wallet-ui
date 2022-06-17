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
import Translation from '../../common/translation';


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
            MODE_NODE_SYNC_FULL   : validate.integerPositive(Translation.getPhrase('75bd6a579'), this.mode_node_sync_full.value, error_list, true),
            MODE_STORAGE_SYNC_FULL: validate.integerPositive(Translation.getPhrase('184520f26'), this.mode_storage_sync_full.value, error_list, true)
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
                    message: Translation.getPhrase('b037567e4')
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
                        heading={Translation.getPhrase('4dae761ef')}
                        body={
                            <div>{Translation.getPhrase('159a3c824')}</div>
                        }/>
                    <div className={'panel panel-filled'}>
                        <div className={'panel-heading bordered'}>{Translation.getPhrase('24ab03c96')}</div>
                        <div className={'panel-body'}>
                            <Form>
                                <ErrorList
                                    error_list={this.state.error_list}/>
                                <Form.Group className="form-group">
                                    <label>{Translation.getPhrase('75bd6a579')}<HelpIconView help_item_name={'full_node'}/></label>
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
                                    <label>{Translation.getPhrase('e07c91976')}<HelpIconView help_item_name={'full_storage'}/></label>
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
                                        {this.state.sending ? <>{Translation.getPhrase('15cc5bad2')}</> : <>{Translation.getPhrase('3dedae695')}</>}
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
