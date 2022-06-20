import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row, Table} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../redux/actions';
import HelpIconView from './utils/help-icon-view';
import * as format from '../helper/format';
import Translation from '../common/translation';


class StatsView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let is_public = '';
        if (this.props.network.node_is_public === 'unknown') {
            is_public = Translation.getPhrase('b2e9a640f');
        }
        else if (this.props.network.node_is_public === true) {
            is_public = Translation.getPhrase('bdacde9fd');
        }
        else {
            is_public = Translation.getPhrase('648c44366');
        }

        const props = this.props;
        return (<Col md="12">
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>{Translation.getPhrase('729a7460c')}</div>
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
                                     }}>
                                 {Translation.getPhrase('5144ca302')}
                                 v.{props.wallet.version_available} !</Button>
                         </Col>
                     </Row>)}

                    <Row>
                        <Col>
                            <div className={'section_subtitle'}>
                                {Translation.getPhrase('5afb36415')}
                            </div>
                            <Table striped bordered hover>
                                <tbody>
                                <tr>
                                    <td className={'w-20'}>
                                        {Translation.getPhrase('a84b519b0')}
                                    </td>
                                    <td>
                                        {props.network.node_id}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        {Translation.getPhrase('626426447')}<HelpIconView
                                        help_item_name={'network_state'}/>
                                    </td>
                                    <td>
                                        {is_public}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        {Translation.getPhrase('498ed7e9a')}<HelpIconView
                                        help_item_name={'key_identifier'}/>
                                    </td>
                                    <td>
                                        {props.wallet.address_key_identifier}
                                    </td>
                                </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div className={'section_subtitle'}>
                                {Translation.getPhrase('8eb3e2d2d')}
                            </div>
                            <Table striped bordered hover>
                                <tbody>
                                <tr>
                                    <td className={'w-20'}>
                                        {Translation.getPhrase('389451101')}
                                    </td>
                                    <td>
                                        {format.number(props.wallet.transaction_count)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        {Translation.getPhrase('b22cd1d5c')}
                                    </td>
                                    <td>
                                        {format.number(props.wallet.transaction_wallet_unstable_count)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        <a className={''}
                                           onClick={() => props.history.push('/event-log')}>
                                            {Translation.getPhrase('f183a9ddd')}
                                        </a>
                                    </td>
                                    <td>
                                        {format.number(props.log.size)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        <a className={''}
                                           onClick={() => props.history.push('/backlog')}>
                                            {Translation.getPhrase('04a1455dc')}
                                        </a>
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
                                {Translation.getPhrase('e10d6c779')}
                            </div>
                            <Table striped bordered hover className={'mb-0'}>
                                <tbody>
                                <tr>
                                    <td className={'w-20'}>
                                        {Translation.getPhrase('f920af04c')}
                                    </td>
                                    <td>
                                        {this.props.network.node_is_public === true && props.network.node_public_ip + ':' + props.network.node_port}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        {Translation.getPhrase('027ec7293')}
                                    </td>
                                    <td>
                                        {props.network.node_bind_ip}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        <a className={''}
                                           onClick={() => props.history.push('/peers')}>
                                            {Translation.getPhrase('1f9fb0f71')}
                                        </a>
                                    </td>
                                    <td>
                                        {props.network.connections}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        {Translation.getPhrase('66a6b022e')}
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
