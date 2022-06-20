import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Row} from 'react-bootstrap';
import MessageComposeForm from './message-compose-form';
import Translation from '../../common/translation';

class MessageComposeView extends Component {

    render() {
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>{Translation.getPhrase('88a62ae8d')}</div>
                            <div className={'panel-body'}>
                                <p>
                                    {Translation.getPhrase('24861d022')}
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
