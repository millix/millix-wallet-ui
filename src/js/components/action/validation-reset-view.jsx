import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import {Button} from 'react-bootstrap';
import ModalView from '../utils/modal-view';
import * as text from '../../helper/text';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../../api';
import {changeLoaderState} from '../loader';
import Translation from '../../common/translation';


class ValidationResetView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalShowResetValidation: false,
            modalShowResult         : false
        };
    }

    resetTransactionValidation() {
        changeLoaderState(true);
        API.resetTransactionValidation().then(data => {
            changeLoaderState(false);
            if (data.success === true) {
                this.toggleResultModal(true);
            }
        });
    }

    toggleResultModal(status = true) {
        this.setState({
            modalShowResetValidation: false,
            modalShowResult         : status
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
                       heading={Translation.getPhrase('9de297694')}
                       on_close={() => this.changeModalShowResetValidation(false)}
                       on_accept={() => this.resetTransactionValidation()}
                       body={<div>
                           <div>{Translation.getPhrase('ead313199')}</div>
                           {text.get_confirmation_modal_question()}
                       </div>}/>
            <ModalView show={this.state.modalShowResult}
                       size={'lg'}
                       on_close={() => this.toggleResultModal(false)}
                       heading={Translation.getPhrase('2a0e88ec9')}
                       body={
                           <div>
                               {Translation.getPhrase('9d0b858a7')}
                               <div>
                                   {Translation.getPhrase('f076b569c', {
                                       transaction_link_list: <Link to={'/unspent-transaction-output-list/pending'}>{Translation.getPhrase('c9d84d4df')}</Link>
                                   })}
                               </div>
                           </div>
                       }
            />
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>{Translation.getPhrase('155911684')}</div>
                <div className={'panel-body'}>
                    <div className={'form-group'}>
                        {Translation.getPhrase('c0af243fd')}
                        <ul>
                            <li>{Translation.getPhrase('06bf7636c')}
                            </li>
                            <li>
                                {Translation.getPhrase('bfc5bbd78')}
                            </li>
                        </ul>
                    </div>

                    <div className={'text-center'}>
                        <Button
                            variant="outline-primary"
                            onClick={() => this.changeModalShowResetValidation()}>
                            <FontAwesomeIcon
                                icon="rotate-left"
                                size="1x"/>{Translation.getPhrase('5768462be')}
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
