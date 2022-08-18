import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import API from '../../api';
import {parse} from 'querystring';
import {TRANSACTION_DATA_TYPE_ASSET, TRANSACTION_DATA_TYPE_NFT} from '../../../config';
import * as format from '../../helper/format';
import {Button, Col, Row} from 'react-bootstrap';
import DatatableView from '../utils/datatable-view';
import Translation from '../../common/translation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import ReloadTimeTickerView from '../utils/reload-time-ticker-view';
import moment from 'moment/moment';
import NftActionSummaryView from './nft-action-summary';
import ErrorList from '../utils/error-list-view';
import DatatableActionButtonView from '../utils/datatable-action-button-view';
import utils from '../../helper/utils';
import {changeLoaderState} from '../loader';


class NftPreviewView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status                  : 'asset',
            parameter_list          : {},
            image_data              : {},
            action                  : 'preview',
            nft_sync_timestamp      : moment.now(),
            modal_show_copy_result  : false,
            error_list              : [],
            transaction_history_list: []
        };

        this.timeout_id = null;
    }

    componentDidMount() {
        const params = parse(this.props.location.search.slice(1));
        this.setState({
            parameter_list: {
                transaction_id           : params.p0,
                address_key_identifier_to: params.p1,
                key                      : params.p2,
                hash                     : params.p3,
                metadata_hash            : params.p4
            }
        }, () => {
            if (params.type) {
                this.setAssetData();
            }
            else {
                this.setNftData();
            }
        });
    }

    componentWillUnmount() {
        clearTimeout(this.timeout_id);
    }

    async setNftData() {
        const sync_request_image    = API.getSyncNftTransaction(this.state.parameter_list);
        const sync_request_metadata = API.getSyncNftTransaction(this.state.parameter_list, true);
        Promise.all([
            sync_request_image,
            sync_request_metadata
        ]).then((result_sync) => {
            const result_image    = result_sync[0];
            const result_metadata = result_sync[1];

            this.setState({
                status            : result_image.status,
                nft_sync_timestamp: moment.now()
            });

            if (result_image.status !== 'syncing' && result_metadata.status !== 'syncing') {
                clearTimeout(this.timeout_id);
                API.listTransactionWithDataReceived(this.state.parameter_list.address_key_identifier_to, TRANSACTION_DATA_TYPE_NFT)
                   .then(transaction_list => {
                       const transaction = transaction_list.filter((entry) => entry.transaction_id === this.state.parameter_list.transaction_id)[0];

                       if (!transaction) {
                           this.setState({
                               error_list: [
                                   {
                                       message: 'nft not found'
                                   }
                               ]
                           });
                       }
                       else {
                           transaction.file_key = this.state.parameter_list.key;
                           utils.getImageFromApi(transaction)
                                .then(image_data => {
                                    this.setState({
                                        image_data
                                    });
                                    changeLoaderState(false);
                                });
                       }
                   });
            }
            else {
                setTimeout(() => this.setNftData(), 30000);
            }
        }).catch(_ => {
            setTimeout(() => this.setNftData(), 30000);
        });
    }

    setAssetData() {
        // this.getImageDataWithDetails(TRANSACTION_DATA_TYPE_ASSET).then(stateData => {
        //     this.setState(stateData);
        // });
    }

    // async getImageDataWithDetails(data_type) {
    // return API.getNftImageWithKey(this.state.image_data_parameter_list).then(result => {
    //     return result.ok ? result.blob() : undefined;
    // }).then(blob => {
    //     return API.listTransactionWithDataReceived(this.state.image_data_parameter_list.address_key_identifier_to, data_type).then(data => {
    //         const transaction = data.filter((entry) => entry.transaction_id === this.state.image_data_parameter_list.transaction_id)[0];
    //         console.log(data);
    //         if (!transaction) {
    //             this.setState({
    //                 error_list: [
    //                     {
    //                         message: 'nft not found'
    //                     }
    //                 ]
    //             });
    //         }
    //         else {
    //             return {
    //                 image_data              : {
    //                     amount: transaction.amount,
    //                     ...transaction.transaction_output_attribute[0].value.file_data,
    //                     transaction
    //                 },
    //                 image_src               : URL.createObjectURL(blob),
    //                 transaction_history_list: this.getTransactionHistoryList(data)
    //             };
    //         }
    //     });
    // });
    // }

    // getTransactionHistoryList(data) {
    //     return data.map((transaction) => {
    //         return {
    //             date  : format.date(transaction.transaction_date),
    //             txid  : transaction.transaction_id,
    //             action: <>
    //                 <DatatableActionButtonView
    //                     history_path={'/transaction/' + encodeURIComponent(transaction.transaction_id)}
    //                     history_state={[transaction]}
    //                     icon={'eye'}/>
    //             </>
    //         };
    //     });
    // }

    render() {
        let nft_body;
        if (this.state.status !== 'syncing') {
            if (this.state.error_list.length === 0) {
                nft_body = <>
                    <div className={'nft-collection-img'}>
                        <a href={this.state.image_data.src} target={'_blank'} className={'mx-auto'}>
                            <img src={this.state.image_data.src} alt={this.state.image_data.name}/>
                        </a>
                    </div>
                    <Row className={'nft-preview-description'}>
                        <Col>
                            <div>
                                <p className={'nft-name page_subtitle mb-0'}>{this.state.image_data.name}</p>
                                <p className={'nft-description'}>{this.state.image_data.description}</p>
                            </div>
                        </Col>
                    </Row>

                    {/*<hr/>*/}

                    {/*<div className={'section_subtitle'}>*/}
                    {/*    transfer history*/}
                    {/*</div>*/}
                    {/*<DatatableView*/}
                    {/*    on_global_search_change={false}*/}
                    {/*    value={this.state.transaction_history_list}*/}
                    {/*    sortField={'date'}*/}
                    {/*    sortOrder={-1}*/}
                    {/*    resultColumn={[*/}
                    {/*        {*/}
                    {/*            field : 'date',*/}
                    {/*            header: Translation.getPhrase('cd55d1db8')*/}
                    {/*        },*/}
                    {/*        {*/}
                    {/*            field : 'txid',*/}
                    {/*            header: Translation.getPhrase('da26d66d6')*/}
                    {/*        },*/}
                    {/*        {*/}
                    {/*            field : 'action',*/}
                    {/*            header: Translation.getPhrase('012bb6684')*/}

                    {/*        }*/}
                    {/*    ]}/>*/}
                </>;
            }
        }
        else {
            nft_body = <Row className={'align-items-center'}>
                <Col md={5}>
                    <Button variant="outline-primary"
                            size={'sm'}
                            className={'refresh_button'}
                            onClick={() => this.setNftData()}
                    >
                        <FontAwesomeIcon
                            icon={'sync'}
                            size="1x"/>
                        refresh
                    </Button>
                </Col>
                <Col md={7}>
                    <span>
                        <ReloadTimeTickerView last_update_time={this.state.nft_sync_timestamp}/>
                    </span>
                </Col>
            </Row>;
        }

        return (<div className={'panel panel-filled'}>
            <div className={'panel-heading bordered d-flex'}>
                nft details
                <div className={'ms-auto message_subject_action_container'}>
                    {this.state.error_list.length === 0 && this.state.status === 'synced' && <NftActionSummaryView
                        nft_data={this.state.image_data}
                        src={this.state.image_data.src}
                        view_page={true}
                    />}
                </div>
            </div>
            <div className={'panel-body'}>
                <ErrorList
                    error_list={this.state.error_list}/>
                {nft_body}
            </div>

        </div>);
    }
}


export default connect(state => ({
    wallet: state.wallet
}))(withRouter(NftPreviewView));

