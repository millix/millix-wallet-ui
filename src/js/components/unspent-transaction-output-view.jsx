import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Row} from 'react-bootstrap';
import moment from 'moment';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {MDBDataTable as DataTable} from 'mdbreact';
import {walletUpdateTransactions} from '../redux/actions';
import API from '../api/index';


class UnspentTransactionOutputView extends Component {
    constructor(props) {
        super(props);
        this.updaterHandler = undefined;
        this.state          = {
            transaction_output_list: {
                columns: [
                    {
                        label: '#',
                        field: 'idx'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="user-clock" size="1x"/>,
                            ' date'
                        ],
                        field: 'transaction_date'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="book" size="1x"/>,
                            ' transaction id'
                        ],
                        field: 'transaction_id'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="book" size="1x"/>,
                            ' output position'
                        ],
                        field: 'output_position'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="compress-arrows-alt"
                                             size="1x"/>,
                            ' amount'
                        ],
                        field: 'amount'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="box"
                                             size="1x"/>,
                            ' address'
                        ],
                        field: 'address'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="clock" size="1x"/>,
                            ' stable date'
                        ],
                        field: 'stable_date'
                    }
                ],
                rows   : []
            }
        };
    }

    componentDidMount() {
        this.updaterHandler = setInterval(() => API.getWalletUnspentTransactionOutputList(this.props.wallet.address_key_identifier, this.props.location.state.stable).then(data => {

            let rows = data.filter(output => output.status !== 3).map((output, idx) => ({
                clickEvent      : () => this.props.history.push('/transaction/' + encodeURIComponent(output.transaction_id), [output]),
                idx             : data.length - idx,
                transaction_id  : output.transaction_id,
                address         : output.address,
                output_position : output.output_position,
                amount          : output.amount.toLocaleString('en-US'),
                transaction_date: moment.utc(output.transaction_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
                stable_date     : output.stable_date && moment.utc(output.stable_date * 1000).format('YYYY-MM-DD HH:mm:ss')
            }));
            this.setState({
                transaction_output_list: {
                    columns: [...this.state.transaction_output_list.columns],
                    rows   : rows
                }
            });
        }), 5000);
    }

    componentWillUnmount() {
        clearTimeout(this.updaterHandler);
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div
                        className={'panel-heading bordered'}>{this.props.location.state.stable ? '' : 'pending'} unspent
                        transaction
                        outputs
                    </div>
                    <div className={'panel-body'}>
                        <Row id={'txhistory'}>
                            <DataTable striped bordered small hover
                                       autoWidth={false}
                                       info={false}
                                       entries={10}
                                       entriesOptions={[
                                           10,
                                           30,
                                           50
                                       ]}
                                       data={this.state.transaction_output_list}/>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }),
    {
        walletUpdateTransactions
    }
)(withRouter(UnspentTransactionOutputView));
