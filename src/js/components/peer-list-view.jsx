import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import API from '../api/index';
import DatatableView from './utils/datatable-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import Translation from '../common/translation';


class PeerListView extends Component {
    constructor(props) {
        super(props);
        this.updateHandler = null;
        this.state         = {
            node_online_list          : new Set(),
            peer_list                 : [],
            datatable_reload_timestamp: '',
            datatable_loading         : false
        };
    }

    reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

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
                       history_state={{peer: item.node_id}}
                       icon={'eye'}/>;

                   peerList.push({
                       node_idx   : idx + 1,
                       node_url   : `${item.node_prefix}${item.node_address}:${item.node_port}`,
                       node_status: Translation.getPhrase('8d14f90c0'),
                       action     : action
                   });
               });
               if (shouldUpdate) {
                   this.setState({
                       node_online_list          : onlineNodeList,
                       peer_list                 : peerList,
                       datatable_reload_timestamp: new Date(),
                       datatable_loading         : false
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
                    <div className={'panel-heading bordered'}>{Translation.getPhrase('df4e20959')}</div>
                    <div className={'panel-body'}>
                        <div className={'form-group'}>
                            <span>{Translation.getPhrase('bd223d540')}</span>
                        </div>
                        <Row>
                            <DatatableView
                                reload_datatable={() => this.reloadDatatable()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}

                                value={this.state.peer_list}
                                sortField={'node_idx'}
                                loading={this.state.datatable_loading}
                                sortOrder={-1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field : 'node_idx',
                                        header: Translation.getPhrase('6ca535005')
                                    },
                                    {
                                        field : 'node_url',
                                        header: Translation.getPhrase('0cc2c9f50')
                                    },
                                    {
                                        field : 'node_status',
                                        header: Translation.getPhrase('6c56ee442')
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
