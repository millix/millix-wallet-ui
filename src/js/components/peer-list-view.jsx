import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Row, Col, Button} from 'react-bootstrap';
import API from '../api/index';
import DatatableView from './utils/datatable-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import moment from 'moment';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';


class PeerListView extends Component {
    constructor(props) {
        super(props);
        this.updateHandler = null;
        this.state         = {
            node_online_list          : new Set(),
            peer_list                 : [],
            datatable_reload_timestamp: ''
        };
    }

    reloadDatatable() {
        API.listActivePeers()
           .then(data => {
               let shouldUpdate   = false;
               let onlineNodeList = new Set();
               let peerList       = [];
               data.forEach((item, idx) => {
                   if (!this.state.node_online_list.has(item.node_id)) {
                       shouldUpdate = true;
                   }
                   onlineNodeList.add(item.node_id);

                   const action = <DatatableActionButtonView
                       history_path={'/peer/' + item.node_id}
                       history_state={{peer: item.node_id}}/>;

                   peerList.push({
                       node_idx   : idx + 1,
                       node_url   : `${item.node_prefix}${item.node_address}:${item.node_port}`,
                       node_status: 'connected',
                       action     : action
                   });
               });
               if (shouldUpdate) {
                   this.setState({
                       node_online_list          : onlineNodeList,
                       peer_list                 : peerList,
                       datatable_reload_timestamp: new Date()
                   });
               }
           });
    }

    componentDidMount() {
        this.reloadDatatable();
        this.updateHandler = setInterval(() => this.reloadDatatable(), 10000);
    }

    componentWillUnmount() {
        clearTimeout(this.updateHandler);
    }


    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>peers</div>
                    <div className={'panel-body'}>
                        <Row>
                            <Col>
                                <div className={'form-group'}>
                                    <span>these are peers to which you are connected. "peer" is another node to which your node connects to in order to send/receive data.</span>
                                </div>
                            </Col>
                        </Row>
                        <div className={'datatable_action_row'}>
                            <Col md={4}>
                                <Button variant="outline-primary"
                                        className={'btn-sm refresh_button'}
                                        onClick={() => this.reloadDatatable()}
                                >
                                    <FontAwesomeIcon
                                        icon={'sync'}
                                        size="1x"/>
                                    refresh
                                </Button>
                            </Col>
                            <Col md={4} className={'datatable_refresh_ago'}>
                            <span>
                                refreshed {this.state.datatable_reload_timestamp && moment(this.state.datatable_reload_timestamp).fromNow()}
                            </span>
                            </Col>
                        </div>
                        <Row>
                            <DatatableView
                                value={this.state.peer_list}
                                sortField={'node_idx'}
                                sortOrder={-1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        'field'   : 'node_idx',
                                        'header'  : 'id',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'node_url',
                                        'header'  : 'node',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'node_status',
                                        'header'  : 'status',
                                        'sortable': true
                                    }
                                ]}/>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


export default withRouter(PeerListView);
