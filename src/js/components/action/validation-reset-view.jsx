import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button} from 'react-bootstrap';
import ModalView from '../utils/modal-view';
import * as text from '../../helper/text';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../../api';


class ValidationResetView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalShowResetValidation: false
        };
    }

    resetTransactionValidation() {
        API.resetTransactionValidation().then(_ => {
            this.props.history.push('/unspent-transaction-output-list/pending');
        });
    }

    changeModalShowResetValidation(value = true) {
        this.setState({
            modalShowResetValidation: value
        });
    }

    render() {
        return <>
            <ModalView show={this.state.modalShowResetValidation}
                       size={'lg'}
                       heading={'reset validation'}
                       on_close={() => this.changeModalShowResetValidation(false)}
                       on_accept={() => this.resetTransactionValidation()}
                       body={<div>
                           <div>continuing will force your node to
                               revalidate all your transactions. this may
                               take some time depending on how many
                               transactions you have.
                           </div>
                           {text.get_confirmation_modal_question()}
                       </div>}/>

            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>reset
                    validation
                </div>
                <div className={'panel-body'}>
                    <div className={'form-group'}>
                        reset validation forces your node to
                        revalidate all your transactions (to or from
                        you). it is recommended to do in one of the
                        following cases:
                        <ul>
                            <li>if you have
                                transaction(s) in pending state for
                                longer than 10-15 minutes
                            </li>
                            <li>
                                you think that your balance is wrong
                            </li>
                        </ul>
                    </div>

                    <div className={'text-center'}>
                        <Button
                            variant="outline-primary"
                            onClick={() => this.changeModalShowResetValidation()}>
                            <FontAwesomeIcon
                                icon="rotate-left"
                                size="1x"/>reset validation
                        </Button>
                    </div>
                </div>
            </div>
        </>;
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }))(withRouter(ValidationResetView));
