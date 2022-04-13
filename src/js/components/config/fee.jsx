import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form} from 'react-bootstrap';
import {walletUpdateConfig} from '../../redux/actions';
import * as validate from '../../helper/validate';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import * as format from '../../helper/format';


class Fee extends Component {
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
        let fee_config   = {
            TRANSACTION_FEE_PROXY  : validate.amount('transaction fee proxy', this.transaction_fee_proxy_input.value, error_list),
            TRANSACTION_FEE_DEFAULT: validate.amount('transaction fee default', this.transaction_fee_default_input.value, error_list)
        };
        if (error_list.length === 0) {
            this.props.walletUpdateConfig(fee_config).then(() => {
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
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>fees</div>
                    <div className={'panel-body'}>
                        <ErrorList
                            error_list={this.state.error_list}/>
                        <Col>
                            <Form.Group className="form-group">
                                <label>transaction proxy fee</label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.transaction_fee_proxy_input = c}
                                    onChange={(e) => {
                                        return validate.handleInputChangeInteger(e, false, 'millix');
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="form-group">
                                <label>transaction fee</label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.transaction_fee_default_input = c}
                                    onChange={(e) => {
                                        return validate.handleInputChangeInteger(e, false, 'millix');
                                    }}
                                />
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
                    </div>
                </div>
            </Form>
        </div>;
    }
}


export default connect(
    state => ({
        config: state.config
    }),
    {
        walletUpdateConfig
    })(withRouter(Fee));
