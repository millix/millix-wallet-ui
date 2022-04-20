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
        this.consensus_round_node_count.value           = format.number(this.props.config.CONSENSUS_ROUND_NODE_COUNT);
        this.consensus_round_validation_max.value       = format.number(this.props.config.CONSENSUS_ROUND_VALIDATION_MAX);
        this.consensus_round_double_spend_max.value     = format.number(this.props.config.CONSENSUS_ROUND_DOUBLE_SPEND_MAX);
        this.consensus_round_validation_required.value  = format.number(this.props.config.CONSENSUS_ROUND_VALIDATION_REQUIRED);
        this.consensus_validation_wait_time_max.value   = format.number(this.props.config.CONSENSUS_VALIDATION_WAIT_TIME_MAX);
        this.consensus_validation_retry_wait_time.value = format.number(this.props.config.CONSENSUS_VALIDATION_RETRY_WAIT_TIME);
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

        validate.required('number of nodes', this.consensus_round_node_count.value, error_list);
        validate.required('number of validation rounds', this.consensus_round_validation_max.value, error_list);
        validate.required('max double spend bound', this.consensus_round_double_spend_max.value, error_list);
        validate.required('number of validation required', this.consensus_round_validation_required.value, error_list);
        validate.required('max wait (sec)', this.consensus_validation_wait_time_max.value, error_list);
        validate.required('retry wait (sec)', this.consensus_validation_retry_wait_time.value, error_list);

        let consensus_config = {
            CONSENSUS_ROUND_NODE_COUNT          : validate.integerPositive('number of nodes', this.consensus_round_node_count.value, error_list, false),
            CONSENSUS_ROUND_VALIDATION_MAX      : validate.integerPositive('number of validation rounds', this.consensus_round_validation_max.value, error_list, false),
            CONSENSUS_ROUND_DOUBLE_SPEND_MAX    : validate.integerPositive('max double spend bound', this.consensus_round_double_spend_max.value, error_list, false),
            CONSENSUS_ROUND_VALIDATION_REQUIRED : validate.integerPositive('number of validation required', this.consensus_round_validation_required.value, error_list, false),
            CONSENSUS_VALIDATION_WAIT_TIME_MAX  : validate.integerPositive('max wait (sec)', this.consensus_validation_wait_time_max.value, error_list, false),
            CONSENSUS_VALIDATION_RETRY_WAIT_TIME: validate.integerPositive('retry wait (sec)', this.consensus_validation_retry_wait_time.value, error_list, false)
        };
        if (error_list.length === 0) {
            this.props.walletUpdateConfig(consensus_config).then(() => {
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
                    <div className={'panel-heading bordered'}>consensus</div>
                    <div className={'panel-body'}>
                        <ErrorList
                            error_list={this.state.error_list}/>
                        <Col>
                            <Form.Group className="form-group">
                                <label>number of nodes</label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.consensus_round_node_count = c}
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
                                    ref={(c) => this.consensus_round_validation_max = c}
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
                                    ref={(c) => this.consensus_round_double_spend_max = c}
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
                                    ref={(c) => this.consensus_round_validation_required = c}
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
                                    ref={(c) => this.consensus_validation_wait_time_max = c}
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
                                    ref={(c) => this.consensus_validation_retry_wait_time = c}
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
