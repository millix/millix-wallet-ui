import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Col, FormControl, Row} from 'react-bootstrap';

const MnemonicConfirmView = (props) => {
    const inputList = [];
    const [mnemonicConfirm, setMnemonicConfirm] = useState(new Array(props.mnemonic.length));
    const isConfirmed = (newMnemonic) => {
        for (let i = 0; i < newMnemonic.length; i++) {
            if (newMnemonic[i] !== props.mnemonic[i]) {
                return false;
            }
        }
        return true;
    }

    const isValid = (newMnemonic) => {
        return props.importNew ? /*check if there is an empty field*/ !newMnemonic.reduce((r, v) => !v || r, false) : isConfirmed(newMnemonic);
    }
    return (
        <div className={"mnemonic"}>
            <Row>
                <Col sm={12} className={"center mb-3"}><small>reproduce the recovery phrase by placing the words in the
                    correct order.</small></Col>
            </Row>
            {new Array(4).fill(1).map((_, row) => {
                return (<Row key={`row_${row}`}>
                    {new Array(6).fill(1).map((_, col) => {
                        const idx = row * 6 + col;
                        return (<Col key={`row_${row}_col_${col}`} className={"mnemonic-cell"} sm={2}>
                            <div>
                                <span className={"phrase-number"}>{idx + 1}</span>
                                <FormControl className={"phrase"} type="text"
                                             style={{
                                                 width: "70%",
                                                 ...(!props.importNew && mnemonicConfirm[idx] && mnemonicConfirm[idx] !== props.mnemonic[idx]) ? ({border: 'solid rosybrown 1px'}) : ({})
                                             }}
                                             ref={c => inputList[idx] = c}
                                             onChange={() => {
                                                 let newMnemonicConfig = [...mnemonicConfirm];
                                                 newMnemonicConfig[idx] = inputList[idx].value;
                                                 setMnemonicConfirm(newMnemonicConfig);
                                                 props.onChange(isValid(newMnemonicConfig), newMnemonicConfig)
                                             }}
                                             aria-describedby="basic-addon"/>
                            </div>
                        </Col>);
                    })}
                </Row>);
            })}
        </div>
    );
};

MnemonicConfirmView.propTypes = {
    mnemonic: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    importNew: PropTypes.bool
};

export default MnemonicConfirmView;
