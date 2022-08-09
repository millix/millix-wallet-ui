import React from 'react';
import PropTypes from 'prop-types';
import {Form} from 'react-bootstrap';
import Translation from '../../common/translation';

const WalletCreateInfoView = (props) => {
    let info_label = 'your wallet has been successfully created.';
    if (props.processName === 'import') {
        info_label = 'your wallet has been successfully imported.';
    }

    return (
        <div className={'wallet-create-password'}>
            <div className={'center mb-3'}>{info_label}</div>
            <Form.Group className={'form-group'}>
                <label>{Translation.getPhrase('6e8dc8a1b')}</label>
                <Form.Control type="text"
                              readOnly={true}
                              value={props.wallet.id}/>
            </Form.Group>
            <Form.Group className={'form-group'}>
                <label>{Translation.getPhrase('ac81b973d')}</label>
                <Form.Control type="text"
                              readOnly={true}
                              value={'0x' + props.wallet.private_key}/>
            </Form.Group>
            <Form.Group className={'form-group'}>
                <label>{Translation.getPhrase('235861067')}</label>
                <Form.Control type="text"
                              readOnly={true}
                              value={props.wallet.address}/>
            </Form.Group>
        </div>
    );
};

WalletCreateInfoView.propTypes = {
    wallet     : PropTypes.object.isRequired,
    processName: PropTypes.string
};

export default WalletCreateInfoView;
