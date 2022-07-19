import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import NftView from './nft-view';


class NftTransferView extends Component {
    render() {
        return (
            <NftView nft_text={'you can transfer an encrypted nft to other recipient. the nft will be stored on your device and the recipients\n' +
                               'device. to transport the nft to reach the recipient, the data is stored on the ' +
                               'millix network for up to 90 days. only\n' +
                               'you and the recipient can decrypt and see your nft.'}
                     nft_type={'transfer'}
            />
        );
    }
}


export default (withRouter(NftTransferView));
