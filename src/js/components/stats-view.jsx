import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../redux/actions';


class StatsView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
    }

    render() {
        const props = this.props;
        return (<Col md="12">
            <div className={'panel panel-filled'}>
                <div className={'panel-heading'}>status
                </div>
                <hr className={'hrPanel'}/>
                <div className={'panel-body'}>
                    {props.config.MODE_TEST_NETWORK && (<Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <small>millix testnet</small>
                            <hr/>
                        </Col>
                    </Row>)}
                    {!!props.wallet.version_available && !(props.config.NODE_MILLIX_VERSION === props.wallet.version_available || props.config.NODE_MILLIX_VERSION !== (props.wallet.version_available + '-tangled')) &&
                     (<Row>
                         <Col className="pr-0"
                              style={{textAlign: 'right'}}>
                             <Button variant="link"
                                     onClick={() => {
                                     }}
                                     style={{
                                         fontSize: '75%',
                                         padding : 0,
                                         color   : '#ffadad'
                                     }}>new version
                                 available
                                 v.{props.wallet.version_available} !</Button>
                         </Col>
                     </Row>)}
                    <Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <small>{props.network.node_is_public === 'unknown' ? 'analyzing your network connection' : props.network.node_is_public === true ? 'your node is public and is eligible to receive transaction fees' : 'your node is not public and is not eligible to receive transaction fees.  use port forwarding on your router to make your node public.'}</small>
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <small>event log
                                size: {props.log.size.toLocaleString('en-US')}</small>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <small>backlog
                                size: {props.backlog.size.toLocaleString('en-US')}</small>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <small>pending
                                transaction
                                count: {props.wallet.transaction_wallet_unstable_count.toLocaleString('en-US')}</small>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <small>transaction
                                count: {props.wallet.transaction_count.toLocaleString('en-US')}</small>
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <small>node id: {props.network.node_id}</small>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <small>node public
                                address: {props.network.node_public_ip.toLocaleString('en-US') + ':' + props.network.node_port}</small>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <small>node bind
                                ip: {props.network.node_bind_ip.toLocaleString('en-US')}</small>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <small>local network
                                addresses: {props.network.node_network_addresses.join(', ')}</small>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <Button variant="link"
                                    onClick={() => props.history.push('/peers')}
                                    style={{
                                        padding    : 0,
                                        borderWidth: '0rem'
                                    }}>
                                <small>peers: {props.network.connections}</small></Button>
                        </Col>
                    </Row>
                </div>
            </div>
        </Col>);
    }
}


export default connect(
    state => ({
        clock  : state.clock,
        config : state.config,
        log    : state.log,
        network: state.network,
        wallet : state.wallet,
        backlog: state.backlog,
        node   : state.node
    }), {
        updateNetworkState
    })(withRouter(StatsView));
