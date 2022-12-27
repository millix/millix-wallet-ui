import React from 'react';
import {Alert, Button, Col, Row} from 'react-bootstrap';

const MetamaskInstall = () => {
    return <>
        <Alert variant={'warning'}>cannot detect the metamask extension</Alert>
        <div className={'text-center'}>
            <Button
                variant="outline-primary"
                className={'btn_loader'}
                onClick={() => window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn', '_blank').focus()}>
                install metamask
            </Button>
        </div>
    </>;
};

export default MetamaskInstall;
