import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link, withRouter} from 'react-router-dom';
import * as text from '../../helper/text';
import ModalView from './modal-view';
import _ from 'lodash';
import API from '../../api';
import {changeLoaderState} from '../loader';
import Translation from '../../common/translation';


class ResetTransactionValidationView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            confirmation_modal_show: false,
            result_modal_show      : false,
            reset_transaction_id   : ''
        };
    }

    reloadAndClose() {
        this.setState({
            result_modal_show: false
        });
        if(this.props.reloadDatatable){
            this.props.reloadDatatable();
        }
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
            <div>{Translation.getPhrase('ddcefc418')}</div>
            {text.get_confirmation_modal_question()}
        </>;
        const confirmation_modal_body_single      = <>
            <div>{Translation.getPhrase('7b4ab8e6b')}</div>
            <div>{this.state.reset_transaction_id}</div>
            {text.get_confirmation_modal_question()}
        </>;

        return (
            <>
                <ModalView
                    show={this.state.confirmation_modal_show}
                    size={'lg'}
                    heading={Translation.getPhrase('d9b0ec301')}
                    on_close={() => this.toggleConfirmationModal(this.state.reset_transaction_id, false)}
                    on_accept={() => this.revalidateTransaction(this.state.reset_transaction_id)}
                    body={_.isArray(this.state.reset_transaction_id) ? confirmation_modal_body_all_pending : confirmation_modal_body_single}
                />
                <ModalView show={this.state.result_modal_show}
                           size={'lg'}
                           on_close={() => this.toggleResultModal(this.state.reset_transaction_id, false)}
                           heading={Translation.getPhrase('e9bc5c56e')}
                           body={(typeof (this.state.reset_transaction_id) === 'string') ? (
                               <div>
                                   {Translation.getPhrase('af3042810')} {this.state.reset_transaction_id}
                                   <div>
                                       {Translation.getPhrase('b6f821b21', {
                                           unspent_transaction_link: <Link
                                               key={'unspent-transaction-output-list-pending'}
                                               to={'/unspent-transaction-output-list/pending'}
                                               onClick={() => this.reloadAndClose()}>{Translation.getPhrase('a1fa680b7')}</Link>
                                       })}
                                   </div>
                               </div>
                           ) : (
                                     <div>
                                         {Translation.getPhrase('9c43cfe62')}
                                         <div>
                                             {Translation.getPhrase('8a5638e24', {
                                                 pending_transaction_link: <Link
                                                     key={'unspent-transaction-output-list-pending'}
                                                     to={'/unspent-transaction-output-list/pending'}>{Translation.getPhrase('a1fa680b7')}</Link>
                                             })}
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
