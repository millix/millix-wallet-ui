import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button, Col, OverlayTrigger, Popover, Form} from 'react-bootstrap';
import {connect} from 'react-redux';
import ModalView from '../utils/modal-view';
import * as format from '../../helper/format';
import * as text from '../../helper/text';
import {changeLoaderState} from '../loader';
import Transaction from '../../common/transaction';
import {TRANSACTION_DATA_TYPE_ASSET, TRANSACTION_DATA_TYPE_NFT, TRANSACTION_DATA_TYPE_TRANSACTION} from '../../../config';
import API from '../../api';


class NftActionSummaryView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nft_data                    : props.nft_data,
            modal_show_burn_confirmation: false,
            modal_show_burn_result      : false,
            modal_burn_create_asset     : true,
            modal_body_burn_result      : [],
            burned_nft_kept_as_asset    : true,
            src                         : props.nft_data.src,
            name                        : props.nft_data.name
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.nft_data !== this.props.nft_data) {
            this.setState({
                nft_data: this.props.nft_data,
                src     : this.props.nft_data?.src,
                name    : this.props.nft_data?.name
            });
        }
    }

    getBurnModalNftName() {
        let result = '';
        const name = this.state.name;

        if (name) {
            result = <b> "{name}"</b>;
        }

        return result;
    }

    doNftBurn() {
        const keepAsAsset = this.state.modal_burn_create_asset;

        changeLoaderState(true);
        let transaction_output_payload = this.prepareTransactionOutputToBurnNft(this.state.nft_data, keepAsAsset);
        const newState                 = {
            modal_show_burn_result      : true,
            modal_show_burn_confirmation: false,
            modal_burn_create_asset     : true,
            burned_nft_kept_as_asset    : keepAsAsset
        };

        Transaction.sendTransaction(transaction_output_payload, true, false).then(() => {
            // this.reloadCollection(); // todo: either reload or redirect to collection
            this.setState(newState);
            changeLoaderState(false);
            this.props.history.push('/nft-collection');
        }).catch((error) => {
            this.setState({
                ...error,
                ...newState
            });
            changeLoaderState(false);
        });
    }

    cancelNftBurn() {
        this.setState({
            modal_show_burn_confirmation: false,
            modal_burn_create_asset     : true
        });
    }

    prepareTransactionOutputToBurnNft(nft, keepAsAsset) {
        return {
            transaction_output_attribute: {
                name                 : nft.name,
                description          : nft.description,
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

    getViewLink(absolute = false) {
        let origin = '';
        if (absolute) {
            origin = window.location.origin;
        }

        let url = '';
        if (this.state.nft_data.transaction) {
            url = `${origin}/nft-preview/?p0=${this.state.nft_data.transaction.transaction_id}&p1=${this.state.nft_data.transaction.address_key_identifier_to}&p2=${this.state.nft_data.file_key}&p3=${this.state.nft_data.hash}&p4=${this.state.nft_data.metadata_hash}`;
        }

        return url;
    }

    copyViewLink() {
        navigator.clipboard.writeText(this.getViewLink(true));
        this.setState({
            modal_show_copy_result: true
        });
    }

    isOwner() {
        return this.state.nft_data.transaction?.address_key_identifier_to === this.props.wallet.address_key_identifier;
    }

    render() {
        let owner_action_list = '';
        if (this.isOwner()) {
            owner_action_list = <>
                <div className={'mt-3'}>
                    <Button
                        variant="outline-default"
                        className={'w-100'}
                        onClick={() => this.setState({
                            modal_show_burn_confirmation: true
                        })}>
                        <FontAwesomeIcon className="text-warning"
                                         icon={'bomb'}/>burn
                    </Button>
                </div>
                <div className={'mt-3'}>
                    <Button
                        variant="outline-default"
                        className={'w-100'}
                        onClick={() => this.props.history.push('/nft-transfer', this.state.nft_data)}>
                        <FontAwesomeIcon icon={'arrow-right-arrow-left'}/>transfer
                    </Button>
                </div>

                <div className={'mt-3'}>
                    <a href={this.state.src} target={'_blank'} className={'btn btn-outline-default w-100'}>
                        <FontAwesomeIcon icon={'file'}/>raw image
                    </a>
                </div>
            </>;
        }

        let detail_link = '';
        if (!this.props.view_page) {
            detail_link = <div className={'mt-3'}>
                <Button variant="outline-default"
                        className={'w-100'}
                        onClick={() => {
                            this.props.history.push(this.getViewLink());
                        }}
                >
                    <FontAwesomeIcon icon={'eye'}/>details
                </Button>
            </div>;
        }

        const popoverFocus = (
            <Popover id="popover-basic">
                <Popover.Header>
                    <div className={'page_subtitle'}>
                        nft actions
                    </div>
                </Popover.Header>
                <Popover.Body>
                    <div>
                        <Form.Group>
                            <label>public preview link</label>
                            <Col className={'input-group'}>
                                <Form.Control type="text" value={this.getViewLink(true)} readOnly={true}/>
                                <button
                                    className="btn btn-outline-input-group-addon icon_only"
                                    type="button"
                                    onClick={() => this.copyViewLink()}
                                >
                                    <FontAwesomeIcon
                                        icon={'copy'}/>
                                </button>
                            </Col>
                        </Form.Group>
                        {owner_action_list}
                        {detail_link}
                    </div>
                </Popover.Body>
            </Popover>
        );

        return (
            <>
                <OverlayTrigger
                    trigger={['click']}
                    rootClose
                    placement="auto"
                    overlay={popoverFocus}
                >
                    <Button
                        variant="outline-default"
                        size={'xs'}>
                        <FontAwesomeIcon icon={'caret-down'}/>actions
                    </Button>
                </OverlayTrigger>

                <ModalView
                    show={this.state.modal_show_burn_confirmation}
                    size={'lg'}
                    heading={'burn nft'}
                    on_accept={() => this.doNftBurn()}
                    on_close={() => this.cancelNftBurn()}
                    body={<div>
                        <div className="mb-3">
                            you are about to burn your nft {this.getBurnModalNftName()} and
                            unlock {format.millix(this.state.nft_data?.amount)} in your wallet
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
                        this.props.history.push('/nft-collection');
                    }}
                    heading={'burn nft'}
                    body={<div>
                        your nft {this.getBurnModalNftName()} has been burned
                        successfully. {this.state.burned_nft_kept_as_asset && 'the file is now available as an asset.'}
                    </div>}/>
                <ModalView
                    show={this.state.modal_show_copy_result}
                    size={'lg'}
                    heading={'nft public preview link copied'}
                    on_close={() => this.setState({modal_show_copy_result: false})}
                    body={<div>
                        nft public preview link has been copied to clipboard
                    </div>}/>
            </>
        );
    }
}


NftActionSummaryView.propTypes = {
    nft_data : PropTypes.any,
    src      : PropTypes.string,
    view_page: PropTypes.bool
};

export default connect(
    state => ({
        wallet: state.wallet
    }), {})(withRouter(NftActionSummaryView));
