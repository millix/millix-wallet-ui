import React from 'react';
import PropTypes from 'prop-types';
import {Col, Form, FormControl, InputGroup, Row} from 'react-bootstrap';

const MnemonicView = (props) => {
    return (
        <div className={'mnemonic'}>
            <div className={'mb-3'}>
                mnemonic phrase is a unique string that allows you to access
                your wallet.
                we recommend you to write these words down and keep them in
                a safe place.
                avoid saving your mnemonic phrase in a computer or online
                service and do not take a screenshot of it.
            </div>
            <Form.Group className="form-group">
                <label>you can copy entire mnemonic phrase</label>
                <Form.Control type="text"
                              placeholder="mnemonic phrase"
                              value={props.mnemonic.join(' ')}
                              readOnly={true}/>
            </Form.Group>
            <div className={'section_subtitle'}>
                or
            </div>
            <label>save mnemonic phrase word by word</label>
            {new Array(4).fill(1).map((_, row) =>
                <Row key={`row_${row}`}>
                    {new Array(6).fill(1).map((_, col) => {
                        const idx     = row * 6 + col;
                        const text_id = 'word_' + (idx + 1);

                        return (
                        <Col key={`row_${row}_col_${col}`} sm={2}>
                            <InputGroup className={'form-group'}>
                                <InputGroup.Text
                                    id={text_id}>{idx + 1}</InputGroup.Text>
                                <FormControl
                                    aria-label={idx + 1}
                                    aria-describedby={text_id}
                                    readOnly={true}
                                    value={props.mnemonic[row * 6 + col]}
                                />
                            </InputGroup>
                        </Col>);
                    })}
                </Row>
            )}
        </div>
    );
};

MnemonicView.propTypes = {
    mnemonic: PropTypes.array.isRequired
};

export default MnemonicView;
