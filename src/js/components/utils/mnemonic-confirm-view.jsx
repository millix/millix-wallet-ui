import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Col, FormControl, Row, InputGroup, Form} from 'react-bootstrap';
import Translation from '../../common/translation';

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
    };

    let info_label = Translation.getPhrase('485b49925');
    if (props.processName === 'import') {
        info_label = Translation.getPhrase('9d97c9f67');
    }

    return (
        <div className={'mnemonic'}>
            <div className={'center mb-3'}>
                <span>{info_label}</span>
            </div>

            <Form.Group className="form-group">
                <label>{Translation.getPhrase('afa9ebab3')}</label>
                <Form.Control type="text"
                              placeholder={Translation.getPhrase('080d63a14')}
                              onChange={entirePhraseChange}/>
            </Form.Group>
            <div className={'section_subtitle'}>
                {Translation.getPhrase('adbe6703b')}
            </div>
            <label>{Translation.getPhrase('b374b45c8')}</label>
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
    mnemonic   : PropTypes.array.isRequired,
    onChange   : PropTypes.func.isRequired,
    importNew  : PropTypes.bool,
    processName: PropTypes.string
};

export default MnemonicConfirmView;
