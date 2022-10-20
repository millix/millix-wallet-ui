import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import API from '../../api';
import * as helper_message from '../../helper/message';
import DatatableView from './../utils/datatable-view';
import {connect} from 'react-redux';
import Translation from '../../common/translation';
import {TRANSACTION_DATA_TYPE_MESSENGER} from '../../../config';
import utils from '../../helper/utils';


class MessageInboxView extends Component {
    constructor(props) {
        super(props);
        this.datatable_reload_interval = undefined;
        this.state                     = {
            message_list              : [],
            datatable_reload_timestamp: '',
            datatable_loading         : false
        };
    }

    componentDidMount() {
        this.reloadDatatable();
        this.datatable_reload_interval = setInterval(() => this.reloadDatatable(), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.datatable_reload_interval);
    }

    reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

        return API.listTransactionWithDataReceived(this.props.wallet.address_key_identifier, TRANSACTION_DATA_TYPE_MESSENGER).then(data => {
            const message_list = helper_message.datatable_format(data);

            this.setState({
                message_list              : message_list,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    getDateField(rawData) {
        return <>{rawData.date}</>;
    }

    render() {
        return (
            <>
                <div className={'panel panel-filled'}>
                    <div className={'panel-body'} style={{textAlign: 'center'}}>
                        <div>
                            <p>
                                {Translation.getPhrase('78916d069')}
                            </p>
                        </div>
                        <div className={'primary_address'}>
                            {this.props.wallet.address_public_key}{utils.get_address_version(this.props.wallet.address_key_identifier)}{this.props.wallet.address_key_identifier}
                        </div>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>{Translation.getPhrase('a6e7dca40')}</div>
                    <div className={'panel-body'}>
                        <Row>
                            <DatatableView
                                action_button={{
                                    label   : Translation.getPhrase('544d6013e'),
                                    on_click: () => this.props.history.push('/message-compose'),
                                    icon    : 'envelope'
                                }}
                                loading={this.state.datatable_loading}
                                reload_datatable={() => this.reloadDatatable()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                value={this.state.message_list}
                                sortField={'raw_date'}
                                sortOrder={-1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field     : 'raw_date',
                                        body      : this.getDateField,
                                        header    : Translation.getPhrase('b25d3cd74'),
                                        class_name: 'w-10'
                                    },
                                    {
                                        field : 'subject',
                                        header: Translation.getPhrase('d334c1e6d')
                                    },
                                    {
                                        field : 'address_from',
                                        header: Translation.getPhrase('666115b0d')
                                    },
                                    {
                                        field : 'amount',
                                        header: Translation.getPhrase('77ba93615')
                                    }
                                ]}/>
                        </Row>
                    </div>
                </div>
            </>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(MessageInboxView));

