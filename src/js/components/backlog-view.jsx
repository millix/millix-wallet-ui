import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Col} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../redux/actions';
import DatatableView from './utils/datatable-view';
import API from '../api';
import * as text from '../helper/text';
import ModalView from './utils/modal-view';


class BacklogView extends Component {
    constructor(props) {
        super(props);
        this.update_handler = null;
        this.state          = {
            backlog_list              : [],
            datatable_loading         : false,
            datatable_reload_timestamp: new Date(),
            modal_show                : false
        };
    }

    loadBacklogList() {
        this.setState({
            datatable_loading: true
        });

        API.backlogList()
           .then(data => {
               this.setState({
                   backlog_list              : data.backlog_list,
                   datatable_reload_timestamp: new Date(),
                   datatable_loading         : false
               });
           });
    }

    backlogReset() {
        API.backlogReset()
           .then(() => {
               this.showModal(false);
               this.loadBacklogList();
           });
    }

    showModal(value = true) {
        this.setState({
            modal_show: value
        });
    }

    componentDidMount() {
        this.loadBacklogList();
        this.update_handler = setInterval(() => this.loadBacklogList(), 10000);
    }

    componentWillUnmount() {
        clearTimeout(this.update_handler);
    }

    render() {
        return (<Col md="12">
            <div className={'panel panel-filled'}>
                <ModalView show={this.state.modal_show}
                           size={'lg'}
                           heading={'reset backlog'}
                           on_close={() => this.showModal(false)}
                           on_accept={() => this.backlogReset()}
                           body={<div>
                               <div>
                                   continuing will force your node to reset backlog.
                               </div>
                               {text.get_confirmation_modal_question()}
                           </div>}/>
                <div className={'panel-heading bordered'}>
                    backlog
                </div>
                <div className={'panel-body'}>
                    <div className={'form-group'}>
                        <span>backlog size is calculated from items with key "transaction". this page display every backlog size item, so count will not match.</span>
                    </div>
                    <DatatableView
                        reload_datatable={() => this.loadBacklogList()}
                        datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                        action_button={{
                            label   : 'reset backlog',
                            on_click: () => this.showModal()
                        }}
                        value={this.state.backlog_list}
                        sortField={'datetime'}
                        loading={this.state.datatable_loading}
                        sortOrder={1}
                        resultColumn={[
                            {
                                field : 'datetime',
                                header: 'datetime'
                            },
                            {
                                field: 'job_group_name'
                            },
                            {
                                field : 'timestamp',
                                header: 'timestamp'
                            },
                            {
                                field: 'arr_keys'
                            }
                        ]}/>
                </div>
            </div>
        </Col>);
    }
}


export default connect(
    state => ({
        backlog: state.backlog
    }), {
        updateNetworkState
    })(withRouter(BacklogView));
