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
            nft_list_reload_timestamp   : moment.now(),
            burned_nft_kept_as_asset    : true
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
                         image_data.result_image_detail = row.transaction_output_attribute[0];
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
                name                 : nft.image_details.value.name,
                description          : nft.image_details.value.description,
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
            modal_burn_create_asset     : true,
            burned_nft_kept_as_asset    : keepAsAsset
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
                      result_image_detail
                  }                 = image_props;
            image_props.name        = result_image_detail.value.name;
            image_props.description = result_image_detail.value.description;
            nft_list_formatted.push(
                <Col xs={12} md={3} className={'mt-3'} key={result_image_detail.transaction_id}>
                    <Card className={'nft-card'}>
                        <img src={src} alt={alt} className={'nft-collection-img'}/>
                        <Card.Body>
                            <div className={'nft-name page_subtitle'}>{result_image_detail.value.name}</div>
                            <p className={'nft-description'}>{result_image_detail.value.description}</p>
                            <div className={'nft-action-section'}>
                                <Button
                                    variant="outline-default"
                                    size={'sm'}
                                    onClick={() => this.setState({
                                        modal_show_burn_confirmation: true,
                                        nft_selected                : image_props
                                    })}>
                                    <FontAwesomeIcon className="text-warning"
                                                     icon={'bomb'}/>burn
                                </Button>

                                <Button variant="outline-primary"
                                        size={'sm'}
                                        className={'preview_link'}>
                                    <FontAwesomeIcon icon={'eye'}/>preview
                                </Button>

                                <Button variant="outline-primary"
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

    getBurnModalNftName() {
        let result = '';
        const name = this.state.nft_selected?.result_image_detail.value.name;

        if (name) {
            result = <b> "{name}"</b>;
        }

        return result;
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
                        <Row>
                            {nft_row_list}
                            <ModalView
                                show={this.state.modal_show_burn_confirmation}
                                size={'lg'}
                                heading={'burn nft'}
                                on_accept={() => this.doNftBurn()}
                                on_close={() => this.cancelNftBurn()}
                                body={<div>
                                    <div className="mb-3">
                                        you are about to burn your nft {this.getBurnModalNftName()} and
                                        unlock {format.millix(this.state.nft_selected?.amount)} in your wallet
                                        balance. you can keep a non-nft copy of this file as an asset.
                                    </div>
                                    <div className="mb-3"
                                         style={{
                                             display      : 'flex',
                                             flexDirection: 'row'
                                         }}><Form.Check type="checkbox" label="" checked={this.state.modal_burn_create_asset}
                                                        onChange={e => this.setState({modal_burn_create_asset: e.target.checked})}/> preserve file as an
                                        asset
                                    </div>
                                    {text.get_confirmation_modal_question()}
                                </div>}/>
                            <ModalView
                                show={this.state.modal_show_burn_result}
                                size={'lg'}
                                on_close={() => {
                                    this.setState({modal_show_burn_result: false});
                                    this.reloadCollection();
                                }}
                                heading={'burn nft'}
                                body={<div>
                                    your nft {this.getBurnModalNftName()} was burned
                                    successfully. {this.state.burned_nft_kept_as_asset && 'the file is now available as an asset.'}
                                </div>}/>
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

