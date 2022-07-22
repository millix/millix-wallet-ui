import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Card, Col, Form, Row} from 'react-bootstrap';
import API from '../../api';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import * as format from '../../helper/format';
import ModalView from '../utils/modal-view';
import * as text from '../../helper/text';
import {changeLoaderState} from '../loader';
import Transaction from '../../common/transaction';
import async from 'async';
import utils from '../../helper/utils';
import {TRANSACTION_DATA_TYPE_ASSET, TRANSACTION_DATA_TYPE_NFT, TRANSACTION_DATA_TYPE_TRANSACTION} from '../../../config';
import HelpIconView from '../utils/help-icon-view';
import moment from 'moment';
import ReloadTimeTickerView from '../utils/reload-time-ticker-view';


class NftCollectionView extends Component {
    constructor(props) {
        super(props);
        this.datatable_reload_interval = undefined;
        this.state                     = {
            nft_list                    : [],
            nft_selected                : undefined,
            datatable_reload_timestamp  : '',
            datatable_loading           : false,
            modal_show_burn_confirmation: false,
            modal_show_burn_result      : false,
            modal_burn_create_asset     : true,
            modal_body_burn_result      : [],
            nft_list_reload_timestamp   : moment.now()
        };
    }

    componentDidMount() {
        moment.relativeTimeThreshold('ss', -1);
        this.reloadCollection();
        this.datatable_reload_interval = setInterval(() => this.reloadCollection(), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.datatable_reload_interval);
        this.state.nft_list.forEach(nft => nft.src && URL.revokeObjectURL(nft.src));
    }

    reloadCollection() {
        changeLoaderState(true);
        this.setState({
            datatable_loading: true
        });

        return API.listTransactionWithDataReceived(this.props.wallet.address_key_identifier, TRANSACTION_DATA_TYPE_NFT).then(data => {
            async.mapLimit(data, 6, (row, callback) => {
                utils.getImageFromApi(row)
                     .then(image_data => {
                         image_data.image_details = row.transaction_output_attribute[0];
                         callback(null, image_data);
                         changeLoaderState(false);
                     });
            }, (err, nftList) => {
                changeLoaderState(false);
                this.setState({
                    nft_list                  : nftList,
                    datatable_reload_timestamp: new Date(),
                    datatable_loading         : false,
                    nft_list_reload_timestamp : moment.now()
                });
            });
        });
    }

    cancelNftBurn() {
        this.setState({
            nft_selected                : undefined,
            modal_show_burn_confirmation: false,
            modal_burn_create_asset     : true
        });
    }

    prepareTransactionOutputToBurnNft(nft, keepAsAsset) {
        return {
            transaction_output_attribute: {
                parent_transaction_id: nft.txid
            },
            transaction_data            : {
                file_hash        : nft.hash,
                attribute_type_id: 'Adl87cz8kC190Nqc'
            },
            transaction_data_type       : keepAsAsset ? TRANSACTION_DATA_TYPE_ASSET : TRANSACTION_DATA_TYPE_TRANSACTION,
            transaction_data_type_parent: TRANSACTION_DATA_TYPE_NFT,
            transaction_output_list     : [
                {
                    address_base          : this.props.wallet.address_key_identifier,
                    address_version       : this.props.wallet.address_key_identifier.startsWith('1') ? '0a0' : 'la0l',
                    address_key_identifier: this.props.wallet.address_key_identifier,
                    amount                : nft.amount
                }
            ],
            transaction_output_fee      : {
                fee_type: 'transaction_fee_default',
                amount  : 1000
            }
        };
    }

    doNftBurn() {
        const keepAsAsset = this.state.modal_burn_create_asset;

        changeLoaderState(true);
        let transaction_output_payload = this.prepareTransactionOutputToBurnNft(this.state.nft_selected, keepAsAsset);
        const newState                 = {
            modal_show_burn_result      : true,
            modal_show_burn_confirmation: false,
            modal_burn_create_asset     : true
        };

        Transaction.sendTransaction(transaction_output_payload, true, false).then(() => {
            this.reloadCollection();
            this.setState(newState);
            changeLoaderState(false);
        }).catch((error) => {
            this.setState({
                ...error,
                ...newState
            });
            changeLoaderState(false);
        });
    }

