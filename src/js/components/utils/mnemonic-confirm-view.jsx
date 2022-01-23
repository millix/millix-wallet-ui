import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Col, FormControl, Row, InputGroup, Form} from 'react-bootstrap';

const MnemonicConfirmView = (props) => {
    const inputList                             = [];
    const [mnemonicConfirm, setMnemonicConfirm] = useState(new Array(props.mnemonic.length));
    const isConfirmed                           = (newMnemonic) => {
        for (let i = 0; i < newMnemonic.length; i++) {
            if (newMnemonic[i] !== props.mnemonic[i]) {
                return false;
            }
        }
        return true;
    };

    const isValid = (newMnemonic) => {
        return props.importNew ? /*check if there is an empty field*/ !newMnemonic.reduce((r, v) => !v || r, false) : isConfirmed(newMnemonic);
    };

    const entirePhraseChange = (event) => {
        const mnemonic = event.target.value.split(' ');
        props.onChange(isValid(mnemonic), mnemonic);
    }

    return (
        <div className={'mnemonic'}>
            <Row>
                <Col sm={12} className={'center mb-3'}>reproduce the
                    mnemonic phrase from the previous step by placing the words
                    in inputs below</Col>
            </Row>

            <Form.Group className="form-group">
                <label>you can paste entire mnemonic phrase</label>
                <Form.Control type="text"
                              placeholder="mnemonic phrase"
                              onChange={entirePhraseChange}/>
            </Form.Group>
            <div className={'section_subtitle'}>
                or
            </div>
            <label>enter mnemonic phrase word by word</label>
            {new Array(4).fill(1).map((_, row) => {
                return (<Row key={`row_${row}`}>
                    {new Array(6).fill(1).map((_, col) => {
                        const idx     = row * 6 + col;
                        const text_id = 'word_' + (idx + 1);

                        return (<Col key={`row_${row}_col_${col}`}
                                     className={'mnemonic-cell'} sm={2}>
                            <InputGroup className={'form-group'}>
                                <InputGroup.Text
                                    id={text_id}>{idx + 1}</InputGroup.Text>
                                <FormControl
                                    aria-label={idx + 1}
                                    aria-describedby={text_id}
                                    ref={c => inputList[idx] = c}
                                    onChange={() => {
                                        let newMnemonicConfig  = [...mnemonicConfirm];
                                        newMnemonicConfig[idx] = inputList[idx].value;
                                        setMnemonicConfirm(newMnemonicConfig);
                                        console.log(newMnemonicConfig);
                                        props.onChange(isValid(newMnemonicConfig), newMnemonicConfig);
                                    }}
                                />
                            </InputGroup>
                        </Col>);
                    })}
                </Row>);
            })}
        </div>
    );
};

MnemonicConfirmView.propTypes = {
    mnemonic : PropTypes.array.isRequired,
    onChange : PropTypes.func.isRequired,
    importNew: PropTypes.bool
};

export default MnemonicConfirmView;
