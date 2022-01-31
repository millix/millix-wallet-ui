import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row, Table} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../redux/actions';
import HelpIconView from './utils/help-icon-view';
import * as format from '../helper/format';


class StatsView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let is_public = '';
        if (this.props.network.node_is_public === 'unknown') {
            is_public = 'analyzing your network connection';
        }
        else if (this.props.network.node_is_public === true) {
            is_public = 'your node is public';
        }
        else {
            is_public = 'your node is not public and is unlikely to receive transaction fees. use port forwarding on your router to make your node public.';
        }

        const props = this.props;
        return (<Col md="12">
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>status summary
                </div>
                <div className={'panel-body'}>
                    {props.config.MODE_TEST_NETWORK && (<Row>
                        <Col className="pr-0"
                             style={{textAlign: 'left'}}>
                            <span>millix testnet</span>
                            <hr/>
                        </Col>
                    </Row>)}
                    {!!props.wallet.version_available && !(props.config.NODE_MILLIX_VERSION === props.wallet.version_available || props.config.NODE_MILLIX_VERSION !== (props.wallet.version_available + '-tangled')) &&
                     (<Row>
                         <Col style={{textAlign: 'right'}}>
                             <Button variant="outline-primary"
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
                        <Col>
                            <div className={'section_subtitle'}>
                                node
                            </div>
                            <Table striped bordered hover>
                                <tbody>
                                <tr>
                                    <td className={'w-20'}>
                                        node id
                                    </td>
                                    <td>
                                        {props.network.node_id}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        network state<HelpIconView
                                        help_item_name={'network_state'}/>
                                    </td>
                                    <td>
                                        {is_public}
                                    </td>
                                </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div className={'section_subtitle'}>
                                data
                            </div>
                            <Table striped bordered hover>
                                <tbody>
                                <tr>
                                    <td className={'w-20'}>
                                        transaction
                                        count
                                    </td>
                                    <td>
                                        {format.number(props.wallet.transaction_count)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        pending
                                        transaction
                                        count
                                    </td>
                                    <td>
                                        {format.number(props.wallet.transaction_wallet_unstable_count)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        event log size
                                    </td>
                                    <td>
                                        {format.number(props.log.size)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        backlog size
                                    </td>
                                    <td>
                                        {format.number(props.backlog.size)}
                                    </td>
                                </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div className={'section_subtitle'}>
                                network
                            </div>
                            <Table striped bordered hover className={'mb-0'}>
                                <tbody>
                                <tr>
                                    <td className={'w-20'}>
                                        node public address
                                    </td>
                                    <td>
                                        {this.props.network.node_is_public === true && props.network.node_public_ip + ':' + props.network.node_port}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        node bind ip
                                    </td>
                                    <td>
                                        {props.network.node_bind_ip}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        <a className={''}
                                           onClick={() => props.history.push('/peers')}>
                                            peers
                                        </a>
                                    </td>
                                    <td>
                                        {props.network.connections}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        local network
                                        addresses
                                    </td>
                                    <td>
                                        {props.network.node_network_addresses.join(', ')}
                                    </td>
                                </tr>
                                </tbody>
                            </Table>
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
