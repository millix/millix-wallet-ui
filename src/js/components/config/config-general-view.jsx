import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import ConfigAudioView from './config-audio-view';
import {Button, Form, Row} from 'react-bootstrap';
import * as format from '../../helper/format';
import * as validate from '../../helper/validate';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import HelpIconView from '../utils/help-icon-view';
import {connect} from 'react-redux';
import {walletUpdateConfig} from '../../redux/actions';
import {Dropdown} from 'primereact/dropdown';
import Translation from '../../common/translation';


class ConfigGeneralView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sending               : false,
            error_list            : {},
            modal_show_save_result: false,
            reload                : false,
            language_list         : [],
            language              : 'BEpDwgG53'
        };
    }

    componentDidMount() {
        this.populateForm();
        this.setState({
            language_list: Translation.language_list
                                      .filter(language => language.language_guid !== 'BEpDwgG53')
                                      .map(({
                                                language_name,
                                                language_guid
                                            }) => ({
                                          label: language_name,
                                          value: language_guid
                                      }))
                                      .sort((a, b) => a.label.localeCompare(b.label)),
            language     : Translation.getCurrentLanguageGuid()
        });

    }


    populateForm() {
        this.transaction_fee_proxy_input.value   = format.millix(this.props.config.TRANSACTION_FEE_PROXY, false);
        this.transaction_fee_default_input.value = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
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
            TRANSACTION_FEE_PROXY  : validate.amount(Translation.getPhrase('9b54da23c'), this.transaction_fee_proxy_input.value, error_list),
            TRANSACTION_FEE_DEFAULT: validate.amount(Translation.getPhrase('6614812f0'), this.transaction_fee_default_input.value, error_list),
            ACTIVE_LANGUAGE_GUID   : this.state.language
        };
        if (error_list.length === 0) {
            this.props.walletUpdateConfig(config).then(() => {
                this.setState({
                    sending: false
                });
                Translation.setCurrentLanguageGuid(this.state.language);
                this.changeModalShowSaveResult();
            }).catch(() => {
                error_list.push({
                    name   : 'save_error',
                    message: Translation.getPhrase('6d0d08601')
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
                <div className={'col-lg-10'}>
                    <ModalView
                        show={this.state.modal_show_save_result}
                        size={'lg'}
                        on_close={() => this.changeModalShowSaveResult(false)}
                        heading={Translation.getPhrase('7ce94c08c')}
                        body={
                            <div>
                                {Translation.getPhrase('363b5379a')}
                            </div>
                        }/>
                    <div className={'panel panel-filled'}>
                        <div className={'panel-heading bordered'}>{Translation.getPhrase('6e907b11d')}</div>
                        <div className={'panel-body'}>
                            <Form>
                                <ErrorList
                                    error_list={this.state.error_list}/>

                                <Form.Group className="form-group">
                                    <label>{Translation.getPhrase('33a2a68f2')}</label>
                                    <Dropdown
                                        value={this.state.language} options={this.state.language_list}
                                        onChange={(e) => this.setState({language: e.value})} className={'form-control p-0 language-dropdown'}/>
                                </Form.Group>

                                <Form.Group className="form-group">
                                    <label>{Translation.getPhrase('d99efcbbe')}<HelpIconView help_item_name={'transaction_fee_proxy'}/></label>
                                    <Form.Control
                                        type="text"
                                        ref={(c) => this.transaction_fee_proxy_input = c}
                                        onChange={(e) => {
                                            return validate.handleInputChangeInteger(e, false, 'millix');
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group className="form-group">
                                    <label>{Translation.getPhrase('161f55520')}<HelpIconView help_item_name={'transaction_fee_default'}/></label>
                                    <Form.Control
                                        type="text"
                                        ref={(c) => this.transaction_fee_default_input = c}
                                        onChange={(e) => {
                                            return validate.handleInputChangeInteger(e, false, 'millix');
                                        }}
                                    />
                                </Form.Group>

                                <Form.Group
                                    className={'d-flex justify-content-center'}>
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => this.save()}
                                        disabled={this.state.sending}>
                                        {this.state.sending ? <>{Translation.getPhrase('a23d9a84b')}</> : <>{Translation.getPhrase('0e3e60d83')}</>}
                                    </Button>
                                </Form.Group>
                            </Form>
                        </div>
                    </div>
                </div>
                <div className={'col-lg-2'}>
                    <ConfigAudioView/>
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
    })(withRouter(ConfigGeneralView));
