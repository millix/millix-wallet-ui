import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Card, Col, Row} from 'react-bootstrap';
import API from '../../api';
import PhotoAlbum from 'react-photo-album';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import async from 'async';
import utils from '../../helper/utils';
import * as format from '../../helper/format';
import {TRANSACTION_DATA_TYPE_ASSET} from '../../../config';


class AssetView extends Component {
    constructor(props) {
        super(props);
        this.datatable_reload_interval = undefined;
        this.state                     = {
            asset_list                : [],
            datatable_reload_timestamp: '',
            datatable_loading         : false
        };
    }

    componentDidMount() {
        this.reloadAssetList();
        this.datatable_reload_interval = setInterval(() => this.reloadAssetList(), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.datatable_reload_interval);
        this.state.asset_list.forEach(asset => asset.src && URL.revokeObjectURL(asset.src));
    }

    reloadAssetList() {
        this.setState({
            datatable_loading: true
        });

        return API.listTransactionWithDataReceived(this.props.wallet.address_key_identifier, TRANSACTION_DATA_TYPE_ASSET).then(data => {
            async.mapLimit(data, 6, (row, callback) => {
                utils.getImageFromApi(row)
                     .then(image_data => callback(null, image_data));
            }, (err, assetList) => {
                this.setState({
                    asset_list                : assetList,
                    datatable_reload_timestamp: new Date(),
                    datatable_loading         : false
                });
            });
        });
    }

    renderAsset({
                    imageProps,
                    photo
                }) {
        const {
                  src,
                  alt,
                  srcSet,
                  sizes,
                  ...restImageProps
              } = imageProps;
        return (<Card className={'nft-card'}>
            <Card.Img variant="top" src={src} alt={alt} {...(srcSet ? {
                srcSet,
                sizes
            } : null)} {...restImageProps} style={{maxWidth: 800}}/>
            <Card.Body>
                <Card.Title style={{
                    width   : `calc(${sizes} - 4vw)`,
                    maxWidth: 720
                }}>{photo.hash}</Card.Title>
            </Card.Body>
        </Card>);
    }

    render() {
        return (
            <>
                <div className={'panel panel-filled'}>
                    <div className={'panel-body'} style={{textAlign: 'center'}}>
                        <div>
                            <p>
                                use this address to receive assets
                            </p>
                        </div>
                        <div className={'primary_address'}>
                            {this.props.wallet.address_public_key}{this.props.wallet.address_key_identifier.startsWith('1') ? '0b0' : 'lb0l'}{this.props.wallet.address_key_identifier}
                        </div>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>asset list
                    </div>
                    <div className={'panel-body'}>
                        <Row>
                            <Col xs={12} md={4}>
                                <Button variant="outline-primary"
                                        size={'sm'}
                                        className={'refresh_button'}
                                        onClick={() => this.reloadAssetList()}
                                >
                                    <FontAwesomeIcon
                                        icon={'sync'}
                                        size="1x"/>
                                    refresh
                                </Button>
                            </Col>
                        </Row>
                        <Row style={{marginTop: 10}}>
                            <Col>
                                <PhotoAlbum layout="masonry" renderPhoto={this.renderAsset.bind(this)} photos={this.state.asset_list}/>
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
)(withRouter(AssetView));

