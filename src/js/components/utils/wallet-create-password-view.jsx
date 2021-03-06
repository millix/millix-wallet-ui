import React from 'react';
import PropTypes from 'prop-types';
import {FormControl} from 'react-bootstrap';
import Translation from '../../common/translation';

const WalletCreatePasswordView = (props) => {
    let passphraseRef, passphraseConfirmRef;

    let info_label = Translation.getPhrase('b7e9ca83d');
    if (props.processName === 'import') {
        info_label = Translation.getPhrase('0b3b5d17b');
    }

    return (
        <div className={'wallet-create-password'}>
            <div className={'center mb-3'}>{info_label}</div>
            <FormControl
                className={'form-group'}
                type="password"
                ref={c => passphraseRef = c}
                placeholder={Translation.getPhrase('43c568626')}
                aria-label="password"
                aria-describedby="basic-addon"
                onChange={() => {
                    props.onPassword(passphraseRef.value);
                }}
            />
            <FormControl
                className={'form-group'}
                type="password"
                ref={c => passphraseConfirmRef = c}
                placeholder={Translation.getPhrase('e59f9ba20')}
                aria-label="confirm password"
                aria-describedby="basic-addon"
                onChange={() => {
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
