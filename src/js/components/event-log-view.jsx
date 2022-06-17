import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import DatatableView from './utils/datatable-view';
import API from '../api';
import Translation from '../common/translation';


class EventsLogView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            event_log_list: [],
            datatable     : {
                reload_timestamp: new Date(),
                loading         : false
            },
            update_handler: null
        };
    }

    componentDidMount() {
        this.loadEventLogToState();
    }

    componentWillUnmount() {
        clearTimeout(this.update_handler);
    }

    loadEventLogToState() {
        this.setState({
            datatable: {
                loading: true
            }
        });

        API.getEventLogList().then(response => {
            if (response.api_status === 'success') {
                this.setState({
                    event_log_list: response.event_log_list,
                    datatable     : {
                        reload_timestamp: new Date(),
                        loading         : false
                    }
                });

                clearTimeout(this.update_handler);
                this.update_handler = setTimeout(() => this.loadEventLogToState(), 20 * 1000);
            }
        });
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>{Translation.getPhrase('3eb332ead')}</div>
                    <div className={'panel-body'}>
                        <DatatableView
                            reload_datatable={() => this.loadEventLogToState()}
                            datatable_reload_timestamp={this.state.datatable.reload_timestamp}
                            value={this.state.event_log_list}
                            loading={this.state.datatable.loading}
                            sortField={'timestamp'}
                            sortOrder={1}
                            resultColumn={[
                                {
                                    field : 'timestamp',
                                    header: Translation.getPhrase('0ed0bab27')
                                },
                                {
                                    field : 'type',
                                    header: Translation.getPhrase('607744dc0')
                                },
                                {
                                    field : 'content',
                                    header: Translation.getPhrase('b20e6ad48')
                                }
                            ]}/>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        log: state.log
    }))(withRouter(EventsLogView));
