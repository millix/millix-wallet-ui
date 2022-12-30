import React from 'react';
import {Alert, Button, Col, Row} from 'react-bootstrap';
import Translation from '../../common/translation';

const MetamaskInstall = () => {
    return <>
        <Alert variant={'warning'}>{Translation.getPhrase('O9LUuNb0k')}</Alert>
        <div className={'text-center'}>
            <Button
                variant="outline-primary"
                className={'btn_loader'}
                onClick={() => window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn', '_blank').focus()}>
                {Translation.getPhrase('rV5jwzlqn')}
            </Button>
        </div>
    </>;
};

export default MetamaskInstall;
