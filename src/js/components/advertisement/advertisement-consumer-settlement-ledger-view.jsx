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
            const ledger_list     = [];
            let total_paid_amount = 0;
            response.ledger_list?.forEach(item_ledger => {
                total_paid_amount += item_ledger.deposit;
                ledger_list.push({
                    payment_date          : format.date(item_ledger.payment_date),
                    presentation_date     : format.date(item_ledger.presentation_date),
                    amount                : format.millix(item_ledger.deposit),
                    preview               : this.advertisementPreview(item_ledger),
                    advertisement_url     : item_ledger.advertisement_url,
                    advertisement_headline: item_ledger.advertisement_headline,
                    advertisement_deck    : item_ledger.advertisement_deck,
                    action                : <>
                        <DatatableActionButtonView
                            history_path={'/transaction/' + encodeURIComponent(item_ledger.protocol_transaction_id)}
                            history_state={{}}
                            icon={'th-list'}/>
                        <DatatableActionButtonView
                            callback={(callback_args) => this.openAdvertisementLink(callback_args)}
                            callback_args={item_ledger.advertisement_url}
                            icon={'link'}/></>
                });
            });

            this.setState({
                ledger_list               : ledger_list,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false,
                total_paid_amount         : total_paid_amount
            });
        });
    }

    openAdvertisementLink(data) {
        window.open(data.callback_args, '_blank');
    }

    advertisementPreview(item_ledger) {
        return (<>
            <AdvertisementPreview
                disable_link={true}
                url={item_ledger.advertisement_url}
                headline={item_ledger.advertisement_headline}
                deck={item_ledger.advertisement_deck}>
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
                                    field: 'preview',
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


