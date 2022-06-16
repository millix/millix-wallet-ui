import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row} from 'react-bootstrap';
import API from '../../api';
import PhotoAlbum from 'react-photo-album';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import api from '../../api';
import async from 'async';


class NftCollectionView extends Component {
    constructor(props) {
        super(props);
        this.datatable_reload_interval = undefined;
        this.state                     = {
            nft_list                  : [],
            datatable_reload_timestamp: '',
            datatable_loading         : false
        };
    }

    componentDidMount() {
        this.reloadCollection();
        this.datatable_reload_interval = setInterval(() => this.reloadCollection(), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.datatable_reload_interval);
    }

    getNftSize(url) {
        return new Promise((resolve, reject) => {
            const img   = new Image();
            img.onload  = () => resolve({
                width : 1,
                height: 1
            });
            img.onerror = () => reject();
            img.src     = url;
        });
    }

    reloadCollection() {
        this.setState({
            datatable_loading: true
        });

        return API.listTransactionWithDataReceived(this.props.wallet.address_key_identifier, 'tangled_nft').then(data => {
            this.setState({
                nft_list                  : data.map(row => ({
                    src   : `${api.getAuthenticatedMillixApiURL()}/Mh9QifTIESw5t1fa?p0=${row.transaction_id}&p1=${row.address_key_identifier_to}&p2=Adl87cz8kC190Nqc&p3=${row.transaction_output_attribute[0].value.file_list[0].hash}`,
                    width : 4,
                    height: 3
                })),
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    render() {
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
                        <Row>
                            <Col xs={12} md={4}>
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
                        </Row>
                        <Row style={{marginTop: 10}}>
                            <Col>
                                <PhotoAlbum layout="masonry" photos={this.state.nft_list}/>
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

