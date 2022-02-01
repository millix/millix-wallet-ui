import React from 'react';
import PropTypes from 'prop-types';
import {Col, Row, Form} from 'react-bootstrap';

const WalletCreateInfoView = (props) => {
    let info_label = 'your wallet has been successfully created.';
    if (props.processName === 'import') {
        info_label = 'your wallet has been successfully imported.';
    }

    return (
        <div className={'wallet-create-password'}>
            <div className={'center mb-3'}>{info_label}</div>
            <Form.Group className={'form-group'}>
                <label>wallet id</label>
                <Form.Control type="text"
                              readOnly={true}
                              value={props.wallet.id}/>
            </Form.Group>
            <Form.Group className={'form-group'}>
                <label>wallet private key</label>
                <Form.Control type="text"
                              readOnly={true}
                              value={'0x' + props.wallet.private_key}/>
            </Form.Group>
            <Form.Group className={'form-group'}>
                <label>wallet prime address</label>
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
