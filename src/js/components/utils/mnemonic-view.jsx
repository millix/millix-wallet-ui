import React from 'react';
import PropTypes from 'prop-types';
import {Col, Form, FormControl, InputGroup, Row} from 'react-bootstrap';
import Translation from '../../common/translation';

const MnemonicView = (props) => {
    return (
        <div className={'mnemonic'}>
            <div className={'mb-3'}>
                {Translation.getPhrase('6bf163d02')}
            </div>
            <Form.Group className="form-group">
                <label>{Translation.getPhrase('01f11055b')}</label>
                <Form.Control type="text"
                              placeholder={Translation.getPhrase('b8b4deaaf')}
                              value={props.mnemonic.join(' ')}
                              readOnly={true}/>
            </Form.Group>
            <div className={'section_subtitle'}>
                {Translation.getPhrase('c9f1c9835')}
            </div>
            <label>{Translation.getPhrase('020c9ae6f')}</label>
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
