import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Button, Col, Container, Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Translation from '../common/translation';


class ManageWalletView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        if (this.props.wallet.unlocked) {
            return <Redirect to={{pathname: '/'}}/>;
        }

        return (
            <Container style={{
                marginTop  : 50,
                paddingLeft: 25
            }}>
                <Row className="mb-3">
                    <Button variant="outline-primary"
                            className={'btn btn-w-md btn-accent'}
                            onClick={() => {
                                this.props.history.replace('/unlock/');
                            }}>
                        <FontAwesomeIcon icon="fingerprint"
                                         size="1x"/> {Translation.getPhrase('1c5234018')}
                    </Button>
                </Row>
                <div className="container-center lg">
                    <Row>
                        <Col sm={6} style={{textAlign: 'right'}}>
                            <Button variant="outline-primary"
                                    onClick={() => this.props.history.push('/new-wallet/')}>
                                <FontAwesomeIcon icon="wallet" size="8x"
                                                 style={{
                                                     margin : '0 auto',
                                                     display: 'block'
                                                 }}/> {Translation.getPhrase('e7661880b')}
                            </Button>
                        </Col>
                        <Col sm={6}>
                            <Button variant="outline-primary"
                                    onClick={() => this.props.history.push('/import-wallet/')}>
                                <FontAwesomeIcon icon="key" size="6x"
                                                 style={{
                                                     margin : '0 auto',
                                                     display: 'block'
                                                 }}/> {Translation.getPhrase('04f143cb0')}
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Container>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(ManageWalletView);
