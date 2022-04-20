import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Table} from 'react-bootstrap';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import * as format from '../../helper/format';
import * as text from '../../helper/text';
import API from '../../api';
import HelpIconView from '../utils/help-icon-view';
import SubmitButtonView from '../utils/submit-button-view';


class OutputAggregateView extends Component {
    aggregationTransactionOutputCountMin = 2;
    aggregationTransactionOutputCountMax = 120;

    constructor(props) {
        super(props);
        this.state = {
            errorList                : [],
            submitButtonForceDisabled: true,

            transactionOutputCount           : undefined,
            transactionMaxAmount             : undefined,
            aggregationTransactionOutputCount: 0,

            modalShowResult: false,
            modalBodyResult: []
        };

        this.submit       = this.submit.bind(this);
        this.cancelSubmit = this.cancelSubmit.bind(this);
    }

    componentDidMount() {
        this.reloadUnspentOutputStat();
    }

    reloadUnspentOutputStat() {
        API.getUnspentOutputStat()
           .then(data => {
               if (data.api_status === 'fail') {
                   return Promise.reject(data);
               }

               let aggregationTransactionOutputCount = Math.min(data.transaction_output_count, this.aggregationTransactionOutputCountMax);
               this.setState({
                   transactionOutputCount   : data.transaction_output_count,
                   transactionMaxAmount     : data.transaction_max_amount,
                   submitButtonForceDisabled: data.transaction_output_count < this.aggregationTransactionOutputCountMin,
                   aggregationTransactionOutputCount
               });
           });
    }

    cancelSubmit() {
        return API.interruptTransaction().then(_ => {
            this.setState({
                submitButtonForceDisabled: true
            });
        });
    }

    submit() {
        let errorList = [];
        this.setState({
            errorList
        });

        return API.sendAggregationTransaction()
                  .then(data => {
                      if (data.api_status === 'fail') {
                          return Promise.reject(data);
                      }
                      return data;
                  })
                  .then(data => {
                      const transaction = data.transaction.find(item => {
                          return item.version.indexOf('0a') !== -1;
                      });

                      const modalBodyResult = <div>
                          <div>
                              transaction id
                          </div>
                          <div>
                              {transaction.transaction_id}
                          </div>
                      </div>;

                      this.aggregateOnComplete(errorList, modalBodyResult);
                  })
                  .catch((e) => {
                      if (e && e.api_message) {
                          const error_message = text.get_ui_error(e.api_message);

                          errorList.push({
                              name   : 'sendTransactionError',
                              message: error_message
                          });
                          this.aggregateOnComplete(errorList, []);
                      }
                  });
    }

    aggregateOnComplete(errorList, modalBodyResult) {
        this.setState({
            errorList,
            transactionOutputCount           : undefined,
            transactionMaxAmount             : undefined,
            aggregationTransactionOutputCount: 0,
            modalBodyResult
        }, () => this.reloadUnspentOutputStat());

        if (errorList.length === 0 && modalBodyResult) {
            this.changeModalShowResult();
        }
    }

    changeModalShowResult(value = true) {
        this.setState({
            modalShowResult: value
        });
    }

    render() {
        return <>
            <ModalView
                show={this.state.modalShowResult}
                size={'lg'}
                on_close={() => this.changeModalShowResult(false)}
                heading={'aggregation payment has been sent'}
                body={this.state.modalBodyResult}/>

            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>unspents aggregation
                </div>
                <div className={'panel-body'}>
                    <ErrorList
                        error_list={this.state.errorList}/>
                    <p>
                        the millix protocol limits each transaction to be funded by a maximum of 128 inputs<HelpIconView
                        help_item_name={'transaction_max_input_number'}/>. the smallest unspents are being used first.
                        aggregation consumes the smallest unspents by sending a payment to yourself.
                        each time you click aggregate you will see numbers below change (unspent count will decrease and maximum single payment amount will
                        increase). continue to click the aggregate button until
                        the maximum single payment amount meets your needs. your balance and pending balance will change while
                        aggregation is in progress.
                    </p>

                    <Table striped bordered hover>
                        <tbody>
                        <tr>
                            <td className={'w-20'}>
                                unspent count
                            </td>
                            <td>
                                {format.number(this.state.transactionOutputCount)}
                            </td>
                        </tr>
                        <tr>
                            <td className={'w-20'}>
                                maximum single payment amount
                            </td>
                            <td>
                                {format.millix(this.state.transactionMaxAmount)}
                            </td>
                        </tr>
                        </tbody>
                    </Table>

                    <div className={'text-center'}>
                        <SubmitButtonView
                            on_cancel={this.cancelSubmit}
                            on_submit={this.submit}
                            force_disabled={this.state.submitButtonForceDisabled}
                            icon={'code-merge'}
                            label={'aggregate'}
                            confirmation_modal_heading={'unspent aggregation'}
                            confirmation_modal_body={<>
                                <div>you are about to aggregate {format.number(this.state.aggregationTransactionOutputCount)} unspents.</div>
                                {text.get_confirmation_modal_question()}
                            </>}
                        />
                    </div>
                </div>
            </div>
        </>;
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }))(withRouter(OutputAggregateView));
