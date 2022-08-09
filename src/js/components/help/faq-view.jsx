import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Col, Row} from 'react-bootstrap';
import {connect} from 'react-redux';
import {DISCORD_URL} from '../../../config.js';
import Translation from '../../common/translation';


class FaqView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<Col md="12">
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>
                    {Translation.getPhrase('66f2297a0')}
                </div>
                <div className={'panel-body'}>
                    <Row>
                        <Col>
                            <div className={'section_subtitle'}>
                                millix
                            </div>
                            <div className={'form-group'}>
                                <div>{Translation.getPhrase('76e90feec')}</div>
                                <ul>
                                    <li>{Translation.getPhrase('dea74a359')}</li>
                                    <li>{Translation.getPhrase('c07e6bf76')}</li>
                                    <li>{Translation.getPhrase('ae88baaa3')}</li>
                                    <li>{Translation.getPhrase('0ca623439')}</li>
                                    <li>{Translation.getPhrase('d1874305e')}</li>
                                </ul>
                                <div>
                                    {Translation.getPhrase('8b704ebc9', {
                                        faq_link: <a
                                            key={'millix_faq_link'}
                                            href={'https://millix.org/faq.html'}
                                            target={'_blank'}>{Translation.getPhrase('9439b19f2')}</a>
                                    })}
                                </div>
                                <div>
                                    {Translation.getPhrase('8ff8f2824', {
                                        discord_link: <a
                                            key={'discord_link'}
                                            href={DISCORD_URL}
                                            target={'_blank'}>discord</a>
                                    })}
                                </div>
                            </div>
                            <hr/>
                            <div className={'section_subtitle'}>
                                tangled
                            </div>
                            <div className={'form-group'}>
                                <div>{Translation.getPhrase('0a10bb8a1')}</div>
                                <ul>
                                    <li>{Translation.getPhrase('876f3cf6e')}</li>
                                    <li>{Translation.getPhrase('38d790ed6')}</li>
                                    <li>{Translation.getPhrase('b9840d1f9')}</li>
                                    <li>{Translation.getPhrase('4db417761')}</li>
                                </ul>
                                <div>
                                    {Translation.getPhrase('0da6f70e0', {
                                        tangled_link: <a
                                            key={'tangled_browser_link'}
                                            href={'https://tangled.com/browser'}
                                            target={'_blank'}>{Translation.getPhrase('d690cecdb')}</a>
                                    })}
                                </div>
                                <div>
                                    {Translation.getPhrase('965d32628')}<a
                                    href={DISCORD_URL}
                                    target={'_blank'}>discord</a>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </Col>);
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(FaqView));
