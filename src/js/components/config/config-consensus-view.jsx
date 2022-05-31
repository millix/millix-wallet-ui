import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form} from 'react-bootstrap';
import {walletUpdateConfig} from '../../redux/actions';
import * as validate from '../../helper/validate';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import * as format from '../../helper/format';


class ConfigConsensusView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sending               : false,
            error_list            : {},
            modal_show_save_result: false
        };
    }

    componentDidMount() {
        this.populateForm();
    }

    populateForm() {
        this.consensusRoundNodeCount.value          = format.number(this.props.config.CONSENSUS_ROUND_NODE_COUNT);
        this.consensusRoundValidationMax.value      = format.number(this.props.config.CONSENSUS_ROUND_VALIDATION_MAX);
        this.consensusRoundDoubleSpendMax.value     = format.number(this.props.config.CONSENSUS_ROUND_DOUBLE_SPEND_MAX);
        this.consensusRoundValidationRequired.value = format.number(this.props.config.CONSENSUS_ROUND_VALIDATION_REQUIRED);
        this.consensusValidationWaitTimeMax.value   = format.number(this.props.config.CONSENSUS_VALIDATION_WAIT_TIME_MAX);
        this.consensusValidationRetryWaitTime.value = format.number(this.props.config.CONSENSUS_VALIDATION_RETRY_WAIT_TIME);
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

        validate.required('number of nodes', this.consensusRoundNodeCount.value, errorList);
        validate.required('number of validation rounds', this.consensusRoundValidationMax.value, errorList);
        validate.required('max double spend bound', this.consensusRoundDoubleSpendMax.value, errorList);
        validate.required('number of validation required', this.consensusRoundValidationRequired.value, errorList);
        validate.required('max wait (sec)', this.consensusValidationWaitTimeMax.value, errorList);
        validate.required('retry wait (sec)', this.consensusValidationRetryWaitTime.value, errorList);

        let consensusConfig = {
            CONSENSUS_ROUND_NODE_COUNT          : validate.integerPositive('number of nodes', this.consensusRoundNodeCount.value, errorList, false),
            CONSENSUS_ROUND_VALIDATION_MAX      : validate.integerPositive('number of validation rounds', this.consensusRoundValidationMax.value, errorList, false),
            CONSENSUS_ROUND_DOUBLE_SPEND_MAX    : validate.integerPositive('max double spend bound', this.consensusRoundDoubleSpendMax.value, errorList, false),
            CONSENSUS_ROUND_VALIDATION_REQUIRED : validate.integerPositive('number of validation required', this.consensusRoundValidationRequired.value, errorList, false),
            CONSENSUS_VALIDATION_WAIT_TIME_MAX  : validate.integerPositive('max wait (sec)', this.consensusValidationWaitTimeMax.value, errorList, false),
            CONSENSUS_VALIDATION_RETRY_WAIT_TIME: validate.integerPositive('retry wait (sec)', this.consensusValidationRetryWaitTime.value, errorList, false)
        };
        if (errorList.length === 0) {
            this.props.walletUpdateConfig(consensusConfig).then(() => {
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
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>consensus</div>
                    <div className={'panel-body'}>
                        <ErrorList
                            error_list={this.state.error_list}/>
                        <Col>
                            <Form.Group className="form-group">
                                <label>number of nodes</label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.consensusRoundNodeCount = c}
                                    onChange={(e) => {
                                        return validate.handleInputChangeInteger(e, false);
                                    }}/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="form-group">
                                <label>number of validation rounds</label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.consensusRoundValidationMax = c}
                                    onChange={(e) => {
                                        return validate.handleInputChangeInteger(e, false);
                                    }}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>max double spend bound</label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.consensusRoundDoubleSpendMax = c}
                                    onChange={(e) => {
                                        return validate.handleInputChangeInteger(e, false);
                                    }}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>number of validation required</label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.consensusRoundValidationRequired = c}
                                    onChange={(e) => {
                                        return validate.handleInputChangeInteger(e, false);
                                    }}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>max wait (sec)</label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.consensusValidationWaitTimeMax = c}
                                    onChange={(e) => {
                                        return validate.handleInputChangeInteger(e, false);
                                    }}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>retry wait (sec)</label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.consensusValidationRetryWaitTime = c}
                                    onChange={(e) => {
                                        return validate.handleInputChangeInteger(e, false);
                                    }}/>
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
    })(withRouter(ConfigConsensusView));
