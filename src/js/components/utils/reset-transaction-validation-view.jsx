import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {Link, withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import * as text from '../../helper/text';
import ModalView from './modal-view';
import _ from 'lodash';
import API from '../../api';
import {changeLoaderState} from '../loader';


class ResetTransactionValidationView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            confirmation_modal_show: false,
            result_modal_show      : false,
            reset_transaction_id   : ''
        };
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    revalidateTransaction(transaction_id) {
        changeLoaderState(true);
        API.resetTransactionValidationByID(transaction_id).then(response => {
            changeLoaderState(false);
            if (typeof response.api_status === 'string') {
                this.toggleResultModal(transaction_id, true);
            }
        });
    }

    toggleResultModal(transaction_id, status = true) {
        this.setState({
            confirmation_modal_show: false,
            result_modal_show      : status,
            reset_transaction_id   : status ? transaction_id : ''
        });
    }

    toggleConfirmationModal(transaction_id, status = true) {
        this.setState({
            confirmation_modal_show: status,
            result_modal_show      : false,
            reset_transaction_id   : transaction_id
        });
    }

    render() {
        const confirmation_modal_body_all_pending = <>
            <div>continuing will force your node to revalidate all your pending transactions</div>
            {text.get_confirmation_modal_question()}
        </>;
        const confirmation_modal_body_single      = <>
            <div>continuing will force your node to revalidate transaction</div>
            <div>{this.state.reset_transaction_id}</div>
            {text.get_confirmation_modal_question()}
        </>;

        return (
            <>
                <ModalView
                    show={this.state.confirmation_modal_show}
                    size={'lg'}
                    heading={'reset transaction validation'}
                    on_close={() => this.toggleConfirmationModal(this.state.reset_transaction_id, false)}
                    on_accept={() => this.revalidateTransaction(this.state.reset_transaction_id)}
                    body={_.isArray(this.state.reset_transaction_id) ? confirmation_modal_body_all_pending : confirmation_modal_body_single}
                />
                <ModalView show={this.state.result_modal_show}
                           size={'lg'}
                           on_close={() => this.toggleResultModal(this.state.reset_transaction_id, false)}
                           heading={'reset transaction validation'}
                           body={(typeof (this.state.reset_transaction_id) === 'string') ? (
                               <div>validation has been reset for
                                   transaction {this.state.reset_transaction_id}
                                   <div>
                                       click <Link to={'/unspent-transaction-output-list/pending'}>here</Link> to see all your pending transactions
                                   </div>
                               </div>
                           ) : (
                                     <div>validation has been reset for all
                                         your pending transactions
                                         <div>
                                             click <Link to={'/unspent-transaction-output-list/pending'}>here</Link> to see all your pending transactions
                                         </div>
                                     </div>
                                 )
                           }
                />
            </>
        );
    }
}


ResetTransactionValidationView.propTypes = {
    reset_transaction_id: PropTypes.any
};

export default withRouter(ResetTransactionValidationView);
