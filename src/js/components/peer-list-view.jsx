import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {MDBDataTable as DataTable} from 'mdbreact';
import API from '../api/index';


class PeerListView extends Component {
    constructor(props) {
        super(props);
        this.peerListUpdateHandler = null;
        this.state                 = {
            peer_list: {
                node_online_list: new Set(),
                columns         : [
                    {
                        label: '#',
                        field: 'node_idx',
                        width: 150
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="microchip" size="1x"/>,
                            ' node'
                        ],
                        field: 'node_url',
                        width: 270
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="power-off" size="1x"/>,
                            ' status'
                        ],
                        field: 'node_status',
                        width: 270
                    }
                ],
                rows            : []
            }
        };
    }

    updatePeerList() {
        API.listActivePeers()
           .then(data => {
               let shouldUpdate   = false;
               let onlineNodeList = new Set();
               let peerList       = [];
               data.forEach((item, idx) => {
                   if (!this.state.peer_list.node_online_list.has(item.node_id)) {
                       shouldUpdate = true;
                   }
                   onlineNodeList.add(item.node_id);
                   peerList.push({
                       clickEvent : () => this.props.history.push('/peer/' + item.node_id, {peer: item.node_id}),
                       node_idx   : idx + 1,
                       node_url   : `${item.node_prefix}${item.node_address}${item.node_port}`,
                       node_status: 'up'
                   });
               });
               if (shouldUpdate) {
                   this.setState({
                       peer_list: {
                           columns         : [...this.state.peer_list.columns],
                           node_online_list: onlineNodeList,
                           rows            : peerList
                       }
                   });
               }
               this.peerListUpdateHandler = setTimeout(() => this.updatePeerList(), 1500);
           })
           .catch(() => this.peerListUpdateHandler = setTimeout(() => this.updatePeerList(), 1500));
    }

    componentDidMount() {
        this.peerListUpdateHandler = setTimeout(() => this.updatePeerList(), 0);
    }

    componentWillUnmount() {
        clearTimeout(this.peerListUpdateHandler);
    }

    render() {

        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading'}>connections</div>
                    <hr className={'hrPanel'}/>
                    <div className={'panel-body'}>
                        <Row>
                            <DataTable striped bordered small hover
                                       info={false}
                                       entries={10}
                                       entriesOptions={[
                                           10,
                                           30,
                                           50
                                       ]}
                                       data={this.state.peer_list}/>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


export default withRouter(PeerListView);
