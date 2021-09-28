import React from 'react';
import PropTypes from 'prop-types';
import {Col, FormControl, Row} from 'react-bootstrap';

const WalletCreatePasswordView = (props) => {
    let passphraseRef, passphraseConfirmRef;
    return (
        <div className={"wallet-create-password"}>
            <Row>
                {props.walletImport ? (<Col sm={12} className={"center mb-3"}><small>type the password to unlock your wallet. if you do not know the password to unlock the wallet you have lost access to your funds.</small></Col>):
                    (<Col sm={12} className={"center mb-3"}><small>create a strong password and save it in a safe place. if you lose or forget your password you will lose your funds.</small></Col>)}
            </Row>
            <Row>
                <Col className={'mb-3 col-md-offset-2'} md={8}>
                    <FormControl
                        type="password"
                        ref={c => passphraseRef = c}
                        placeholder="wallet passphrase"
                        aria-label="wallet passphrase"
                        aria-describedby="basic-addon"
                        onChange={(e) => {
                            props.onPassword(passphraseRef.value);
                        }}
                    />
                </Col>
            </Row>
            <Row>
                <Col className={'mb-3 col-md-offset-2'} md={8}>
                    <FormControl
                        type="password"
                        ref={c => passphraseConfirmRef = c}
                        style={{...props.notConfirmed ? ({border: 'solid rosybrown 1px'}) : ({})}}
                        placeholder="confirm wallet password"
                        aria-label="confirm  wallet password"
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