    renderNftImage(nft_list) {
        let nft_list_formatted = [];
        for (const image_props of nft_list) {
            const {
                      src,
                      alt,
                      image_details
                  } = image_props;

            nft_list_formatted.push(
                <Col xs={12} md={3} className={'mt-4'} key={image_details.transaction_id}>
                    <Card className={'nft-card'}>
                        <img src={src} alt={alt} className={'nft-collection-img'}/>
                        <Card.Body>
                            <Card.Title className={'nft-name'}>{image_details.value.name}</Card.Title>
                            <p className={'nft-description'}>{image_details.value.description}</p>
                            <div className={'nft-action-section'}>
                                <Button
                                    className='icon_only'
                                    variant='outline-default'
                                    size={'sm'}
                                    onClick={() => this.setState({
                                        modal_show_burn_confirmation: true,
                                        nft_selected                : image_props
                                    })}>
                                    <FontAwesomeIcon icon={'fa-fire'}/>
                                </Button>
                                <Button variant='outline-primary'
                                        size={'sm'}
                                        onClick={() => this.props.history.push('/nft-transfer', image_props)}>transfer</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            );
        }
        return <>{nft_list_formatted}</>;
    }

    render() {
        const nft_row_list = this.renderNftImage(this.state.nft_list);
        return (
            <>
                <div className={'panel panel-filled'}>
                    <div className={'panel-body'} style={{textAlign: 'center'}}>
                        <div>
                            <p>
                                use this address to receive nfts
                            </p>
                        </div>
                        <div className={'primary_address'}>
                            {this.props.wallet.address_public_key}{this.props.wallet.address_key_identifier.startsWith('1') ? '0b0' : 'lb0l'}{this.props.wallet.address_key_identifier}
                        </div>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>collection
                    </div>
                    <div className={'panel-body'}>
                        <p>
                            nft files are different than normal media files. when you create or receive an nft in a millix transaction,
                            the funds are not available in your wallet balance. this preserves and protects the provenance and ownership of the nft asset.
                            if you burn an nft you are destroying the provenance and proof of ownership of the nft and the funds stored in the associated
                            nft transaction are added to your wallet balance.
                            backup your nft <HelpIconView help_item_name={'nft'}/>
                        </p>
                        <Row className={'align-items-center'}>
                            <Col md={5}>
                                <Button variant="outline-primary"
                                        size={'sm'}
                                        className={'refresh_button'}
                                        onClick={() => this.reloadCollection()}
                                >
                                    <FontAwesomeIcon
                                        icon={'sync'}
                                        size="1x"/>
                                    refresh
                                </Button>
                            </Col>
                            <Col md={7}>
                                <span>
                                    <ReloadTimeTickerView last_update_time={this.state.nft_list_reload_timestamp}/>
                                </span>
                            </Col>
                        </Row>
                        <Row style={{marginTop: 10}}>
                            <Col>
                                <Row>
                                    {nft_row_list}
                                </Row>
                                <ModalView
                                    show={this.state.modal_show_burn_confirmation}
                                    size={'lg'}
                                    heading={'burn nft'}
                                    on_accept={() => this.doNftBurn()}
                                    on_close={() => this.cancelNftBurn()}
                                    body={<div>
                                        <div>you are about to burn an nft and receive {format.millix(this.state.nft_selected?.amount)} in your wallet</div>
                                        <div style={{
                                            display      : 'flex',
                                            flexDirection: 'row'
                                        }}><Form.Check type="checkbox" label="" checked={this.state.modal_burn_create_asset}
                                                       onChange={e => this.setState({modal_burn_create_asset: e.target.checked})}/> preserve image as an asset
                                        </div>
                                        {text.get_confirmation_modal_question()}
                                    </div>}/>
                                <ModalView
                                    show={this.state.modal_show_burn_result}
                                    size={'lg'}
                                    on_close={() => {
                                        this.setState({modal_show_burn_result: false})
                                        this.reloadCollection();
                                    }}
                                    heading={'burn nft'}
                                    body={<p>nft burned</p>}/>
                            </Col>
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
)(withRouter(NftCollectionView));

