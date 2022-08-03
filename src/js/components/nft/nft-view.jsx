import React from 'react';
import {withRouter} from 'react-router-dom';
import NftCreateForm from './nft-create-form';


function NftView(props) {
    return (
        <div className={'panel panel-filled'}>
            <div className={'panel-heading bordered'}>{props.nft_type}</div>
            <div className={'panel-body'}>
                <p>
                    {props.nft_text}
                </p>
                <NftCreateForm nft_transaction_type={props.nft_type}/>
            </div>
        </div>
    );
}


export default (withRouter(NftView));

