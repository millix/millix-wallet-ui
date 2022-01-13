import React from 'react';
import PropTypes from 'prop-types';
import {Col, Row, Form} from 'react-bootstrap';

const WalletCreateInfoView = (props) => {
    return (
        <div className={"wallet-create-password"}>
            <Row>
                <Col sm={12} className={"center mb-3"}><small>your wallet was successfully created.</small></Col>
            </Row>
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>wallet</div>
                <div className={'panel-body'}>
                    <Row className="mb-3">
                        <Form>
                            <Col>
                                <Form.Group>
                                    <label>wallet id</label>
                                    <Form.Control type="text"
                                                  readOnly={true}
                                                  value={props.wallet.id}/>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <label>wallet private key</label>
                                    <Form.Control type="text"
                                                  readOnly={true}
                                                  value={"0x" + props.wallet.private_key}/>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <label>wallet prime address</label>
                                    <Form.Control type="text"
                                                  readOnly={true}
                                                  value={props.wallet.address}/>
                                </Form.Group>
                            </Col>
                        </Form>
                    </Row>
                </div>
            </div>
        </div>
    );
};

WalletCreateInfoView.propTypes = {
    wallet: PropTypes.object.isRequired
};

export default WalletCreateInfoView;
