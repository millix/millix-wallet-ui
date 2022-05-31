import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Col, Row} from 'react-bootstrap';
import {connect} from 'react-redux';


class FaqView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<Col md="12">
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>
                    frequent questions
                </div>
                <div className={'panel-body'}>
                    <Row>
                        <Col>
                            <div className={'section_subtitle'}>
                                millix
                            </div>
                            <div className={'form-group'}>
                                <div>if you have a question about anything
                                    related to millix cryptocurrency, like:
                                </div>
                                <ul>
                                    <li>sending transactions</li>
                                    <li>how does the millix cryptocurrency
                                        work
                                    </li>
                                    <li>which technologies does it use</li>
                                    <li>where to buy or sell millix</li>
                                    <li>how to earn millix</li>
                                </ul>
                                <div>
                                    you may find answers on millix.org <a
                                    href={'https://millix.org/faq.html'}
                                    target={'_blank'}>faq</a> page
                                </div>
                                <div>
                                    if you haven't find an answer on faq page or
                                    in other site sections you are always
                                    welcome to ask a question on <a
                                    href={'https://discord.gg/HgZqav7v66'}
                                    target={'_blank'}>discord</a>
                                </div>
                            </div>
                            <hr/>
                            <div className={'section_subtitle'}>
                                tangled
                            </div>
                            <div className={'form-group'}>
                                <div>if you have a question about anything
                                    related to tangled browser, like:
                                </div>
                                <ul>
                                    <li>advertisements</li>
                                    <li>earning millix
                                    </li>
                                    <li>privacy</li>
                                    <li>censorship</li>
                                </ul>
                                <div>
                                    you may find answers on tangled.com <a
                                    href={'https://tangled.com/browser-overview.html'}
                                    target={'_blank'}>overview</a> page
                                </div>
                                <div>
                                    if you haven't find an answer on faq page or
                                    in other site sections you are always
                                    welcome to ask a question on <a
                                    href={'https://discord.gg/HgZqav7v66'}
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
