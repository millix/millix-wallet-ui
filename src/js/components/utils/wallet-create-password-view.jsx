import React from 'react';
import PropTypes from 'prop-types';
import {Col, FormControl, Row} from 'react-bootstrap';

const WalletCreatePasswordView = (props) => {
    let passphraseRef, passphraseConfirmRef;
    return (
        <div className={"wallet-create-password"}>
            <Row>
                {props.walletImport ? (<Col className={"center mb-3"}>type the password to unlock your wallet. if you do not know the password to unlock the wallet you have lost access to your funds.</Col>):
                    (<Col className={"center mb-3"}>create a strong password and save it in a safe place. if you lose or forget your password you will lose your funds.</Col>)}
            </Row>
            <Row>
                <Col className={'form-group'}>
                    <FormControl
                        type="password"
                        ref={c => passphraseRef = c}
                        placeholder="password"
                        aria-label="password"
                        aria-describedby="basic-addon"
                        onChange={(e) => {
                            props.onPassword(passphraseRef.value);
                        }}
                    />
                </Col>
            </Row>
            <Row>
                <Col className={'form-group'}>
                    <FormControl
                        type="password"
                        ref={c => passphraseConfirmRef = c}
                        placeholder="confirm password"
                        aria-label="confirm password"
                        aria-describedby="basic-addon"
                        onChange={(e) => {
                            props.onConfirmPassword(passphraseConfirmRef.value);
                        }}
                    />
                </Col>
            </Row>
        </div>
    );
};

WalletCreatePasswordView.propTypes = {
    onPassword: PropTypes.func.isRequired,
    onConfirmPassword: PropTypes.func.isRequired,
    notConfirmed: PropTypes.bool
};

export default WalletCreatePasswordView;
