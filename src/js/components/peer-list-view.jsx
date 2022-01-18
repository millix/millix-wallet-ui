import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import API from '../api/index';


class PeerListView extends Component {
    constructor(props) {
        super(props);
        this.peerListUpdateHandler = null;
        this.state                 = {
            node_online_list: new Set(),
            peer_list: []
        };
    }

    updatePeerList() {
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
                   peerList.push({
                       clickEvent : () => this.props.history.push('/peer/' + item.node_id, {peer: item.node_id}),
                       node_idx   : idx + 1,
                       node_url   : `${item.node_prefix}${item.node_address}:${item.node_port}`,
                       node_status: 'connected'
                   });
               });
               if (shouldUpdate) {
                   this.setState({
                       node_online_list: onlineNodeList,
                       peer_list: peerList
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
                    <div className={'panel-heading bordered'}>peers</div>
                    <div className={'panel-body'}>
                        <Row>
                            <DataTable value={this.state.peer_list}
                                       stripedRows
                                       showGridlines
                                       resizableColumns
                                       columnResizeMode="fit"
                                       responsiveLayout="scroll">
                                <Column field="node_idx"
                                        header="id"
                                        sortable></Column>
                                <Column field="node_url"
                                        header="node"
                                        sortable></Column>
                                <Column field="node_status"
                                        header="status"
                                        sortable></Column>
                            </DataTable>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


export default withRouter(PeerListView);
