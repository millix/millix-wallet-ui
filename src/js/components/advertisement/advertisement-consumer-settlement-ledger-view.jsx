import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import DatatableView from '../utils/datatable-view';
import API from '../../api';
import AdvertisementPreview from './advertisement-preview';
import * as format from '../../helper/format';
import moment from 'moment';
import DatatableActionButtonView from '../utils/datatable-action-button-view';


class AdvertisementConsumerSettlementLedgerView extends Component {
    constructor(props) {
        super(props);
        this.updaterHandler = undefined;
        this.state          = {
            ledger_list               : [],
            datatable_reload_timestamp: '',
            datatable_loading         : false,
            total_paid_amount         : 0
        };
    }

    componentDidMount() {
        this.reloadDatatable();
        this.updaterHandler = setInterval(() => this.reloadDatatable(), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.updaterHandler);
    }

    reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

        return API.listAdsLedgerDetails(moment().subtract(24, 'hours').unix()).then(response => {
            const ledgerList    = [];
            let totalPaidAmount = 0;
            response.ledger_list?.forEach(itemLedger => {
                totalPaidAmount += itemLedger.deposit;
                ledgerList.push({
                    payment_date          : format.date(itemLedger.payment_date),
                    presentation_date     : format.date(itemLedger.presentation_date),
                    amount                : format.millix(itemLedger.deposit),
                    preview               : this.advertisementPreview(itemLedger),
                    advertisement_url     : itemLedger.advertisement_url,
                    advertisement_headline: itemLedger.advertisement_headline,
                    advertisement_deck    : itemLedger.advertisement_deck,
                    action                : <>
                        <DatatableActionButtonView
                            history_path={'/transaction/' + encodeURIComponent(itemLedger.protocol_transaction_id)}
                            history_state={{}}
                            icon={'th-list'}/>
                        <DatatableActionButtonView
                            callback={(data) => this.openAdvertisementLink(data)}
                            callback_args={itemLedger.advertisement_url}
                            icon={'link'}/></>
                });
            });

            this.setState({
                ledger_list               : ledgerList,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false,
                total_paid_amount         : totalPaidAmount
            });
        });
    }

    openAdvertisementLink(data) {
        window.open(data.callback_args, '_blank');
    }

    advertisementPreview(itemLedger) {
        return (<>
            <AdvertisementPreview
                disable_link={true}
                url={itemLedger.advertisement_url}
                headline={itemLedger.advertisement_headline}
                deck={itemLedger.advertisement_deck}>
            </AdvertisementPreview>
        </>);
    }

    render() {
        return (<div>
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>received advertisements deposits
                </div>
                <div className={'panel-body'}>
                    <div className={'form-group'}>
                        <p>
                            these are advertisements you have been presented in the past 24 hours. you should receive advertisement deposits on a consistent
                            basis.
                            if you are not receiving advertisement deposits click <a className={''}
                                                                                     onClick={() => this.props.history.push('/report-issue')}>here</a> to
                            request assistance.
                        </p>
                        <span>you have received {format.millix(this.state.total_paid_amount)} in the past 24 hours.</span>
                    </div>
                    <Row id={'adlist'} className={'advertisement_consumer_settlement_ledger_list'}>
                        <DatatableView
                            reload_datatable={() => this.reloadDatatable()}
                            datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                            value={this.state.ledger_list}
                            sortField={'payment_date'}
                            sortOrder={-1}
                            loading={this.state.datatable_loading}
                            showActionColumn={true}
                            resultColumn={[
                                {
                                    field     : 'preview',
                                    class_name: 'advertisement_preview_datatable_column'
                                },
                                {
                                    field     : 'advertisement_deck',
                                    class_name: 'hidden_data_search_column'
                                },
                                {
                                    field     : 'advertisement_headline',
                                    class_name: 'hidden_data_search_column'
                                },
                                {
                                    field     : 'advertisement_url',
                                    class_name: 'hidden_data_search_column'
                                },
                                {
                                    field : 'amount',
                                    header: 'amount'
                                },
                                {
                                    field : 'presentation_date',
                                    header: 'presentation date'
                                },
                                {
                                    field : 'payment_date',
                                    header: 'payment date'
                                }
                            ]}/>
                    </Row>
                </div>
            </div>

        </div>);
    }
}


export default withRouter(AdvertisementConsumerSettlementLedgerView);


