import React from 'react';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-bootstrap';

const MnemonicView = (props) => {
    return (
        <div className={"mnemonic"}>
            <Row>
                <Col sm={12} className={"center mb-3"}>
                    <small>the recovery phrase (aka mnemonic phrase) is a unique string that allows you to recover your wallet.
                        we recommend you to write these words down and keep them in a safe place.
                        avoid saving your recovery phrase in a computer or online service and do not take a screenshot of it.</small>
                </Col>
            </Row>
            {new Array(4).fill(1).map((_, row) =>
                <Row key={`row_${row}`}>
                    {new Array(6).fill(1).map((_, col) =>
                        <Col key={`row_${row}_col_${col}`} className={"mnemonic-cell"} sm={2}>
                            <div><span className={"phrase-number"}>{row * 6 + col + 1}</span><span
                                className={"phrase"}>{props.mnemonic[row * 6 + col]}</span></div>
                        </Col>
                    )}
                </Row>
            )}
        </div>
    );
};

MnemonicView.propTypes = {
    mnemonic: PropTypes.array.isRequired
};

export default MnemonicView;
