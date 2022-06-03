import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Row} from 'react-bootstrap';
import MessageComposeForm from './message-compose-form';

class MessageComposeView extends Component {

    render() {
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>compose</div>
                            <div className={'panel-body'}>
                                <p>
                                    compose an encrypted message to any tangled browser user. the message will be stored on your device and the recipients
                                    device. to transport the message to reach the recipient, the message is stored on the millix network for up to 90 days. only
                                    you and the recipient can read your messages.
                                </p>
                                <MessageComposeForm/>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet,
        config: state.config
    })
)(withRouter(MessageComposeView));
