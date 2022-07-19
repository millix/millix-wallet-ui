import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import NftView from './nft-view';


class NftCreateView extends Component {
    render() {
        return (
            <NftView nft_text={'create an encrypted nft. the nft will be stored on your device and the recipients\n' +
                               'device. to transport the nft to reach the recipient, the data is stored on the millix network for up to 90 days. only\n' +
                               'you and the recipient can decrypt and see your nft.'}
                     nft_type={'create'}
            />
        );
    }
}


export default (withRouter(NftCreateView));
