import React from 'react';
import PropTypes from 'prop-types';
import {Col, FormControl, Row} from 'react-bootstrap';

const WalletCreatePasswordView = (props) => {
    let passphraseRef, passphraseConfirmRef;

    let info_label = 'create a strong password and save it in a safe place. if you lose or forget your password you will lose your funds.';
    if (props.processName === 'import') {
        info_label = 'enter the password. if you do not know the password to unlock the wallet you have lost access to your funds.';
    }

    return (
        <div className={'wallet-create-password'}>
            <div className={'center mb-3'}>{info_label}</div>
            <FormControl
                className={'form-group'}
                type="password"
                ref={c => passphraseRef = c}
                placeholder="password"
                aria-label="password"
                aria-describedby="basic-addon"
                onChange={(e) => {
                    props.onPassword(passphraseRef.value);
                }}
            />
            <FormControl
                className={'form-group'}
                type="password"
                ref={c => passphraseConfirmRef = c}
                placeholder="confirm password"
                aria-label="confirm password"
                aria-describedby="basic-addon"
                onChange={(e) => {
                    props.onConfirmPassword(passphraseConfirmRef.value);
                }}
            />
        </div>
    );
};

WalletCreatePasswordView.propTypes = {
    onPassword       : PropTypes.func.isRequired,
    onConfirmPassword: PropTypes.func.isRequired,
    notConfirmed     : PropTypes.bool,
    processName      : PropTypes.string
};

export default WalletCreatePasswordView;
