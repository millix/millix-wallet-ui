import React from 'react';
import PropTypes from 'prop-types';
import {Button, Col, FormControl, Row} from 'react-bootstrap';
import Translation from '../../common/translation';

const styles            = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    }
};
const PasswordInputView = (props) => {
    let passphraseRef;

    return (
        <Row>
            <Col>
                <Row>
                    <Col className={'mb-3 col-md-offset-2'} md={8}>
                        <FormControl
                            ref={c => passphraseRef = c}
                            type="password"
                            placeholder={Translation.getPhrase('98043c8bd')}
                            aria-label="wallet password"
                            aria-describedby="basic-addon"
                            onKeyPress={(e) => {
                                if (e.charCode === 13) {
                                    props.onPassword(passphraseRef.value);
                                }
                            }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col style={styles.centered}>
                        <Button variant="outline-primary"
                                onClick={() => {
                                    props.onPassword(passphraseRef.value);
                                }}>{props.newWallet ? Translation.getPhrase('2fde4af37') : Translation.getPhrase('31c1b6c9f')}</Button>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

PasswordInputView.propTypes = {
    onPassword: PropTypes.func.isRequired,
    newWallet : PropTypes.bool.isRequired
};


export default PasswordInputView;
