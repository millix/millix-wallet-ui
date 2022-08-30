import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Card, Col, Row} from 'react-bootstrap';
import API from '../../api';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {changeLoaderState} from '../loader';
import async from 'async';
import utils from '../../helper/utils';
import {TRANSACTION_DATA_TYPE_NFT} from '../../../config';
import HelpIconView from '../utils/help-icon-view';
import moment from 'moment';
import ReloadTimeTickerView from '../utils/reload-time-ticker-view';
import NftActionSummaryView from './nft-action-summary';


class NftCollectionView extends Component {
    constructor(props) {
        super(props);
        this.datatable_reload_interval = undefined;
        this.state                     = {
            nft_list                  : [],
            nft_selected              : undefined,
            datatable_reload_timestamp: '',
            datatable_loading         : false,
            nft_list_reload_timestamp : moment.now()
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
            async.mapLimit(data, 6, (transaction, callback) => {
                utils.getImageFromApi(transaction)
                     .then(image_data => {
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

    renderNftImage(nft_list) {
        let nft_list_formatted = [];
        for (const image_props of nft_list) {
            const {
                      src,
                      alt,
                      transaction,
                      name,
                      description
                  } = image_props;

            let image = <img src={src} alt={alt}/>;
            nft_list_formatted.push(
                <Col xs={12} md={3} className={'mt-3'} key={transaction.transaction_id}>
                    <Card className={'nft-card'}>
                        <div className={'nft-collection-img'}>
                            {image}
                        </div>
                        <Card.Body>
                            <div className={'nft-name page_subtitle'}>{name}</div>
                            <div className={'nft-description'}>{description}</div>
                            <div className={'nft-action-section'}>
                                <NftActionSummaryView
                                    nft_data={image_props}
                                    modal_show_burn_result_on_close={() => this.reloadCollection()}
                                />

                                <Button variant="outline-default"
                                        size={'sm'}
                                        className={'ms-auto'}
                                        onClick={() => {
                                            this.props.history.push(utils.getNftViewLink(image_props));
                                        }}
                                >
                                    <FontAwesomeIcon icon={'eye'}/>details
                                </Button>
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
                    <div className={'panel-heading bordered'}>nft collection
                    </div>
                    <div className={'panel-body'}>
                        <p>
                            nft files are different than normal asset files. when you create or receive an nft in a millix transaction, the funds are not
                            available in your wallet balance. this preserves and protects the provenance and ownership of the nft asset. if you burn an nft you
                            are destroying the provenance and proof of ownership of the nft and the funds stored in the associated nft transaction are added to
                            your wallet balance. backup your nft <HelpIconView help_item_name={'nft'}/>
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

