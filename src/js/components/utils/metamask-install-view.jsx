import React from 'react';
import {Alert, Button, Col, Row} from 'react-bootstrap';

const MetamaskInstall = () => {
    return <>
        <Row>
            <Col>
                <Alert variant={'warning'}>cannot detect the metamask extension</Alert>
            </Col>
        </Row>
        <Row>
            <Col className={'d-flex justify-content-center'}>
                <Button
                    variant="outline-primary"
                    className={'btn_loader'}
                    onClick={() => window.open("https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn", '_blank').focus()}>
                    install metamask
                </Button>
            </Col>
        </Row>
    </>
};

export default MetamaskInstall;
