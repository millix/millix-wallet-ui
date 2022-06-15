import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Row} from 'react-bootstrap';
import NftCreateForm from './nft-create-form';

class NftCreateView extends Component {

    render() {
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>create</div>
                            <div className={'panel-body'}>
                                <p>
                                    create an encrypted nft. the nft will be stored on your device and the recipients
                                    device. to transport the nft to reach the recipient, the data is stored on the millix network for up to 90 days. only
                                    you and the recipient can decrypt and see your nft.
                                </p>
                                <NftCreateForm/>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet,
        config: state.config
    })
)(withRouter(NftCreateView));
